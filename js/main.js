import { fitTopbar, positionSliceDockRail } from "./modules/layout.js";
import { refreshDockTags } from "./modules/dock.js";
import { hydratePostits } from "./modules/postits.js";
import { currentPageEditable } from "./modules/page.js";
import { hydrateDockTags } from "./modules/slices.js";
import { cycleTheme, getCurrentTheme, initThemes, setTheme } from "./modules/themes.js";
import { createKeyboardSfx } from "./modules/keyboardSfx.js";
import { createIntegrationRegistry } from "./integrations/registry.js";
import { initNotesSidebar } from "./modules/notes.js";
import { initMesa, exportSkv } from "./modules/mesa.js";
import { addPage, restorePagesState } from "./modules/pageFlow.js";
import { initWordClass } from "./modules/wordclass.js";
import { initGrammarLint } from "./modules/grammarLint.js";
import { initLexCheck }   from "./modules/lexCheck.js";

const refs = {
  frameEl:             document.querySelector(".frame"),
  pagesEl:             document.getElementById("pages"),
  statusEl:            document.getElementById("status"),
  topbarEl:            document.querySelector(".topbar"),
  viewportEl:          document.querySelector(".viewport"),
  sliceDockEl:         document.getElementById("sliceDockRail"),
  postitLayerEl:       document.getElementById("postitLayer"),
  selectionToolbarEl:  document.getElementById("selectionToolbar"),
};

const state = {
  sliceId:       0,
  dockAnchorId:  0,
  pages:         [],   // array de .pageContent elements
  currentPageIdx: 0,
  dockOffsetX:   20,
  dockOffsetY:   0,
};

const ctx = {
  refs,
  state,
  integrations: null,
  sfx: createKeyboardSfx(),
  theme: {
    cycle: cycleTheme,
    set:   setTheme,
    get:   getCurrentTheme,
  },
  setStatus(msg) {
    if (refs.statusEl) refs.statusEl.textContent = msg;
  },
  flashCommandError() {
    const el = refs.frameEl;
    if (!el) return;
    el.classList.remove("cmdErrorFlash");
    void el.offsetWidth;
    el.classList.add("cmdErrorFlash");
    window.setTimeout(() => el.classList.remove("cmdErrorFlash"), 380);
  },
};

ctx.integrations = createIntegrationRegistry(ctx);
ctx.sfx?.bind?.();

// ── Init multi-page ───────────────────────────────────────────────────────
addPage(ctx, null, true);    // cria page1, wires e foca
restorePagesState(ctx);      // restaura conteúdo salvo (ou legado)

hydrateDockTags(ctx);
hydratePostits(ctx);
initThemes();
positionSliceDockRail(ctx);
fitTopbar(ctx);

window.addEventListener("resize", () => fitTopbar(ctx));
window.addEventListener("resize", () => {
  positionSliceDockRail(ctx);
  refreshDockTags(ctx);
});

ctx.setStatus("ready");
window.__ESKREV_INDEX2_READY__ = true;

// ── Notes sidebar ─────────────────────────────────────────────────────────
initNotesSidebar();

// ── Mesa (arquivos / projetos) ────────────────────────────────────────────
initMesa(ctx);

// ── Classes de palavras ───────────────────────────────────────────────────
initWordClass(ctx);

// ── Verificador gramatical ────────────────────────────────────────────────
initGrammarLint(ctx);

// ── Verificador de vocabulário (léxico PT-BR) ─────────────────────────────
initLexCheck();

// ── Foco sempre no editor ao carregar ────────────────────────────────────
requestAnimationFrame(() => {
  const first = document.getElementById("page1");
  if (first) first.focus();
});

document.addEventListener("keydown", (ev) => {
  const key = String(ev.key || "").toLowerCase();
  const mod = (ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey;

  // Ctrl+S — exportar tudo como .skv
  if (mod && key === "s") {
    ev.preventDefault();
    ev.stopPropagation();
    const filename = exportSkv();
    ctx.setStatus?.(`salvo: ${filename}`);
    return;
  }

  // Ctrl+A — seleciona tudo na página ativa
  if (mod && key === "a") {
    const editor = currentPageEditable();
    if (!editor) return;
    ev.preventDefault();
    ev.stopPropagation();
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  }
}, true);
