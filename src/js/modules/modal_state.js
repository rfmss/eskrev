// Verifica suporte nativo ao atributo inert
const hasInertSupport = typeof HTMLElement !== "undefined" && 
    (HTMLElement.prototype.hasOwnProperty("inert") || 
     Object.getOwnPropertyDescriptor(HTMLElement.prototype, "inert") !== undefined);

// Cache para valores originais de tabindex e aria-hidden (fallback quando inert não é suportado)
const modalStateCache = new WeakMap();

export function setModalActive(modal, isActive) {
    if (!modal) return;
    const active = Boolean(isActive);
    
    const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    if (!active) {
        // Modal fechando: remover foco e bloquear interação
        const focused = document.activeElement;
        if (focused && modal.contains(focused) && typeof focused.blur === "function") {
            focused.blur();
        }
        
        if (hasInertSupport) {
            // Suporte nativo: usar atributo inert
            modal.setAttribute("inert", "");
        } else {
            // Fallback: bloquear via CSS e atributos
            modal.style.pointerEvents = "none";
            const focusables = modal.querySelectorAll("button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])");
            const cache = new Map();
            
            focusables.forEach(el => {
                // Salvar valores originais
                const originalTabindex = el.getAttribute("tabindex");
                const originalAriaHidden = el.getAttribute("aria-hidden");
                cache.set(el, { tabindex: originalTabindex, ariaHidden: originalAriaHidden });
                
                // Bloquear
                el.setAttribute("tabindex", "-1");
                el.setAttribute("aria-hidden", "true");
            });
            
            modalStateCache.set(modal, cache);
        }
        
        if (document.activeElement === document.body && document.body && typeof document.body.focus === "function") {
            document.body.focus({ preventScroll: true });
        }
    } else {
        // Modal abrindo: restaurar interação
        if (hasInertSupport && typeof modal.removeAttribute === "function") {
            modal.removeAttribute("inert");
        } else {
            // Fallback: restaurar valores originais
            modal.style.pointerEvents = "";
            const cache = modalStateCache.get(modal);
            if (cache) {
                cache.forEach((values, el) => {
                    if (values.tabindex !== null) {
                        el.setAttribute("tabindex", values.tabindex);
                    } else {
                        el.removeAttribute("tabindex");
                    }
                    if (values.ariaHidden !== null) {
                        el.setAttribute("aria-hidden", values.ariaHidden);
                    } else {
                        el.removeAttribute("aria-hidden");
                    }
                });
                modalStateCache.delete(modal);
            }
        }
    }
    
    modal.classList.toggle("active", active);
    modal.setAttribute("aria-hidden", active ? "false" : "true");
    if (active) {
        queueMicrotask(() => {
            if (!modal.classList.contains("active")) return;
            if (!modal.hasAttribute("tabindex")) modal.setAttribute("tabindex", "-1");
            if (modal.contains(document.activeElement)) return;
            const first = modal.querySelector(focusableSelector);
            if (first && typeof first.focus === "function") {
                first.focus({ preventScroll: true });
                return;
            }
            if (typeof modal.focus === "function") {
                modal.focus({ preventScroll: true });
            }
        });
    }
}
