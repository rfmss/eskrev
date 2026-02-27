export function initDevTools() {
    const host = (window.location && window.location.hostname) || "";
    const isLocal = host === "localhost" || host === "127.0.0.1";
    if (!isLocal) return;

    document.addEventListener("keydown", (e) => {
        if (!(e.ctrlKey && e.altKey && (e.key === "I" || e.key === "i"))) return;
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.toggle("iso-debug");
    });
}
