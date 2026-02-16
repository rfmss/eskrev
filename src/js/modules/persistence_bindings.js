export function setupPersistenceBindings({ editorEl, memoEl, panelEl, store, editorFeatures }) {
    if (!editorEl) return;
    const isMobileContext = () =>
        document.body.classList.contains("mobile-lite")
        || document.body.classList.contains("mobile-only-page")
        || /mobile\.html$/i.test(window.location.pathname || "");

    editorEl.addEventListener("input", () => {
        const cursorPos = editorFeatures.getCursorPos();
        const memoValue = memoEl ? memoEl.value : "";
        store.save(editorEl.innerHTML, memoValue, cursorPos);
        if (isMobileContext()) {
            document.body.classList.add("mobile-typing");
            clearTimeout(window.__mobileTypingTimer);
            window.__mobileTypingTimer = setTimeout(() => {
                document.body.classList.remove("mobile-typing");
            }, 800);
        }
    });

    editorEl.addEventListener("keyup", () => store.save(undefined, undefined, editorFeatures.getCursorPos()));
    editorEl.addEventListener("click", () => store.save(undefined, undefined, editorFeatures.getCursorPos()));

    if (memoEl) {
        memoEl.addEventListener("input", (e) => store.save(undefined, e.target.value));
    }

    if (panelEl) {
        panelEl.addEventListener("scroll", () => {
            const active = store.getActive();
            const key = (active && active.id) ? `lit_ui_editor_scroll_${active.id}` : "lit_ui_editor_scroll";
            localStorage.setItem(key, panelEl.scrollTop.toString());
        });
    }
}
