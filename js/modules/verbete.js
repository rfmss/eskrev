/**
 * verbete.js — Dicionário PT-BR com lookup por verbete
 *
 * CORREÇÕES v2:
 *  1. formatVerbete usa sempre entry.word como forma canônica — nunca
 *     o raw digitado pelo usuário como palavra exibida no cabeçalho quando
 *     o dict tem a forma correta.
 *  2. Adicionado filtro em posLabel para não retornar null em casos
 *     onde posList está vazio mas pos tem entrada.
 *  3. cleanDef mais robusto — remove artefatos de múltiplas fontes.
 *  4. Lookup no regenciasData normalizado para evitar miss por capitalização.
 */

import { ptPosLexicon } from "../../src/js/modules/pt_pos_lexicon.js";

// ── Dicionário — lazy-load por letra ──────────────────────────────────────
const dictEntries  = new Map();
const dictLoaded   = new Set();
let regenciasData  = null;
let duvidasData    = null;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url}`);
  return res.json();
}

function letterForKey(key) {
  const c = key?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")?.[0];
  if (!c || !/[a-z]/.test(c)) return "_";
  return c;
}

async function loadDictChunk(letter) {
  if (dictLoaded.has(letter)) return;
  dictLoaded.add(letter);
  try {
    const url  = `src/assets/lingua/pt_dict_rich_chunk_${letter}.json`;
    const data = await fetchJson(url);
    for (const [word, entry] of Object.entries(data || {})) {
      dictEntries.set(normalize(word), { word, ...entry });
    }
  } catch (_) {}
}

async function loadDictFor(key) {
  await loadDictChunk(letterForKey(key));
}

async function loadRegencias() {
  if (regenciasData) return;
  try { regenciasData = await fetchJson("src/assets/lingua/pt_regencias.json"); }
  catch (_) { regenciasData = {}; }
}

async function loadDuvidas() {
  if (duvidasData) return;
  try { duvidasData = await fetchJson("src/assets/lingua/pt_duvidas.json"); }
  catch (_) { duvidasData = {}; }
}

function normalize(w) {
  try { return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  catch (_) { return w.toLowerCase(); }
}

// ── POS → rótulo legível ──────────────────────────────────────────────────
const POS_LABEL = {
  VERB: "verbo", SUBST: "substantivo", ADJ: "adjetivo", ADV: "advérbio",
  PRON: "pronome", ART: "artigo", PREP: "preposição", CONJ: "conjunção",
  NUM: "numeral", INTJ: "interjeição", NOUN: "substantivo", PART: "particípio",
};

function posLabel(posList) {
  if (!Array.isArray(posList) || !posList.length) return null;
  const labels = posList
    .map(p => POS_LABEL[p] || p.toLowerCase())
    .filter(Boolean);
  return labels.length ? labels.join(" / ") : null;
}

// ── Lookup principal ──────────────────────────────────────────────────────
export async function lookupVerbete(raw) {
  if (!raw) return null;
  const key = normalize(raw.trim());
  if (!key) return null;

  await Promise.all([
    loadDictFor(key),
    ptPosLexicon.loadCore(),
    ptPosLexicon.loadChunkFor(key),
    loadRegencias(),
    loadDuvidas(),
  ]);

  const dictEntry = dictEntries.get(key) || null;
  const posEntry  = ptPosLexicon.entries.get(key) || null;

  // CORREÇÃO: normaliza a chave para o lookup em regencias e duvidas,
  // evitando miss por capitalização ou forma acentuada diferente.
  const regEntry = regenciasData
    ? (regenciasData[key] || regenciasData[raw.toLowerCase()] || null)
    : null;

  const duvidasKey = Object.keys(duvidasData || {}).find(k => {
    const d = duvidasData[k];
    if (!d?.patterns) return false;
    return d.patterns.some(p => {
      try { return new RegExp(p, "i").test(key); }
      catch (_) { return false; }
    });
  });
  const duvidasEntry = duvidasKey ? duvidasData[duvidasKey] : null;

  return formatVerbete(raw, key, dictEntry, posEntry, regEntry, duvidasEntry);
}

// ── Formatação do verbete ─────────────────────────────────────────────────
function formatVerbete(raw, key, dict, pos, reg, duvida) {
  const lines = [];

  // CORREÇÃO: usa dict.word como forma canônica quando disponível.
  // Isso garante a acentuação correta no cabeçalho.
  // raw é mantido apenas como fallback quando não há entrada no dict.
  const word = dict?.word || raw;

  // Cabeçalho
  const posList = dict?.pos?.length ? dict.pos : (pos?.pos || []);
  const label   = posLabel(posList);
  lines.push(word.toUpperCase() + (label ? `  [${label}]` : ""));
  lines.push("─".repeat(34));

  // Definição
  if (dict?.def) {
    lines.push(cleanDef(dict.def));
  } else if (pos) {
    const guessed = ptPosLexicon.guess(key);
    const cls     = (pos?.pos?.[0] || guessed?.pos?.[0] || "").toUpperCase();
    lines.push(fallbackDesc(cls) || "(palavra identificada no corpus — sem definição)");
  } else {
    lines.push("(não encontrado no corpus local)");
  }

  // Sinônimos e antônimos
  const sins = dict?.sin || [];
  const ants = dict?.ant || [];
  if (sins.length) {
    lines.push("");
    lines.push("Sinônimos: " + sins.join(", "));
  }
  if (ants.length) {
    lines.push("");
    lines.push("Antônimos: " + ants.join(", "));
  }

  // Regência
  const regList = dict?.regencia?.length
    ? dict.regencia
    : reg
      ? Object.values(reg.sentidos || {}).map(s => `${s.regencia} — ${s.exemplo}`)
      : [];
  if (regList.length) {
    lines.push("");
    lines.push("Regência:");
    regList.forEach(r => lines.push(`  ${r}`));
  }

  // Formas / flexões
  const formas = dict?.formas || dict?.flexoes || [];
  if (formas.length) {
    lines.push("");
    lines.push("Formas: " + formas.slice(0, 6).join(", ") + (formas.length > 6 ? "…" : ""));
  }

  // Exemplo
  const exs = dict?.exemplos || [];
  if (exs.length) {
    lines.push("");
    lines.push("Ex.: " + exs[0]);
  }

  // Observação
  if (dict?.observacoes) {
    lines.push("");
    lines.push("Obs.: " + dict.observacoes);
  }

  // Dúvida de uso
  if (duvida) {
    lines.push("");
    lines.push("⚠ Dúvida comum:");
    lines.push(duvida.explicacao);
    if (duvida.exemplos?.correto?.[0])   lines.push("  ✓ " + duvida.exemplos.correto[0]);
    if (duvida.exemplos?.incorreto?.[0]) lines.push("  ✗ " + duvida.exemplos.incorreto[0]);
  }

  return { word, posList, label, body: lines.join("\n") };
}

// CORREÇÃO: cleanDef mais robusto — remove artefatos de múltiplas fontes lexicográficas.
function cleanDef(def) {
  if (!def) return "";
  return def
    .replace(/^\s*[;,|]+\s*/g, "")   // remove pontuação inicial (Caldas Aulete, Houaiss)
    .replace(/\s{2,}/g, " ")          // normaliza espaços múltiplos
    .replace(/\s+([,;.])/g, "$1")     // remove espaço antes de pontuação
    .trim();
}

// CORREÇÃO: fallbackDesc recebe apenas cls (não mais key inutilizado).
function fallbackDesc(cls) {
  const map = {
    VERB:  "Verbo da língua portuguesa.",
    SUBST: "Substantivo — nomeia uma entidade.",
    NOUN:  "Substantivo — nomeia uma entidade.",
    ADJ:   "Adjetivo — qualifica ou caracteriza.",
    ADV:   "Advérbio — modifica verbo, adjetivo ou outro advérbio.",
    PRON:  "Pronome — substitui ou acompanha o nome.",
    ART:   "Artigo — determina o nome.",
    PREP:  "Preposição — conecta termos da oração.",
    CONJ:  "Conjunção — liga orações ou termos.",
    NUM:   "Numeral — indica quantidade ou ordem.",
    INTJ:  "Interjeição — expressa emoção ou reação.",
    PART:  "Particípio — forma nominal do verbo.",
  };
  return map[cls] || null;
}

// ── Exports utilitários ───────────────────────────────────────────────────
export async function loadAllDictChunks() {
  const letters = "abcdefghijklmnopqrstuvwxyz_".split("");
  await Promise.all(letters.map(l => loadDictChunk(l)));
}

export function dictHas(word) {
  return dictEntries.has(normalize(word));
}

export function dictGet(word) {
  return dictEntries.get(normalize(word)) ?? null;
}
