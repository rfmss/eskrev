import { positionPageBreakRail, positionPageFlowRail } from "./layout.js";

function getPageMetric(contentEl) {
  const cs = getComputedStyle(contentEl);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const liveMetric = Math.max(1, contentEl.clientHeight - padTop - padBottom);
  const metric = Number(contentEl.dataset.pageMetric || "0") || liveMetric;
  if (!contentEl.dataset.pageMetric) {
    contentEl.dataset.pageMetric = String(metric);
  }
  return { metric, padTop, padBottom };
}

function getPageCount(contentEl, metric, allowGrowth) {
  const cs = getComputedStyle(contentEl);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const totalRaw = Math.max(metric, contentEl.scrollHeight - padTop - padBottom);
  const total = Math.max(metric, totalRaw);
  const eps = 2;
  const adjustedTotal = Math.max(metric, total - eps);
  const stableCount = Math.max(1, Math.ceil(adjustedTotal / metric));

  const prevMax = Number(contentEl.dataset.maxPagesSeen || "1");
  const maxSeen = allowGrowth ? Math.max(prevMax, stableCount) : prevMax;
  contentEl.dataset.maxPagesSeen = String(maxSeen);
  return maxSeen;
}

export function syncFlowPageMarkers(ctx, contentEl, { allowGrowth = true } = {}) {
  const page = contentEl.closest(".page");
  if (!page) return;
  const layer = ctx.refs.pageFlowRailEl || page.querySelector(".pageFlowMarkers");
  if (!layer) return;

  const { metric, padTop, padBottom } = getPageMetric(contentEl);

  positionPageFlowRail(ctx, contentEl);

  const maxSeen = getPageCount(contentEl, metric, allowGrowth);

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
  const breakGap = Math.max(26, Math.round(lineHeight + 2));
  rail.style.setProperty("--break-gap", `${breakGap}px`);

  const { metric } = getPageMetric(contentEl);
  const maxSeen = getPageCount(contentEl, metric, allowGrowth);

  positionPageBreakRail(ctx, contentEl);

  // Virtual page break anchor starts at top of editable content.
  const bornTop = 0;
  const layerHeight = rail.clientHeight || page.clientHeight;

  for (let i = 2; i <= maxSeen; i += 1) {
    const id = `break-${i}`;
    let sep = rail.querySelector(`.pageBreak[data-id="${id}"]`);
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

    const y = bornTop + ((i - 1) * metric) - contentEl.scrollTop;
    const visible = y > -52 && y < layerHeight + 52;
    sep.style.top = `${Math.round(y)}px`;
    sep.style.opacity = visible ? "1" : "0";
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
}
