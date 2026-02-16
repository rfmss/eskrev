export function setModalActive(modal, isActive) {
    if (!modal) return;
    const active = Boolean(isActive);
    if (!active) {
        const focused = document.activeElement;
        if (focused && modal.contains(focused) && typeof focused.blur === "function") {
            focused.blur();
        }
    } else {
        if (typeof modal.removeAttribute === "function") {
            modal.removeAttribute("inert");
        }
    }
    modal.classList.toggle("active", active);
    modal.setAttribute("aria-hidden", active ? "false" : "true");
    if (!active) {
        modal.setAttribute("inert", "");
        if (document.activeElement === document.body && document.body && typeof document.body.focus === "function") {
            document.body.focus({ preventScroll: true });
        }
    }
}
