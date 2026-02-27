import { getTextBeforeCaretWithin, deleteCharsBeforeCaretWithin, insertNodeAtCaret, insertTextAtCaret, ensureEditableAnchorAfterNode } from "./dom.js";
import { getLastWordBeforeToken } from "./textops.js";
import { handleCommand } from "./slices.js";
import { syncFlowPageMarkers, syncPageBreakSeparators, resetFlowMarkerState } from "./flowMarkers.js";
import { syncOuterScrollerMetric, syncOuterScrollerFromContent } from "./scrollSync.js";
import { positionPageFlowRail, positionSliceDockRail } from "./layout.js";
import { initSelectionToolbar } from "./selectionToolbar.js";

function syncPlaceholderState(el) {
  const text = String(el.textContent || "").replace(/\u200B/g, "").trim();
  const hasSlices = !!el.querySelector(".slice");
  el.classList.toggle("is-empty", !text && !hasSlices);
}

function isFormLikeTarget(target) {
  if (!target || target.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") return true;
  if (target.closest?.(".postitComposer")) return true;
  return false;
}

function rangeFromPoint(x, y) {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    const r = document.createRange();
    r.setStart(pos.offsetNode, pos.offset);
    r.collapse(true);
    return r;
  }
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);
  }
  return null;
}

function moveCaretToClientPointWithin(el, clientX, clientY) {
  const r = rangeFromPoint(clientX, clientY);
  if (!r) return false;
  if (!el.contains(r.startContainer)) return false;
  const sel = window.getSelection();
  if (!sel) return false;
  sel.removeAllRanges();
  sel.addRange(r);
  return true;
}

function snapCaretOutOfPageBreak(el) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  if (!el.contains(range.startContainer)) return false;

  const metric = Number(el.dataset.pageMetric || "0");
  if (!Number.isFinite(metric) || metric <= 0) return false;

  const page = el.closest(".page");
  if (!page) return false;
  const rail = page.querySelector(".pageBreakRail");
  if (!rail) return false;

  const breakGap = Number.parseFloat(getComputedStyle(rail).getPropertyValue("--break-gap")) || 33;
  const halfGap = breakGap / 2;

  const caretRect = range.getBoundingClientRect();
  const contentRect = el.getBoundingClientRect();
  const yLocal = (caretRect.top - contentRect.top) + el.scrollTop;
  const pageCount = Number(el.dataset.maxPagesSeen || "1");
  const maxPages = Number.isFinite(pageCount) && pageCount > 1 ? pageCount : 1;

  for (let i = 2; i <= maxPages; i += 1) {
    const breakY = (i - 1) * metric;
    const minY = breakY - halfGap;
    const maxY = breakY + halfGap;
    if (yLocal >= minY && yLocal <= maxY) {
      const targetY = breakY + halfGap + 2;
      const clientY = contentRect.top + targetY - el.scrollTop;
      const clientX = Math.max(contentRect.left + 6, caretRect.left + 1);
      return moveCaretToClientPointWithin(el, clientX, clientY);
    }
  }
  return false;
}

function getActiveBreakZoneAtCaret(el) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return null;
  if (!el.contains(range.startContainer)) return null;

  const metric = Number(el.dataset.pageMetric || "0");
  if (!Number.isFinite(metric) || metric <= 0) return null;
  const page = el.closest(".page");
  if (!page) return null;
  const rail = page.querySelector(".pageBreakRail");
  if (!rail) return null;

  const breakGap = Number.parseFloat(getComputedStyle(rail).getPropertyValue("--break-gap")) || 33;
  const halfGap = breakGap / 2;
  const caretRect = range.getBoundingClientRect();
  const contentRect = el.getBoundingClientRect();
  const yLocal = (caretRect.top - contentRect.top) + el.scrollTop;
  const pageCount = Number(el.dataset.maxPagesSeen || "1");
  const maxPages = Number.isFinite(pageCount) && pageCount > 1 ? pageCount : 1;

  for (let i = 2; i <= maxPages; i += 1) {
    const breakY = (i - 1) * metric;
    const minY = breakY - halfGap;
    const maxY = breakY + halfGap;
    if (yLocal >= minY && yLocal <= maxY) {
      return { breakY, minY, maxY, breakGap };
    }
  }
  return null;
}

function isSliceElement(node) {
  return !!(node && node.nodeType === Node.ELEMENT_NODE && node.classList?.contains("slice"));
}

function findSliceFromNode(node) {
  if (!node) return null;
  if (isSliceElement(node)) return node;
  if (node.nodeType === Node.ELEMENT_NODE) {
    return node.closest?.(".slice") || null;
  }
  return node.parentElement?.closest?.(".slice") || null;
}

function edgeSiblingFromBoundary(container, offset, direction) {
  let node = container;
  let idx = offset;

  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const children = node.childNodes;
      if (direction === "back" && idx > 0) return children[idx - 1] || null;
      if (direction === "forward" && idx < children.length) return children[idx] || null;
    }

    const parent = node.parentNode;
    if (!parent) return null;
    idx = Array.prototype.indexOf.call(parent.childNodes, node);
    if (idx < 0) return null;
    node = parent;
  }
  return null;
}

function edgeNodeWithin(node, direction) {
  let cur = node;
  while (cur && cur.nodeType === Node.ELEMENT_NODE) {
    const next = direction === "back" ? cur.lastChild : cur.firstChild;
    if (!next) break;
    cur = next;
  }
  return cur;
}

function adjacentSliceFromCaret(range, direction) {
  const container = range.startContainer;
  const offset = range.startOffset;

  if (container.nodeType === Node.TEXT_NODE) {
    const len = container.textContent?.length || 0;
    if (direction === "back" && offset > 0) return null;
    if (direction === "forward" && offset < len) return null;
  }

  let sibling = edgeSiblingFromBoundary(container, offset, direction);
  if (!sibling) return null;
  sibling = edgeNodeWithin(sibling, direction);
  return findSliceFromNode(sibling);
}

function selectionTouchesSlice(editorEl, range) {
  const slices = editorEl.querySelectorAll(".slice");
  for (const slice of slices) {
    try {
      if (range.intersectsNode(slice)) return true;
    } catch (_e) {}
  }
  return false;
}

function getIntersectingSlices(editorEl, range) {
  const out = [];
  const slices = editorEl.querySelectorAll(".slice");
  for (const slice of slices) {
    try {
      if (range.intersectsNode(slice)) out.push(slice);
    } catch (_e) {}
  }
  return out;
}

function placeCaretAfter(node) {
  if (!node || !node.parentNode) return false;
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const sel = window.getSelection();
  if (!sel) return false;
  sel.removeAllRanges();
  sel.addRange(range);
  return true;
}

function moveCaretPastSlicesForTyping(editorEl, key) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  if (!editorEl.contains(range.startContainer) || !editorEl.contains(range.endContainer)) return false;

  // If selection crosses slices, collapse typing position after the last touched slice.
  if (!range.collapsed) {
    const touched = getIntersectingSlices(editorEl, range);
    if (!touched.length) return false;
    const target = touched[touched.length - 1];
    return placeCaretAfter(target);
  }

  // If caret is immediately before a slice, jump after it for typing/Enter.
  const forwardSlice = adjacentSliceFromCaret(range, "forward");
  if (forwardSlice) return placeCaretAfter(forwardSlice);
  return false;
}

function shouldProtectSliceFromDelete(editorEl, key) {
  if (key !== "Backspace" && key !== "Delete") return false;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  if (!editorEl.contains(range.startContainer) || !editorEl.contains(range.endContainer)) return false;

  if (!range.collapsed) {
    return selectionTouchesSlice(editorEl, range);
  }

  const direction = key === "Backspace" ? "back" : "forward";
  return !!adjacentSliceFromCaret(range, direction);
}

export function currentPageEditable() {
  const ae = document.activeElement;
  if (ae && ae.classList && ae.classList.contains("pageContent")) return ae;
  return document.querySelector(".pageContent");
}

function getKnownCommands(ctx) {
  return [
    "h", "help",
    "b", "buscar",
    "s", "exportar",
    "n", "notas",
    "i", "importar",
    "books",
    "a", "arquivos",
    "v", "verificacao", "verificação",
    "f", "fullscreen",
    "d", "hardreset",
    "l", "idioma",
    "t", "toolbar",
    "p", "postit", "note",
    "r", "reader",
    "w", "writer",
  ];
}

function isAmbiguousPrefix(ctx, cmd) {
  const c = String(cmd || "").toLowerCase();
  if (!c) return false;
  const known = getKnownCommands(ctx);
  return known.some((k) => k !== c && k.startsWith(c));
}

export function maybeTriggerCommand(ctx, el, { force = false } = {}) {
  const textBefore = getTextBeforeCaretWithin(el);
  const m = textBefore.match(/--([a-z][a-z0-9_-]{0,24})\s*$/i);
  if (!m) return;

  const cmd = (m[1] || "").toLowerCase();
  const token = `--${cmd}`;
  const tokenLen = token.length;
  const word = getLastWordBeforeToken(textBefore, token);

  const ambiguous = isAmbiguousPrefix(ctx, cmd);
  const committedBySpace = /\s$/.test(textBefore);
  if (!force && ambiguous && !committedBySpace) {
    clearTimeout(ctx.state.pendingCommandTimer);
    ctx.state.pendingCommandTimer = setTimeout(() => {
      maybeTriggerCommand(ctx, el, { force: true });
    }, 360);
    return;
  }

  clearTimeout(ctx.state.pendingCommandTimer);
  ctx.state.pendingCommandTimer = null;

  deleteCharsBeforeCaretWithin(el, tokenLen);
  const sliceNode = handleCommand(ctx, el, cmd, word);
  if (sliceNode) {
    insertNodeAtCaret(sliceNode);
    if (sliceNode.classList?.contains("slice")) {
      ensureEditableAnchorAfterNode(sliceNode);
    }
    ctx.setStatus(`slice: --${cmd}`);
  }
}

export function wirePage(ctx, el) {
  let t = null;
  resetFlowMarkerState(ctx, el);
  ctx.integrations?.persistence?.bind?.(el);
  syncPlaceholderState(el);

  el.addEventListener("keydown", (ev) => {
    if (isFormLikeTarget(ev.target)) return;

    if (shouldProtectSliceFromDelete(el, ev.key)) {
      ev.preventDefault();
      ctx.setStatus("corte protegido: use topo/laterais/tag");
      return;
    }

    const isPlainTypingKey = ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.isComposing;
    const isEnter = ev.key === "Enter";

    const breakZone = (isEnter || isPlainTypingKey) ? getActiveBreakZoneAtCaret(el) : null;
    if (breakZone) {
      ev.preventDefault();
      if (isEnter) {
        // Force jump over sacred break zone as if it were occupied content.
        insertTextAtCaret("\n\n");
      } else {
        insertTextAtCaret("\n");
        insertTextAtCaret(ev.key);
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    if (isEnter || isPlainTypingKey) snapCaretOutOfPageBreak(el);
    const jumped = isEnter || isPlainTypingKey ? moveCaretPastSlicesForTyping(el, ev.key) : false;
    if (jumped && isPlainTypingKey) {
      ev.preventDefault();
      insertTextAtCaret(ev.key);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    ctx.sfx?.playForKey?.(ev);
    if (!isEnter) return;
    ev.preventDefault();
    insertTextAtCaret("\n");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });

  el.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      syncPlaceholderState(el);
      snapCaretOutOfPageBreak(el);
      maybeTriggerCommand(ctx, el);
      syncPlaceholderState(el);
      syncFlowPageMarkers(ctx, el, { allowGrowth: true });
      syncPageBreakSeparators(ctx, el, { allowGrowth: true });
      syncOuterScrollerMetric(ctx, el);
      syncOuterScrollerFromContent(ctx, el);
    }, 60);
  });

  el.addEventListener("mouseup", () => {
    snapCaretOutOfPageBreak(el);
  });

  el.addEventListener("scroll", () => {
    syncFlowPageMarkers(ctx, el, { allowGrowth: false });
    syncPageBreakSeparators(ctx, el, { allowGrowth: false });
    syncOuterScrollerMetric(ctx, el);
    syncOuterScrollerFromContent(ctx, el);
  });

  syncFlowPageMarkers(ctx, el, { allowGrowth: true });
  syncPageBreakSeparators(ctx, el, { allowGrowth: true });
  syncOuterScrollerMetric(ctx, el);
  syncOuterScrollerFromContent(ctx, el);
  positionPageFlowRail(ctx, el);
  positionSliceDockRail(ctx);
  initSelectionToolbar(ctx, el);
}
