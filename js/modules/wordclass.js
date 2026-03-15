import { ptPosLexicon } from "../../src/js/modules/pt_pos_lexicon.js";

// ── 10 classes de palavras ─────────────────────────────────────────────────
const POS_PRIORITY = ["VERB", "ADJ", "ADV", "SUBST", "PRON", "PREP", "CONJ", "ART", "NUM", "INTJ"];

const CLASS_LABEL = {
  "wc-verb":  "verbo",
  "wc-subst": "substantivo",
  "wc-adj":   "adjetivo",
  "wc-adv":   "advérbio",
  "wc-pron":  "pronome",
  "wc-art":   "artigo",
  "wc-prep":  "preposição",
  "wc-conj":  "conjunção",
  "wc-num":   "numeral",
  "wc-intj":  "interjeição",
};

function normalizeWord(w) {
  try { return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  catch (_) { return w.toLowerCase(); }
}

function classifySync(word) {
  const norm = normalizeWord(word).replace(/^['\-]+|['\-]+$/g, "");
  if (!norm) return null;
  const entry = ptPosLexicon.entries.get(norm);
  const posList = entry?.pos || ptPosLexicon.guess(norm)?.pos || [];
  for (const p of POS_PRIORITY) {
    if (posList.includes(p)) return p;
  }
  return null;
}

function tokenize(text) {
  const tokens = [];
  const re = /([a-záàãâéêíóôõúüçñ'-]+)|([^a-záàãâéêíóôõúüçñ'-]+)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== undefined) tokens.push({ text: m[1], isWord: true });
    else tokens.push({ text: m[2], isWord: false });
  }
  return tokens;
}

// ── Filtros ────────────────────────────────────────────────────────────────
const annotateFilter = {
  acceptNode(node) {
    if (node.parentElement?.closest(".slice")) return NodeFilter.FILTER_REJECT;
    if (node.parentElement?.className?.startsWith?.("wc-")) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  },
};

// ── Cursor save/restore via âncora DOM ────────────────────────────────────
// Insere um elemento <wc-mark> na posição exata do cursor antes da re-anotação.
// Funciona em qualquer posição: texto, linha vazia após ENTER, início/fim do editor.
// Sobrevive ao stripAnnotations (que só remove span[class^="wc-"]) e ao normalize().
const WC_MARKER_TAG = "wc-mark";

function saveCursorWC(pageContentEl) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return null;
  const range = sel.getRangeAt(0);
  if (!range.collapsed || !pageContentEl.contains(range.startContainer)) return null;
  const marker = document.createElement(WC_MARKER_TAG);
  try {
    range.insertNode(marker);
  } catch (_) {
    return null;
  }
  return { el: pageContentEl };
}

function restoreCursorWC(saved) {
  if (!saved) return;
  const marker = saved.el.querySelector(WC_MARKER_TAG) ?? document.querySelector(WC_MARKER_TAG);
  if (!marker) return;
  try {
    const r = document.createRange();
    r.setStartAfter(marker);
    r.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
  } catch (_) {}
  marker.remove();
}

// ── Remove anotações wc-* ──────────────────────────────────────────────────
function stripAnnotations(pageContentEl) {
  const spans = Array.from(pageContentEl.querySelectorAll('span[class^="wc-"]'));
  for (const span of spans) {
    span.replaceWith(document.createTextNode(span.textContent));
  }
  pageContentEl.normalize();
}

// ── Anota texto com spans de classe gramatical ────────────────────────────
function annotate(pageContentEl) {
  stripAnnotations(pageContentEl);
  const walker = document.createTreeWalker(pageContentEl, NodeFilter.SHOW_TEXT, annotateFilter);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  for (const textNode of textNodes) {
    const text = textNode.textContent;
    if (!text.trim()) continue;
    const tokens = tokenize(text);
    if (!tokens.some(t => t.isWord)) continue;

    const frag = document.createDocumentFragment();
    for (const { text: t, isWord } of tokens) {
      if (!isWord) { frag.appendChild(document.createTextNode(t)); continue; }
      const pos = classifySync(t);
      if (!pos) { frag.appendChild(document.createTextNode(t)); continue; }
      const span = document.createElement("span");
      span.className = `wc-${pos.toLowerCase()}`;
      span.textContent = t;
      frag.appendChild(span);
    }
    textNode.replaceWith(frag);
  }
}

// ── Hover tooltip ─────────────────────────────────────────────────────────
let tooltip = null;
let hideTimer = null;

function getTooltip() {
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "wcTooltip";
    document.body.appendChild(tooltip);
  }
  return tooltip;
}

function showTooltip(spanEl) {
  clearTimeout(hideTimer);
  const cls = spanEl.className;
  const label = CLASS_LABEL[cls];
  if (!label) return;
  const color = getComputedStyle(spanEl).color;
  const tip = getTooltip();
  tip.textContent = label;
  tip.style.color = color;
  tip.style.borderColor = color.replace("rgb(", "rgba(").replace(")", ", .3)");

  const rect = spanEl.getBoundingClientRect();
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top - 10}px`;
  tip.style.transform = "translateX(-50%) translateY(-100%)";
  tip.style.transition = "none";
  tip.classList.add("visible");
}

function hideTooltip(immediate = false) {
  clearTimeout(hideTimer);
  if (immediate) {
    tooltip?.classList.remove("visible");
    return;
  }
  hideTimer = setTimeout(() => tooltip?.classList.remove("visible"), 120);
}

function onPageMouseOver(e) {
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) { hideTooltip(true); return; }
  const span = e.target?.closest?.('span[class^="wc-"]');
  if (span) showTooltip(span);
  else hideTooltip();
}

// ── Touch tap: tap num span wc-* mostra tooltip ────────────────────────────
function onPageTouchEnd(e) {
  const t = e.changedTouches?.[0];
  if (!t) return;
  const el = document.elementFromPoint(t.clientX, t.clientY);
  const span = el?.closest?.('span[class^="wc-"]');
  if (span) {
    e.preventDefault(); // não dispara mousedown/click fantasma
    showTooltip(span);
  } else {
    hideTooltip(true);
  }
}

// ── Cursor via teclado (espaço drag, setas): selectionchange → tooltip ─────
let _selChangeTimer = null;
function onSelectionChange() {
  clearTimeout(_selChangeTimer);
  _selChangeTimer = setTimeout(() => {
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) { hideTooltip(true); return; }
    const node = range.startContainer;
    const span = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node)
      ?.closest?.('span[class^="wc-"]');
    if (span) showTooltip(span);
    // não esconde se não achar — cursor pode estar entre palavras
  }, 200);
}

// ── Lexicon ────────────────────────────────────────────────────────────────
async function loadFullLexicon() {
  await ptPosLexicon.loadCore();
  await ptPosLexicon.loadChunkFor("a");
  await ptPosLexicon.loadChunkFor("g");
  await ptPosLexicon.loadChunkFor("p");
}

// ── Toggle ─────────────────────────────────────────────────────────────────
export async function toggleWordClass(ctx) {
  const active = !ctx.state.wcActive;
  ctx.state.wcActive = active;

  if (active) {
    ctx.setStatus?.("classes: carregando léxico…");
    try { await loadFullLexicon(); } catch (e) { console.warn("WC lexicon:", e); }

    for (const pc of (ctx.state.pages || [])) {
      const saved = saveCursorWC(pc);
      annotate(pc);
      if (saved) restoreCursorWC(saved);
    }

    ctx.state._wcListeners = new Map();
    ctx.state._wcHoverListeners = new Map();
    ctx.state._wcTouchListeners = new Map();
    ctx.state._wcTimers = new Map();

    for (const pc of (ctx.state.pages || [])) {
      // input: re-anota com debounce
      const inputFn = () => {
        clearTimeout(ctx.state._wcTimers?.get(pc));
        const t = setTimeout(() => {
          const saved = saveCursorWC(pc);
          annotate(pc);
          if (saved) restoreCursorWC(saved);
        }, 400);
        ctx.state._wcTimers?.set(pc, t);
      };
      pc.addEventListener("input", inputFn);
      ctx.state._wcListeners.set(pc, inputFn);

      // hover (desktop) — esconde ao selecionar
      pc.addEventListener("mouseover", onPageMouseOver);
      pc.addEventListener("mouseleave", () => hideTooltip());
      pc.addEventListener("mousedown", () => hideTooltip(true));
      ctx.state._wcHoverListeners.set(pc, onPageMouseOver);

      // touch tap (mobile)
      pc.addEventListener("touchend", onPageTouchEnd, { passive: false });
      ctx.state._wcTouchListeners.set(pc, onPageTouchEnd);
    }

    // selectionchange — cursor via teclado/spacebar drag
    document.addEventListener("selectionchange", onSelectionChange);

    ctx.setStatus?.("classes: ativo");
  } else {
    hideTooltip(true);
    clearTimeout(_selChangeTimer);
    document.removeEventListener("selectionchange", onSelectionChange);
    for (const pc of (ctx.state.pages || [])) {
      // cancela debounce pendente antes de strip — evita re-anotação após strip
      clearTimeout(ctx.state._wcTimers?.get(pc));
      const inputFn = ctx.state._wcListeners?.get(pc);
      if (inputFn) pc.removeEventListener("input", inputFn);
      const hoverFn = ctx.state._wcHoverListeners?.get(pc);
      if (hoverFn) {
        pc.removeEventListener("mouseover", hoverFn);
        pc.removeEventListener("mouseleave", () => hideTooltip());
      }
      const touchFn = ctx.state._wcTouchListeners?.get(pc);
      if (touchFn) pc.removeEventListener("touchend", touchFn);
      const saved = saveCursorWC(pc);
      stripAnnotations(pc);
      if (saved) restoreCursorWC(saved);
    }
    ctx.state._wcListeners = new Map();
    ctx.state._wcHoverListeners = new Map();
    ctx.state._wcTouchListeners = new Map();
    ctx.state._wcTimers = new Map();
    ctx.setStatus?.("classes: desativado");
  }
}

export function initWordClass(ctx) {
  ctx.state.wcActive = false;
  ctx.state._wcListeners = new Map();
  ctx.state._wcHoverListeners = new Map();
  ctx.state._wcTouchListeners = new Map();
  ctx.state._wcTimers = new Map();
}
