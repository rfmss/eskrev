export function getDockTagBounds(tag) {
  const dock = tag.parentElement;
  const dockHeight = dock ? dock.clientHeight : 0;
  const visualHeight = Math.max(
    18,
    Math.ceil(tag.getBoundingClientRect().height || tag.offsetWidth || 108)
  );
  const edgeGap = 3;
  const minTop = visualHeight + edgeGap;
  const maxTop = Math.max(minTop, dockHeight - edgeGap);
  return { minTop, maxTop };
}

export function positionDockTag(ctx, tag) {
  const hasManualTop = Object.prototype.hasOwnProperty.call(tag.dataset, "manualTop");
  const manualTop = Number(tag.dataset.manualTop);
  if (hasManualTop && Number.isFinite(manualTop)) {
    const { minTop, maxTop } = getDockTagBounds(tag);
    const clamped = Math.min(Math.max(minTop, manualTop), maxTop);
    tag.style.top = `${Math.round(clamped)}px`;
    return;
  }

  const anchorId = tag.dataset.anchorId;
  if (!anchorId) return;
  const anchor = document.getElementById(anchorId);
  if (!anchor) return;

  const page = anchor.closest(".page");
  if (!page) return;
  const content = page.querySelector(".pageContent");
  const contentRect = content ? content.getBoundingClientRect() : page.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();

  const top = Math.round(anchorRect.top - contentRect.top + 2);
  const { minTop, maxTop } = getDockTagBounds(tag);
  const clamped = Math.min(Math.max(minTop, top), maxTop);
  tag.style.top = `${clamped}px`;
}

export function refreshDockTags(ctx) {
  document.querySelectorAll(".sliceTag[data-anchor-id]").forEach((tag) => {
    positionDockTag(ctx, tag);
  });
}
