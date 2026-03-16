const THEME_KEY = "eskrev:index2:theme";
const THEMES = new Set(["paper", "script", "chumbo"]);
const THEME_ORDER = ["paper", "script", "chumbo"];

const THEME_LABELS = {
  paper:  "Tema claro ativo",
  script: "Tema roteiro ativo",
  chumbo: "Tema escuro ativo",
};

function applyTheme(theme) {
  const safe = THEMES.has(theme) ? theme : "paper";
  document.body.dataset.theme = safe;
  const isDark = safe === "chumbo";
  document.querySelectorAll(".chrome .themeToggle").forEach((el) => {
    el.classList.toggle("is-dark", isDark);
    el.classList.toggle("is-script", safe === "script");
    el.setAttribute("aria-pressed", isDark ? "true" : "false");
    el.setAttribute("title", THEME_LABELS[safe] ?? "Tema ativo");
  });
  return safe;
}

export function setTheme(theme) {
  const safe = applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, safe);
  } catch (_e) {}
  return safe;
}

export function getCurrentTheme() {
  const current = document.body?.dataset?.theme || "";
  return THEMES.has(current) ? current : "paper";
}

export function cycleTheme() {
  const current = getCurrentTheme();
  const idx = THEME_ORDER.indexOf(current);
  const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length] || "paper";
  return setTheme(next);
}

export function initThemes() {
  const saved = localStorage.getItem(THEME_KEY);
  const initial = applyTheme(saved || "paper");

  document.querySelectorAll(".chrome .themeToggle").forEach((btn) => {
    btn.addEventListener("click", () => cycleTheme());
    btn.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      cycleTheme();
    });
  });

  return initial;
}
