import { ptPosLexicon } from "../../src/js/modules/pt_pos_lexicon.js";

// ── Dicionário — lazy-load por chunk de inicial ────────────────────────────
const dictEntries     = new Map();
const dictLoaded      = { core: false, chunk_1: false, chunk_2: false, chunk_3: false };
let regenciasData     = null;
let duvidasData       = null;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao carregar ${url}`);
  return res.json();
}

function chunkForKey(key) {
  const c = key?.[0];
  if (!c || !/[a-z]/.test(c)) return "core";
  if (c <= "f") return "chunk_1";
  if (c <= "o") return "chunk_2";
  return "chunk_3";
}

async function loadDictChunk(chunk) {
  if (dictLoaded[chunk]) return;
  try {
    const data = await fetchJson(`src/assets/lingua/pt_dict_${chunk}.json`);
    for (const [word, entry] of Object.entries(data || {})) {
      dictEntries.set(normalize(word), { word, ...entry });
    }
  } catch (_) {}
  dictLoaded[chunk] = true;
}

async function loadDictFor(key) {
  await Promise.all([
    loadDictChunk("core"),
    loadDictChunk(chunkForKey(key)),
  ]);
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

// ── POS → rótulo legível ───────────────────────────────────────────────────
const POS_LABEL = {
  VERB: "verbo", SUBST: "substantivo", ADJ: "adjetivo", ADV: "advérbio",
  PRON: "pronome", ART: "artigo", PREP: "preposição", CONJ: "conjunção",
  NUM: "numeral", INTJ: "interjeição", NOUN: "substantivo", PART: "particípio",
};

function posLabel(posList) {
  if (!Array.isArray(posList) || !posList.length) return null;
  return posList.map(p => POS_LABEL[p] || p.toLowerCase()).join(" / ");
}

// ── Lookup principal ───────────────────────────────────────────────────────
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

  const dictEntry    = dictEntries.get(key) || null;
  const posEntry     = ptPosLexicon.entries.get(key) || null;
  const regEntry     = regenciasData?.[raw.toLowerCase()] || regenciasData?.[key] || null;
  const duvidasKey   = Object.keys(duvidasData || {}).find(k => {
    const d = duvidasData[k];
    if (!d.patterns) return false;
    return d.patterns.some(p => { try { return new RegExp(p, "i").test(key); } catch (_) { return false; } });
  });
  const duvidasEntry = duvidasKey ? duvidasData[duvidasKey] : null;

  return formatVerbete(raw, key, dictEntry, posEntry, regEntry, duvidasEntry);
}

// ── Formatação do verbete ──────────────────────────────────────────────────
function formatVerbete(raw, key, dict, pos, reg, duvida) {
  const lines = [];
  // Usa sempre o que o utilizador escreveu — dict.word pode ser variante acentuada
  // diferente da forma consultada (ex.: "ora" → dict.word "orá")
  const word  = raw;

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
    lines.push(fallbackDesc(key, cls) || "(palavra identificada no corpus — sem definição)");
  } else {
    lines.push("(não encontrado no corpus local)");
  }

  // Regência
  const regList = dict?.regencia?.length
    ? dict.regencia
    : reg ? Object.values(reg.sentidos || {}).map(s => `${s.regencia} — ${s.exemplo}`) : [];
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

// Remove artefatos tipográficos do Caldas Aulete (ponto e vírgula iniciais, etc.)
function cleanDef(def) {
  return def
    .replace(/^\s*[;,\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Fallback mínimo por classe ─────────────────────────────────────────────
function fallbackDesc(key, cls) {
  const map = {
    VERB:  "Verbo da língua portuguesa.",
    SUBST: "Substantivo — nomeia uma entidade.",
    ADJ:   "Adjetivo — qualifica ou caracteriza.",
    ADV:   "Advérbio — modifica verbo, adjetivo ou outro advérbio.",
    PRON:  "Pronome — substitui ou acompanha o nome.",
    ART:   "Artigo — determina o nome.",
    PREP:  "Preposição — conecta termos da oração.",
    CONJ:  "Conjunção — liga orações ou termos.",
    NUM:   "Numeral — indica quantidade ou ordem.",
    INTJ:  "Interjeição — expressa emoção ou reação.",
  };
  return map[cls] || null;
}

// ── Exports para lexCheck ──────────────────────────────────────────────────
export { dictEntries };

export async function loadAllDictChunks() {
  await Promise.all([
    loadDictChunk("core"),
    loadDictChunk("chunk_1"),
    loadDictChunk("chunk_2"),
    loadDictChunk("chunk_3"),
  ]);
}
