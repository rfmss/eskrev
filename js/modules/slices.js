import { vocab } from "../data/vocab.js";
import { escapeHtml, getTextBeforeCaretWithin } from "./dom.js";
import { getLastWordBeforeToken } from "./textops.js";
import { getDockTagBounds, positionDockTag } from "./dock.js";
import { positionSliceDockRail } from "./layout.js";
import { attachPostitComposer } from "./postits.js";

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

  for (const raw of lines) {
    const line = String(raw || "");
    const trimmed = line.trim();

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

    const ul = trimmed.match(/^[-*]\s+(.+)$/);
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
  return out.join("") || `<p>${renderInlineMarkdown(String(text || ""))}</p>`;
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
    const page = root.closest(".page");
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
      body: "Lendo index_old.html e convertendo modal para corte...",
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
        <p>Atalho direto: <code>conto --w</code>, <code>poesia --w</code>...</p>
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

  const isServiceCmd = new Set([
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
  ]);
  if (!isServiceCmd.has(c)) {
    ctx.flashCommandError?.();
    ctx.setStatus?.(`comando inválido: ${token}`);
    return null;
  }

  if (c === "b" || c === "buscar") {
    return legacyModalSlice("consultlegacy", "consultlegacy") || openLocalSlice({
      badge: "01",
      title: "BUSCAR",
      kindKey: "consult",
      meta: "busca local",
      body: "Buscar está indisponível no legado agora.",
    });
  }
  if (c === "s" || c === "exportar") {
    return legacyModalSlice("export", "export") || openLocalSlice({
      badge: "02",
      title: "EXPORTAR",
      kindKey: "consult",
      meta: "exportação",
      body: "Exportação está indisponível no legado agora.",
    });
  }
  if (c === "n" || c === "notas") {
    return legacyModalSlice("notes", "notes") || openLocalSlice({
      badge: "03",
      title: "NOTAS",
      kindKey: "consult",
      meta: "notas",
      body: "Notas está indisponível no legado agora.",
    });
  }
  if (c === "i" || c === "importar") {
    return legacyModalSlice("import", "import") || openLocalSlice({
      badge: "04",
      title: "TRAZER PROJETO",
      kindKey: "consult",
      meta: "importação",
      body: "Importação está indisponível no legado agora.",
    });
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
  if (c === "a" || c === "arquivos") {
    return legacyModalSlice("system", "system") || openLocalSlice({
      badge: "06",
      title: "ARQUIVOS",
      kindKey: "consult",
      meta: "projetos e backups",
      body: "Arquivos está indisponível no legado agora.",
    });
  }
  if (c === "v" || c === "verificacao" || c === "verificação") {
    return openLocalSlice({
      badge: "07",
      title: "VERIFICAÇÃO",
      kindKey: "consult",
      meta: "integridade",
      body: "Abra `verify.html` para verificar um arquivo .skv.",
    });
  }
  if (c === "f" || c === "fullscreen") {
    const active = !!document.fullscreenElement;
    const toggleFs = async () => {
      try {
        if (active) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch (_e) {}
    };
    toggleFs();
    return openLocalSlice({
      badge: "08",
      title: "TELA CHEIA",
      kindKey: "help",
      meta: active ? "desativando" : "ativando",
      body: active ? "Saindo da tela cheia." : "Entrando em tela cheia.",
    });
  }
  if (c === "d" || c === "hardreset") {
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

  if (c === "t" || c === "toolbar") {
    return openLocalSlice({
      badge: "11",
      title: "TOOLBAR",
      kindKey: "help",
      meta: "atalhos de superfície",
      body: "Comandos ativos: --h --b --s --n --i --books --a --v --f --d --l --t --p --r --w\n\nUse --w para personas de escrita.",
    });
  }

  if (c === "p" || c === "postit" || c === "note") {
    const slice = openLocalSlice({
      badge: "12",
      title: "POST-IT",
      kindKey: "consult",
      meta: "captura rápida",
      body: "Abrindo captura...",
    });
    attachPostitComposer(ctx, slice);
    return slice;
  }

  if (c === "r" || c === "reader") {
    return legacyModalSlice("reader", "reader") || openLocalSlice({
      badge: "13",
      title: "READER",
      kindKey: "consult",
      meta: "modo leitor",
      body: "Reader está indisponível no legado agora.",
    });
  }

  if (c === "w" || c === "writer") {
    return openWriterSlice(word);
  }

  if (c === "h" || c === "help") {
    const modalList = ctx.integrations?.modalTransplant?.list?.() || [];
    const transplanted = modalList.map((m) => `- ${m.cmd}  → ${m.title} (${m.id})`).join("\n");
    return makeSlice(ctx, {
      badge: "01",
      title: "HELP",
      kindKey: "help",
      meta: "comandos e regras",
      body: `- palavra --d    → define a palavra anterior\n- --v            → vocabulário local\n- --c            → consulta local (vocab + texto + dúvidas + regência)\n- --postit       → captura de post-it fora da página\n- --h / --help   → ajuda\n- --o / --modals → inventário de transplantes\n- alvo --modal   → abre modal legado pelo alias anterior\n- conto --persona (ou --conto/--romance/--poesia...) → persona em corte\n- --templates    → inventário de templates\n- alvo --template → abre template por id/persona\n- persona --figures (ou --figures) → figuras de linguagem no corte\n\nCompat legado:\n- --save --open --theme --dark --light --zen --fs\n- --music --mute --unmute --pomo --mode --overview --thumbs\n- --visitas --reset --roll/--dice/--dado --kb --qr\n\nTransplantes (modal -> corte):\n${transplanted || "(nenhum pacote ativo)"}\n\nTopo do corte: minimiza/abre.\nLaterais (gutter): fecham o corte.\nVocê continua escrevendo sempre.`,
    });
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
        : "Use: `conto --persona` (ou romance/roteiro/ensaio/universitario/enem/poesia).",
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
  if (personaAliases.has(c)) {
    return openPersonaSlice(c);
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
      body: key ? "Lendo template..." : "Use: `conto --template` ou `romance-capitulo --template`.",
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
      body: "Persistência local deste editor foi limpa.\n\n(Comando legado `--reset` aplicado no modo seguro v2.)",
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
      body: "Toggle de compatibilidade legado (`--kb`) aplicado.",
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
      lines.push("Consulta local: digite uma palavra e use `--c`.");
      lines.push("");
      lines.push("Exemplo: `doravante --c`");
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
