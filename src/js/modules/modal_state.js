export function setModalActive(modal, isActive) {
    if (!modal) return;
    modal.classList.toggle("active", Boolean(isActive));
    modal.setAttribute("aria-hidden", isActive ? "false" : "true");
}
