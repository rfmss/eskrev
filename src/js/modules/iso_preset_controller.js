export function initIsoPresetController({
    body = document.body,
    editorWrapSelector = "#editorWrap"
} = {}) {
    if (!body) return { refresh: () => {}, destroy: () => {} };

    const PRESETS = ["iso-calm", "iso-balanced", "iso-dense"];
    let raf = 0;
    const editorWrap = document.querySelector(editorWrapSelector);

    const setPreset = (next) => {
        // calm stays CSS-only via focus selectors (:has / focus-within)
        if (next === "iso-calm") return;
        PRESETS.forEach((preset) => {
            if (preset !== next) body.classList.remove(preset);
        });
        body.classList.add(next);
    };

    const computePreset = () => {
        const dense =
            body.classList.contains("editor-mode-overview") ||
            body.classList.contains("editor-mode-browse") ||
            body.classList.contains("drawer-open") ||
            body.classList.contains("command-palette-open");
        return dense ? "iso-dense" : "iso-balanced";
    };

    const schedule = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            raf = 0;
            setPreset(computePreset());
        });
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "attributes" && (mutation.attributeName === "class" || mutation.attributeName === "data-mode")) {
                schedule();
                return;
            }
        }
    });

    observer.observe(body, { attributes: true, attributeFilter: ["class", "data-mode"] });

    if (editorWrap) {
        editorWrap.addEventListener("focusin", schedule, true);
        editorWrap.addEventListener("focusout", schedule, true);
    }

    schedule();

    return {
        refresh: schedule,
        destroy() {
            observer.disconnect();
            if (editorWrap) {
                editorWrap.removeEventListener("focusin", schedule, true);
                editorWrap.removeEventListener("focusout", schedule, true);
            }
            if (raf) cancelAnimationFrame(raf);
        }
    };
}
