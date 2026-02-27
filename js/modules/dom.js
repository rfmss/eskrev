export function getSelectionRange() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.getRangeAt(0);
}

export function getTextBeforeCaretWithin(el) {
  const range = getSelectionRange();
  if (!range) return "";
  if (!el.contains(range.endContainer)) return "";
  const pre = range.cloneRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString();
}

export function deleteCharsBeforeCaretWithin(el, n) {
  const range = getSelectionRange();
  if (!range) return;
  if (!el.contains(range.startContainer)) return;

  const pre = range.cloneRange();
  pre.collapse(true);
  let remaining = n;

  function prevTextNode(node) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let prev = null;
    while (walker.nextNode()) {
      if (walker.currentNode === node) return prev;
      prev = walker.currentNode;
    }
    return prev;
  }

  let node = pre.startContainer;
  let offset = pre.startOffset;

  if (node.nodeType !== Node.TEXT_NODE) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let last = null;
    while (walker.nextNode()) last = walker.currentNode;
    if (!last) return;
    node = last;
    offset = last.textContent.length;
  }

  while (remaining > 0 && node) {
    const take = Math.min(remaining, offset);
    const start = offset - take;

    const del = document.createRange();
    del.setStart(node, start);
    del.setEnd(node, offset);
    del.deleteContents();

    remaining -= take;
    if (remaining <= 0) break;

    node = prevTextNode(node);
    offset = node ? node.textContent.length : 0;
  }
}

export function insertNodeAtCaret(node) {
  const range = getSelectionRange();
  if (!range) return;
  range.collapse(false);
  range.insertNode(node);

  const sel = window.getSelection();
  const after = document.createRange();
  after.setStartAfter(node);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
}

export function ensureEditableAnchorAfterNode(node) {
  if (!node || !node.parentNode) return;
  let anchor = node.nextSibling;
  if (!anchor || anchor.nodeType !== Node.TEXT_NODE) {
    anchor = document.createTextNode("\u200B");
    node.parentNode.insertBefore(anchor, node.nextSibling || null);
  } else if (!anchor.textContent || !anchor.textContent.includes("\u200B")) {
    anchor.textContent = `\u200B${anchor.textContent || ""}`;
  }

  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStart(anchor, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function insertTextAtCaret(text) {
  const range = getSelectionRange();
  if (!range) return;
  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);
  const sel = window.getSelection();
  const after = document.createRange();
  after.setStartAfter(node);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
