export function syncOuterScrollerMetric(ctx, contentEl) {
  const { outerScrollEl, outerScrollSizerEl } = ctx.refs;
  if (!outerScrollEl || !outerScrollSizerEl || !contentEl) return;
  const maxInner = Math.max(0, contentEl.scrollHeight - contentEl.clientHeight);
  const targetHeight = outerScrollEl.clientHeight + maxInner;
  outerScrollSizerEl.style.height = `${Math.max(outerScrollEl.clientHeight, targetHeight)}px`;
}

export function syncOuterScrollerFromContent(ctx, contentEl) {
  const { outerScrollEl } = ctx.refs;
  if (!outerScrollEl || !contentEl || ctx.state.syncInnerLock) return;
  ctx.state.syncOuterLock = true;
  outerScrollEl.scrollTop = contentEl.scrollTop;
  ctx.state.syncOuterLock = false;
}

export function bindOuterScroll(ctx, deps) {
  const { outerScrollEl } = ctx.refs;
  if (!outerScrollEl) return;

  outerScrollEl.addEventListener("scroll", () => {
    if (ctx.state.syncOuterLock) return;
    const el = deps.currentPageEditable();
    if (!el) return;
    ctx.state.syncInnerLock = true;
    el.scrollTop = outerScrollEl.scrollTop;
    ctx.state.syncInnerLock = false;
    deps.syncFlowPageMarkers(el, { allowGrowth: false });
    deps.syncPageBreakSeparators?.(el, { allowGrowth: false });
    deps.refreshDockTags();
  });
}
