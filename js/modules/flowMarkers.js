import { positionPageBreakRail, positionPageFlowRail } from "./layout.js";

// A4 height in CSS pixels at 96 dpi (1 mm = 96/25.4 px).
// This is the reference used by Word: 297 mm page, 2 cm top/bottom margins.
// metric = A4_HEIGHT_PX - padTop - padBottom  →  the usable content height
// that fits on one printed A4 page given the element's current padding.
const A4_PX = Math.round(297 * (96 / 25.4)); // ≈ 1123 px

function getPageMetric(contentEl) {
  const cs = getComputedStyle(contentEl);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  // Fixed A4-based metric — independent of viewport size so screen breaks
  // correspond to real A4 page boundaries and match print output.
  const metric = Math.max(200, A4_PX - padTop - padBottom);
  contentEl.dataset.pageMetric = String(metric);
  return { metric, padTop, padBottom };
}

/**
 * Computes page break positions using a hybrid approach:
 *
 *   PRIMARY  — pixel-based: one break every `metric` pixels of scrollHeight.
 *              Works for plain text, Enter-created lines, anything.
 *   SECONDARY — slice-snapping: if a pixel break would split a `.slice`, the
 *              break moves to the slice's top boundary and the slice receives
 *              a physical `data-page-start` margin so the separator doesn't
 *              overlay its content.
 *
 * Returns array of { content, rail } break-center Y values.
 *   content — relative to contentEl top border (same as yLocal in page.js)
 *   rail    — relative to pageBreakRail top (= content - padTop)
 */
function computePageBreaks(contentEl, metric, halfGap, padTop, padBottom) {
  // Step 1: clear existing margins to read natural layout positions.
  contentEl.querySelectorAll(".slice[data-page-start]").forEach((s) => {
    delete s.dataset.pageStart;
  });

  // Step 2: pixel-based raw break count from natural scrollHeight.
  const totalH = contentEl.scrollHeight - padTop - padBottom;
  const numBreaks = Math.max(0, Math.ceil(totalH / metric) - 1);
  if (numBreaks === 0) return [];

  const slices = Array.from(contentEl.querySelectorAll(":scope > .slice"));

  // Step 3: for each pixel break, snap to nearest slice boundary if needed.
  const breakItems = [];
  const seenY = new Set();
  const pageBreakSliceSet = new Set();

  for (let i = 1; i <= numBreaks; i += 1) {
    let breakY = padTop + i * metric;
    let breakSlice = null;

    // Check if this pixel break would split a slice.
    for (const s of slices) {
      const top = s.offsetTop;
      const bottom = top + s.offsetHeight;
      if (top < breakY && bottom > breakY) {
        // Break falls inside the slice — move it to the slice's top.
        breakY = top;
        breakSlice = s;
        pageBreakSliceSet.add(s);
        break;
      }
    }

    // Skip duplicate Y (can happen when two raw breaks snap to same slice).
    if (!seenY.has(breakY)) {
      seenY.add(breakY);
      breakItems.push({ rawY: breakY, slice: breakSlice });
    }
  }

  // Step 4: apply margin markers to slice-boundary breaks.
  // CSS: .slice[data-page-start] { margin-top: var(--break-gap) }
  pageBreakSliceSet.forEach((s) => { s.dataset.pageStart = "1"; });

  // Step 5: compute break centers.
  //   Free-text break  → center = rawY (separator overlays the gap; snap handles cursor)
  //   Slice break      → center = slice.offsetTop_after_margin - halfGap
  //                      The margin gap spans [offsetTop-breakGap, offsetTop].
  return breakItems.map(({ rawY, slice }) => {
    const centerContent = slice ? slice.offsetTop - halfGap : rawY;
    return {
      content: centerContent,
      rail:    centerContent - padTop,
    };
  });
}

export function syncFlowPageMarkers(ctx, contentEl, { allowGrowth = true } = {}) {
  const page = contentEl.closest(".page");
  if (!page) return;
  const layer = ctx.refs.pageFlowRailEl || page.querySelector(".pageFlowMarkers");
  if (!layer) return;

  const { metric, padTop } = getPageMetric(contentEl);
  positionPageFlowRail(ctx, contentEl);

  // Derive page count from stored break centers (set by syncPageBreakSeparators).
  let breakCount = 0;
  try {
    const raw = contentEl.dataset.pageBreakCenters;
    if (raw) breakCount = JSON.parse(raw).length;
  } catch (_) {}

  const livePageCount = breakCount + 1;
  const prevMax = Number(contentEl.dataset.maxPagesSeen || "1");
  const maxSeen = allowGrowth ? Math.max(prevMax, livePageCount) : prevMax;
  contentEl.dataset.maxPagesSeen = String(maxSeen);

  const bornTop = Number(layer.dataset.bornTop || "0") || 2;
  if (!layer.dataset.bornTop) {
    layer.dataset.bornTop = String(bornTop);
  }

  for (let i = 1; i <= maxSeen; i += 1) {
    const id = `pg-${i}`;
    let tag = layer.querySelector(`.flowMarker[data-id="${id}"]`);
    if (!tag) {
      tag = document.createElement("span");
      tag.className = "flowMarker";
      tag.dataset.id = id;
      tag.textContent = `PG${String(i).padStart(2, "0")}`;
      layer.appendChild(tag);
    }

    const anchorY = bornTop + (i - 1) * metric;
    const y = anchorY - contentEl.scrollTop;
    const layerHeight = layer.clientHeight || page.clientHeight;
    const visible = y > -14 && y < layerHeight - 2;

    tag.style.top = `${Math.round(y)}px`;
    tag.style.opacity = visible ? ".82" : "0";
  }
}

export function syncPageBreakSeparators(ctx, contentEl, { allowGrowth = true } = {}) {
  const page = contentEl.closest(".page");
  if (!page) return;
  const rail = ctx.refs.pageBreakRailEl || page.querySelector(".pageBreakRail");
  if (!rail) return;

  const lineHeight = parseFloat(getComputedStyle(contentEl).lineHeight) || 32;
  const breakGap = Math.max(36, Math.round(lineHeight + 8));
  const halfGap = breakGap / 2;

  // Set --break-gap on .page (ancestor of both rail and slices) so
  // .slice[data-page-start] can inherit it via CSS var().
  page.style.setProperty("--break-gap", `${breakGap}px`);
  rail.style.setProperty("--break-gap", `${breakGap}px`); // also on rail for page.js readers

  const { metric, padTop, padBottom } = getPageMetric(contentEl);
  positionPageBreakRail(ctx, contentEl);

  // Compute hybrid (pixel + slice-snapping) page breaks.
  const breaks = computePageBreaks(contentEl, metric, halfGap, padTop, padBottom);

  // Persist content-coord centers for page.js snap/guard.
  contentEl.dataset.pageBreakCenters = JSON.stringify(breaks.map((b) => b.content));

  // Update page count.
  const livePageCount = Math.max(1, breaks.length + 1);
  const prevMax = Number(contentEl.dataset.maxPagesSeen || "1");
  const maxSeen = allowGrowth ? Math.max(prevMax, livePageCount) : prevMax;
  contentEl.dataset.maxPagesSeen = String(maxSeen);

  const layerHeight = rail.clientHeight || page.clientHeight;

  // Create / update / hide separator elements.
  const existingSeps = new Map(
    Array.from(rail.querySelectorAll(".pageBreak")).map((s) => [s.dataset.id, s]),
  );
  const usedIds = new Set();

  for (let i = 0; i < breaks.length; i += 1) {
    const id = `break-${i + 2}`;
    usedIds.add(id);

    let sep = existingSeps.get(id);
    if (!sep) {
      sep = document.createElement("div");
      sep.className = "pageBreak";
      sep.dataset.id = id;
      sep.innerHTML = `
        <span class="line top" aria-hidden="true"></span>
        <span class="line dash" aria-hidden="true"></span>
        <span class="line bottom" aria-hidden="true"></span>
      `;
      rail.appendChild(sep);
    }

    const y = breaks[i].rail - contentEl.scrollTop;
    const visible = y > -52 && y < layerHeight + 52;
    sep.style.top = `${Math.round(y)}px`;
    sep.style.opacity = visible ? "1" : "0";
  }

  // Hide separators that are no longer needed.
  for (const [id, sep] of existingSeps) {
    if (!usedIds.has(id)) sep.style.opacity = "0";
  }
}

export function resetFlowMarkerState(ctx, contentEl) {
  const page = contentEl.closest(".page");
  if (!page) return;
  const layer = ctx.refs.pageFlowRailEl || page.querySelector(".pageFlowMarkers");
  const breakRail = ctx.refs.pageBreakRailEl || page.querySelector(".pageBreakRail");
  if (!layer) return;
  layer.innerHTML = "";
  if (breakRail) breakRail.innerHTML = "";
  delete layer.dataset.bornTop;
  delete contentEl.dataset.pageMetric;
  delete contentEl.dataset.maxPagesSeen;
  delete contentEl.dataset.pageBreakCenters;
  contentEl.querySelectorAll(".slice[data-page-start]").forEach((s) => {
    delete s.dataset.pageStart;
  });
}
