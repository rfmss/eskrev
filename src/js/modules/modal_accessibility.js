import { setModalActive } from "./modal_state.js";

export function setupModalFocusTrap() {
    const focusableSelector = [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled]):not([type='hidden'])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])"
    ].join(", ");

    const getTopActiveOverlay = () => {
        const active = Array.from(document.querySelectorAll(".modal-overlay.active"));
        return active.length ? active[active.length - 1] : null;
    };

    const getFocusableIn = (container) =>
        Array.from(container.querySelectorAll(focusableSelector)).filter((el) => {
            if (!el) return false;
            if (el.getAttribute("aria-hidden") === "true") return false;
            return el.getClientRects().length > 0;
        });

    const focusOverlayIfNeeded = () => {
        const overlay = getTopActiveOverlay();
        if (!overlay) return;
        if (!overlay.hasAttribute("tabindex")) overlay.setAttribute("tabindex", "-1");
        if (overlay.contains(document.activeElement)) return;
        const focusables = getFocusableIn(overlay);
        if (focusables.length) {
            focusables[0].focus({ preventScroll: true });
            return;
        }
        overlay.focus({ preventScroll: true });
    };

    document.addEventListener("focusin", () => {
        focusOverlayIfNeeded();
    }, true);

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        const overlay = getTopActiveOverlay();
        if (!overlay) return;
        const focusables = getFocusableIn(overlay);
        if (!focusables.length) {
            e.preventDefault();
            overlay.focus({ preventScroll: true });
            return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement;
        if (!overlay.contains(activeEl)) {
            e.preventDefault();
            first.focus({ preventScroll: true });
            return;
        }
        if (e.shiftKey && activeEl === first) {
            e.preventDefault();
            last.focus({ preventScroll: true });
            return;
        }
        if (!e.shiftKey && activeEl === last) {
            e.preventDefault();
            first.focus({ preventScroll: true });
        }
    }, true);
}

export function createBootModalBlocker() {
    return () => {
        const gate = document.getElementById("gatekeeper");
        if (gate && gate.classList.contains("active")) return true;
        const dedication = document.getElementById("dedicationModal");
        if (dedication && dedication.classList.contains("active")) return true;
        const onboarding = document.getElementById("onboardingModal");
        return !!(onboarding && onboarding.classList.contains("active"));
    };
}

export function createOverlayBackdropHandler(deps) {
    const {
        nonClosableOverlays,
        onSystemOverlayClick,
        onResetOverlayClose
    } = deps;

    return (overlay, event) => {
        if (nonClosableOverlays.has(overlay.id)) return;
        if (overlay.id === "systemModal") {
            onSystemOverlayClick(event, overlay);
            return;
        }
        if (event.target !== overlay) return;
        setModalActive(overlay, false);
        if (overlay.id === "resetModal") onResetOverlayClose();
    };
}
