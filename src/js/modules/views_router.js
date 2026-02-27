export function initViewsRouter({ lang }) {
    const ensureFrameLoaded = (id) => {
        const frame = document.getElementById(id);
        if (!frame) return null;
        const currentSrc = frame.getAttribute("src");
        const lazySrc = frame.getAttribute("data-src");
        if (!currentSrc && lazySrc) frame.setAttribute("src", lazySrc);
        return frame;
    };

    const openEditor = () => {
        const editorView = document.getElementById("editorView");
        const booksView = document.getElementById("booksView");
        const verifyView = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        if (editorView) editorView.style.display = "";
        if (booksView) booksView.style.display = "none";
        if (verifyView) verifyView.style.display = "none";
        const editorEl = document.getElementById("editor");
        if (editorEl) editorEl.focus();
        if (panel) panel.classList.remove("books-active");
        localStorage.setItem("lit_ui_view", "editor");
    };

    const openBooks = () => {
        const editorView = document.getElementById("editorView");
        const booksView = document.getElementById("booksView");
        const verifyView = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        const booksFrame = ensureFrameLoaded("booksFrame");
        if (editorView) editorView.style.display = "none";
        if (booksView) booksView.style.display = "block";
        if (verifyView) verifyView.style.display = "none";
        if (panel) panel.classList.add("books-active");
        if (booksFrame) {
            try {
                booksFrame.contentWindow?.postMessage({ type: "lang", value: lang.current }, window.location.origin);
            } catch (_) {}
        }
        localStorage.setItem("lit_ui_view", "books");
    };

    const openVerify = () => {
        const editorView = document.getElementById("editorView");
        const booksView = document.getElementById("booksView");
        const verifyView = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        const verifyFrame = ensureFrameLoaded("verifyFrame");
        if (editorView) editorView.style.display = "none";
        if (booksView) booksView.style.display = "none";
        if (verifyView) verifyView.style.display = "block";
        if (panel) panel.classList.add("books-active");
        if (verifyFrame) {
            try {
                verifyFrame.contentWindow?.postMessage({ type: "lang", value: lang.current }, window.location.origin);
            } catch (_) {}
        }
        localStorage.setItem("lit_ui_view", "verify");
    };

    const closeAuxView = () => openEditor();

    const getActiveView = () => {
        const editorView = document.getElementById("editorView");
        const booksView = document.getElementById("booksView");
        const verifyView = document.getElementById("verifyView");
        if (verifyView && verifyView.style.display !== "none") return "verify";
        if (booksView && booksView.style.display !== "none") return "books";
        if (editorView && editorView.style.display !== "none") return "editor";
        return localStorage.getItem("lit_ui_view") || "editor";
    };

    return {
        openEditor,
        openBooks,
        openVerify,
        closeAuxView,
        getActiveView
    };
}
