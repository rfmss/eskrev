import { insertNodeAtCaret } from "./dom.js";
import { createPostit } from "./postits.js";
import { openSelectionConsultSlice } from "./slices.js";

function rangeTouchesSlice(editorEl, range) {
  const slices = editorEl.querySelectorAll(".slice");
  for (const slice of slices) {
    try {
      if (range.intersectsNode(slice)) return true;
    } catch (_e) {}
  }
  return false;
}

function isSelectionInsideEditor(editorEl, range) {
  if (!editorEl || !range) return false;
  const start = range.startContainer;
  const end = range.endContainer;
  return editorEl.contains(start) && editorEl.contains(end);
}

function normalizeSelectionText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function initSelectionToolbar(ctx, editorEl) {
  const toolbar = ctx?.refs?.selectionToolbarEl || document.getElementById("selectionToolbar");
  if (!toolbar || !editorEl) return;

  let selectedText = "";
  let selectedRange = null;
  let raf = 0;

  const hide = () => {
    toolbar.classList.remove("isVisible");
    toolbar.setAttribute("aria-hidden", "true");
  };

  const show = (rect) => {
    const pad = 8;
    const top = Math.max(8, rect.top - toolbar.offsetHeight - pad);
    let left = rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2);
    left = Math.max(8, Math.min(left, window.innerWidth - toolbar.offsetWidth - 8));
    toolbar.style.top = `${Math.round(top)}px`;
    toolbar.style.left = `${Math.round(left)}px`;
    toolbar.classList.add("isVisible");
    toolbar.setAttribute("aria-hidden", "false");
  };

  const update = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      selectedRange = null;
      selectedText = "";
      hide();
      return;
    }

    const range = sel.getRangeAt(0);
    if (!isSelectionInsideEditor(editorEl, range) || rangeTouchesSlice(editorEl, range)) {
      selectedRange = null;
      selectedText = "";
      hide();
      return;
    }

    const text = normalizeSelectionText(sel.toString());
    if (!text) {
      selectedRange = null;
      selectedText = "";
      hide();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) {
      selectedRange = null;
      selectedText = "";
      hide();
      return;
    }

    selectedRange = range.cloneRange();
    selectedText = text;
    show(rect);
  };

  const scheduleUpdate = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  };

  const restoreRangeAndCollapse = () => {
    if (!selectedRange) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(selectedRange);
    sel.collapseToEnd();
    return true;
  };

  toolbar.addEventListener("mousedown", (ev) => {
    ev.preventDefault();
  });

  toolbar.addEventListener("click", (ev) => {
    const btn = ev.target && ev.target.closest ? ev.target.closest(".selectionToolbarBtn") : null;
    if (!btn || !selectedText) return;
    const action = btn.getAttribute("data-act");
    if (!action) return;

    if (action === "consult") {
      editorEl.focus();
      restoreRangeAndCollapse();
      const slice = openSelectionConsultSlice(ctx, editorEl, selectedText);
      if (slice) {
        insertNodeAtCaret(slice);
        ctx.setStatus?.(`consulta: ${selectedText}`);
      }
      hide();
      return;
    }

    if (action === "postit") {
      createPostit(ctx, selectedText);
      ctx.setStatus?.("post-it criado pela seleção");
      hide();
    }
  });

  document.addEventListener("selectionchange", scheduleUpdate);
  editorEl.addEventListener("mouseup", scheduleUpdate);
  editorEl.addEventListener("keyup", scheduleUpdate);
  editorEl.addEventListener("scroll", scheduleUpdate);
  window.addEventListener("resize", scheduleUpdate);
  document.addEventListener("pointerdown", (ev) => {
    if (toolbar.contains(ev.target)) return;
    if (editorEl.contains(ev.target)) return;
    hide();
  });
}
