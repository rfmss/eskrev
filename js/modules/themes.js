const THEME_KEY = "eskrev:index2:theme";
const THEMES = new Set(["paper", "ink", "blueprint"]);
const THEME_ORDER = ["paper", "ink", "blueprint"];

function applyTheme(theme) {
  const safe = THEMES.has(theme) ? theme : "paper";
  document.body.dataset.theme = safe;
  const isDark = safe === "ink";
  document.querySelectorAll(".chrome .themeToggle").forEach((el) => {
    el.classList.toggle("is-dark", isDark);
    el.setAttribute("aria-pressed", isDark ? "true" : "false");
    el.setAttribute("title", isDark ? "Tema escuro ativo" : "Tema claro ativo");
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
    btn.addEventListener("click", () => {
      const current = getCurrentTheme();
      setTheme(current === "ink" ? "paper" : "ink");
    });
    btn.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      const current = getCurrentTheme();
      setTheme(current === "ink" ? "paper" : "ink");
    });
  });

  return initial;
}
