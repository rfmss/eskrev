import { wirePage } from "./page.js";
import { hydrateSlices } from "./slices.js";
import { idbGet, idbSet, idbRemove } from "./idb.js";

const A4_PX = Math.round(297 * (96 / 25.4)); // ≈ 1123px

function syncPlaceholder(el) {
  const text = String(el.textContent || "").replace(/\u200B/g, "").trim();
  el.classList.toggle("is-empty", !text && !el.querySelector(".slice"));
}

// ── Cria nova página no DOM, wires e registra em ctx.state.pages ──────────
export function addPage(ctx, afterContentEl, focus = false) {
  const pagesDiv = document.getElementById("pages");
  const pageNum  = ctx.state.pages.length + 1;

  const page = document.createElement("div");
  page.className = "page";
  page.dataset.page = String(pageNum);

  const content = document.createElement("div");
  content.className = "pageContent";
  content.id = `page${pageNum}`;
  content.contentEditable = "true";
  content.setAttribute("spellcheck", "false");
  content.setAttribute("aria-label", `Editor página ${pageNum}`);
  if (pageNum === 1) {
    content.setAttribute(
      "data-placeholder",
      "..h ajuda  ·  ..n notas  ·  ..a arquivos",
    );
  }

  const numEl = document.createElement("div");
  numEl.className = "pageNumber";
  numEl.textContent = String(pageNum);

  page.appendChild(content);
  page.appendChild(numEl);

  if (afterContentEl) {
    afterContentEl.closest(".page").after(page);
    const idx = ctx.state.pages.indexOf(afterContentEl) + 1;
    ctx.state.pages.splice(idx, 0, content);
  } else {
    pagesDiv.appendChild(page);
    ctx.state.pages.push(content);
  }

  rebuildPageNumbers(ctx);
  wirePage(ctx, content);
  if (focus) setTimeout(() => content.focus(), 0);
  return content;
}

export function removePage(ctx, idx) {
  if (ctx.state.pages.length <= 1) return;
  const content = ctx.state.pages[idx];
  const page    = content.closest(".page");
  ctx.state.pages.splice(idx, 1);
  page.remove();
  rebuildPageNumbers(ctx);
}

function rebuildPageNumbers(ctx) {
  ctx.state.pages.forEach((el, i) => {
    const page = el.closest(".page");
    if (page) page.dataset.page = String(i + 1);
    const numEl = page?.querySelector(".pageNumber");
    if (numEl) numEl.textContent = String(i + 1);
  });
}

// ── Core overflow/underflow ───────────────────────────────────────────────
export function checkOverflow(ctx, contentEl) {
  if (contentEl.scrollHeight <= contentEl.clientHeight) return;

  const idx = ctx.state.pages.indexOf(contentEl);
  let nextContent = ctx.state.pages[idx + 1];
  if (!nextContent) nextContent = addPage(ctx, contentEl, false);

  moveLastNodeToNext(contentEl, nextContent);
  syncPlaceholder(contentEl);
  syncPlaceholder(nextContent);
  checkOverflow(ctx, nextContent); // cascade
}

export function checkUnderflow(ctx, contentEl) {
  const idx         = ctx.state.pages.indexOf(contentEl);
  const nextContent = ctx.state.pages[idx + 1];
  if (!nextContent) return;

  while (nextContent.firstChild) {
    const node = nextContent.firstChild;
    contentEl.appendChild(node);
    if (contentEl.scrollHeight > contentEl.clientHeight) {
      nextContent.insertBefore(node, nextContent.firstChild);
      break;
    }
  }

  syncPlaceholder(contentEl);
  syncPlaceholder(nextContent);
  if (!nextContent.firstChild || nextContent.innerHTML.trim() === "") {
    removePage(ctx, idx + 1);
    checkUnderflow(ctx, contentEl);    // cascade: nova próxima pode ter conteúdo
  } else {
    checkUnderflow(ctx, nextContent);  // cascade descendente
  }
}

// Remove páginas que ficaram sem nenhum filho (innerHTML='') do fim para o início.
// Nunca remove page1. Páginas com <div><br> de overflow são mantidas.
export function cleanupEmptyPages(ctx) {
  for (let i = ctx.state.pages.length - 1; i >= 1; i--) {
    const pg = ctx.state.pages[i];
    if (pg.firstChild) break; // tem filhos → não é vazia
    const wasActive = document.activeElement === pg;
    const prev = ctx.state.pages[i - 1];
    removePage(ctx, i);
    if (wasActive) { moveCursorToEnd(prev); prev.focus(); }
  }
}

function moveLastNodeToNext(from, to) {
  const last = from.lastChild;
  if (!last) return;

  // Slice atômico — nunca dividir
  if (last.nodeType === Node.ELEMENT_NODE && last.classList?.contains("slice")) {
    from.removeChild(last);
    to.insertBefore(last, to.firstChild);
    if (from.scrollHeight > from.clientHeight) moveLastNodeToNext(from, to);
    return;
  }

  // TextNode — bisseção binária
  if (last.nodeType === Node.TEXT_NODE && last.textContent.length > 0) {
    const breakIdx = findTextBreakPoint(from, last);
    if (breakIdx > 0 && breakIdx < last.textContent.length) {
      const overflow = last.splitText(breakIdx);
      to.insertBefore(overflow, to.firstChild);
      return;
    }
  }

  // Qualquer outro elemento — move inteiro
  from.removeChild(last);
  to.insertBefore(last, to.firstChild);
  if (from.scrollHeight > from.clientHeight) moveLastNodeToNext(from, to);
}

function findTextBreakPoint(container, textNode) {
  const text      = textNode.textContent;
  const CONTENT_H = container.clientHeight;
  let lo = 0, hi  = text.length;

  while (lo < hi - 1) {
    const mid = Math.floor((lo + hi) / 2);
    textNode.textContent = text.slice(0, mid);
    if (container.scrollHeight <= CONTENT_H) { lo = mid; } else { hi = mid; }
  }
  textNode.textContent = text;
  return lo;
}

// ── Cursor save/restore para reflow seguro ───────────────────────────────
// Salva cursor como offset total de caracteres somando todas as páginas
// anteriores. Número puro — sobrevive a qualquer mutação de DOM (incluindo
// a busca binária de findTextBreakPoint que altera textNode.textContent).
export function saveCursorForReflow(ctx) {
  if (!ctx.state?.pages?.length) return null;
  const sel = window.getSelection();
  if (!sel?.rangeCount) return null;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return null;

  let totalOffset = 0;
  for (let i = 0; i < ctx.state.pages.length; i++) {
    const page = ctx.state.pages[i];
    if (page.contains(range.startContainer)) {
      const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node === range.startContainer) {
          totalOffset += range.startOffset;
          return { totalOffset };
        }
        totalOffset += node.textContent.length;
      }
      // Fallback: cursor em nó não-texto
      try {
        const pre = document.createRange();
        pre.selectNodeContents(page);
        pre.setEnd(range.startContainer, range.startOffset);
        totalOffset += pre.toString().length;
        return { totalOffset };
      } catch (_) { return null; }
    }
    totalOffset += page.textContent.length;
  }
  return null;
}

// Restaura o cursor ao offset total após redistribuição. Se o conteúdo
// migrou para a próxima página, o cursor segue — nunca volta ao início.
export function restoreCursorAfterReflow(ctx, saved) {
  if (!saved || !ctx.state?.pages?.length) return;
  let remaining = saved.totalOffset;

  for (const page of ctx.state.pages) {
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const len = node.textContent.length;
      if (remaining <= len) {
        try {
          const range = document.createRange();
          range.setStart(node, remaining);
          range.collapse(true);
          const s = window.getSelection();
          s?.removeAllRanges();
          s?.addRange(range);
          if (document.activeElement !== page) page.focus();
        } catch (_) {
          moveCursorToEnd(page);
          page.focus();
        }
        return;
      }
      remaining -= len;
    }
  }

  // Além do fim de todo conteúdo → fim da última página
  const last = ctx.state.pages[ctx.state.pages.length - 1];
  if (last) { moveCursorToEnd(last); last.focus(); }
}

// ── Cursor utils ─────────────────────────────────────────────────────────
export function isAtStart(container, range) {
  if (!range) return false;
  const test = document.createRange();
  test.selectNodeContents(container);
  test.collapse(true);
  return range.compareBoundaryPoints(Range.START_TO_START, test) <= 0;
}

export function isAtEnd(container, range) {
  if (!range) return false;
  const test = document.createRange();
  test.selectNodeContents(container);
  test.collapse(false);
  return range.compareBoundaryPoints(Range.END_TO_END, test) >= 0;
}

export function moveCursorToEnd(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export function moveCursorToStart(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// ── Persistência multi-page ───────────────────────────────────────────────
const STORAGE_KEY    = "eskrev:onep:pages:v2";
const STORAGE_KEY_V1 = "eskrev:onep:pages:v1";
const LEGACY_KEY     = "eskrev:index2:page1:html";

export function savePagesState(ctx) {
  try {
    const data = ctx.state.pages.map((el) => {
      // Slices são efêmeros — nunca persistir no localStorage.
      // O browser pode corromper o DOM deles ao serializar dentro de contenteditable.
      const clone = el.cloneNode(true);
      clone.querySelectorAll(".slice").forEach((s) => s.remove());
      // Remove também âncoras vazias que ficam após slices
      clone.querySelectorAll("span[data-anchor]").forEach((a) => {
        if (!a.textContent.trim()) a.remove();
      });
      return clone.innerHTML;
    });
    idbSet(STORAGE_KEY, data);
  } catch (_) {}
}

export function restorePagesState(ctx) {
  try {
    // ── v2 (atual) — idbGet retorna valor já parseado ─────────────────────
    const data = idbGet(STORAGE_KEY);
    if (data) {
      if (!data?.length) return;
      ctx.state.pages[0].innerHTML = data[0] || "";
      for (let i = 1; i < data.length; i++) {
        const prev = ctx.state.pages[i - 1];
        const c    = addPage(ctx, prev, false);
        c.innerHTML = data[i] || "";
      }
      ctx.state.pages.forEach((el) => {
        // Purga slices corrompidos que possam ter vindo de sessão antiga
        el.querySelectorAll(".slice").forEach((s) => s.remove());
        hydrateSlices(ctx, el);
        syncPlaceholder(el);
      });
      requestAnimationFrame(() => {
        ctx.state.pages.forEach((el) => checkOverflow(ctx, el));
      });
      return;
    }

    // ── migração v1 → v2 (consolida páginas; overflow re-distribui) ───────
    const dataV1 = idbGet(STORAGE_KEY_V1);
    if (dataV1) {
      if (Array.isArray(dataV1) && dataV1.length) {
        const combined = dataV1.join("");
        ctx.state.pages[0].innerHTML = combined;
        ctx.state.pages[0].querySelectorAll(".slice").forEach((s) => s.remove());
        hydrateSlices(ctx, ctx.state.pages[0]);
        syncPlaceholder(ctx.state.pages[0]);
        requestAnimationFrame(() => {
          checkOverflow(ctx, ctx.state.pages[0]);
          savePagesState(ctx); // grava já em v2
        });
        idbRemove(STORAGE_KEY_V1);
      }
      return;
    }

    // ── legado single-page (antes do sistema multi-page) ──────────────────
    const legacy = idbGet(LEGACY_KEY);
    if (legacy) {
      ctx.state.pages[0].innerHTML = typeof legacy === "string" ? legacy : "";
      ctx.state.pages[0].querySelectorAll(".slice").forEach((s) => s.remove());
      hydrateSlices(ctx, ctx.state.pages[0]);
      syncPlaceholder(ctx.state.pages[0]);
      requestAnimationFrame(() => checkOverflow(ctx, ctx.state.pages[0]));
    }
  } catch (_) {}
}
