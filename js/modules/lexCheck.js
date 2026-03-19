/**
 * lexCheck.js — Verificador de vocabulário baseado no léxico PT-BR
 *
 * Após 2s de inatividade no editor, varre o texto e marca palavras que não
 * existem no dicionário (360k entradas via dictHas/dictGet). Hover mostra sugestões
 * por distância de edição; clique substitui a palavra no texto.
 *
 * CORREÇÕES v2:
 *  1. edits1 opera sobre forma NORMALIZADA (sem acentos) — evita candidatos
 *     com acentuação impossível gerados pela substituição cega de diacríticos.
 *  2. suggest valida o candidato tanto na forma normalizada quanto na forma
 *     original do dicionário — garante que só palavras reais são sugeridas.
 *  3. Filtro mínimo de 3 caracteres em candidatos (era 2 — gerava lixo).
 *  4. Distância 2 usa apenas candidatos de distância 1 que existem no dict,
 *     não qualquer edição — reduz explosão combinatória e melhora qualidade.
 *  5. suggest retorna sempre entry.word do dicionário, nunca o candidato cru.
 */

import { dictHas, dictGet, loadAllDictChunks } from "./verbete.js";
import { ACCENT_IGNORELIST } from "./grammarLint.js";

// ── Normalização (remove acentos, lowercase) ──────────────────────────────
function normalize(w) {
  try {
    return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (_) { return w.toLowerCase(); }
}

// ── Palavras a nunca marcar ────────────────────────────────────────────────
const SKIP = new Set([
  ...ACCENT_IGNORELIST,
  "a", "e", "o", "é", "à", "i", "u",
  "ai", "ei", "eu", "tu",
  "em", "de", "do", "da", "no", "na", "ao", "às", "dos", "das", "nos", "nas",
  "um", "uma", "uns", "umas",
  "com", "por", "sem", "sob", "até", "via",
]);

// ── Carregamento lazy do dict completo ────────────────────────────────────
let _ready = false;

async function ensureLoaded() {
  if (_ready) return;
  await loadAllDictChunks();
  _ready = true;
}

function isKnown(word) {
  if (!_ready) return true;
  return dictHas(word);
}

// ── Sugestões por distância de edição ─────────────────────────────────────
//
// CORREÇÃO CENTRAL: o alfabeto usado nas edições é APENAS ASCII sem acentos.
// Isso evita que substituições gerem candidatos como "cásá", "têxtó", etc.
// A acentuação correta vem do entry.word do dicionário — não do candidato gerado.
//
const ASCII_ALPHA = "abcdefghijklmnopqrstuvwxyz";

// Gera todas as edições a distância 1 de uma palavra NORMALIZADA (sem acentos).
// Retorna Set de strings normalizadas (minúsculas, sem acentos).
function edits1Normalized(normWord) {
  const w   = normWord;
  const out = new Set();
  const n   = w.length;

  for (let i = 0; i < n; i++) {
    // deleção
    out.add(w.slice(0, i) + w.slice(i + 1));
    // transposição adjacente
    if (i < n - 1) out.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
    // substituição (só ASCII — acentos vêm do dicionário)
    for (const c of ASCII_ALPHA) out.add(w.slice(0, i) + c + w.slice(i + 1));
    // inserção
    for (const c of ASCII_ALPHA) out.add(w.slice(0, i) + c + w.slice(i));
  }
  // inserção no final
  for (const c of ASCII_ALPHA) out.add(w + c);

  return out;
}

// Dado um candidato normalizado, tenta encontrar a entrada real no dicionário.
// Retorna a entry.word (com acentuação correta) ou null se não existir.
function resolveCandidate(normCandidate) {
  if (normCandidate.length < 3) return null;

  // Tenta direto (muitas palavras PT-BR não têm acento)
  if (dictHas(normCandidate)) {
    const entry = dictGet(normCandidate);
    // Usa entry.word se disponível — é a forma canônica do dicionário
    return entry?.word || normCandidate;
  }

  return null;
}

export function suggest(word, limit = 4) {
  if (!_ready || !word || word.length < 3) return [];

  const normWord = normalize(word);
  const found    = new Map(); // normCandidate → { word, dist }

  // ── Distância 1 ──────────────────────────────────────────────────────────
  for (const normCandidate of edits1Normalized(normWord)) {
    if (normCandidate === normWord) continue;
    if (found.has(normCandidate)) continue;

    const resolved = resolveCandidate(normCandidate);
    if (resolved) {
      found.set(normCandidate, { word: resolved, dist: 1 });
    }
  }

  // ── Distância 2 ──────────────────────────────────────────────────────────
  // CORREÇÃO: parte apenas dos candidatos de dist-1 que já existem no dict,
  // não de todas as edições — qualidade muito melhor, menos lixo.
  if (found.size < limit) {
    const dist1Valid = [...found.values()]
      .filter(r => r.dist === 1)
      .map(r => normalize(r.word))
      .slice(0, 20); // limita a base para não travar

    outer:
    for (const base of dist1Valid) {
      for (const normCandidate of edits1Normalized(base)) {
        if (normCandidate === normWord) continue;
        if (found.has(normCandidate)) continue;

        const resolved = resolveCandidate(normCandidate);
        if (resolved) {
          found.set(normCandidate, { word: resolved, dist: 2 });
          if (found.size >= limit * 4) break outer;
        }
      }
    }
  }

  return [...found.values()]
    .sort((a, b) => a.dist - b.dist || a.word.length - b.word.length)
    .slice(0, limit)
    .map(r => r.word);
}

// ── Marcação DOM ──────────────────────────────────────────────────────────
function clearLexMarks(el) {
  for (const m of el.querySelectorAll(".lex-mark")) {
    const parent = m.parentNode;
    if (!parent) continue;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  }
}

export async function scanLex(editorEl) {
  if (!editorEl) return;
  await ensureLoaded();
  clearLexMarks(editorEl);

  const walker = document.createTreeWalker(
    editorEl,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.parentElement?.closest?.(".slice,.gram-mark,.lex-mark")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const toWrap = [];
  const wordRe = /\b([a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]{3,})\b/g;
  let tNode;

  while ((tNode = walker.nextNode())) {
    const text = tNode.textContent;
    let m;
    wordRe.lastIndex = 0;
    while ((m = wordRe.exec(text)) !== null) {
      const word = m[1];
      const norm = normalize(word);

      if (SKIP.has(norm)) continue;
      // Nomes próprios (maiúscula em posição não-inicial) — não marcar
      if (/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(word) && m.index > 0) continue;

      if (!isKnown(word)) {
        toWrap.push({ node: tNode, start: m.index, end: m.index + word.length, word });
      }
    }
  }

  toWrap.sort((a, b) => a.node === b.node ? b.start - a.start : 0);

  for (const { node, start, end, word } of toWrap) {
    try {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      const span = document.createElement("span");
      span.className    = "lex-mark";
      span.dataset.word = word;
      range.surroundContents(span);
    } catch (_) {}
  }
}

// ── Floater de sugestões ──────────────────────────────────────────────────
let _floater   = null;
let _hideTimer = 0;

function getFloater() {
  if (_floater) return _floater;
  _floater = document.createElement("div");
  _floater.id = "lexFloater";
  _floater.setAttribute("aria-hidden", "true");
  document.body.appendChild(_floater);
  _floater.addEventListener("mouseenter", () => clearTimeout(_hideTimer));
  _floater.addEventListener("mouseleave", scheduleHide);
  return _floater;
}

function scheduleHide() {
  clearTimeout(_hideTimer);
  _hideTimer = setTimeout(() => {
    if (!_floater) return;
    _floater.classList.remove("isVisible");
    _floater.setAttribute("aria-hidden", "true");
  }, 200);
}

function showFloater(markEl, sugs) {
  clearTimeout(_hideTimer);
  const f = getFloater();

  let html = `<span class="lf-label">não encontrado</span>`;
  if (sugs.length) {
    html += `<span class="lf-hint">sugestões</span><div class="lf-chips">`;
    for (const s of sugs) {
      html += `<button class="lf-chip" type="button" data-sug="${s}">${s}</button>`;
    }
    html += `</div>`;
  } else {
    html += `<span class="lf-hint">sem sugestões próximas</span>`;
  }

  f.innerHTML = html;
  f.setAttribute("aria-hidden", "false");

  const rect = markEl.getBoundingClientRect();
  let top  = rect.bottom + window.scrollY + 5;
  let left = rect.left + window.scrollX;
  if (left + 220 > window.innerWidth) left = window.innerWidth - 228;
  if (top + 80 > window.innerHeight + window.scrollY)
    top = rect.top + window.scrollY - 80 - 5;

  f.style.top  = top  + "px";
  f.style.left = left + "px";
  f.classList.add("isVisible");

  f.querySelectorAll(".lf-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const sug  = btn.dataset.sug;
      const orig = markEl.textContent;
      const replacement = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(orig)
        ? sug.charAt(0).toUpperCase() + sug.slice(1)
        : sug;
      const parent = markEl.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(replacement), markEl);
      parent.normalize();
      scheduleHide();
    });
  });
}

// ── Init público ──────────────────────────────────────────────────────────
export function initLexCheck() {
  const DEBOUNCE_MS = 2000;
  let timer = 0;

  ensureLoaded();

  document.addEventListener("input", (ev) => {
    const editorEl = ev.target?.closest?.(".pageContent");
    if (!editorEl) return;
    clearTimeout(timer);
    timer = setTimeout(() => scanLex(editorEl), DEBOUNCE_MS);
  });

  document.addEventListener("focusin", (ev) => {
    const editorEl = ev.target?.closest?.(".pageContent");
    if (!editorEl) return;
    clearTimeout(timer);
    clearLexMarks(editorEl);
    scheduleHide();
  });

  document.addEventListener("mouseover", (ev) => {
    const mark = ev.target?.closest?.(".lex-mark");
    if (!mark) return;
    const word = mark.dataset.word || mark.textContent;
    showFloater(mark, suggest(word));
  });

  document.addEventListener("mouseout", (ev) => {
    const mark = ev.target?.closest?.(".lex-mark");
    if (!mark) return;
    const toEl = ev.relatedTarget;
    if (_floater && (toEl === _floater || _floater.contains(toEl))) return;
    scheduleHide();
  });
}
