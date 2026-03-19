// js/modules/perf.js
// Medição de performance: TTFR (editor pronto) + TTFA (primeira ação)
// Resultados em sessionStorage — persistem entre renders na mesma aba

const KEY_TTFR = "eskrev:perf:ttfr";
const KEY_TTFA = "eskrev:perf:ttfa";

export function markEditorReady() {
  if (typeof performance === "undefined") return;
  const t = Math.round(performance.now());
  try { sessionStorage.setItem(KEY_TTFR, String(t)); } catch (_) {}
  performance.mark?.("eskrev:ready");
}

export function markFirstAction() {
  if (typeof performance === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY_TTFA)) return; // só a primeira vez
    const t = Math.round(performance.now());
    sessionStorage.setItem(KEY_TTFA, String(t));
  } catch (_) {}
  performance.mark?.("eskrev:first-action");
}

function fmt(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function getPerfReport() {
  let ttfr = null;
  let ttfa = null;
  try {
    const r = sessionStorage.getItem(KEY_TTFR);
    const a = sessionStorage.getItem(KEY_TTFA);
    if (r) ttfr = parseInt(r, 10);
    if (a) ttfa = parseInt(a, 10);
  } catch (_) {}

  let status = null;
  if (ttfa != null) {
    if (ttfa < 2000) status = "ok";
    else if (ttfa < 5000) status = "warn";
    else status = "slow";
  }

  return {
    ttfr,
    ttfa,
    ttfrFmt: ttfr != null ? fmt(ttfr) : null,
    ttfaFmt: ttfa != null ? fmt(ttfa) : null,
    status,
  };
}
