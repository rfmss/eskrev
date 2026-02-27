let dictModulePromise = null;

function fold(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function getPtDictionary() {
  if (!dictModulePromise) {
    dictModulePromise = import("../../src/js/modules/pt_dictionary.js");
  }
  const mod = await dictModulePromise;
  return mod.ptDictionary;
}

export async function lookupPtDetailed(term) {
  const t = String(term || "").trim();
  if (!t) return { ok: false, reason: "empty" };
  try {
    const dict = await getPtDictionary();
    const result = await dict.lookupDetailed(t);
    return {
      ok: true,
      term: t,
      entry: result?.entry || null,
      status: result?.status || null,
      tried: result?.tried || [],
      raw: result?.raw || t,
      error: result?.error || null,
    };
  } catch (error) {
    return { ok: false, reason: "load_error", term: t, error };
  }
}

export async function lookupPtDoubt(term) {
  const t = String(term || "").trim();
  if (!t) return { ok: false, reason: "empty" };
  try {
    const dict = await getPtDictionary();
    const doubt = await dict.getDoubt(t);
    return { ok: true, term: t, doubt: doubt || null };
  } catch (error) {
    return { ok: false, reason: "load_error", term: t, error };
  }
}

export async function lookupPtRegencia(term) {
  const t = String(term || "").trim();
  if (!t) return { ok: false, reason: "empty" };
  try {
    const dict = await getPtDictionary();
    const regencia = await dict.getRegencia(t);
    return { ok: true, term: t, regencia: regencia || null };
  } catch (error) {
    return { ok: false, reason: "load_error", term: t, error };
  }
}

export async function scanPtDoubts(text) {
  const body = String(text || "").trim();
  if (!body) return { ok: true, items: [] };
  try {
    const dict = await getPtDictionary();
    const items = await dict.findDoubts(body);
    return { ok: true, items: Array.isArray(items) ? items : [] };
  } catch (error) {
    return { ok: false, reason: "load_error", error, items: [] };
  }
}

export async function scanPtRegencias(text) {
  const body = String(text || "").trim();
  if (!body) return { ok: true, items: [] };
  try {
    const dict = await getPtDictionary();
    const items = await dict.findRegenciaAlerts(body);
    return { ok: true, items: Array.isArray(items) ? items : [] };
  } catch (error) {
    return { ok: false, reason: "load_error", error, items: [] };
  }
}

export function findTermInText(term, text, limit = 6) {
  const needle = fold(term).trim();
  if (!needle) return [];
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim());
  return lines
    .map((line, idx) => ({ line, idx: idx + 1 }))
    .filter((entry) => entry.line && fold(entry.line).includes(needle))
    .slice(0, limit);
}
