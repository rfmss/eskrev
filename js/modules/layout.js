export function fitTopbar(ctx) {
  const { topbarEl } = ctx.refs;
  if (!topbarEl) return;
  topbarEl.style.setProperty("--topbar-scale", "1");
  const usable = Math.max(1, topbarEl.clientWidth - 4);
  const needed = Math.max(1, topbarEl.scrollWidth);
  const scale = needed > usable ? Math.max(0.72, usable / needed) : 1;
  topbarEl.style.setProperty("--topbar-scale", String(scale));
}

export function positionSliceDockRail(ctx) {
  const { sliceDockEl, viewportEl } = ctx.refs;
  const { dockOffsetX, dockOffsetY } = ctx.state;
  if (!sliceDockEl || !viewportEl) return;

  const page = document.querySelector(".page");
  if (!page) {
    sliceDockEl.style.display = "none";
    return;
  }
  const content = page.querySelector(".pageContent");
  if (!content) {
    sliceDockEl.style.display = "none";
    return;
  }

  const viewportRect = viewportEl.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();

  const left = Math.round(pageRect.right - viewportRect.left + dockOffsetX);
  const top = Math.round(contentRect.top - viewportRect.top + dockOffsetY);
  const height = Math.max(0, Math.round(contentRect.height));

  sliceDockEl.style.display = "block";
  sliceDockEl.style.left = `${left}px`;
  sliceDockEl.style.top = `${top}px`;
  sliceDockEl.style.height = `${height}px`;
}

export function positionPageFlowRail(ctx, contentEl) {
  const { pageFlowRailEl, viewportEl } = ctx.refs;
  const { flowOffsetY } = ctx.state;
  if (!pageFlowRailEl || !viewportEl || !contentEl) return;

  const page = contentEl.closest(".page");
  if (!page) {
    pageFlowRailEl.style.display = "none";
    return;
  }

  const cs = getComputedStyle(contentEl);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const padLeft = parseFloat(cs.paddingLeft) || 0;

  const viewportRect = viewportEl.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();

  const left = Math.round(pageRect.left - viewportRect.left + padLeft);
  const top = Math.round(pageRect.top - viewportRect.top + padTop + flowOffsetY);
  const height = Math.max(0, Math.round(pageRect.height - padTop - padBottom - flowOffsetY));

  pageFlowRailEl.style.display = "block";
  pageFlowRailEl.style.left = `${left}px`;
  pageFlowRailEl.style.top = `${top}px`;
  pageFlowRailEl.style.height = `${height}px`;
}

export function positionPageBreakRail(ctx, contentEl) {
  const { pageBreakRailEl } = ctx.refs;
  if (!pageBreakRailEl || !contentEl) return;

  const page = contentEl.closest(".page");
  if (!page) {
    pageBreakRailEl.style.display = "none";
    return;
  }

  const cs = getComputedStyle(contentEl);
  const padTop = parseFloat(cs.paddingTop) || 0;
  const padBottom = parseFloat(cs.paddingBottom) || 0;
  const padLeft = parseFloat(cs.paddingLeft) || 0;
  const padRight = parseFloat(cs.paddingRight) || 0;

  const width = Math.max(0, Math.round(page.clientWidth - padLeft - padRight));
  const height = Math.max(0, Math.round(page.clientHeight - padTop - padBottom));

  pageBreakRailEl.style.display = "block";
  pageBreakRailEl.style.left = `${Math.round(padLeft)}px`;
  pageBreakRailEl.style.top = `${Math.round(padTop)}px`;
  pageBreakRailEl.style.width = `${width}px`;
  pageBreakRailEl.style.height = `${height}px`;
}
