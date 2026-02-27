export function setupPersistenceBindings({ editorEl, memoEl, panelEl, store, editorFeatures }) {
    if (!editorEl) return;
    const isMobileContext = () =>
        document.body.classList.contains("mobile-lite")
        || document.body.classList.contains("mobile-only-page")
        || /mobile\.html$/i.test(window.location.pathname || "");

    // Throttle visual para reduzir chamadas durante digitação rápida
    let inputThrottleTimer = null;
    let lastInputTime = 0;
    const INPUT_THROTTLE_MS = 200; // Throttle visual de 200ms

    const handleInput = () => {
        const now = Date.now();
        const timeSinceLastInput = now - lastInputTime;

        // Se passou tempo suficiente desde último input, processa imediatamente
        if (timeSinceLastInput >= INPUT_THROTTLE_MS) {
            lastInputTime = now;
            const cursorPos = editorFeatures.getCursorPos();
            const memoValue = memoEl ? memoEl.value : "";
            const html = (editorFeatures && typeof editorFeatures.getPersistHtml === "function")
                ? editorFeatures.getPersistHtml()
                : editorEl.innerHTML;
            store.save(html, memoValue, cursorPos);
        } else {
            // Caso contrário, agenda para processar após throttle
            if (inputThrottleTimer) clearTimeout(inputThrottleTimer);
            inputThrottleTimer = setTimeout(() => {
                lastInputTime = Date.now();
                const cursorPos = editorFeatures.getCursorPos();
                const memoValue = memoEl ? memoEl.value : "";
                const html = (editorFeatures && typeof editorFeatures.getPersistHtml === "function")
                    ? editorFeatures.getPersistHtml()
                    : editorEl.innerHTML;
                store.save(html, memoValue, cursorPos);
                inputThrottleTimer = null;
            }, INPUT_THROTTLE_MS - timeSinceLastInput);
        }

        if (isMobileContext()) {
            document.body.classList.add("mobile-typing");
            clearTimeout(window.__mobileTypingTimer);
            window.__mobileTypingTimer = setTimeout(() => {
                document.body.classList.remove("mobile-typing");
            }, 800);
        }
    };

    editorEl.addEventListener("input", handleInput);

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
