import { vocab } from "../data/vocab.js";
import { escapeHtml, getTextBeforeCaretWithin } from "./dom.js";
import { getLastWordBeforeToken } from "./textops.js";
import { getDockTagBounds, positionDockTag } from "./dock.js";
import { positionSliceDockRail } from "./layout.js";
import { attachPostitComposer } from "./postits.js";
import { toggleWordClass } from "./wordclass.js";
import { lookupVerbete } from "./verbete.js";
import { corpus } from "../../src/js/modules/corpus.js";
import { openCoordenador } from "./coordenador.js";
import { exportSkv } from "./mesa.js";

// ── Countdown toast ────────────────────────────────────────────────────────
// Para comandos que mudam o estado visual da tela: exibe "label  3 · 2 · 1"
// no canto e executa fn() após 3s. ESC cancela.
function showCountdown(label, fn) {
  let toast = document.getElementById("eskrev-countdown");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "eskrev-countdown";
    const style = document.createElement("style");
    style.textContent = `
      #eskrev-countdown {
        position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
        z-index: 8999; background: var(--iso-ink-1, #111); color: var(--iso-paper, #f7f5f0);
        font-family: ui-monospace, monospace; font-size: 12px; letter-spacing: .12em;
        padding: 7px 18px; border-radius: 3px; opacity: 0;
        transition: opacity .18s; pointer-events: none; white-space: nowrap;
      }
      #eskrev-countdown.cd-visible { opacity: .9; pointer-events: auto; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
  }

  // Cancela countdown anterior se existir
  if (toast._cdTimer) { clearInterval(toast._cdTimer); toast._cdTimer = null; }
  if (toast._cdEsc)   { document.removeEventListener("keydown", toast._cdEsc, true); }

  let n = 3;
  const update = () => { toast.textContent = `${label}  ${n}`; };
  update();
  toast.classList.add("cd-visible");

  const onEsc = (e) => {
    if (e.key !== "Escape") return;
    e.stopImmediatePropagation();
    clearInterval(toast._cdTimer);
    document.removeEventListener("keydown", toast._cdEsc, true);
    toast.classList.remove("cd-visible");
    toast._cdTimer = null;
  };
  toast._cdEsc = onEsc;
  document.addEventListener("keydown", onEsc, true);

  toast._cdTimer = setInterval(() => {
    n -= 1;
    if (n > 0) { update(); return; }
    clearInterval(toast._cdTimer);
    toast._cdTimer = null;
    document.removeEventListener("keydown", toast._cdEsc, true);
    toast.classList.remove("cd-visible");
    fn();
  }, 1000);
}

function decodeSliceHtml(value) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch (_e) {
    return value;
  }
}

function encodeSliceHtml(value) {
  return encodeURIComponent(String(value || ""));
}

function rootFromSliceHtml(sliceHtml) {
  const html = decodeSliceHtml(sliceHtml).trim();
  if (!html) return null;
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  const node = wrap.firstElementChild;
  if (!node || !node.classList?.contains("slice")) return null;
  return node;
}

function renderInlineMarkdown(text) {
  const safe = escapeHtml(text);
  return safe
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const out = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let inCodeBlock = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${paragraph.map((l) => renderInlineMarkdown(l)).join("<br>")}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    out.push(`<${listType}>${listItems.map((li) => `<li>${renderInlineMarkdown(li)}</li>`).join("")}</${listType}>`);
    listType = null;
    listItems = [];
  };

  const flushCode = () => {
    out.push(`<pre><code>${codeLines.map((l) => escapeHtml(l)).join("\n")}</code></pre>`);
    codeLines = [];
    inCodeBlock = false;
  };

  for (const raw of lines) {
    const line = String(raw || "");
    const trimmed = line.trim();

    // Fenced code block handling
    if (inCodeBlock) {
      if (trimmed === "```" || trimmed === "~~~") { flushCode(); }
      else { codeLines.push(line); }
      continue;
    }
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      flushParagraph(); flushList();
      inCodeBlock = true;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const h = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      flushParagraph();
      flushList();
      const level = Math.min(3, h[1].length);
      out.push(`<h${level}>${renderInlineMarkdown(h[2])}</h${level}>`);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      out.push("<hr>");
      continue;
    }

    const bq = trimmed.match(/^>\s+(.+)$/);
    if (bq) {
      flushParagraph();
      flushList();
      out.push(`<blockquote>${renderInlineMarkdown(bq[1])}</blockquote>`);
      continue;
    }

    const ul = trimmed.match(/^[-*✓✗]\s+(.+)$/);
    if (ul) {
      flushParagraph();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listItems.push(ul[1]);
      continue;
    }

    const ol = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      flushParagraph();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listItems.push(ol[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  if (inCodeBlock && codeLines.length) flushCode(); // unclosed block
  return out.join("") || `<p>${renderInlineMarkdown(String(text || ""))}</p>`;
}

// Agrupa heading + conteúdo seguinte em .modos-section para alternância de fundo
function groupModosIntoSections(container) {
  const children = Array.from(container.childNodes);
  const sections = [];
  let current = null;

  for (const node of children) {
    const isHeading = node.nodeType === Node.ELEMENT_NODE &&
      /^H[123]$/.test(node.tagName);
    const isHr = node.nodeType === Node.ELEMENT_NODE && node.tagName === "HR";

    if (isHr) {
      current = null;
      continue; // descarta separadores — a alternância visual substitui
    }
    if (isHeading) {
      // Destaca número inicial no heading (ex: "1) TÍTULO" → <mark>1)</mark> TÍTULO)
      const txt = node.textContent || "";
      const numMatch = txt.match(/^(\d+\))\s+(.+)$/);
      if (numMatch) {
        node.innerHTML = `<span class="modos-sec-num">${numMatch[1]}</span> ${numMatch[2]}`;
      }
      current = document.createElement("div");
      current.className = "modos-section";
      current.appendChild(node.cloneNode(true));
      sections.push(current);
      continue;
    }
    if (!current) {
      // Conteúdo antes do primeiro heading — seção de introdução
      current = document.createElement("div");
      current.className = "modos-section";
      sections.push(current);
    }
    current.appendChild(node.cloneNode(true));
  }

  container.innerHTML = "";
  sections.forEach((s) => container.appendChild(s));
}

function normalizePersonaGuideText(text) {
  const raw = String(text || "").replace(/\r/g, "");
  if (!raw) return "";
  const lines = raw.split("\n");
  const out = [];
  let supportInjected = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push(line);
      continue;
    }
    if (/^o texto mesmo voc[eê] escreve do lado\.?$/i.test(trimmed)) {
      if (!supportInjected) {
        out.push("Isso aqui é só um apoio.");
        supportInjected = true;
      }
      continue;
    }
    if (/^isso aqui [ée] s[oó] um apoio\.?$/i.test(trimmed)) {
      if (!supportInjected) {
        out.push("Isso aqui é só um apoio.");
        supportInjected = true;
      }
      continue;
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function updateSliceContent(root, { meta, body }) {
  if (!root) return;
  const metaEl = root.querySelector(".sliceMeta");
  const bodyEl = root.querySelector(".panelBody");
  if (metaEl && typeof meta === "string") metaEl.textContent = meta;
  if (bodyEl && typeof body === "string") bodyEl.innerHTML = renderMarkdown(body);
}

function smoothScrollSliceIntoView(root, { duration = 980, topGap = 24 } = {}) {
  const content = root?.closest(".pageContent");
  if (!content) return;
  const start = content.scrollTop;
  const target = Math.max(0, root.offsetTop - topGap);
  const delta = target - start;
  if (Math.abs(delta) < 1) return;

  const t0 = performance.now();
  const ease = (x) => 1 - Math.pow(1 - x, 3); // heavy/deep ease-out

  const tick = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    content.scrollTop = start + (delta * ease(p));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function getSliceBadgeTitle(root) {
  const badge = root.querySelector(".badge strong")?.textContent?.trim() || "00";
  const title = root.querySelector(".badge span")?.textContent?.trim() || "CUT";
  return { badge, title };
}

function bindDockTagInteractions(ctx, tag) {
  if (!tag || tag.__dockTagBound === true) return;
  tag.__dockTagBound = true;

  let drag = null;
  let moved = false;
  const dragThreshold = 4;
  const deleteZonePx = 92;
  const deleteArmedThreshold = 0.74;

  const clearDeleteVisual = () => {
    tag.style.setProperty("--tag-danger", "0");
    tag.classList.remove("isDeleteArmed");
  };

  const stopDrag = () => {
    drag = null;
    tag.classList.remove("isDragging");
    clearDeleteVisual();
  };

  const bounceBack = () => {
    const currentTop = Number.parseFloat(tag.style.top || "0");
    if (!Number.isFinite(currentTop)) return;
    const { minTop } = getDockTagBounds(tag);
    const bounceTop = Math.max(minTop, currentTop - 12);
    tag.classList.add("isBouncing");
    tag.style.top = `${Math.round(bounceTop)}px`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tag.style.top = `${Math.round(currentTop)}px`;
      });
    });
    window.setTimeout(() => tag.classList.remove("isBouncing"), 280);
  };

  const onPointerMove = (ev) => {
    if (!drag) return;
    const nextTop = drag.startTop + (ev.clientY - drag.startY);
    const { minTop, maxTop } = getDockTagBounds(tag);
    const clampedTop = Math.min(Math.max(minTop, nextTop), maxTop);
    tag.dataset.manualTop = String(clampedTop);
    tag.style.top = `${Math.round(clampedTop)}px`;

    const deleteStart = Math.max(minTop, maxTop - deleteZonePx);
    const danger = Math.min(1, Math.max(0, (clampedTop - deleteStart) / Math.max(1, (maxTop - deleteStart))));
    tag.style.setProperty("--tag-danger", danger.toFixed(3));
    tag.classList.toggle("isDeleteArmed", danger >= deleteArmedThreshold);

    if (Math.abs(ev.clientY - drag.startY) > dragThreshold) moved = true;
  };

  tag.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    const currentTop = Number.parseFloat(tag.style.top || "0");
    drag = {
      startY: ev.clientY,
      startTop: Number.isFinite(currentTop) ? currentTop : 0,
    };
    moved = false;
    tag.classList.add("isDragging");
    tag.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });

  tag.addEventListener("pointermove", onPointerMove);
  tag.addEventListener("pointerup", (ev) => {
    const shouldDelete = tag.classList.contains("isDeleteArmed");
    const draggedNow = moved;
    stopDrag();
    try {
      tag.releasePointerCapture(ev.pointerId);
    } catch (_e) {}
    if (shouldDelete) {
      const anchorEl = document.getElementById(tag.dataset.anchorId || "");
      if (anchorEl) anchorEl.remove();
      tag.remove();
      positionSliceDockRail(ctx);
      ctx.setStatus?.("tag removida");
      return;
    }
    if (draggedNow) bounceBack();
  });
  tag.addEventListener("pointercancel", stopDrag);

  tag.addEventListener("click", () => {
    if (moved) {
      moved = false;
      return;
    }

    const root = rootFromSliceHtml(tag.dataset.sliceHtml || "");
    if (!root) return;

    const targetContent = document.getElementById("page1");
    if (!targetContent) return;
    targetContent.appendChild(root);
    bindSliceInteractions(ctx, root);
    root.classList.add("isEntering");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("isEntering")));

    const anchorEl = document.getElementById(tag.dataset.anchorId || "");
    if (anchorEl) anchorEl.remove();
    tag.remove();
    positionSliceDockRail(ctx);
    ctx.setStatus(`reopened: ${getSliceBadgeTitle(root).title}`);
  });
}

function bindSliceInteractions(ctx, root) {
  if (!root || root.__sliceBound === true) return;
  root.__sliceBound = true;
  root.setAttribute("contenteditable", "false");
  root.dataset.kind = root.dataset.kind || "unknown";
  if (!root.dataset.sliceId) root.dataset.sliceId = String(++ctx.state.sliceId);

  const closeWithAnimation = () => {
    if (root.classList.contains("isClosing")) return;
    root.classList.add("isClosing");
    const removeNow = () => {
      if (root.parentNode) root.remove();
    };
    root.addEventListener("transitionend", removeNow, { once: true });
    setTimeout(removeNow, 420);
  };

  const dockSlice = () => {
    const { badge, title } = getSliceBadgeTitle(root);
    const dock = ctx.refs.sliceDockEl || document.querySelector(".sliceDock");
    if (!dock || root.classList.contains("isClosing")) return;

    const parent = root.parentNode;
    if (!parent) return;

    const anchor = document.createElement("span");
    anchor.className = "sliceAnchor";
    anchor.id = `sliceAnchor${++ctx.state.dockAnchorId}`;
    anchor.setAttribute("contenteditable", "false");
    parent.insertBefore(anchor, root.nextSibling);

    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = `sliceTag k-${root.dataset.kind || "unknown"}`;
    tag.textContent = `${badge} ${title}`;
    tag.title = `Reabrir ${title}`;
    tag.dataset.sliceId = root.dataset.sliceId;
    tag.dataset.anchorId = anchor.id;
    tag.dataset.kind = root.dataset.kind || "unknown";
    tag.dataset.sliceHtml = encodeSliceHtml(root.outerHTML);

    bindDockTagInteractions(ctx, tag);

    dock.prepend(tag);
    positionSliceDockRail(ctx);
    positionDockTag(ctx, tag);

    // Tag live para o --v: substitui texto estático por contador de palavras/chars
    if (root.dataset.liveVerify) {
      tag.dataset.liveVerify = "1";
      startLiveVerifyTag(ctx, tag);
    }

    root.remove();
    ctx.setStatus(`docked: ${title}`);
  };

  const toggle = () => root.classList.toggle("isMinimized");
  const topHandle = root.querySelector(".sliceTopHandle");
  const dockBtn = root.querySelector(".sliceDockBtn");
  const leftGutter = root.querySelector(".gutter.left");
  const rightGutter = root.querySelector(".gutter.right");
  const panelBody = root.querySelector(".panelBody");

  if (topHandle && !topHandle.querySelector(".sliceTopBlob")) {
    const blob = document.createElement("span");
    blob.className = "sliceTopBlob";
    topHandle.appendChild(blob);
  }

  if (topHandle) topHandle.addEventListener("click", toggle);
  if (topHandle) {
    const state = {
      tx: 0.5,
      ty: 0,
      prevTy: 0,
      x: 0.5,
      y: 0,
      vx: 0,
      vy: 0,
      raf: 0,
    };
    const apply = () => {
      const w = Math.max(1, topHandle.clientWidth);
      const gap = Number.parseFloat(getComputedStyle(topHandle).getPropertyValue("--venom-gap")) || 12;
      const barH = Number.parseFloat(getComputedStyle(topHandle).getPropertyValue("--venom-bar-h")) || 6;
      const leftPx = state.x * w;
      const corridor = Math.max(2, gap - barH - 1); // movement only below visible strip
      const hPx = 1 + (corridor * state.y);
      const speed = Math.min(1, Math.abs(state.vx) * 22 + Math.abs(state.vy) * 30);
      const widthPx = 20 - (5 * state.y) + (6 * speed);
      const skew = Math.max(-9, Math.min(9, state.vx * 580));
      const squash = 1 + (0.22 * speed);
      topHandle.style.setProperty("--venom-left", `${leftPx.toFixed(2)}px`);
      topHandle.style.setProperty("--venom-h", `${hPx.toFixed(2)}px`);
      topHandle.style.setProperty("--venom-w", `${widthPx.toFixed(2)}px`);
      topHandle.style.setProperty("--venom-skew", `${skew.toFixed(2)}deg`);
      topHandle.style.setProperty("--venom-squash", squash.toFixed(3));
    };
    const tick = () => {
      const ax = (state.tx - state.x) * 0.24;
      const ay = (state.ty - state.y) * 0.2;
      state.vx = (state.vx + ax) * 0.72;
      state.vy = (state.vy + ay) * 0.7;
      state.x += state.vx;
      state.y += state.vy;
      state.x = Math.max(0, Math.min(1, state.x));
      // hit lower invisible limit -> rebound up with style
      if (state.y > 1) {
        state.y = 1;
        if (state.vy > 0) state.vy *= -0.58;
      } else if (state.y < 0) {
        state.y = 0;
        if (state.vy < 0) state.vy *= -0.35;
      }
      apply();
      if (
        Math.abs(state.tx - state.x) > 0.0008 ||
        Math.abs(state.ty - state.y) > 0.0008 ||
        Math.abs(state.vx) > 0.0006 ||
        Math.abs(state.vy) > 0.0006
      ) {
        state.raf = requestAnimationFrame(tick);
      } else {
        state.raf = 0;
      }
    };
    const ensureTick = () => {
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };
    const magneticMove = (ev) => {
      const r = topHandle.getBoundingClientRect();
      const barH = Number.parseFloat(getComputedStyle(topHandle).getPropertyValue("--venom-bar-h")) || 6;
      const x = Math.max(0, Math.min(1, (ev.clientX - r.left) / Math.max(1, r.width)));
      // Near strip baseline => deeper tongue; far => retract.
      const dy = Math.abs(ev.clientY - (r.top + barH));
      const influence = Math.max(0, 1 - (dy / 84));
      // "Insist" behavior when mouse is far: keeps a tiny pull downward.
      const insist = dy > 84 ? Math.max(0, 0.24 - ((dy - 84) / 360)) : 0;
      const nextTy = Math.min(1, Math.max(influence, insist));
      // if target drops suddenly, keep a tiny downward momentum before rising.
      if (nextTy < state.ty && state.y > 0.62) {
        state.vy += 0.012;
      }
      state.tx = x;
      state.prevTy = state.ty;
      state.ty = nextTy;
      ensureTick();
    };
    const resetMagnet = () => {
      state.ty = 0;
      ensureTick();
    };
    topHandle.addEventListener("mousemove", magneticMove);
    root.addEventListener("mousemove", magneticMove);
    root.addEventListener("mouseleave", resetMagnet);
    window.addEventListener("resize", apply);
    apply();
  }
  if (dockBtn) dockBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    dockSlice();
  });
  if (leftGutter) leftGutter.addEventListener("click", closeWithAnimation);
  if (rightGutter) rightGutter.addEventListener("click", closeWithAnimation);
  if (panelBody && !panelBody.dataset.heavyScrollBound) {
    panelBody.dataset.heavyScrollBound = "1";
    panelBody.addEventListener("wheel", (ev) => {
      const max = Math.max(0, panelBody.scrollHeight - panelBody.clientHeight);
      if (max <= 0) return;
      const factor = 0.38; // heavier/slower than default wheel
      panelBody.scrollTop += ev.deltaY * factor;
      ev.preventDefault();
    }, { passive: false });
  }
}

export function hydrateSlices(ctx, contentEl) {
  if (!contentEl) return;
  const existingIds = Array.from(contentEl.querySelectorAll(".slice[data-slice-id]"))
    .map((el) => Number.parseInt(el.dataset.sliceId || "0", 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (existingIds.length) {
    const maxId = Math.max(...existingIds);
    ctx.state.sliceId = Math.max(ctx.state.sliceId || 0, maxId);
  }

  contentEl.querySelectorAll(".slice").forEach((slice) => {
    slice.classList.remove("isEntering", "isClosing");
    if (slice.dataset.sliceBound) delete slice.dataset.sliceBound;
    bindSliceInteractions(ctx, slice);
  });
}

export function hydrateDockTags(ctx) {
  const dock = ctx?.refs?.sliceDockEl || document.querySelector(".sliceDock");
  if (!dock) return;
  dock.querySelectorAll(".sliceTag").forEach((tag) => {
    bindDockTagInteractions(ctx, tag);
  });
}

export function makeSlice(ctx, payload) {
  const { badge, title, kindKey, meta, body, focusScroll } = payload;
  const root = document.createElement("div");
  root.className = "slice isEntering";
  root.setAttribute("contenteditable", "false");
  root.dataset.sliceId = String(++ctx.state.sliceId);
  root.dataset.kind = kindKey || "unknown";

  root.innerHTML = `
    <div class="sliceRow">
      <div class="sliceTopHandle" title="Minimizar/expandir corte"></div>
      <button class="sliceDockBtn" type="button" title="Enviar para lateral"></button>
      <div class="gutter left" title="Fechar corte"></div>

      <div class="sliceCard">
        <div class="sliceHead">
          <div class="badge"><strong>${escapeHtml(badge)}</strong> <span>${escapeHtml(title)}</span></div>
          <div class="sliceMeta">${escapeHtml(meta || "")}</div>
        </div>
        <div class="sliceBody">
          <div class="panel">
            <div class="panelBody">${renderMarkdown(body)}</div>
          </div>
        </div>
      </div>

      <div class="gutter right" title="Fechar corte"></div>
    </div>
  `;

  bindSliceInteractions(ctx, root);

  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("isEntering")));
  if (focusScroll) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      smoothScrollSliceIntoView(root, { duration: focusScroll === "heavy" ? 1180 : 760, topGap: 20 });
    }));
  }
  return root;
}

function toCleanTerm(value) {
  return String(value || "")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .trim();
}

function summarizeDictionary(dictResult) {
  if (!dictResult || dictResult.ok === false) return ["Sem retorno do dicionário."];
  const entry = dictResult.entry || {};
  const out = [];
  if (entry.lemma) out.push(`Lema: ${entry.lemma}`);
  if (entry.classe) out.push(`Classe: ${entry.classe}`);
  if (entry.definicao) out.push(`Definição: ${entry.definicao}`);
  if (Array.isArray(entry.definicoes) && entry.definicoes.length) {
    out.push(...entry.definicoes.slice(0, 3).map((d, i) => `${i + 1}. ${String(d)}`));
  }
  if (Array.isArray(entry.examples) && entry.examples.length) {
    out.push(`Ex.: ${String(entry.examples[0])}`);
  }
  if (!out.length) out.push("Entrada encontrada, sem campos mapeados.");
  return out;
}

export function openSelectionConsultSlice(ctx, editorEl, selectedText) {
  const text = String(selectedText || "").trim();
  if (!text) return null;
  const term = toCleanTerm(text) || text;
  const fullEditorText = String(editorEl?.innerText || editorEl?.textContent || "");
  const slice = makeSlice(ctx, {
    badge: "03",
    title: "CONSULTA",
    kindKey: "consult",
    meta: `seleção: ${term} • carregando`,
    body: "Lendo dicionário e contexto...",
    focusScroll: "heavy",
  });

  const consult = ctx.integrations?.consult;
  if (!consult) {
    updateSliceContent(slice, {
      meta: `seleção: ${term} • integração indisponível`,
      body: "Pacote de consulta indisponível.",
    });
    return slice;
  }

  Promise.all([
    Promise.resolve(consult.findInVocab?.(term) || []),
    Promise.resolve(consult.findInText?.(term, fullEditorText, 5) || []),
    Promise.resolve(consult.lookupDictionary?.(term) || null),
    Promise.resolve(consult.lookupDoubt?.(term) || null),
    Promise.resolve(consult.lookupRegencia?.(term) || null),
  ]).then(([vocabHits, textHits, dict, doubt, reg]) => {
    const lines = [];
    lines.push(`## ${term}`);
    lines.push("");
    lines.push("### Dicionário");
    lines.push(...summarizeDictionary(dict));
    lines.push("");
    lines.push("### Vocabulário local");
    if (Array.isArray(vocabHits) && vocabHits.length) {
      lines.push(...vocabHits.slice(0, 5).map(([k, v]) => `- **${k}**: ${v}`));
    } else {
      lines.push("- sem ocorrência no vocab local");
    }
    lines.push("");
    lines.push("### Ocorrências no texto");
    if (Array.isArray(textHits) && textHits.length) {
      lines.push(...textHits.map((hit) => `- linha ${hit.idx}: ${hit.line}`));
    } else {
      lines.push("- sem ocorrência no conteúdo atual");
    }

    if (doubt?.ok && doubt?.doubt) {
      lines.push("");
      lines.push("### Dúvida frequente");
      lines.push(`- ${doubt.doubt}`);
    }
    if (reg?.ok && reg?.regencia) {
      lines.push("");
      lines.push("### Regência");
      lines.push(`- ${reg.regencia}`);
    }

    updateSliceContent(slice, {
      meta: `seleção: ${term}`,
      body: lines.join("\n"),
    });
  }).catch((error) => {
    updateSliceContent(slice, {
      meta: `seleção: ${term} • falha`,
      body: `Falha ao consultar seleção.\n\n${error?.message || String(error)}`,
    });
  });

  return slice;
}

// ── --v Verificação ───────────────────────────────────────────────────────

function getEditorText() {
  return Array.from(document.querySelectorAll(".pageContent")).map(el => {
    const clone = el.cloneNode(true);
    clone.querySelectorAll(".slice").forEach(s => s.remove());
    return clone.innerText || "";
  }).join("\n");
}

function computeTextStats(text) {
  const t = text || "";
  const words = t.trim() ? t.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = t.length;
  const charsNoSpaces = t.replace(/\s/g, "").length;
  const sentences = t.split(/[.!?…]+/).filter(s => s.trim().length > 2).length;
  const paragraphs = t.split(/\n{2,}|\r\n{2,}/).filter(p => p.trim()).length || (t.trim() ? 1 : 0);
  const readSec = Math.round((words / 200) * 60);
  const readTime = readSec < 60
    ? `${readSec}s`
    : `${Math.floor(readSec / 60)}min ${readSec % 60}s`;
  const allWords = t.toLowerCase().match(/[\p{L}]{2,}/gu) || [];
  const uniqueWords = new Set(allWords);
  const lexDensity = allWords.length
    ? `${Math.round((uniqueWords.size / allWords.length) * 100)}%`
    : "—";
  const longestWord = allWords.reduce((a, b) => b.length > a.length ? b : a, "");
  return { words, chars, charsNoSpaces, sentences, paragraphs, readTime, lexDensity, longestWord };
}

async function sha256HexV(text) {
  try {
    const data = new TextEncoder().encode(text || "");
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (_) { return ""; }
}

async function verifySkv(parsed) {
  // Suporte a formato v2 (onep) e fullm legado
  const storedHash = parsed?.proof?.content_hash || parsed?.HEADER?.HASH || "";
  if (!storedHash) return { status: "warn", msg: "Arquivo sem proof.content_hash — não foi exportado com verificação ativa." };

  // Extrai o texto: deve ser idêntico ao que foi usado no sha256Hex() em exportSkv().
  // Export faz: pages.map(getPageText).join("") → saveContent(allText) → active.content = allText
  // Logo: text = active project.content (sem join com \n e sem trim — ambos mudam o hash).
  let text = "";
  if (Array.isArray(parsed.projects)) {
    const activeProject =
      parsed.projects.find(p => p.id === parsed.activeId) ||
      parsed.projects[0];
    text = activeProject?.content || "";
  } else if (parsed.content?.text) {
    text = parsed.content.text;
  } else if (parsed.MASTER_TEXT) {
    text = parsed.MASTER_TEXT;
  }

  const computed = await sha256HexV(text);
  if (!computed) return { status: "warn", msg: "Não foi possível calcular hash." };

  const hashOk = storedHash === computed;
  const sig = parsed.authoria_sig || parsed.AUTHORIA_SIGNATURE;
  const hasSig = !!(sig?.signature && sig?.public_key_jwk);

  let sigStatus = "";
  if (hasSig) {
    try {
      const pubKey = await crypto.subtle.importKey(
        "jwk", sig.public_key_jwk,
        { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]
      );
      const sigBuf = Uint8Array.from(atob(sig.signature), c => c.charCodeAt(0));
      const dataBytes = new TextEncoder().encode(computed);
      const valid = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, pubKey, sigBuf, dataBytes);
      sigStatus = valid ? "\nAssinatura ECDSA · válida ✓" : "\nAssinatura ECDSA · inválida ✗";
    } catch (_) {
      sigStatus = "\nAssinatura ECDSA · erro ao verificar";
    }
  }

  const created = parsed.proof?.created_at
    ? new Date(parsed.proof.created_at).toLocaleString("pt-BR")
    : "—";

  if (hashOk) {
    return {
      status: "ok",
      msg: `Conteúdo íntegro — hash confere ✓\nGerado em: ${created}\nSHA-256: ${storedHash.slice(0, 16)}…${sigStatus}`,
    };
  } else {
    return {
      status: "fail",
      msg: `Hash diverge — conteúdo foi alterado após a exportação ✗\nRegistrado: ${storedHash.slice(0, 16)}…\nAtual:      ${computed.slice(0, 16)}…`,
    };
  }
}

function startLiveVerifyTag(ctx, tag) {
  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  const update = () => {
    if (!tag.isConnected) {
      clearInterval(intervalId);
      document.removeEventListener("input", onInput, true);
      return;
    }
    const t = getEditorText();
    const words = t.trim() ? t.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = t.length;
    tag.textContent = `${fmt(words)} pal · ${fmt(chars)} chr`;
    tag.title = "Abrir verificação";
  };
  update();
  const intervalId = setInterval(update, 3000);
  const onInput = () => update();
  document.addEventListener("input", onInput, { capture: true, passive: true });
}

// ── Pomodoro ───────────────────────────────────────────────────────────────
function openPomodoro() {
  const LS_TARGET   = "eskrev_pomo_target";
  const LS_PHASE    = "eskrev_pomo_phase";  // "work" | "break" | "done"
  const LS_DURATION = "eskrev_pomo_dur";

  let overlay = document.getElementById("eskrev-pomo");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "eskrev-pomo";
    const style = document.createElement("style");
    style.textContent = `
      #eskrev-pomo {
        position: fixed; inset: 0; z-index: 8800;
        display: flex; align-items: center; justify-content: center;
        background: rgba(17,17,16,.92);
        font-family: ui-monospace, monospace;
        color: #f7f5f0;
        transition: opacity .25s;
      }
      #eskrev-pomo.pomo-work {
        inset: auto auto 18px 18px;
        width: auto; height: auto;
        background: none;
        border: none;
        border-radius: 0;
        align-items: flex-start; justify-content: flex-start;
        pointer-events: none;
      }
      #eskrev-pomo.pomo-hidden { display: none; }
      .pomo-box {
        display: flex; flex-direction: column; align-items: center; gap: 20px;
        padding: 40px 48px; text-align: center;
      }
      .pomo-title {
        font-size: 11px; letter-spacing: .2em; opacity: .5; text-transform: uppercase;
      }
      .pomo-clock {
        font-size: 52px; font-weight: 700; letter-spacing: -.02em;
        font-variant-numeric: tabular-nums;
      }
      .pomo-work .pomo-work-clock {
        font-size: 13px; letter-spacing: .06em; font-variant-numeric: tabular-nums;
        color: var(--iso-ink-3, #aaa);
        opacity: .38;
      }
      .pomo-sub { font-size: 11px; opacity: .45; line-height: 1.6; }
      .pomo-btns { display: flex; gap: 12px; }
      .pomo-btn {
        background: none; border: 1px solid rgba(247,245,240,.3);
        color: #f7f5f0; padding: 10px 28px; font-size: 12px; letter-spacing: .12em;
        cursor: pointer; font-family: ui-monospace, monospace;
        transition: background .15s, border-color .15s;
      }
      .pomo-btn:hover { background: rgba(247,245,240,.1); border-color: rgba(247,245,240,.6); }
      .pomo-btn.pomo-btn-stop {
        border-color: rgba(247,245,240,.12); opacity: .4; font-size: 10px; padding: 6px 16px;
      }
      .pomo-btn.pomo-btn-stop:hover { opacity: .8; }
      .pomo-locked-note { font-size: 10px; opacity: .3; letter-spacing: .08em; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    let ticker = null;

    function fmt(ms) {
      const total = Math.max(0, Math.ceil(ms / 1000));
      const m = Math.floor(total / 60).toString().padStart(2, "0");
      const s = (total % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }

    function stopAll() {
      clearInterval(ticker); ticker = null;
      localStorage.removeItem(LS_TARGET);
      localStorage.removeItem(LS_PHASE);
      localStorage.removeItem(LS_DURATION);
      overlay.className = "pomo-hidden";
      overlay.innerHTML = "";
    }

    function startWork(minutes) {
      const target = Date.now() + minutes * 60_000;
      localStorage.setItem(LS_TARGET, String(target));
      localStorage.setItem(LS_PHASE, "work");
      localStorage.setItem(LS_DURATION, String(minutes));

      overlay.className = "pomo-work";
      overlay.innerHTML = `<span class="pomo-work-clock">${fmt(target - Date.now())}</span>`;

      clearInterval(ticker);
      ticker = setInterval(() => {
        const diff = parseInt(localStorage.getItem(LS_TARGET)) - Date.now();
        if (diff <= 0) { clearInterval(ticker); startBreak(); return; }
        const el = overlay.querySelector(".pomo-work-clock");
        if (el) el.textContent = fmt(diff);
      }, 1000);
    }

    function startBreak() {
      const BREAK_MS = 6 * 60_000;
      const target = Date.now() + BREAK_MS;
      localStorage.setItem(LS_TARGET, String(target));
      localStorage.setItem(LS_PHASE, "break");

      function renderBreak(diff) {
        overlay.className = "";  // full-screen locked
        overlay.innerHTML = `
          <div class="pomo-box">
            <div class="pomo-title">pausa obrigatória</div>
            <div class="pomo-clock" id="pomoClock">${fmt(diff)}</div>
            <div class="pomo-sub">
              Descanse os olhos · afaste-se da tela<br>
              O editor reabre ao fim da pausa.
            </div>
            <div class="pomo-locked-note">não é possível fechar antes do tempo</div>
          </div>
        `;
      }
      renderBreak(BREAK_MS);

      clearInterval(ticker);
      ticker = setInterval(() => {
        const diff = parseInt(localStorage.getItem(LS_TARGET)) - Date.now();
        const clockEl = overlay.querySelector("#pomoClock");
        if (diff <= 0) { clearInterval(ticker); showDone(); return; }
        if (clockEl) clockEl.textContent = fmt(diff);
      }, 1000);
    }

    function showDone() {
      localStorage.removeItem(LS_TARGET);
      localStorage.setItem(LS_PHASE, "done");

      overlay.className = "";
      overlay.innerHTML = `
        <div class="pomo-box">
          <div class="pomo-title">ciclo concluído</div>
          <div class="pomo-sub">Próximo ciclo ou encerrar?</div>
          <div class="pomo-btns">
            <button class="pomo-btn" data-dur="25">25 min</button>
            <button class="pomo-btn" data-dur="50">50 min</button>
          </div>
          <button class="pomo-btn pomo-btn-stop" id="pomoStop">encerrar sessão</button>
        </div>
      `;
      overlay.querySelectorAll("[data-dur]").forEach(btn => {
        btn.onclick = () => startWork(parseInt(btn.dataset.dur));
      });
      overlay.querySelector("#pomoStop").onclick = () => stopAll();
    }

    function showSetup() {
      overlay.className = "";
      overlay.innerHTML = `
        <div class="pomo-box">
          <div class="pomo-title">pomodoro — foco</div>
          <div class="pomo-sub">Quanto tempo de concentração?</div>
          <div class="pomo-btns">
            <button class="pomo-btn" data-dur="25">25 min</button>
            <button class="pomo-btn" data-dur="50">50 min</button>
          </div>
          <button class="pomo-btn pomo-btn-stop" id="pomoCancelSetup">cancelar</button>
        </div>
      `;
      overlay.querySelectorAll("[data-dur]").forEach(btn => {
        btn.onclick = () => startWork(parseInt(btn.dataset.dur));
      });
      overlay.querySelector("#pomoCancelSetup").onclick = () => stopAll();
    }

    overlay._pomoShowSetup = showSetup;
    overlay._pomoResume = () => {
      const target = parseInt(localStorage.getItem(LS_TARGET));
      const phase  = localStorage.getItem(LS_PHASE);
      if (phase === "work" && target > Date.now()) {
        // retoma ticker sem resetar o alvo
        overlay.className = "pomo-work";
        overlay.innerHTML = `<span class="pomo-work-clock">${fmt(target - Date.now())}</span>`;
        clearInterval(ticker);
        ticker = setInterval(() => {
          const diff = parseInt(localStorage.getItem(LS_TARGET)) - Date.now();
          if (diff <= 0) { clearInterval(ticker); startBreak(); return; }
          const el = overlay.querySelector(".pomo-work-clock");
          if (el) el.textContent = fmt(diff);
        }, 1000);
      } else if (phase === "break" && target > Date.now()) {
        startBreak();
      } else if (phase === "done") {
        showDone();
      }
    };
  }

  // Se já há sessão ativa, retoma
  const phase = localStorage.getItem(LS_PHASE);
  if (phase === "work" || phase === "break") {
    overlay._pomoResume?.();
    return;
  }
  overlay._pomoShowSetup?.();
}

// ── Ereader ────────────────────────────────────────────────────────────────
let _erLibraryBooks = null;
let _erFioIndex = null;

function openEreader() {
  function getPageText(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll(".slice,.sliceBar").forEach(n => n.remove());
    return clone.innerText || "";
  }
  const pages = document.querySelectorAll(".pageContent");
  const rawText = Array.from(pages).map(getPageText).join("\n\n").trim();
  if (!rawText) return;

  let overlay = document.getElementById("eskrev-ereader");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "eskrev-ereader";

    const style = document.createElement("style");
    style.textContent = `
      #eskrev-ereader {
        position: fixed; inset: 0; z-index: 9000;
        display: flex; flex-direction: column;
        transform: translateY(100%);
        transition: transform .35s cubic-bezier(.2,1,.3,1);
        background: var(--er-bg, #fcfbf9); color: var(--er-fg, #2c2c2c);
        font-family: Georgia, 'Times New Roman', serif;
      }
      #eskrev-ereader.er-active { transform: translateY(0); }
      /* temas */
      .er-t-paper { --er-bg:#fcfbf9; --er-fg:#2c2c2c; --er-tb:rgba(247,245,240,.95); --er-glass:rgba(252,251,249,.88); --er-ruler:#c4542a; }
      .er-t-sepia  { --er-bg:#f4ecd8; --er-fg:#5b4636; --er-tb:rgba(235,225,201,.95); --er-glass:rgba(244,236,216,.88); --er-ruler:#9b6a3a; }
      .er-t-chumbo { --er-bg:#111110; --er-fg:#c0c0c0; --er-tb:rgba(20,20,19,.95);    --er-glass:rgba(17,17,16,.88);    --er-ruler:#4a90d9; }
      /* toolbar */
      #er-tb {
        height: 48px; display: flex; align-items: center; gap: 6px;
        padding: 0 16px; border-bottom: 1px solid rgba(128,128,128,.12);
        background: var(--er-tb); backdrop-filter: blur(6px); flex-shrink: 0; z-index: 20;
      }
      #er-tb button {
        background: none; border: 1px solid transparent; border-radius: 5px;
        cursor: pointer; padding: 3px 9px; font-size: .75rem; font-family: ui-monospace, monospace;
        color: inherit; opacity: .6; transition: opacity .12s, border-color .12s; white-space: nowrap;
      }
      #er-tb button:hover { opacity: 1; border-color: rgba(128,128,128,.3); }
      #er-tb button.er-btn-on { opacity: 1; border-color: var(--er-ruler); color: var(--er-ruler); }
      .er-sep { width: 1px; height: 18px; background: currentColor; opacity: .12; flex-shrink: 0; }
      .er-spacer { flex: 1; }
      /* body layout */
      #er-body { flex: 1; display: flex; position: relative; overflow: hidden; min-height: 0; }
      #er-viewer { flex: 1; position: relative; overflow: hidden; }
      /* scroll mode */
      .er-scroll #er-viewer { overflow-y: auto; }
      .er-scroll #er-content {
        position: static; width: min(66ch, 88vw); margin: 0 auto;
        padding: 48px 0 120px; height: auto !important;
        column-width: auto !important; transform: none !important;
      }
      /* page mode */
      .er-page #er-viewer { overflow: hidden; }
      .er-page #er-content {
        position: absolute; top: 0; left: 0;
        height: calc(100vh - 96px);
        padding: 36px clamp(20px, 12vw, 140px);
        column-width: 68vw; column-gap: calc(100vw - 68vw);
        column-fill: auto; width: auto;
        transition: left .32s cubic-bezier(.25,1,.5,1);
      }
      .er-click { position: absolute; top: 0; bottom: 0; width: 11%; z-index: 12; cursor: pointer; display: none; }
      .er-page .er-click { display: block; }
      .er-click-l { left: 0; } .er-click-r { right: 0; }
      /* content */
      #er-content { font-size: 19px; line-height: 1.85; text-align: justify; outline: none; }
      #er-content p { margin: 0 0 .9em; }
      /* ruler / lupa */
      .er-ruler {
        position: absolute; left: 0; right: 0; z-index: 15;
        border-top: 1.5px solid var(--er-ruler); border-bottom: 1.5px solid var(--er-ruler);
        cursor: grab; display: none; user-select: none; touch-action: none;
        min-height: 44px;
      }
      .er-ruler.dragging { cursor: grabbing; }
      .er-box.show-ruler .er-ruler { display: block; }
      .er-glass {
        position: absolute; left: 0; right: 0; z-index: 14;
        background: var(--er-glass); pointer-events: none; display: none;
      }
      .er-box.show-ruler .er-glass { display: block; }
      .er-glass-top { top: 0; height: var(--ruler-top, 40%); }
      .er-glass-bot { top: calc(var(--ruler-top, 40%) + var(--ruler-h, 80px)); bottom: 0; }
      /* ruler resize edges */
      .er-ruler::before, .er-ruler::after {
        content: ""; position: absolute; left: 0; right: 0; height: 10px; cursor: ns-resize; z-index: 16;
      }
      .er-ruler::before { top: 0; }
      .er-ruler::after  { bottom: 0; }
      /* ruler controls */
      .er-ruler-bar {
        position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        display: none; gap: 4px; z-index: 17; align-items: center;
      }
      .er-box.show-ruler .er-ruler-bar { display: flex; }
      .er-ruler-bar button {
        background: var(--er-tb); border: 1px solid rgba(128,128,128,.2);
        color: var(--er-fg); border-radius: 4px; padding: 2px 7px; font-size: .7rem;
        cursor: pointer; font-family: ui-monospace, monospace; opacity: .7;
      }
      .er-ruler-bar button:hover { opacity: 1; }
      /* glossary sidebar */
      #er-glos {
        width: 0; overflow: hidden; flex-shrink: 0;
        transition: width .25s; border-left: 1px solid rgba(128,128,128,.12);
        display: flex; flex-direction: column;
      }
      .er-box.show-glos #er-glos { width: 200px; }
      .er-glos-title { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; opacity: .45; padding: 12px 12px 6px; }
      .er-glos-item { display: flex; justify-content: space-between; padding: 3px 12px; font-size: .75rem; opacity: .7; font-family: ui-monospace, monospace; }
      /* library panel */
      #er-lib-panel {
        position: absolute; top: 0; right: 0; bottom: 0; width: 0; overflow: hidden;
        background: var(--er-tb); border-left: 1px solid rgba(128,128,128,.12);
        z-index: 18; transition: width .25s; display: flex; flex-direction: column;
      }
      .er-box.show-lib #er-lib-panel { width: 280px; }
      .er-lib-header { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-bottom: 1px solid rgba(128,128,128,.12); flex-shrink: 0; }
      .er-lib-tabs { display: flex; gap: 4px; padding: 8px 12px 4px; flex-shrink: 0; }
      .er-lib-tab { background: none; border: 1px solid rgba(128,128,128,.2); border-radius: 4px; padding: 3px 10px; font-size: .7rem; cursor: pointer; color: inherit; font-family: ui-monospace, monospace; opacity: .55; }
      .er-lib-tab.active { opacity: 1; border-color: var(--er-ruler); color: var(--er-ruler); }
      .er-lib-lang { display: flex; gap: 3px; padding: 0 12px 6px; flex-shrink: 0; }
      .er-lib-lang-btn { background: none; border: 1px solid rgba(128,128,128,.18); border-radius: 3px; padding: 2px 7px; font-size: .68rem; cursor: pointer; color: inherit; font-family: ui-monospace, monospace; opacity: .5; }
      .er-lib-lang-btn.active { opacity: 1; border-color: var(--er-fg); }
      .er-lib-list { flex: 1; overflow-y: auto; padding: 4px 0; }
      .er-lib-item { padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(128,128,128,.06); }
      .er-lib-item:hover { background: rgba(128,128,128,.08); }
      .er-lib-item-title { font-size: .78rem; font-weight: 600; margin-bottom: 2px; }
      .er-lib-item-author { font-size: .68rem; opacity: .5; font-family: ui-monospace, monospace; }
      .er-lib-empty { padding: 20px 12px; font-size: .75rem; opacity: .45; text-align: center; }
      .er-lib-back { background: none; border: none; cursor: pointer; font-size: .72rem; color: inherit; opacity: .5; padding: 0; font-family: ui-monospace, monospace; }
      .er-lib-back:hover { opacity: 1; }
      /* fio do verso */
      .er-fio-tabs { display: flex; flex-wrap: wrap; gap: 3px; padding: 4px 12px 6px; flex-shrink: 0; }
      .er-fio-tab { background: none; border: 1px solid rgba(128,128,128,.18); border-radius: 3px; padding: 2px 7px; font-size: .65rem; cursor: pointer; color: inherit; font-family: ui-monospace, monospace; opacity: .5; }
      .er-fio-tab.active { opacity: 1; }
      .er-fio-item { padding: 6px 12px; cursor: pointer; border-bottom: 1px solid rgba(128,128,128,.06); }
      .er-fio-item:hover { background: rgba(128,128,128,.08); }
      .er-fio-item .date { font-size: .62rem; opacity: .4; font-family: ui-monospace, monospace; }
      .er-fio-item .title { font-size: .75rem; }
      /* auto-scroll */
      #er-play.er-btn-on { color: var(--er-ruler); border-color: var(--er-ruler); }
      /* footer */
      #er-footer { text-align: center; padding: 6px; font-size: .68rem; opacity: .4; flex-shrink: 0; font-family: ui-monospace, monospace; }
    `;
    document.head.appendChild(style);

    overlay.innerHTML = `
      <div id="er-tb">
        <button id="er-close" title="Fechar (Esc)">✕</button>
        <div class="er-sep"></div>
        <button id="er-lib-btn" title="Biblioteca">biblioteca</button>
        <button id="er-back" title="Voltar ao meu texto" style="display:none">← meu texto</button>
        <div class="er-sep"></div>
        <button id="er-glos-btn" title="Glossário de frequência">glossário</button>
        <button id="er-ruler-btn" title="Régua de leitura (lupa)">régua</button>
        <div class="er-spacer"></div>
        <button id="er-play" title="Auto-scroll (A)">▶</button>
        <button id="er-spd-d" title="Mais lento">−</button>
        <button id="er-spd-u" title="Mais rápido">+</button>
        <div class="er-sep"></div>
        <button id="er-fminus" title="Fonte menor (-)">A−</button>
        <button id="er-fplus"  title="Fonte maior (+)">A+</button>
        <div class="er-sep"></div>
        <button id="er-mode" title="Alternar modo (M)">⇄ página</button>
        <button id="er-theme" title="Tema (T)">◑ tema</button>
      </div>
      <div class="er-box er-scroll" id="er-box">
        <div id="er-body">
          <div id="er-viewer">
            <div class="er-glass er-glass-top"></div>
            <div class="er-glass er-glass-bot"></div>
            <div class="er-ruler" id="er-ruler-el">
              <div class="er-ruler-bar">
                <button id="er-ruler-close">fechar régua</button>
              </div>
            </div>
            <div class="er-click er-click-l" id="er-prev"></div>
            <div class="er-click er-click-r" id="er-next"></div>
            <div id="er-content"></div>
          </div>
          <aside id="er-glos"><div class="er-glos-title">Frequência</div><div id="er-glos-list"></div></aside>
          <aside id="er-lib-panel">
            <div class="er-lib-header">
              <button class="er-lib-back" id="er-lib-back" style="display:none">← voltar</button>
              <span style="font-size:.75rem;opacity:.6;font-family:ui-monospace,monospace;flex:1">Biblioteca eskrev</span>
            </div>
            <div class="er-lib-tabs">
              <button class="er-lib-tab active" id="er-lib-tab-books">livros</button>
              <button class="er-lib-tab" id="er-lib-tab-fio">fio do verso</button>
            </div>
            <div class="er-lib-lang" id="er-lib-lang">
              <button class="er-lib-lang-btn active" data-lang="ptbr">PTBR</button>
              <button class="er-lib-lang-btn" data-lang="en">EN</button>
              <button class="er-lib-lang-btn" data-lang="es">ES</button>
              <button class="er-lib-lang-btn" data-lang="fr">FR</button>
            </div>
            <div id="er-fio-tabs" class="er-fio-tabs" style="display:none"></div>
            <div class="er-lib-list" id="er-lib-list"></div>
          </aside>
        </div>
        <div id="er-footer"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const box     = overlay.querySelector("#er-box");
    const viewer  = overlay.querySelector("#er-viewer");
    const content = overlay.querySelector("#er-content");
    const footer  = overlay.querySelector("#er-footer");
    const btnMode = overlay.querySelector("#er-mode");
    const glassT  = overlay.querySelector(".er-glass-top");
    const glassB  = overlay.querySelector(".er-glass-bot");
    const rulerEl = overlay.querySelector("#er-ruler-el");
    const glosList= overlay.querySelector("#er-glos-list");
    const libList = overlay.querySelector("#er-lib-list");
    const libLang = overlay.querySelector("#er-lib-lang");
    const fioTabs = overlay.querySelector("#er-fio-tabs");

    const s = {
      mode: "scroll", themeIdx: 0, page: 0, total: 1, fontSize: 19,
      autoScroll: false, autoRaf: null, autoSpeed: 1,
      libMode: "user", userText: "", userScroll: 0, libLang: "ptbr",
      libView: "books",
      themes: ["er-t-paper","er-t-sepia","er-t-chumbo"],
      themeLabels: ["paper","sépia","chumbo"],
    };

    // ── Utilities ──
    function esc(t) { return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
    function setTheme() {
      s.themes.forEach(t => overlay.classList.remove(t));
      overlay.classList.add(s.themes[s.themeIdx]);
      overlay.querySelector("#er-theme").textContent = `◑ ${s.themeLabels[s.themeIdx]}`;
    }
    function renderFooter() {
      if (s.mode === "page") { footer.textContent = `Página ${s.page+1} de ${s.total}`; return; }
      const d = viewer.scrollHeight - viewer.clientHeight;
      footer.textContent = `Lido: ${d > 0 ? Math.round(viewer.scrollTop/d*100) : 0}%`;
    }
    function calcPages() {
      s.total = Math.max(1, Math.ceil(content.scrollWidth / window.innerWidth));
      renderFooter();
    }
    function goPage(dir) {
      const next = s.page + dir;
      if (next >= 0 && next < s.total) { s.page = next; content.style.left = `-${s.page*100}vw`; renderFooter(); }
    }
    function setMode(m) {
      s.mode = m;
      box.className = box.className.replace(/\ber-(page|scroll)\b/g,"").trim();
      box.classList.add(`er-${m}`);
      btnMode.textContent = m === "page" ? "⇄ página" : "⇅ rolar";
      if (m === "page") { s.page = 0; setTimeout(() => { calcPages(); content.style.left = "0"; renderFooter(); }, 60); }
      else { content.style.left = "0"; setTimeout(renderFooter, 60); }
    }
    function adjustFont(delta) {
      s.fontSize = Math.max(14, Math.min(32, s.fontSize + delta));
      content.style.fontSize = s.fontSize + "px";
      if (s.mode === "page") setTimeout(calcPages, 80);
    }

    // ── Glossário ──
    function buildGlossary(text) {
      const freq = new Map();
      (text.toLowerCase().match(/[a-zà-ÿ]{4,}/gi) || []).forEach(w => freq.set(w, (freq.get(w)||0)+1));
      const top = [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,25);
      glosList.innerHTML = top.map(([w,n]) => `<div class="er-glos-item"><span>${esc(w)}</span><span>${n}</span></div>`).join("");
    }

    // ── Conteúdo ──
    function textToHtml(raw, preserveBreaks = false) {
      const blocks = raw.split(/\n{2,}/g).map(s=>s.trim()).filter(Boolean);
      return blocks.map(b => {
        const safe = esc(b);
        const body = preserveBreaks ? safe.replace(/\n/g,"<br>") : safe.replace(/\n+/g," ");
        return `<p>${body.replace(/\s{2,}/g," ").trim()}</p>`;
      }).join("");
    }
    function normalizeGutenberg(raw) {
      let t = raw.replace(/\r\n/g,"\n");
      const sm = t.match(/\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i);
      if (sm) t = t.slice(sm.index + sm[0].length);
      const em = t.match(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i);
      if (em) t = t.slice(0, em.index);
      return t.replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
    }
    function setContent(html, rawText) {
      content.innerHTML = html;
      content.scrollTop = 0;
      if (s.mode === "page") { s.page = 0; setTimeout(calcPages, 60); }
      buildGlossary(rawText || content.innerText || "");
      renderFooter();
    }
    function showUserText() {
      s.libMode = "user";
      content.innerHTML = textToHtml(s.userText);
      content.scrollTop = s.userScroll;
      buildGlossary(s.userText);
      overlay.querySelector("#er-back").style.display = "none";
      renderFooter();
    }

    // ── Biblioteca ──
    async function loadBooks() {
      if (_erLibraryBooks) return _erLibraryBooks;
      try { const r = await fetch("src/library/books.json"); _erLibraryBooks = (await r.json()).books || []; }
      catch(_) { _erLibraryBooks = []; }
      return _erLibraryBooks;
    }
    async function loadFio() {
      if (_erFioIndex) return _erFioIndex;
      try { const r = await fetch("src/assets/fiodoverso/index.json"); _erFioIndex = await r.json(); }
      catch(_) { _erFioIndex = null; }
      return _erFioIndex;
    }
    async function renderLibBooks() {
      libList.innerHTML = `<div class="er-lib-empty">carregando…</div>`;
      const books = await loadBooks();
      const filtered = books.filter(b => b.language === s.libLang);
      if (!filtered.length) { libList.innerHTML = `<div class="er-lib-empty">nenhum livro neste idioma</div>`; return; }
      libList.innerHTML = filtered.map((b,i) =>
        `<div class="er-lib-item" data-bi="${i}"><div class="er-lib-item-title">${esc(b.title)}</div><div class="er-lib-item-author">${esc(b.author)}</div></div>`
      ).join("");
      libList.querySelectorAll(".er-lib-item").forEach(item => {
        item.onclick = async () => {
          if (s.libMode !== "library") { s.userScroll = content.scrollTop; }
          s.libMode = "library";
          overlay.querySelector("#er-back").style.display = "";
          libList.innerHTML = `<div class="er-lib-empty">carregando…</div>`;
          const book = filtered[parseInt(item.dataset.bi)];
          try {
            const raw = await (await fetch(book.file)).text();
            const clean = normalizeGutenberg(raw);
            setContent(textToHtml(clean), clean);
          } catch(_) { libList.innerHTML = `<div class="er-lib-empty">erro ao carregar</div>`; }
          renderLibBooks();
          box.classList.remove("show-lib");
        };
      });
    }
    async function renderFio() {
      fioTabs.innerHTML = ""; libList.innerHTML = `<div class="er-lib-empty">carregando…</div>`;
      const idx = await loadFio();
      if (!idx?.months?.length) { libList.innerHTML = `<div class="er-lib-empty">não disponível</div>`; return; }
      idx.months.forEach(month => {
        const btn = document.createElement("button");
        btn.className = "er-fio-tab";
        btn.textContent = month.label || month.id;
        btn.onclick = () => {
          fioTabs.querySelectorAll(".er-fio-tab").forEach(b=>b.classList.remove("active"));
          btn.classList.add("active");
          renderFioMonth(month);
        };
        fioTabs.appendChild(btn);
      });
      fioTabs.querySelector(".er-fio-tab")?.classList.add("active");
      renderFioMonth(idx.months[0]);
    }
    function renderFioMonth(month) {
      if (!month?.entries?.length) { libList.innerHTML = `<div class="er-lib-empty">sem entradas</div>`; return; }
      libList.innerHTML = month.entries.map((e,i) =>
        `<div class="er-fio-item" data-fi="${i}"><div class="date">${esc(e.date||"")}</div><div class="title">${esc(e.title||"")}</div></div>`
      ).join("");
      libList.querySelectorAll(".er-fio-item").forEach(item => {
        item.onclick = async () => {
          if (s.libMode !== "fiodoverso") { s.userScroll = content.scrollTop; }
          s.libMode = "fiodoverso";
          overlay.querySelector("#er-back").style.display = "";
          const entry = month.entries[parseInt(item.dataset.fi)];
          try {
            const raw = await (await fetch(`src/assets/fiodoverso/${entry.file}`)).text();
            const clean = raw.replace(/^---[\s\S]*?---\s*/m,"");
            setContent(textToHtml(clean, true), clean);
          } catch(_) { content.innerHTML = `<p>erro ao carregar</p>`; }
          box.classList.remove("show-lib");
        };
      });
    }
    function setLibView(view) {
      s.libView = view;
      overlay.querySelector("#er-lib-tab-books").classList.toggle("active", view==="books");
      overlay.querySelector("#er-lib-tab-fio").classList.toggle("active", view==="fio");
      libLang.style.display = view==="books" ? "" : "none";
      fioTabs.style.display = view==="fio" ? "" : "none";
      if (view === "books") renderLibBooks(); else renderFio();
    }

    // ── Régua / Lupa ──
    function syncGlass() {
      const vr = viewer.getBoundingClientRect();
      const rr = rulerEl.getBoundingClientRect();
      const top = rr.top - vr.top;
      const h   = rr.height;
      viewer.style.setProperty("--ruler-top", `${top}px`);
      viewer.style.setProperty("--ruler-h",   `${h}px`);
    }
    let _rDrag=false, _rResize=null, _rY=0, _rTop=0, _rH=0;
    const EDGE=10;
    rulerEl.addEventListener("pointerdown", e => {
      if (!box.classList.contains("show-ruler")) return;
      const rr = rulerEl.getBoundingClientRect();
      const dy = e.clientY - rr.top;
      if (dy < EDGE) { _rResize="top"; }
      else if (dy > rr.height - EDGE) { _rResize="bot"; }
      else { _rDrag=true; _rResize=null; }
      _rY=e.clientY; _rTop=rulerEl.offsetTop; _rH=rulerEl.offsetHeight;
      rulerEl.classList.add("dragging");
      rulerEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    rulerEl.addEventListener("pointermove", e => {
      if (!_rDrag && !_rResize) return;
      const vr = viewer.getBoundingClientRect();
      const delta = e.clientY - _rY;
      const maxTop = vr.height - 44;
      if (_rResize === "top") {
        const newH = Math.max(44, _rH - delta);
        const newT = Math.min(maxTop, Math.max(0, _rTop + (_rH - newH)));
        rulerEl.style.top = `${newT}px`; rulerEl.style.height = `${newH}px`;
      } else if (_rResize === "bot") {
        rulerEl.style.height = `${Math.max(44, _rH + delta)}px`;
      } else {
        rulerEl.style.top = `${Math.max(0, Math.min(maxTop, _rTop + delta))}px`;
      }
      syncGlass();
    });
    rulerEl.addEventListener("pointerup", () => { _rDrag=false; _rResize=null; rulerEl.classList.remove("dragging"); });

    // ── Auto-scroll ──
    function stopAutoScroll() {
      s.autoScroll = false;
      if (s.autoRaf) cancelAnimationFrame(s.autoRaf);
      s.autoRaf = null;
      overlay.querySelector("#er-play").classList.remove("er-btn-on");
      overlay.querySelector("#er-play").textContent = "▶";
    }
    function startAutoScroll() {
      s.autoScroll = true;
      overlay.querySelector("#er-play").classList.add("er-btn-on");
      overlay.querySelector("#er-play").textContent = "⏸";
      const step = () => {
        if (!s.autoScroll) return;
        const max = viewer.scrollHeight - viewer.clientHeight;
        if (viewer.scrollTop >= max) { stopAutoScroll(); return; }
        viewer.scrollTop += s.autoSpeed;
        s.autoRaf = requestAnimationFrame(step);
      };
      s.autoRaf = requestAnimationFrame(step);
    }

    // ── Bindings ──
    overlay.querySelector("#er-close").onclick  = () => { stopAutoScroll(); overlay.classList.remove("er-active"); };
    overlay.querySelector("#er-mode").onclick   = () => setMode(s.mode==="page"?"scroll":"page");
    overlay.querySelector("#er-theme").onclick  = () => { s.themeIdx=(s.themeIdx+1)%s.themes.length; setTheme(); };
    overlay.querySelector("#er-fminus").onclick = () => adjustFont(-1);
    overlay.querySelector("#er-fplus").onclick  = () => adjustFont(1);
    overlay.querySelector("#er-prev").onclick   = () => goPage(-1);
    overlay.querySelector("#er-next").onclick   = () => goPage(1);
    overlay.querySelector("#er-play").onclick   = () => s.autoScroll ? stopAutoScroll() : startAutoScroll();
    overlay.querySelector("#er-spd-d").onclick  = () => { s.autoSpeed = Math.max(.2, +(s.autoSpeed-.3).toFixed(1)); };
    overlay.querySelector("#er-spd-u").onclick  = () => { s.autoSpeed = Math.min(4,  +(s.autoSpeed+.3).toFixed(1)); };
    overlay.querySelector("#er-glos-btn").onclick = () => {
      box.classList.toggle("show-glos");
      overlay.querySelector("#er-glos-btn").classList.toggle("er-btn-on", box.classList.contains("show-glos"));
    };
    overlay.querySelector("#er-ruler-btn").onclick = () => {
      const on = box.classList.toggle("show-ruler");
      overlay.querySelector("#er-ruler-btn").classList.toggle("er-btn-on", on);
      if (on) {
        const vr = viewer.getBoundingClientRect();
        rulerEl.style.top = `${Math.round(vr.height*.38)}px`;
        rulerEl.style.height = "80px";
        syncGlass();
      }
    };
    overlay.querySelector("#er-ruler-close").onclick = () => {
      box.classList.remove("show-ruler");
      overlay.querySelector("#er-ruler-btn").classList.remove("er-btn-on");
    };
    overlay.querySelector("#er-lib-btn").onclick = () => {
      const on = box.classList.toggle("show-lib");
      if (on) { setLibView(s.libView); }
    };
    overlay.querySelector("#er-back").onclick = () => { showUserText(); box.classList.remove("show-lib"); };
    overlay.querySelector("#er-lib-tab-books").onclick = () => setLibView("books");
    overlay.querySelector("#er-lib-tab-fio").onclick   = () => setLibView("fio");
    libLang.querySelectorAll(".er-lib-lang-btn").forEach(btn => {
      btn.onclick = () => {
        s.libLang = btn.dataset.lang;
        libLang.querySelectorAll(".er-lib-lang-btn").forEach(b=>b.classList.toggle("active", b===btn));
        renderLibBooks();
      };
    });
    viewer.addEventListener("scroll", renderFooter, { passive: true });
    window.addEventListener("resize", () => { if (s.mode==="page") calcPages(); });

    // keyboard
    document.addEventListener("keydown", e => {
      if (!overlay.classList.contains("er-active")) return;
      if (e.key==="Escape")    { stopAutoScroll(); overlay.classList.remove("er-active"); return; }
      if (e.key==="m"||e.key==="M") setMode(s.mode==="page"?"scroll":"page");
      if (e.key==="t"||e.key==="T") { s.themeIdx=(s.themeIdx+1)%s.themes.length; setTheme(); }
      if (e.key==="a"||e.key==="A") { s.autoScroll?stopAutoScroll():startAutoScroll(); e.preventDefault(); }
      if (e.key==="+"||e.key==="=") adjustFont(1);
      if (e.key==="-"||e.key==="_") adjustFont(-1);
      if (s.mode==="page") {
        if (e.key==="ArrowRight"||e.key==="ArrowDown") goPage(1);
        if (e.key==="ArrowLeft" ||e.key==="ArrowUp")   goPage(-1);
      }
    });

    const appTheme = document.body.dataset.theme||"paper";
    s.themeIdx = appTheme==="chumbo" ? 2 : 0;
    setTheme();
    overlay._erS = s;
    overlay._erSetContent = setContent;
    overlay._erShowUser = showUserText;
    overlay._erTextToHtml = textToHtml;
    overlay._erBuildGlossary = buildGlossary;
  }

  const s = overlay._erS;
  s.userText = rawText;
  s.userScroll = 0;
  s.libMode = "user";
  overlay.querySelector("#er-back").style.display = "none";
  overlay._erSetContent(overlay._erTextToHtml(rawText), rawText);
  overlay.querySelector("#er-content").style.fontSize = s.fontSize + "px";
  overlay.classList.add("er-active");
  const box = overlay.querySelector("#er-box");
  box.classList.remove("show-glos","show-lib","show-ruler","er-btn-on");
  box.className = box.className.replace(/\ber-(page|scroll)\b/g,"").trim() + " er-scroll";
  overlay.querySelector("#er-mode").textContent = "⇄ página";
}

function buildHelpSlice(slice) {
  const bodyEl = slice.querySelector(".panelBody");
  if (!bodyEl) return;

  const row = (kbd, desc) =>
    `<div class="hRow"><span class="hKey">${kbd}</span><span class="hDesc">${desc}</span></div>`;

  const cmd = (c, desc, extra = "") =>
    `<div class="hRow"><span class="hCmd">${c}</span><span class="hDesc">${desc}${extra ? `<span class="hCmdExtra">${extra}</span>` : ""}</span></div>`;

  bodyEl.innerHTML = `
    <div class="hSlice">
      <div class="hGrid">
        <section class="vSection">
          <div class="vSectionTitle">Escrever</div>
          ${cmd("palavra..d", "verbete da palavra anterior")}
          ${cmd("..w", "colorir classes de palavras")}
          ${cmd("..c", "coordenador linguístico")}
          ${cmd("..g", "verificação gramatical")}
          ${cmd("..m", "modos de escrita")}
        </section>
        <section class="vSection">
          <div class="vSectionTitle">Teclado</div>
          ${row("Ctrl+S", "salvar · exportar .skv")}
        </section>
        <section class="vSection">
          <div class="vSectionTitle">Arquivos</div>
          ${cmd("..s", "salvar · exportar .skv")}
          ${cmd("..a", "mesa de projetos")}
          ${cmd("..i", "importar .skv")}
          ${cmd("..v", "verificação + estatísticas")}
        </section>
        <section class="vSection">
          <div class="vSectionTitle">Ferramentas</div>
          ${cmd("..p", "criar post-it")}
          ${cmd("..n", "notas laterais")}
          ${cmd("..r", "modo leitura")}
          ${cmd("..f", "pomodoro · foco")}
          ${cmd("..t", "alternar tema (paper / chumbo)")}
        </section>
      </div>
      <section class="vSection vSection--tip">
        <p class="vNote">Clique no título do painel para minimizar ou expandir. &nbsp;·&nbsp; Clique nas bordas para fechar.</p>
      </section>
    </div>
  `;
}

function buildVerifySlice(ctx, slice) {
  const bodyEl = slice.querySelector(".panelBody");
  const metaEl = slice.querySelector(".sliceMeta");
  if (!bodyEl) return;

  const text = getEditorText();
  const stats = computeTextStats(text);

  if (metaEl) metaEl.textContent = `${stats.words} palavras · calculando hash…`;

  const uid = slice.dataset.sliceId || "v";
  const fileId = `vFile-${uid}`;
  const resultId = `vResult-${uid}`;
  const hashId = `vHash-${uid}`;
  const genId = `vGen-${uid}`;

  bodyEl.innerHTML = `
    <div class="vSlice">
      <section class="vSection">
        <div class="vSectionTitle">Texto</div>
        <div class="vGrid">
          <div class="vRow"><span class="vLabel">Palavras</span><span class="vVal">${stats.words.toLocaleString("pt-BR")}</span></div>
          <div class="vRow"><span class="vLabel">Caracteres</span><span class="vVal">${stats.chars.toLocaleString("pt-BR")}</span></div>
          <div class="vRow"><span class="vLabel">Sem espaços</span><span class="vVal">${stats.charsNoSpaces.toLocaleString("pt-BR")}</span></div>
          <div class="vRow"><span class="vLabel">Frases</span><span class="vVal">${stats.sentences}</span></div>
          <div class="vRow"><span class="vLabel">Parágrafos</span><span class="vVal">${stats.paragraphs}</span></div>
          <div class="vRow"><span class="vLabel">Leitura estimada</span><span class="vVal">${stats.readTime}</span></div>
          <div class="vRow"><span class="vLabel">Densidade lexical</span><span class="vVal">${stats.lexDensity}</span></div>
          ${stats.longestWord ? `<div class="vRow"><span class="vLabel">Palavra + longa</span><span class="vVal">${escapeHtml(stats.longestWord)}</span></div>` : ""}
        </div>
      </section>
      <section class="vSection">
        <div class="vSectionTitle">Anterioridade</div>
        <div class="vGrid">
          <div class="vRow"><span class="vLabel">Hash SHA-256</span><span class="vVal vHash" id="${hashId}" title="Clique para copiar">calculando…</span></div>
          <div class="vRow"><span class="vLabel">Gerado em</span><span class="vVal" id="${genId}">—</span></div>
        </div>
        <p class="vNote">Este hash é uma impressão digital do texto agora. Se uma vírgula mudar, o hash muda. Exporte como .skv para registrar com timestamp.</p>
      </section>
      <section class="vSection vSection--tool">
        <div class="vSectionTitle">Verificar arquivo</div>
        <p class="vNote">Suba um .skv para confirmar se o conteúdo não foi alterado após a exportação.</p>
        <label class="vFileLabel">
          <input type="file" class="vFileInput" id="${fileId}" accept=".skv,.json" />
          <span class="vFileBtn">Escolher .skv</span>
        </label>
        <div class="vVerifyResult" id="${resultId}" style="display:none"></div>
      </section>
    </div>
  `;

  // Calcula hash do texto atual
  sha256HexV(text).then((hash) => {
    const hashEl = bodyEl.querySelector(`#${hashId}`);
    const genEl = bodyEl.querySelector(`#${genId}`);
    if (hashEl) {
      const short = hash ? `${hash.slice(0, 12)}…${hash.slice(-8)}` : "—";
      hashEl.textContent = short;
      hashEl.title = hash ? `SHA-256: ${hash}\n\nClique para copiar` : "";
      hashEl.addEventListener("click", () => {
        if (!hash) return;
        navigator.clipboard?.writeText(hash).then(() => {
          hashEl.classList.add("copied");
          hashEl.textContent = "copiado ✓";
          setTimeout(() => {
            hashEl.textContent = short;
            hashEl.classList.remove("copied");
          }, 1600);
        });
      });
    }
    if (genEl) genEl.textContent = new Date().toLocaleString("pt-BR");
    if (metaEl) metaEl.textContent = `${stats.words} palavras · hash: ${hash.slice(0, 8)}…`;
  });

  // Verificar .skv inline
  const fileInput = bodyEl.querySelector(`#${fileId}`);
  const resultDiv = bodyEl.querySelector(`#${resultId}`);
  if (fileInput && resultDiv) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const btn = bodyEl.querySelector(".vFileBtn");
      if (btn) btn.textContent = "verificando…";
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result || "{}");
          const result = await verifySkv(parsed);
          resultDiv.className = `vVerifyResult ${result.status}`;
          resultDiv.textContent = result.msg;
          resultDiv.style.display = "";
          if (btn) btn.textContent = "Escolher .skv";
        } catch (_) {
          resultDiv.className = "vVerifyResult fail";
          resultDiv.textContent = "Arquivo inválido ou corrompido.";
          resultDiv.style.display = "";
          if (btn) btn.textContent = "Escolher .skv";
        }
        fileInput.value = "";
      };
      reader.readAsText(file, "utf-8");
    });
  }
}

export function handleCommand(ctx, el, cmd, wordOverride) {
  const token = `--${cmd}`;
  const textBefore = getTextBeforeCaretWithin(el);
  const word = wordOverride ?? getLastWordBeforeToken(textBefore, token);
  const c = String(cmd || "").toLowerCase();
  const legacyModalSlice = (tokenLike, fallbackToken = "") => {
    const modalPromise = ctx.integrations?.modalTransplant?.resolveCommand?.(tokenLike, fallbackToken);
    if (!modalPromise) return null;
    const loading = makeSlice(ctx, {
      badge: "10",
      title: "TRANSPLANT",
      kindKey: "consult",
      meta: `--${c} • carregando modal legado`,
      body: "Lendo fullm.html e convertendo modal para corte...",
    });
    modalPromise.then((result) => {
      if (!result) return;
      updateSliceContent(loading, {
        meta: result.meta,
        body: result.body,
      });
      const badgeEl = loading.querySelector(".badge");
      if (badgeEl) {
        badgeEl.innerHTML = `<strong>${escapeHtml(result.badge || "10")}</strong> <span>${escapeHtml(result.title || "TRANSPLANT")}</span>`;
      }
    });
    return loading;
  };

  const openLocalSlice = (opts) => makeSlice(ctx, { focusScroll: "heavy", ...opts });
  const openWriterSlice = (personaToken = "") => {
    const token = String(personaToken || "").trim().toLowerCase();
    const slice = openLocalSlice({
      badge: "14",
      title: "WRITER",
      kindKey: "consult",
      meta: token ? `persona: ${token} • carregando` : "personas de escrita",
      body: token ? "Lendo persona..." : "Selecione uma persona abaixo.",
    });

    const renderPersona = (targetToken) => {
      const t = String(targetToken || "").trim().toLowerCase();
      if (!t) return;
      updateSliceContent(slice, {
        meta: `persona: ${t} • carregando`,
        body: "Lendo templates do legado...",
      });
      ctx.integrations?.personaTransplant?.resolve?.(t).then((result) => {
        if (!result) {
          updateSliceContent(slice, {
            meta: `persona: ${t} • não encontrada`,
            body: "Persona não encontrada.",
          });
          return;
        }
        const lines = [];
        for (const tpl of result.templates || []) {
          lines.push(normalizePersonaGuideText(tpl.text || "(vazio)"));
          lines.push("");
        }
        updateSliceContent(slice, {
          meta: `persona: ${result.id} • ${result.templates?.length || 0} template(s)`,
          body: lines.join("\n").trim() || "(sem conteúdo)",
        });
      }).catch((error) => {
        updateSliceContent(slice, {
          meta: `persona: ${t} • falha`,
          body: `Falha ao carregar persona.\n\n${error?.message || String(error)}`,
        });
      });
    };

    if (token) {
      renderPersona(token);
      return slice;
    }

    ctx.integrations?.personaTransplant?.list?.().then((personas) => {
      const bodyEl = slice.querySelector(".panelBody");
      if (!bodyEl) return;
      const items = (personas || []).map((p) => String(p?.id || "").trim()).filter(Boolean);
      if (!items.length) {
        bodyEl.innerHTML = "<p>Sem personas disponíveis.</p>";
        return;
      }
      bodyEl.innerHTML = `
        <div class="writerPersonaList" role="list">
          ${items.map((id) => `<button type="button" class="writerPersonaItem" data-persona="${escapeHtml(id)}">${escapeHtml(id)}</button>`).join("")}
        </div>
        <p>Atalho direto: <code>conto ..w</code>, <code>poesia ..w</code>...</p>
      `;
      bodyEl.querySelectorAll(".writerPersonaItem").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-persona") || "";
          renderPersona(id);
        });
      });
    }).catch((error) => {
      updateSliceContent(slice, {
        meta: "personas • falha",
        body: `Falha ao listar personas.\n\n${error?.message || String(error)}`,
      });
    });

    return slice;
  };

  if (c === "b" || c === "buscar") {
    const slice = openLocalSlice({ badge: "01", title: "BUSCAR", kindKey: "consult", meta: "busca no texto" });
    const body = slice?.querySelector?.(".panelBody");
    if (!body) return slice;

    // Injeta interface de busca
    body.innerHTML = `
      <div style="display:grid;gap:10px">
        <input id="eskrev-search-input" type="search" placeholder="buscar no texto…"
          style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.18);border-radius:6px;
                 background:rgba(255,255,255,.6);color:rgba(0,0,0,.82);padding:8px 10px;font:inherit;
                 font-size:14px;outline:none;" autocomplete="off" spellcheck="false" />
        <div id="eskrev-search-status" style="font-size:10px;color:rgba(0,0,0,.4);letter-spacing:.05em;min-height:1em"></div>
      </div>
    `;

    const MARK_CLASS = "eskrev-search-mark";
    const MARK_ACTIVE = "eskrev-search-mark-active";

    // CSS da highlight
    if (!document.getElementById("eskrev-search-style")) {
      const s = document.createElement("style");
      s.id = "eskrev-search-style";
      s.textContent = `
        .${MARK_CLASS} { background: rgba(196,84,42,.18); border-radius: 2px; }
        .${MARK_ACTIVE} { background: rgba(196,84,42,.48); outline: 1px solid rgba(196,84,42,.6); }
      `;
      document.head.appendChild(s);
    }

    let marks = [];
    let current = -1;

    function clearMarks() {
      document.querySelectorAll(`.${MARK_CLASS}`).forEach(m => m.replaceWith(document.createTextNode(m.textContent)));
      marks = []; current = -1;
    }

    function highlightAll(term) {
      clearMarks();
      if (!term) return;
      const pages = ctx.state.pages || document.querySelectorAll(".pageContent");
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      pages.forEach(pc => {
        const walker = document.createTreeWalker(pc, NodeFilter.SHOW_TEXT, {
          acceptNode(n) {
            if (n.parentElement?.closest(".slice")) return NodeFilter.FILTER_REJECT;
            if (n.parentElement?.tagName === "MARK") return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        });
        const nodes = [];
        let n; while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(node => {
          const text = node.textContent;
          let match; re.lastIndex = 0;
          const parts = []; let last = 0;
          while ((match = re.exec(text)) !== null) {
            if (match.index > last) parts.push(document.createTextNode(text.slice(last, match.index)));
            const mark = document.createElement("mark");
            mark.className = MARK_CLASS;
            mark.textContent = match[0];
            parts.push(mark);
            marks.push(mark);
            last = match.index + match[0].length;
          }
          if (parts.length) {
            if (last < text.length) parts.push(document.createTextNode(text.slice(last)));
            node.replaceWith(...parts);
          }
        });
      });
    }

    function goTo(idx) {
      if (!marks.length) return;
      marks[current]?.classList.remove(MARK_ACTIVE);
      current = ((idx % marks.length) + marks.length) % marks.length;
      marks[current].classList.add(MARK_ACTIVE);
      marks[current].scrollIntoView({ block: "center", behavior: "smooth" });
      updateStatus();
    }

    function updateStatus() {
      const el = document.getElementById("eskrev-search-status");
      if (!el) return;
      el.textContent = marks.length
        ? `${current + 1} / ${marks.length} resultado${marks.length !== 1 ? "s" : ""}`
        : input?.value ? "nenhum resultado" : "";
    }

    let debounce;
    const input = body.querySelector("#eskrev-search-input");
    input?.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        highlightAll(input.value.trim());
        if (marks.length) goTo(0); else updateStatus();
      }, 180);
    });
    input?.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); goTo(e.shiftKey ? current - 1 : current + 1); }
      if (e.key === "Escape") { clearMarks(); input.value = ""; updateStatus(); }
    });

    // Limpa marks quando o corte for removido
    const obs = new MutationObserver(() => { if (!slice.isConnected) { clearMarks(); obs.disconnect(); } });
    obs.observe(document.body, { childList: true, subtree: true });

    requestAnimationFrame(() => input?.focus());
    return slice;
  }
  if (c === "s" || c === "exportar") {
    exportSkv().then((filename) => ctx.setStatus?.(`salvo: ${filename}`));
    return null; // sem slice — Ctrl+S behavior
  }
  if (c === "n" || c === "notas") {
    const sidebar = document.getElementById("notesSidebar");
    if (sidebar) {
      sidebar.classList.toggle("is-open");
      const isOpen = sidebar.classList.contains("is-open");
      ctx.setStatus?.(isOpen ? "notas: aberto" : "notas: fechado");
      if (isOpen) {
        const searchInput = sidebar.querySelector(".notes-search-input");
        searchInput?.focus();
      }
      return null;
    }
    return null;
  }
  if (c === "a" || c === "arquivos") {
    const sidebar = document.getElementById("filesSidebar");
    if (sidebar) {
      sidebar.classList.toggle("is-open");
      const isOpen = sidebar.classList.contains("is-open");
      ctx.setStatus?.(isOpen ? "arquivos: aberto" : "arquivos: fechado");
      if (isOpen) {
        const newBtn = document.getElementById("mesaNewBtn");
        newBtn?.focus();
      }
      return null;
    }
    return null;
  }
  if (c === "i" || c === "importar") {
    const fi = document.getElementById("mesaFileInput");
    if (fi) { fi.click(); return null; }
    return openLocalSlice({ badge: "04", title: "IMPORTAR", kindKey: "consult", meta: "importação", body: "Input de arquivo não encontrado." });
  }
  if (c === "books") {
    return openLocalSlice({
      badge: "05",
      title: "BOOKS",
      kindKey: "consult",
      meta: "catálogo",
      body: "Books está em transplante. Em breve aqui no corte.",
    });
  }
  if (c === "v" || c === "verificacao" || c === "verificação") {
    const slice = openLocalSlice({
      badge: "07",
      title: "VERIFICAÇÃO",
      kindKey: "consult",
      meta: "calculando…",
      body: " ",
      focusScroll: "heavy",
    });
    slice.dataset.liveVerify = "1";
    buildVerifySlice(ctx, slice);
    return slice;
  }
  if (c === "f" || c === "foco" || c === "pomodoro" || c === "pomo") {
    openPomodoro();
    return null;
  }
  if (c === "hardreset") {
    ctx.integrations?.persistence?.clear?.(el);
    return openLocalSlice({
      badge: "09",
      title: "HARD RESET",
      kindKey: "unknown",
      meta: "estado local limpo",
      body: "Persistência local limpa em modo seguro.",
    });
  }
  if (c === "l" || c === "idioma") {
    const key = "eskrev:index2:lang";
    const list = ["pt-BR", "en-GB", "es-ES", "fr-FR"];
    let next = list[0];
    try {
      const current = localStorage.getItem(key) || list[0];
      const idx = list.indexOf(current);
      next = list[(idx + 1) % list.length] || list[0];
      localStorage.setItem(key, next);
    } catch (_e) {}
    return openLocalSlice({
      badge: "10",
      title: "IDIOMA",
      kindKey: "help",
      meta: `idioma ativo: ${next}`,
      body: `Idiomas: ${list.join(" • ")}`,
    });
  }

  if (c === "t") {
    showCountdown("alternar tema", () => ctx.theme?.cycle?.());
    return null;
  }

  if (c === "p" || c === "postit" || c === "note") {
    showCountdown("post-it", () => {
      const slice = openLocalSlice({
        badge: "12",
        title: "POST-IT",
        kindKey: "consult",
        meta: "captura rápida",
        body: "",
      });
      attachPostitComposer(ctx, slice);
    });
    return null;
  }

  if (c === "r" || c === "reader") {
    showCountdown("modo leitor", () => openEreader());
    return null;
  }

  if (c === "writer") {
    return openWriterSlice(word);
  }

  if (c === "d") {
    const target = word || "?";
    const slice = makeSlice(ctx, {
      badge: "DEF",
      title: "VERBETE",
      kindKey: "help",
      meta: target.toLowerCase(),
      body: "Consultando corpus…",
    });
    lookupVerbete(target).then((result) => {
      if (!result) {
        updateSliceContent(slice, {
          meta: target.toLowerCase(),
          body: `"${target}" não encontrado no corpus local.`,
        });
        return;
      }
      updateSliceContent(slice, {
        meta: result.label ? `${result.label}` : target.toLowerCase(),
        body: result.body,
      });
    }).catch(() => {
      updateSliceContent(slice, { meta: "erro", body: "Falha ao consultar o corpus." });
    });
    return slice;
  }

  if (c === "m") {
    const MODOS = [
      { id: "conto",         label: "Conto",         desc: "Narrativa breve, tensão e corte." },
      { id: "romance",       label: "Romance",        desc: "Arco longo, personagens, mundos." },
      { id: "cronica",       label: "Crônica",        desc: "Cotidiano, voz e tempo presente." },
      { id: "poesia",        label: "Poesia",         desc: "Imagem, ritmo, silêncio." },
      { id: "ensaio",        label: "Ensaio",         desc: "Argumento, reflexão, forma aberta." },
      { id: "roteiro",       label: "Roteiro",        desc: "Cena, diálogo, ação visual." },
      { id: "enem",          label: "Enem",           desc: "Redação dissertativa-argumentativa." },
      { id: "universitario", label: "Universitário",  desc: "Texto acadêmico, ABNT." },
    ];
    const slice = openLocalSlice({
      badge: "M",
      title: "MODOS",
      kindKey: "consult",
      meta: "modos de escrita",
      body: " ",
    });
    const bodyEl = slice.querySelector(".panelBody");
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="modosSliceList">
          ${MODOS.map((m) => `
            <button type="button" class="modosSliceItem" data-modo="${escapeHtml(m.id)}">
              <span class="modosSliceLabel">${escapeHtml(m.label)}</span>
              <span class="modosSliceDesc">${escapeHtml(m.desc)}</span>
            </button>
          `).join("")}
        </div>
      `;
      bodyEl.querySelectorAll(".modosSliceItem").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-modo") || "";
          const sidebar = document.getElementById("modosSidebar");
          const titleEl = document.getElementById("modosTitle");
          const contentEl = document.getElementById("modosContent");
          if (!sidebar || !contentEl) return;
          bodyEl.querySelectorAll(".modosSliceItem").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          const modo = MODOS.find((m) => m.id === id);
          if (titleEl) titleEl.textContent = (modo?.label || id).toUpperCase();
          contentEl.innerHTML = `<p class="modos-loading">Carregando…</p>`;
          sidebar.classList.add("is-open");
          sidebar.setAttribute("aria-hidden", "false");
          ctx.integrations?.personaTransplant?.resolve?.(id).then((result) => {
            if (!result || !result.templates?.length) {
              contentEl.innerHTML = renderMarkdown(modo?.desc || "Modo não encontrado.");
              return;
            }
            const combined = result.templates.map((tpl) =>
              normalizePersonaGuideText(tpl.text || "")
            ).join("\n\n---\n\n");
            contentEl.innerHTML = renderMarkdown(combined) || renderMarkdown(modo?.desc || "");
            groupModosIntoSections(contentEl);
          }).catch(() => {
            contentEl.innerHTML = renderMarkdown(modo?.desc || "Falha ao carregar modo.");
          });
        });
      });
    }
    return slice;
  }

  if (c === "w") {
    const wasActive = ctx.state.wcActive;
    const slice = makeSlice(ctx, {
      badge: "W",
      title: "CLASSES",
      kindKey: "help",
      meta: wasActive ? "desativando…" : "carregando léxico…",
      body: wasActive
        ? "Removendo cores do texto."
        : "Aguarde — carregando léxico de português.",
    });
    toggleWordClass(ctx).then(() => {
      const active = ctx.state.wcActive;
      const secs = active ? 10 : 5;
      updateSliceContent(slice, {
        meta: active ? "ativo" : "inativo",
        body: active ? " " : "Modo desativado.",
      });
      if (active) {
        const panelBody = slice.querySelector(".panelBody");
        if (panelBody) {
          const dot = '<span style="opacity:.4"> · </span>';
          const br  = '<br>';
          const c = (cls, label) =>
            `<strong class="wc-${cls}" style="font-weight:700">${label}</strong>`;
          panelBody.innerHTML =
            `<p style="margin-bottom:.6em;font-weight:600">Cores ativas no texto.</p>` +
            `<p style="line-height:1.9">` +
              c("verb","VERB") + dot + c("subst","SUBST") + dot + c("adj","ADJ") + dot + c("adv","ADV") + dot + c("pron","PRON") + br +
              c("art","ART")  + dot + c("prep","PREP")  + dot + c("conj","CONJ") + dot + c("num","NUM")  + dot + c("intj","INTJ") +
            `</p>` +
            `<p style="opacity:.6;margin-top:.6em">Passe o mouse sobre uma palavra para ver a classe.<br>Digite ..w novamente para desativar.</p>`;
        }
      }

      // Reloginho countdown — SVG circular estilo LCD
      const r = 13;
      const circum = +(2 * Math.PI * r).toFixed(3);
      const countdownEl = document.createElement("div");
      countdownEl.className = "wcCountdown";
      countdownEl.innerHTML =
        `<svg viewBox="0 0 32 32" width="32" height="32">` +
          `<circle class="wcc-track" cx="16" cy="16" r="${r}"/>` +
          `<circle class="wcc-fill" cx="16" cy="16" r="${r}"` +
            ` stroke-dasharray="${circum}" stroke-dashoffset="0"/>` +
          `<text class="wcc-num" x="16" y="16">${secs}</text>` +
        `</svg>`;
      slice.querySelector(".sliceCard")?.appendChild(countdownEl);

      const fillEl = countdownEl.querySelector(".wcc-fill");
      const numEl  = countdownEl.querySelector(".wcc-num");
      let remaining = secs - 1;
      const iv = setInterval(() => {
        if (!slice.isConnected) { clearInterval(iv); return; }
        if (remaining <= 0) { clearInterval(iv); slice.remove(); return; }
        const progress = remaining / secs;
        if (fillEl) fillEl.style.strokeDashoffset = String(+(circum * (1 - progress)).toFixed(3));
        if (numEl)  numEl.textContent = String(remaining);
        remaining--;
      }, 1000);
    });
    return slice;
  }

  if (c === "c") {
    showCountdown("inspeção linguística", () => openCoordenador(ctx));
    return null;
  }

  if (c === "h" || c === "help") {
    const slice = openLocalSlice({
      badge: "01",
      title: "HELP",
      kindKey: "help",
      meta: "atalhos e comandos",
      body: " ",
      focusScroll: "heavy",
    });
    buildHelpSlice(slice);
    return slice;
  }

  if (c === "o" || c === "modals") {
    const modalList = ctx.integrations?.modalTransplant?.list?.() || [];
    const lines = [];
    lines.push("Pacote modalTransplant");
    lines.push("");
    if (!modalList.length) {
      lines.push("Nenhum modal mapeado.");
    } else {
      modalList.forEach((m) => lines.push(`• --${m.cmd}  ${m.title}  (${m.id})`));
    }
    return makeSlice(ctx, {
      badge: "10",
      title: "TRANSPLANT",
      kindKey: "help",
      meta: "inventário legado",
      body: lines.join("\n"),
    });
  }

  if (c === "postit" || c === "note") {
    const slice = makeSlice(ctx, {
      badge: "06",
      title: "POST-IT",
      kindKey: "consult",
      meta: "captura rápida",
      body: "Abrindo captura...",
      focusScroll: "heavy",
    });
    attachPostitComposer(ctx, slice);
    return slice;
  }

  const openPersonaSlice = (tokenRaw) => {
    const token = (tokenRaw || "").trim().toLowerCase();
    const loading = makeSlice(ctx, {
      badge: "50",
      title: "PERSONA",
      kindKey: "consult",
      meta: token ? `persona: ${token} • carregando` : "persona: informe uma persona",
      body: token
        ? "Lendo templates do legado..."
        : "Use: `conto ..persona` (ou romance/roteiro/ensaio/universitario/enem/poesia).",
      focusScroll: "heavy",
    });

    if (!token) return loading;
    ctx.integrations?.personaTransplant?.resolve?.(token).then((result) => {
      if (!result) {
        updateSliceContent(loading, {
          meta: `persona: ${token} • não encontrada`,
          body: "Persona não encontrada no legado.",
        });
        return;
      }
      const lines = [];
      for (const tpl of result.templates || []) {
        lines.push(normalizePersonaGuideText(tpl.text || "(vazio)"));
        lines.push("");
      }
      updateSliceContent(loading, {
        meta: `persona: ${result.id} • ${result.templates?.length || 0} template(s)`,
        body: lines.join("\n").trim() || "(sem conteúdo)",
      });
    }).catch((error) => {
      updateSliceContent(loading, {
        meta: `persona: ${token} • falha`,
        body: `Falha ao carregar persona.\n\n${error?.message || String(error)}`,
      });
    });
    return loading;
  };

  if (c === "persona") {
    return openPersonaSlice(word);
  }

  if (c === "templates") {
    const loading = makeSlice(ctx, {
      badge: "52",
      title: "TEMPLATES",
      kindKey: "consult",
      meta: "inventário • carregando",
      body: "Lendo templates do legado...",
      focusScroll: "heavy",
    });
    ctx.integrations?.personaTransplant?.listTemplates?.().then((items) => {
      const lines = [];
      lines.push(`Templates disponíveis: ${items?.length || 0}`);
      lines.push("");
      (items || []).forEach((tpl) => {
        lines.push(`- ${tpl.id}  (${tpl.persona})`);
      });
      updateSliceContent(loading, {
        meta: "inventário de templates",
        body: lines.join("\n"),
      });
    }).catch((error) => {
      updateSliceContent(loading, {
        meta: "templates • falha",
        body: `Falha ao carregar templates.\n\n${error?.message || String(error)}`,
      });
    });
    return loading;
  }

  if (c === "template" || c === "guide") {
    const key = (word || "").trim().toLowerCase();
    const loading = makeSlice(ctx, {
      badge: "53",
      title: "TEMPLATE",
      kindKey: "consult",
      meta: key ? `template: ${key} • carregando` : "template: informe o id/persona",
      body: key ? "Lendo template..." : "Use: `conto ..template` ou `romance-capitulo ..template`.",
      focusScroll: "heavy",
    });
    if (!key) return loading;
    ctx.integrations?.personaTransplant?.resolveTemplate?.(key).then((tpl) => {
      if (!tpl) {
        updateSliceContent(loading, {
          meta: `template: ${key} • não encontrado`,
          body: "Template não encontrado no legado.",
        });
        return;
      }
      updateSliceContent(loading, {
        meta: `template: ${tpl.id} • persona ${tpl.persona}`,
        body: tpl.text || "(sem conteúdo)",
      });
    }).catch((error) => {
      updateSliceContent(loading, {
        meta: `template: ${key} • falha`,
        body: `Falha ao carregar template.\n\n${error?.message || String(error)}`,
      });
    });
    return loading;
  }

  if (c === "figures") {
    const personaToken = (word || "").trim().toLowerCase();
    const loading = makeSlice(ctx, {
      badge: "51",
      title: "FIGURES",
      kindKey: "consult",
      meta: personaToken ? `figuras: ${personaToken} • carregando` : "figuras • carregando",
      body: "Lendo base de figuras de linguagem do legado...",
      focusScroll: "heavy",
    });

    ctx.integrations?.figuresTransplant?.resolve?.(personaToken).then((result) => {
      if (!result) {
        updateSliceContent(loading, {
          meta: "figuras • indisponível",
          body: "Não foi possível carregar figuras.",
        });
        return;
      }

      const lines = [];
      lines.push(result.persona ? `Persona: ${result.persona}` : "Persona: todas");
      lines.push("");
      for (const tab of result.tabs || []) {
        lines.push(`## ${tab.label || tab.id}`);
        for (const item of tab.items || []) {
          lines.push(`### ${item.title || item.id}`);
          if (item.recognize) lines.push(`- Reconhecer: ${item.recognize}`);
          if (item.definition) lines.push(`- Definição: ${item.definition}`);
          if (item.example_use) lines.push(`- Uso: ${item.example_use}`);
          if (item.example_interpret) lines.push(`- Interpretação: ${item.example_interpret}`);
          if (item.not_confuse) lines.push(`- Não confundir: ${item.not_confuse}`);
          lines.push("---");
        }
      }

      updateSliceContent(loading, {
        meta: `figuras • ${result.tabs?.length || 0} aba(s)`,
        body: lines.join("\n").trim() || "(sem conteúdo)",
      });
    }).catch((error) => {
      updateSliceContent(loading, {
        meta: "figuras • falha",
        body: `Falha ao carregar figuras.\n\n${error?.message || String(error)}`,
      });
    });
    return loading;
  }

  if (c === "theme") {
    const theme = ctx.theme?.cycle?.() || "paper";
    return makeSlice(ctx, {
      badge: "11",
      title: "THEME",
      kindKey: "help",
      meta: `tema aplicado: ${theme}`,
      body: `Tema alterado para **${theme}**.`,
    });
  }

  if (c === "dark" || c === "light") {
    const theme = c === "dark" ? "ink" : "paper";
    const applied = ctx.theme?.set?.(theme) || theme;
    return makeSlice(ctx, {
      badge: "11",
      title: "THEME",
      kindKey: "help",
      meta: `tema aplicado: ${applied}`,
      body: `Comando legado \`--${c}\` aplicado para **${applied}**.`,
    });
  }

  if (c === "zen" || c === "fs" || c === "mode") {
    document.body.classList.toggle("zenMode");
    const active = document.body.classList.contains("zenMode");
    return makeSlice(ctx, {
      badge: "12",
      title: "VIEW",
      kindKey: "help",
      meta: active ? "modo foco ativado" : "modo foco desativado",
      body: "Compatibilidade do legado aplicada no layout novo.",
    });
  }

  if (c === "overview" || c === "thumbs") {
    return legacyModalSlice("overview", c) || makeSlice(ctx, {
      badge: "12",
      title: "VIEW",
      kindKey: "help",
      meta: "overview",
      body: "Visão geral indisponível no momento.",
    });
  }

  if (c === "save" || c === "open" || c === "pomo" || c === "qr" || c === "mini" || c === "music") {
    return legacyModalSlice(c, c) || makeSlice(ctx, {
      badge: "10",
      title: "TRANSPLANT",
      kindKey: "consult",
      meta: `--${c}`,
      body: "Modal legado indisponível.",
    });
  }

  if (c === "mute" || c === "unmute") {
    const muted = c === "mute";
    try {
      localStorage.setItem("skrv_sfx_muted", muted ? "true" : "false");
    } catch (_e) {}
    return makeSlice(ctx, {
      badge: "13",
      title: "AUDIO",
      kindKey: "help",
      meta: muted ? "áudio mutado" : "áudio reativado",
      body: `Comando legado \`--${c}\` aplicado.`,
    });
  }

  if (c === "visitas") {
    let count = 0;
    try {
      count = Number.parseInt(localStorage.getItem("skrv_dedication_enter_count") || "0", 10) || 0;
    } catch (_e) {}
    return makeSlice(ctx, {
      badge: "14",
      title: "VISITAS",
      kindKey: "consult",
      meta: "contador da dedicatória legado",
      body: `ENTER na dedicatória: **${count}**`,
    });
  }

  if (c === "reset") {
    ctx.integrations?.persistence?.clear?.(el);
    return makeSlice(ctx, {
      badge: "15",
      title: "RESET",
      kindKey: "unknown",
      meta: "conteúdo local limpo",
      body: "Persistência local deste editor foi limpa.\n\n(Comando `..reset` aplicado no modo seguro v2.)",
    });
  }

  if (c === "roll" || c === "dice" || c === "dado") {
    const value = 1 + Math.floor(Math.random() * 6);
    return makeSlice(ctx, {
      badge: "16",
      title: "DICE",
      kindKey: "consult",
      meta: "rolagem inline",
      body: `Resultado: **${value}**`,
    });
  }

  if (c === "kb") {
    let enabled = false;
    try {
      const current = localStorage.getItem("skrv_hwkb") === "true";
      if (current) {
        localStorage.removeItem("skrv_hwkb");
        localStorage.removeItem("tot_hwkb");
        enabled = false;
      } else {
        localStorage.setItem("skrv_hwkb", "true");
        enabled = true;
      }
    } catch (_e) {}
    return makeSlice(ctx, {
      badge: "17",
      title: "KEYBOARD",
      kindKey: "help",
      meta: enabled ? "hardware keyboard: on" : "hardware keyboard: off",
      body: "Toggle de compatibilidade (`..kb`) aplicado.",
    });
  }

  if (c === "v" || c === "vocab") {
    const list = Object.entries(vocab).map(([k, v]) => `• ${k} — ${v}`).join("\n");
    return makeSlice(ctx, {
      badge: "02",
      title: "VOCAB",
      kindKey: "vocab",
      meta: `${Object.keys(vocab).length} entradas`,
      body: list || "(vazio)",
    });
  }

  if (c === "d" || c === "define") {
    const w = (word || "").toLowerCase();
    const localDef = vocab[w] || `Não encontrei definição local para “${word}”.`;
    const slice = makeSlice(ctx, {
      badge: "03",
      title: "DEFINE",
      kindKey: "define",
      meta: word ? `“${word}” • buscando dicionário legado...` : "nenhuma palavra detectada",
      body: localDef,
    });

    if (!word) return slice;

    const dictPromise = ctx.integrations?.dictionary?.lookup?.(word);
    if (!dictPromise) return slice;

    dictPromise.then((result) => {
      if (!result?.ok) {
        const reason = result?.reason === "load_error" ? "falha ao carregar base legado" : "sem termo";
        updateSliceContent(slice, {
          meta: `“${word}” • ${reason}`,
          body: `${localDef}\n\n(detalhe: usando fallback local)`,
        });
        return;
      }

      const entry = result.entry;
      if (!entry) {
        updateSliceContent(slice, {
          meta: `“${word}” • não encontrado no legado`,
          body: `${localDef}\n\nBase legado carregada: ${result.status?.chunksLoaded ?? 0}/${result.status?.chunksTotal ?? 0} chunks.`,
        });
        return;
      }

      const defs = Array.isArray(entry.def)
        ? entry.def.filter(Boolean)
        : (entry.def ? [String(entry.def)] : []);
      const examples = Array.isArray(entry.exemplos) ? entry.exemplos.filter(Boolean) : [];
      const classes = Array.isArray(entry.pos)
        ? entry.pos.filter(Boolean)
        : (entry.pos ? [String(entry.pos)] : []);

      const lines = [];
      if (defs.length) {
        lines.push("Definições:");
        defs.slice(0, 3).forEach((d, i) => lines.push(`${i + 1}. ${d}`));
      }
      if (classes.length) {
        lines.push("");
        lines.push(`Classe: ${classes.join(", ")}`);
      }
      if (examples.length) {
        lines.push("");
        lines.push("Exemplo:");
        lines.push(`• ${examples[0]}`);
      }

      updateSliceContent(slice, {
        meta: `“${word}” • dicionário legado`,
        body: lines.join("\n") || localDef,
      });
    }).catch(() => {
      updateSliceContent(slice, {
        meta: `“${word}” • falha ao carregar base legado`,
        body: `${localDef}\n\n(detalhe: usando fallback local)`,
      });
    });

    return slice;
  }

  if (c === "c" || c === "consult") {
    const term = (word || "").trim();
    const docText = (el?.innerText || "").trim();
    const consultPkg = ctx.integrations?.consult;
    const vocabHits = consultPkg?.findInVocab?.(term) || [];
    const docHits = consultPkg?.findInText?.(term, docText, 6) || [];

    const lines = [];
    if (!term) {
      lines.push("Consulta local: digite uma palavra e use `..c`.");
      lines.push("");
      lines.push("Exemplo: `doravante ..c`");
    } else {
      lines.push(`Termo: "${term}"`);
      lines.push(`Vocabulário: ${vocabHits.length} hit(s)`);
      if (vocabHits.length) {
        lines.push("");
        lines.push("No vocabulário:");
        vocabHits.slice(0, 4).forEach(([k, v]) => lines.push(`• ${k} — ${v}`));
      }
      lines.push("");
      lines.push(`No texto atual: ${docHits.length} trecho(s)`);
      if (docHits.length) {
        docHits.forEach((h) => lines.push(`• L${h.idx}: ${h.line}`));
      } else {
        lines.push("• nenhum trecho encontrado");
      }
    }

    const slice = makeSlice(ctx, {
      badge: "04",
      title: "CONSULT",
      kindKey: "consult",
      meta: term ? `termo: ${term}` : "termo: (vazio)",
      body: lines.join("\n"),
    });

    if (!term) return slice;

    const dictPromise = consultPkg?.lookupDictionary?.(term);
    if (!dictPromise) return slice;

    dictPromise.then((result) => {
      const docHitsLive = consultPkg?.findInText?.(term, docText, 6) || [];
      const bodyLines = [];
      bodyLines.push(`Termo: "${term}"`);
      bodyLines.push(`No texto atual: ${docHitsLive.length} trecho(s)`);
      if (docHitsLive.length) {
        docHitsLive.forEach((h) => bodyLines.push(`• L${h.idx}: ${h.line}`));
      } else {
        bodyLines.push("• nenhum trecho encontrado");
      }

      if (result?.ok && result.entry) {
        const firstDef = Array.isArray(result.entry.def)
          ? (result.entry.def.find(Boolean) || "")
          : (result.entry.def || "");
        bodyLines.push("");
        bodyLines.push("Dicionário legado:");
        bodyLines.push(`• encontrado para "${result.entry.lemma || term}"`);
        if (firstDef) bodyLines.push(`• ${firstDef}`);
        updateSliceContent(slice, { meta: `termo: ${term} • legado ok`, body: bodyLines.join("\n") });
      } else if (result?.ok && !result.entry) {
        bodyLines.push("");
        bodyLines.push("Dicionário legado:");
        bodyLines.push("• sem entrada correspondente");
        updateSliceContent(slice, { meta: `termo: ${term} • sem entrada no legado`, body: bodyLines.join("\n") });
      } else {
        bodyLines.push("");
        bodyLines.push("Dicionário legado:");
        bodyLines.push("• indisponível (fallback local ativo)");
        updateSliceContent(slice, { meta: `termo: ${term} • fallback local`, body: bodyLines.join("\n") });
      }

      Promise.all([
        consultPkg?.lookupDoubt?.(term),
        consultPkg?.lookupRegencia?.(term),
        consultPkg?.scanDoubts?.(docText),
        consultPkg?.scanRegencias?.(docText),
      ]).then(([doubtRes, regRes, doubtsScan, regScan]) => {
        const lines = [];
        lines.push(...bodyLines);
        lines.push("");
        lines.push("Linguagem (legado):");

        if (doubtRes?.ok && doubtRes?.doubt) {
          const label = doubtRes.doubt.key || term;
          const tip = doubtRes.doubt.tip || doubtRes.doubt.regra || "";
          lines.push(`- Dúvida: ${label}`);
          if (tip) lines.push(`  ${tip}`);
        } else {
          lines.push("- Dúvida: sem alerta direto para o termo");
        }

        if (regRes?.ok && regRes?.regencia) {
          const info = typeof regRes.regencia === "string" ? regRes.regencia : JSON.stringify(regRes.regencia);
          lines.push(`- Regência: ${info}`);
        } else {
          lines.push("- Regência: sem entrada direta para o termo");
        }

        const dCount = Array.isArray(doubtsScan?.items) ? doubtsScan.items.length : 0;
        const rCount = Array.isArray(regScan?.items) ? regScan.items.length : 0;
        lines.push(`- No texto atual: ${dCount} dúvida(s), ${rCount} alerta(s) de regência`);

        updateSliceContent(slice, {
          meta: `termo: ${term} • consulta completa`,
          body: lines.join("\n"),
        });
      }).catch(() => {});
      return;
    }).catch(() => {
      updateSliceContent(slice, {
        meta: `termo: ${term} • fallback local`,
        body: [
          `Termo: "${term}"`,
          "Dicionário legado:",
          "• indisponível (fallback local ativo)",
        ].join("\n"),
      });
    });

    return slice;
  }

  if (c === "g" || c === "gram" || c === "grammar") {
    const gl = ctx.grammarLint;
    const editorEl = el;

    // palavra --g  →  consulta corpus para a regra associada à palavra
    if (word && gl) {
      const slice = makeSlice(ctx, {
        badge: "GR",
        title: "GRAMÁTICA",
        kindKey: "help",
        meta: word.toLowerCase(),
        body: "Consultando corpus…",
      });
      Promise.all([
        corpus.search("syntax", "concordancia", word),
        corpus.search("syntax", "regencia", word),
        corpus.search("stylistics", "figures", word),
      ]).then(([c1, c2, c3]) => {
        const all = [...c1, ...c2, ...c3];
        const lines = [];
        if (!all.length) {
          lines.push(`Nenhuma regra encontrada para **${word}** no corpus.`);
          lines.push("");
          lines.push("Tente usar **..d** para buscar a definição no verbete.");
        } else {
          lines.push(`Ocorrências para "${word}" no corpus:`);
          lines.push("");
          all.slice(0, 8).forEach(e => {
            const id   = e.id   ? `**${e.id}**  ` : "";
            const rule = e.rule || e.tip || e.description || "";
            const ex   = e.correct || e.example || "";
            lines.push(`- ${id}${rule}`);
            if (ex) lines.push(`  ✓ ${ex}`);
          });
        }
        updateSliceContent(slice, {
          meta: `gramática: ${word.toLowerCase()}`,
          body: lines.join("\n"),
        });
      }).catch(() => {
        updateSliceContent(slice, { meta: "erro", body: "Falha ao consultar o corpus." });
      });
      return slice;
    }

    // --g  (sem palavra)  →  toggle do verificador + status
    if (gl) {
      const nowActive = gl.toggle();
      if (nowActive) {
        gl.scan(editorEl);
      } else {
        gl.clear(editorEl);
      }
      const status = nowActive ? "ativo — desvios marcados" : "desativado";
      ctx.setStatus?.(`verificador gramatical: ${status}`);
      return makeSlice(ctx, {
        badge: "GR",
        title: "GRAMÁTICA",
        kindKey: "help",
        meta: status,
        body: nowActive
          ? "Verificador ativado.\n\nDesvios comuns da norma padrão aparecem sublinhados em ondas.\nPasse o mouse para ver a explicação.\n\nDigite **..g** novamente para desativar."
          : "Verificador desativado.",
      });
    }

    return makeSlice(ctx, {
      badge: "GR",
      title: "GRAMÁTICA",
      kindKey: "help",
      meta: "indisponível",
      body: "Verificador gramatical não foi inicializado. Verifique o console.",
    });
  }

  const modalToken = c === "modal" ? word : c;
  const canResolveLegacy = ctx.integrations?.modalTransplant?.isLegacyCommand?.(modalToken)
    || (c === "modal" && Boolean(word));
  if (canResolveLegacy) {
    return legacyModalSlice(modalToken, word);
  }

  ctx.flashCommandError?.();
  ctx.setStatus?.(`comando inválido: ${token}`);
  return null;
}
