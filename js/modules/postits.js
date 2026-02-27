let postitSeq = 0;
const POSTIT_TONES = ["yellow", "green", "blue", "pink"];

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

function snapPostitOutsidePage(ctx, note) {
  const viewport = getViewport(ctx);
  const pageRect = getPageRect(ctx);
  if (!viewport || !pageRect || !note) return;

  const vr = viewport.getBoundingClientRect();
  const nr = note.getBoundingClientRect();

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
  const toneBtn = note.querySelector(".postitToneBtn");
  const body = note.querySelector(".postitBody");
  if (!head || !body) return;

  if (!note.dataset.tone || !POSTIT_TONES.includes(note.dataset.tone)) {
    note.dataset.tone = POSTIT_TONES[Math.floor(Math.random() * POSTIT_TONES.length)];
  }

  const syncToneButton = () => {
    if (!toneBtn) return;
    toneBtn.style.background = getComputedStyle(note).getPropertyValue("--postit-head").trim() || "";
    toneBtn.title = `Cor: ${note.dataset.tone || "post-it"} (clique para alternar)`;
  };
  const cycleTone = () => {
    const current = note.dataset.tone;
    const idx = POSTIT_TONES.indexOf(current);
    const next = POSTIT_TONES[(idx + 1) % POSTIT_TONES.length] || POSTIT_TONES[0];
    note.dataset.tone = next;
    syncToneButton();
  };

  const setFoldState = (minimized) => {
    note.classList.toggle("isMinimized", minimized);
  };
  const toggleFold = () => setFoldState(!note.classList.contains("isMinimized"));

  if (toneBtn) {
    toneBtn.addEventListener("click", (ev) => {
      // Ignore color clicks right after a drag release.
      const suppressUntil = Number(note.dataset.suppressToneUntil || "0");
      if (Date.now() < suppressUntil) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      ev.stopPropagation();
      cycleTone();
    });
  }
  syncToneButton();

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
      return;
    }
    note.classList.remove("isDeleteReady");
    snapPostitOutsidePage(ctx, note);
  };

  head.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    if (ev.target && ev.target.closest(".postitToneBtn")) return;
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
    const onToneArea = !!(ev.target && ev.target.closest(".postitDots"));

    endDrag();
    // Prevent accidental color/minimize click right after a drag.
    if (actuallyDragged) {
      note.dataset.suppressToneUntil = String(Date.now() + 220);
      return;
    }
    if (!onToneArea) toggleFold();
  });
  head.addEventListener("pointercancel", endDrag);
}

export function hydratePostits(ctx) {
  const layer = getLayer(ctx);
  if (!layer) return;
  layer.querySelectorAll(".postit").forEach((note) => bindPostit(ctx, note));
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
      <div class="postitDots" aria-label="Cores do post-it">
        <button class="postitToneBtn" type="button" title="Alternar cor"></button>
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
  const defaultX = clamp((pageRect.right - vr.left) + 18, 0, Math.max(0, vr.width - nw));
  const defaultY = clamp((pageRect.top - vr.top) + 44 + ((postitSeq % 4) * 46), 0, Math.max(0, vr.height - nh));
  note.style.left = `${Math.round(defaultX)}px`;
  note.style.top = `${Math.round(defaultY)}px`;

  bindPostit(ctx, note);
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
