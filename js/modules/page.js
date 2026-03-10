import { getTextBeforeCaretWithin, deleteCharsBeforeCaretWithin, insertNodeAtCaret, insertTextAtCaret, ensureEditableAnchorAfterNode } from "./dom.js";
import { getLastWordBeforeToken } from "./textops.js";
import { handleCommand } from "./slices.js";
import { checkOverflow, checkUnderflow, cleanupEmptyPages, isAtStart, isAtEnd, moveCursorToEnd, moveCursorToStart, removePage, savePagesState, saveCursorForReflow, restoreCursorAfterReflow } from "./pageFlow.js";
import { positionSliceDockRail } from "./layout.js";
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

function findNextSliceAfterOnlyWhitespace(editorEl, range) {
  if (!range.collapsed) return null;
  const slices = editorEl.querySelectorAll(".slice");
  for (const slice of slices) {
    try {
      if (range.comparePoint(slice, 0) <= 0) continue; // slice is before/at caret
      // Slice is after caret. Check if only whitespace between them.
      const between = document.createRange();
      between.setStart(range.startContainer, range.startOffset);
      between.setEndBefore(slice);
      const text = between.toString().replace(/\u200B/g, "").trim();
      if (!text) return slice;
      break; // real content before this slice — stop searching
    } catch (_e) {}
  }
  return null;
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

  // If caret is immediately before a slice, jump after it.
  const forwardSlice = adjacentSliceFromCaret(range, "forward");
  if (forwardSlice) return placeCaretAfter(forwardSlice);

  // If only whitespace separates the caret from the next slice, jump past it.
  // This makes the slice an impenetrable barrier — text cannot accumulate before it.
  const nearSlice = findNextSliceAfterOnlyWhitespace(editorEl, range);
  if (nearSlice) return placeCaretAfter(nearSlice);

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
  return ["h", "n", "a", "w", "d"];
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
  const tokenLen = m[0].length;
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
    // Slices são blocos — nunca podem cortar uma frase no meio.
    // Move o cursor para o fim do editor antes de inserir.
    if (sliceNode.classList?.contains("slice")) {
      moveCursorToEnd(el);
    }
    insertNodeAtCaret(sliceNode);
    if (sliceNode.classList?.contains("slice")) {
      ensureEditableAnchorAfterNode(sliceNode);
    }
    ctx.setStatus(`slice: --${cmd}`);
  }
}

export function wirePage(ctx, el) {
  let t = null;
  syncPlaceholderState(el);

  el.addEventListener("keydown", (ev) => {
    if (isFormLikeTarget(ev.target)) return;

    // ── Navegação cross-page ─────────────────────────────────────────────
    // Backspace no início da página (cursor colapsado) → mescla com a anterior
    if (ev.key === "Backspace" && !ev.ctrlKey && !ev.metaKey) {
      const idx = ctx.state.pages?.indexOf(el) ?? -1;
      if (idx > 0) {
        const sel = window.getSelection();
        if (sel?.isCollapsed && sel?.rangeCount && isAtStart(el, sel.getRangeAt(0))) {
          ev.preventDefault();
          const prev = ctx.state.pages[idx - 1];
          // Memoriza onde termina o conteúdo ORIGINAL de prev (ponto de junção)
          let mergeOffset = 0;
          for (let j = 0; j < idx - 1; j++) mergeOffset += (ctx.state.pages[j]?.textContent.length || 0);
          mergeOffset += prev.textContent.length;
          while (el.firstChild) prev.appendChild(el.firstChild);
          removePage(ctx, idx);
          prev.focus();
          checkOverflow(ctx, prev);
          // Cursor no ponto de junção (pode ter migrado para nova página)
          restoreCursorAfterReflow(ctx, { totalOffset: mergeOffset });
          return;
        }
      }
    }

    // ArrowDown no fim → foca próxima página
    if (ev.key === "ArrowDown") {
      const idx = ctx.state.pages?.indexOf(el) ?? -1;
      if (idx >= 0 && idx < (ctx.state.pages?.length ?? 0) - 1) {
        const sel = window.getSelection();
        if (sel?.rangeCount && isAtEnd(el, sel.getRangeAt(0))) {
          ev.preventDefault();
          const next = ctx.state.pages[idx + 1];
          moveCursorToStart(next);
          next.focus();
          return;
        }
      }
    }

    // ArrowUp no início → foca página anterior
    if (ev.key === "ArrowUp") {
      const idx = ctx.state.pages?.indexOf(el) ?? -1;
      if (idx > 0) {
        const sel = window.getSelection();
        if (sel?.rangeCount && isAtStart(el, sel.getRangeAt(0))) {
          ev.preventDefault();
          const prev = ctx.state.pages[idx - 1];
          moveCursorToEnd(prev);
          prev.focus();
          return;
        }
      }
    }

    // ArrowLeft no início → foca fim da página anterior
    if (ev.key === "ArrowLeft" && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) {
      const idx = ctx.state.pages?.indexOf(el) ?? -1;
      if (idx > 0) {
        const sel = window.getSelection();
        if (sel?.isCollapsed && sel?.rangeCount && isAtStart(el, sel.getRangeAt(0))) {
          ev.preventDefault();
          const prev = ctx.state.pages[idx - 1];
          moveCursorToEnd(prev);
          prev.focus();
          return;
        }
      }
    }

    // ArrowRight no fim → foca início da próxima página
    if (ev.key === "ArrowRight" && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey) {
      const idx = ctx.state.pages?.indexOf(el) ?? -1;
      if (idx >= 0 && idx < (ctx.state.pages?.length ?? 0) - 1) {
        const sel = window.getSelection();
        if (sel?.isCollapsed && sel?.rangeCount && isAtEnd(el, sel.getRangeAt(0))) {
          ev.preventDefault();
          const next = ctx.state.pages[idx + 1];
          moveCursorToStart(next);
          next.focus();
          return;
        }
      }
    }
    // ────────────────────────────────────────────────────────────────────

    if (shouldProtectSliceFromDelete(el, ev.key)) {
      ev.preventDefault();
      ctx.setStatus("corte protegido: use topo/laterais/tag");
      return;
    }

    const isPlainTypingKey = ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.isComposing;
    const isEnter = ev.key === "Enter";

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
      maybeTriggerCommand(ctx, el);
      syncPlaceholderState(el);
      // Salva cursor ANTES das mutações DOM. findTextBreakPoint corrompe
      // textNode.textContent durante busca binária; moveLastNodeToNext move
      // o nó para outra página. O restore reposiciona corretamente.
      const _cur = saveCursorForReflow(ctx);
      checkOverflow(ctx, el);
      checkUnderflow(ctx, el);
      cleanupEmptyPages(ctx);
      restoreCursorAfterReflow(ctx, _cur);
      savePagesState(ctx);
    }, 60);
  });

  // ── Clipboard: only content born in this editor can be pasted ───────────
  const BORN = "\u200B\uFEFF";

  el.addEventListener("copy", (ev) => {
    if (!ev.clipboardData) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    ev.clipboardData.setData("text/plain", BORN + sel.toString());
    ev.preventDefault();
  });

  el.addEventListener("cut", (ev) => {
    if (!ev.clipboardData) return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer)) return;
    ev.clipboardData.setData("text/plain", BORN + sel.toString());
    ev.preventDefault();
    if (!selectionTouchesSlice(el, range)) {
      range.deleteContents();
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      ctx.setStatus("corte protegido: selecione apenas texto");
    }
  });

  el.addEventListener("paste", (ev) => {
    ev.preventDefault();
    if (!ev.clipboardData) return;
    const text = ev.clipboardData.getData("text/plain");
    if (!text.startsWith(BORN)) {
      ctx.flashCommandError?.();
      ctx.setStatus("colar externo bloqueado: apenas conteúdo criado aqui");
      return;
    }
    const clean = text.slice(BORN.length);
    if (clean) {
      insertTextAtCaret(clean);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

  positionSliceDockRail(ctx);
  initSelectionToolbar(ctx, el);
}
