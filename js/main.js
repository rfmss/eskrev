import { fitTopbar, positionPageFlowRail, positionSliceDockRail } from "./modules/layout.js";
import { refreshDockTags } from "./modules/dock.js";
import { syncFlowPageMarkers, syncPageBreakSeparators } from "./modules/flowMarkers.js";
import { syncOuterScrollerMetric, syncOuterScrollerFromContent, bindOuterScroll } from "./modules/scrollSync.js";
import { hydratePostits } from "./modules/postits.js";
import { wirePage, currentPageEditable } from "./modules/page.js";
import { hydrateDockTags, hydrateSlices } from "./modules/slices.js";
import { cycleTheme, getCurrentTheme, initThemes, setTheme } from "./modules/themes.js";
import { createKeyboardSfx } from "./modules/keyboardSfx.js";
import { createIntegrationRegistry } from "./integrations/registry.js";

const refs = {
  frameEl: document.querySelector(".frame"),
  pagesEl: document.getElementById("pages"),
  statusEl: document.getElementById("status"),
  topbarEl: document.querySelector(".topbar"),
  viewportEl: document.querySelector(".viewport"),
  outerScrollEl: document.getElementById("outerScroll"),
  outerScrollSizerEl: document.getElementById("outerScrollSizer"),
  pageBreakRailEl: document.getElementById("pageBreakRail"),
  pageFlowRailEl: document.getElementById("pageFlowRail"),
  sliceDockEl: document.getElementById("sliceDockRail"),
  postitLayerEl: document.getElementById("postitLayer"),
  selectionToolbarEl: document.getElementById("selectionToolbar"),
};

const state = {
  sliceId: 0,
  dockAnchorId: 0,
  syncOuterLock: false,
  syncInnerLock: false,
  dockOffsetX: 20,
  dockOffsetY: 0,
  flowOffsetY: 0,
};

const ctx = {
  refs,
  state,
  integrations: null,
  sfx: createKeyboardSfx(),
  theme: {
    cycle: cycleTheme,
    set: setTheme,
    get: getCurrentTheme,
  },
  setStatus(msg) {
    if (refs.statusEl) refs.statusEl.textContent = msg;
  },
  flashCommandError() {
    const el = refs.frameEl;
    if (!el) return;
    el.classList.remove("cmdErrorFlash");
    // restart animation
    void el.offsetWidth;
    el.classList.add("cmdErrorFlash");
    window.setTimeout(() => el.classList.remove("cmdErrorFlash"), 380);
  },
};

const page1 = document.getElementById("page1");
ctx.integrations = createIntegrationRegistry(ctx);
ctx.sfx?.bind?.();
ctx.integrations?.persistence?.restore?.(page1);
hydrateSlices(ctx, page1);
hydrateDockTags(ctx);
hydratePostits(ctx);
initThemes();
wirePage(ctx, page1);
positionSliceDockRail(ctx);
fitTopbar(ctx);

bindOuterScroll(ctx, {
  currentPageEditable,
  syncFlowPageMarkers: (el, opts) => syncFlowPageMarkers(ctx, el, opts),
  syncPageBreakSeparators: (el, opts) => syncPageBreakSeparators(ctx, el, opts),
  refreshDockTags: () => refreshDockTags(ctx),
});

window.addEventListener("resize", () => fitTopbar(ctx));
window.addEventListener("resize", () => {
  const el = document.getElementById("page1");
  if (el) positionPageFlowRail(ctx, el);
  positionSliceDockRail(ctx);
  refreshDockTags(ctx);
  if (el) {
    syncPageBreakSeparators(ctx, el, { allowGrowth: false });
    syncOuterScrollerMetric(ctx, el);
    syncOuterScrollerFromContent(ctx, el);
  }
});

document.getElementById("page1")?.focus();
ctx.setStatus("ready");
window.__ESKREV_INDEX2_READY__ = true;

document.addEventListener("keydown", (ev) => {
  const key = String(ev.key || "").toLowerCase();
  const isSelectAll = (ev.ctrlKey || ev.metaKey) && !ev.shiftKey && !ev.altKey && key === "a";
  if (!isSelectAll) return;

  const editor = document.getElementById("page1");
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
}, true);
