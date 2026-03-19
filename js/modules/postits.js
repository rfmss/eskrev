import { idbGet, idbSet } from "./idb.js";

let postitSeq = 0;
const POSTIT_TONES = ["yellow", "green", "blue", "pink"];
const POSTITS_KEY = "skrv_postits_v1";

// ── Persistência ──────────────────────────────────────────────────

export function savePostits(ctx) {
  const layer = getLayer(ctx);
  if (!layer) return;
  try {
    const data = Array.from(layer.querySelectorAll(".postit")).map((note) => ({
      id: note.dataset.postitId || "",
      text: note.querySelector(".postitBody")?.textContent?.trim() || "",
      tone: note.dataset.tone || POSTIT_TONES[0],
      left: Number.parseFloat(note.style.left) || 0,
      top: Number.parseFloat(note.style.top) || 0,
      minimized: note.classList.contains("isMinimized"),
    }));
    idbSet(POSTITS_KEY, data);
  } catch (_) {}
}

export function restorePostits(ctx) {
  const layer = getLayer(ctx);
  if (!layer) return;
  try {
    const raw = idbGet(POSTITS_KEY);
    if (!raw) return;
    const data = Array.isArray(raw) ? raw : JSON.parse(raw);
    if (!Array.isArray(data) || !data.length) return;
    data.forEach((item) => {
      const note = document.createElement("article");
      note.className = "postit";
      note.dataset.tone = POSTIT_TONES.includes(item.tone) ? item.tone : POSTIT_TONES[0];
      if (item.id) note.dataset.postitId = item.id;
      note.innerHTML = `
        <header class="postitHead" title="Arraste para mover">
          <div class="postitBtns">
            <button class="postitBtn postitClose" type="button" title="Fechar" aria-label="Fechar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1L7 7M7 1L1 7"/></svg></button>
            <button class="postitBtn postitMin"   type="button" title="Minimizar" aria-label="Minimizar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 4H7"/></svg></button>
            <button class="postitBtn postitColor" type="button" title="Alternar cor" aria-label="Alternar cor"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7 C1 5 2 4 4 4 C6 4 7 5 7 7"/><path d="M4 4 L4 1"/></svg></button>
          </div>
          <span class="postitTitle">POST-IT</span>
        </header>
        <div class="postitBody"></div>
      `;
      const body = note.querySelector(".postitBody");
      if (body) body.textContent = item.text || "";
      note.style.left = `${Math.round(item.left || 0)}px`;
      note.style.top = `${Math.round(item.top || 0)}px`;
      if (item.minimized) note.classList.add("isMinimized");
      layer.appendChild(note);
      bindPostit(ctx, note);
    });
  } catch (_) {}
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getViewport(ctx) {
  return ctx?.refs?.viewportEl || document.querySelector(".viewport");
}

function getLayer(ctx) {
  return ctx?.refs?.postitLayerEl || document.getElementById("postitLayer");
}

function getPageRect(ctx) {
  const page = document.querySelector(".page");
  if (!page) return null;
  return page.getBoundingClientRect();
}

function getDeleteZoneBounds(ctx, noteHeight) {
  const viewport = getViewport(ctx);
  const pageRect = getPageRect(ctx);
  if (!viewport || !pageRect) return null;
  const vr = viewport.getBoundingClientRect();
  const threshold = 24;
  const top = Math.round(pageRect.bottom - vr.top - noteHeight - threshold);
  return { top };
}

function getVerticalBounds(ctx, noteHeight) {
  const viewport = getViewport(ctx);
  const pageRect = getPageRect(ctx);
  if (!viewport || !pageRect) return { minY: 0, maxY: 0 };
  const vr = viewport.getBoundingClientRect();
  const edge = 3;
  const minY = Math.max(0, Math.round(pageRect.top - vr.top + edge));
  const maxY = Math.max(minY, Math.round(pageRect.bottom - vr.top - noteHeight - edge));
  return { minY, maxY };
}

function isMobileViewport() {
  return window.innerWidth < 600;
}

function snapPostitOutsidePage(ctx, note) {
  const viewport = getViewport(ctx);
  const pageRect = getPageRect(ctx);
  if (!viewport || !pageRect || !note) return;

  const vr = viewport.getBoundingClientRect();
  const nr = note.getBoundingClientRect();

  // No mobile, apenas garante que está dentro da viewport — não tenta colocar fora da página
  if (isMobileViewport()) {
    const nw = note.offsetWidth || 148;
    const nh = note.offsetHeight || 96;
    const currentLeft = Number.parseFloat(note.style.left || "0") || 0;
    const currentTop = Number.parseFloat(note.style.top || "0") || 0;
    const x = clamp(currentLeft, 0, Math.max(0, vr.width - nw));
    const y = clamp(currentTop, 0, Math.max(0, vr.height - nh));
    if (x !== currentLeft || y !== currentTop) {
      note.classList.add("isSnapping");
      note.style.left = `${Math.round(x)}px`;
      note.style.top = `${Math.round(y)}px`;
      window.setTimeout(() => note.classList.remove("isSnapping"), 280);
    }
    return;
  }

  // If there is no overlap with the white page, keep current placement.
  const overlapsPage = !(
    nr.right <= pageRect.left ||
    nr.left >= pageRect.right ||
    nr.bottom <= pageRect.top ||
    nr.top >= pageRect.bottom
  );
  if (!overlapsPage) return;

    const noteW = note.offsetWidth || nr.width || 164;
    const noteH = note.offsetHeight || nr.height || 96;
  const margin = 8;

  const currentLeft = Number.parseFloat(note.style.left || "0") || 0;
  const currentTop = Number.parseFloat(note.style.top || "0") || 0;

  const targetLeftOutside = pageRect.left - vr.left - noteW - margin;
  const targetRightOutside = pageRect.right - vr.left + margin;

  const { minY, maxY } = getVerticalBounds(ctx, noteH);
  const y = clamp(currentTop, minY, maxY);

  const xLeft = clamp(targetLeftOutside, 0, Math.max(0, vr.width - noteW));
  const xRight = clamp(targetRightOutside, 0, Math.max(0, vr.width - noteW));

  const overlapsAtX = (x) => {
    const left = vr.left + x;
    const right = left + noteW;
    const top = vr.top + y;
    const bottom = top + noteH;
    return !(
      right <= pageRect.left ||
      left >= pageRect.right ||
      bottom <= pageRect.top ||
      top >= pageRect.bottom
    );
  };

  const leftValid = !overlapsAtX(xLeft);
  const rightValid = !overlapsAtX(xRight);
  const dLeft = Math.abs((nr.right) - pageRect.left);
  const dRight = Math.abs(pageRect.right - nr.left);

  let x = currentLeft;
  if (leftValid && rightValid) {
    x = dLeft <= dRight ? xLeft : xRight;
  } else if (leftValid) {
    x = xLeft;
  } else if (rightValid) {
    x = xRight;
  } else {
    x = dLeft <= dRight ? xLeft : xRight;
  }

  note.classList.add("isSnapping");
  note.style.left = `${Math.round(x)}px`;
  note.style.top = `${Math.round(y)}px`;
  window.setTimeout(() => note.classList.remove("isSnapping"), 280);
}

function ensurePostitId(el) {
  if (!el.dataset.postitId) {
    postitSeq += 1;
    el.dataset.postitId = `postit-${postitSeq}`;
  }
  const n = Number.parseInt(String(el.dataset.postitId).replace(/\D/g, ""), 10);
  if (Number.isFinite(n)) postitSeq = Math.max(postitSeq, n);
}

function bindPostit(ctx, note) {
  if (!note || note.__postitBound) return;
  note.__postitBound = true;
  ensurePostitId(note);

  const head = note.querySelector(".postitHead");
  const closeBtn = note.querySelector(".postitClose");
  const minBtn   = note.querySelector(".postitMin");
  const colorBtn = note.querySelector(".postitColor");
  const body = note.querySelector(".postitBody");
  if (!head || !body) return;

  if (!note.dataset.tone || !POSTIT_TONES.includes(note.dataset.tone)) {
    note.dataset.tone = POSTIT_TONES[Math.floor(Math.random() * POSTIT_TONES.length)];
  }

  const cycleTone = () => {
    const current = note.dataset.tone;
    const idx = POSTIT_TONES.indexOf(current);
    const next = POSTIT_TONES[(idx + 1) % POSTIT_TONES.length] || POSTIT_TONES[0];
    note.dataset.tone = next;
    savePostits(ctx);
  };

  const setFoldState = (minimized) => {
    note.classList.toggle("isMinimized", minimized);
    savePostits(ctx);
  };
  const toggleFold = () => setFoldState(!note.classList.contains("isMinimized"));

  if (closeBtn) closeBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    note.remove();
    savePostits(ctx);
  });
  if (minBtn) minBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const suppressUntil = Number(note.dataset.suppressToneUntil || "0");
    if (Date.now() < suppressUntil) { ev.preventDefault(); return; }
    toggleFold();
  });
  if (colorBtn) colorBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const suppressUntil = Number(note.dataset.suppressToneUntil || "0");
    if (Date.now() < suppressUntil) { ev.preventDefault(); return; }
    cycleTone();
  });

  let drag = null;
  let moved = false;
  const dragThreshold = 4;
  const onMove = (ev) => {
    if (!drag) return;
    const viewport = getViewport(ctx);
    if (!viewport) return;
    const vr = viewport.getBoundingClientRect();
    const nw = note.offsetWidth || 164;
    const nh = note.offsetHeight || 96;
    const nextX = drag.startX + (ev.clientX - drag.pointerX);
    const nextY = drag.startY + (ev.clientY - drag.pointerY);
    const x = clamp(nextX, 0, Math.max(0, vr.width - nw));
    const { minY, maxY } = getVerticalBounds(ctx, nh);
    const y = clamp(nextY, minY, maxY);
    note.style.left = `${Math.round(x)}px`;
    note.style.top = `${Math.round(y)}px`;
    const dz = getDeleteZoneBounds(ctx, nh);
    const isDeleteReady = !!dz && y >= dz.top;
    note.classList.toggle("isDeleteReady", isDeleteReady);
    if (Math.abs(ev.clientX - drag.pointerX) > dragThreshold || Math.abs(ev.clientY - drag.pointerY) > dragThreshold) {
      moved = true;
    }
  };
  const endDrag = () => {
    drag = null;
    note.classList.remove("isDragging");
    if (note.classList.contains("isDeleteReady")) {
      note.remove();
      savePostits(ctx); // persiste a remoção
      return;
    }
    note.classList.remove("isDeleteReady");
    snapPostitOutsidePage(ctx, note);
    savePostits(ctx); // persiste nova posição
  };

  head.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    if (ev.target && ev.target.closest(".postitBtn")) return;
    const x = Number.parseFloat(note.style.left || "0");
    const y = Number.parseFloat(note.style.top || "0");
    drag = {
      startX: Number.isFinite(x) ? x : 0,
      startY: Number.isFinite(y) ? y : 0,
      pointerX: ev.clientX,
      pointerY: ev.clientY,
    };
    moved = false;
    note.classList.add("isDragging");
    head.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  });
  head.addEventListener("pointermove", onMove);
  head.addEventListener("pointerup", (ev) => {
    try {
      head.releasePointerCapture(ev.pointerId);
    } catch (_e) {}
    if (!drag) return;
    const dx = Math.abs(ev.clientX - drag.pointerX);
    const dy = Math.abs(ev.clientY - drag.pointerY);
    const movedByUp = dx > dragThreshold || dy > dragThreshold;
    const actuallyDragged = moved || movedByUp;

    endDrag();
    // Prevent accidental color/minimize click right after a drag.
    if (actuallyDragged) {
      note.dataset.suppressToneUntil = String(Date.now() + 220);
    }
  });
  head.addEventListener("pointercancel", endDrag);
}

export function hydratePostits(ctx) {
  const layer = getLayer(ctx);
  if (!layer) return;
  layer.querySelectorAll(".postit").forEach((note) => bindPostit(ctx, note));
  // Restaura post-its salvos de sessões anteriores (apenas se layer estiver vazio)
  if (!layer.querySelector(".postit")) {
    restorePostits(ctx);
  }
}

export function createPostit(ctx, text) {
  const layer = getLayer(ctx);
  const viewport = getViewport(ctx);
  const pageRect = getPageRect(ctx);
  if (!layer || !viewport || !pageRect) return null;

  const note = document.createElement("article");
  note.className = "postit";
  note.dataset.tone = POSTIT_TONES[Math.floor(Math.random() * POSTIT_TONES.length)];
  note.innerHTML = `
    <header class="postitHead" title="Arraste para mover">
      <div class="postitBtns">
        <button class="postitBtn postitClose" type="button" title="Fechar" aria-label="Fechar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1L7 7M7 1L1 7"/></svg></button>
        <button class="postitBtn postitMin"   type="button" title="Minimizar" aria-label="Minimizar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 4H7"/></svg></button>
        <button class="postitBtn postitColor" type="button" title="Alternar cor" aria-label="Alternar cor"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7 C1 5 2 4 4 4 C6 4 7 5 7 7"/><path d="M4 4 L4 1"/></svg></button>
      </div>
      <span class="postitTitle">POST-IT</span>
    </header>
    <div class="postitBody"></div>
  `;
  const body = note.querySelector(".postitBody");
  if (body) body.textContent = String(text || "").trim();

  layer.appendChild(note);

  const vr = viewport.getBoundingClientRect();
  const nw = note.offsetWidth || 164;
  const nh = note.offsetHeight || 96;
  let defaultX, defaultY;
  if (isMobileViewport()) {
    // No mobile: canto superior direito da viewport, cascateando para baixo
    defaultX = clamp(vr.width - nw - 8, 0, Math.max(0, vr.width - nw));
    defaultY = clamp(44 + ((postitSeq % 4) * 52), 0, Math.max(0, vr.height - nh));
  } else {
    defaultX = clamp((pageRect.right - vr.left) + 18, 0, Math.max(0, vr.width - nw));
    defaultY = clamp((pageRect.top - vr.top) + 44 + ((postitSeq % 4) * 46), 0, Math.max(0, vr.height - nh));
  }
  note.style.left = `${Math.round(defaultX)}px`;
  note.style.top = `${Math.round(defaultY)}px`;

  bindPostit(ctx, note);
  savePostits(ctx);
  return note;
}

export function attachPostitComposer(ctx, sliceRoot) {
  if (!sliceRoot) return;
  const body = sliceRoot.querySelector(".panelBody");
  if (!body) return;
  body.innerHTML = `
    <div class="postitComposer">
      <label class="postitComposerLabel" for="postitInput-${sliceRoot.dataset.sliceId || "x"}">escreva e pressione Enter</label>
      <input class="postitComposerInput" id="postitInput-${sliceRoot.dataset.sliceId || "x"}" type="text" placeholder="novo post-it..." />
      <div class="postitComposerHint">o post-it nasce fora da página branca e pode ser arrastado e minimizado.</div>
    </div>
  `;
  const input = body.querySelector(".postitComposerInput");
  if (!input) return;
  input.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    const text = String(input.value || "").trim();
    if (!text) return;
    const note = createPostit(ctx, text);
    if (note) {
      input.value = "";
      ctx?.setStatus?.("post-it criado");
    }
  });
  requestAnimationFrame(() => input.focus());
}
