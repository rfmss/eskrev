import {
    createCtrlGuardHandler,
    createAltShortcutHandler,
    createTypingRedirectHandler,
    createEscapeHandler
} from './keyboard.js';

export function initShortcutsController(deps) {
    const {
        editorEl,
        searchInput,
        isBootModalBlockingKeyboard,
        editorFeatures,
        selectAllInEditor,
        auth,
        ui,
        store,
        templateState,
        applyTemplateLayout,
        renderProjectList,
        renderNavigation,
        notesState,
        setNotesStage,
        closeNotesModal,
        setModalActive
    } = deps;

    const handleCtrlGuard = createCtrlGuardHandler({
        editorEl,
        onSave: () => document.getElementById("btnSave").click(),
        onTogglePageMode: () => editorFeatures.togglePageMode(),
        onToggleNavOverview: () => editorFeatures.toggleNavOverview(),
        onSelectAll: () => selectAllInEditor(editorEl),
        onCopy: () => document.execCommand("copy"),
        onCut: () => document.execCommand("cut"),
        onPaste: () => document.execCommand("paste")
    });

    const handleEscape = createEscapeHandler({
        searchInput,
        onCloseTerms: () => {
            const termsModal = document.getElementById("termsModal");
            if (termsModal && termsModal.classList.contains("active")) {
                auth.closeTermsModal(true);
                return true;
            }
            return false;
        },
        isNotesModalActive: () => {
            const notesModal = document.getElementById("notesModal");
            return !!(notesModal && notesModal.classList.contains("active"));
        },
        isNotesEditStage: () => notesState.stage === "edit",
        setNotesListStage: () => setNotesStage("list"),
        closeNotesModal: () => closeNotesModal(),
        closeNotesOverlayIfActive: () => {
            const overlay = document.getElementById("notesOverlay");
            if (overlay && overlay.classList.contains("active")) {
                setModalActive(overlay, false);
                return true;
            }
            return false;
        },
        canCancelSystemModal: () => {
            const systemModal = document.getElementById("systemModal");
            return !!(systemModal && systemModal.classList.contains("active") && window.skvModal?.cancel);
        },
        cancelSystemModal: () => window.skvModal.cancel(),
        closeManifestoModal: () => {
            const manifestoModal = document.getElementById("manifestoModal");
            if (manifestoModal && manifestoModal.classList.contains("active")) {
                setModalActive(manifestoModal, false);
                document.body.classList.remove("manifesto-open");
                return true;
            }
            return false;
        },
        isOnboardingActive: () => {
            const onboarding = document.getElementById("onboardingModal");
            return !!(onboarding && onboarding.classList.contains("active"));
        },
        isDedicationActive: () => {
            const dedication = document.getElementById("dedicationModal");
            return !!(dedication && dedication.classList.contains("active"));
        },
        getActiveOverlays: () =>
            Array.from(document.querySelectorAll(".modal-overlay.active")).map((m) => m.id),
        closeOverlayById: (id) => {
            if (id === "commandPaletteModal" && typeof window.closeCommandPalette === "function") {
                window.closeCommandPalette();
                return;
            }
            const overlay = document.getElementById(id);
            if (overlay) setModalActive(overlay, false);
        },
        closeDrawerIfOpen: () => {
            const drawer = document.getElementById("drawer");
            if (drawer && drawer.classList.contains("open")) {
                ui.closeDrawer();
                return true;
            }
            return false;
        },
        focusEditor: () => { if (editorEl) editorEl.focus(); },
        resetCleanupFallback: () => {
            const step2Reset = document.getElementById("step2Reset");
            const resetPassInput = document.getElementById("resetPassInput");
            const resetMsg = document.getElementById("resetMsg");
            if (step2Reset) step2Reset.style.display = "none";
            if (resetPassInput) resetPassInput.value = "";
            if (resetMsg) resetMsg.innerText = "";
        }
    });

    const handleAltShortcuts = createAltShortcutHandler({
        openFilesDrawer: () => ui.openDrawer("files", { renderFiles: renderProjectList }),
        openNavDrawer: () => ui.openDrawer("nav", { renderNav: renderNavigation }),
        openMemoDrawer: () => ui.openDrawer("memo", {}),
        closeDrawer: () => ui.closeDrawer(),
        lockSession: () => auth.lock(),
        toggleTemplatePane: () => {
            templateState.open = !templateState.open;
            if (!templateState.open) templateState.minimized = false;
            applyTemplateLayout();
        },
        toggleTheme: () => ui.toggleTheme(),
        toggleAudio: () => document.getElementById("btnAudio").click(),
        togglePomodoro: () => ui.togglePomodoro(),
        toggleFont: () => document.getElementById("btnFontType").click()
    });

    const handleTypingRedirect = createTypingRedirectHandler({
        editorEl,
        getActiveDoc: () => store.getActive(),
        restoreCursorPos: (pos) => editorFeatures.setCursorPos(pos),
        insertText: (text) => document.execCommand("insertText", false, text),
        onTypeFeedback: () => {
            editorFeatures.playSound("type");
            editorFeatures.triggerFocusMode();
        }
    });

    const isTypingContext = () => {
        const active = document.activeElement;
        if (!active) return false;
        if (active === editorEl) return false;
        const tag = (active.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea" || tag === "select") return true;
        if (active.isContentEditable) return true;
        return Boolean(active.closest && active.closest('[contenteditable="true"]'));
    };

    const onKeyDown = (e) => {
        if (isBootModalBlockingKeyboard()) return;
        const typingContext = isTypingContext();
        const isCtrlLike = e.ctrlKey || e.metaKey;
        const key = (e.key || "").toLowerCase();
        const isCtrlK = isCtrlLike && key === "k";
        const isCtrlF = isCtrlLike && key === "f";

        // In form-like UI fields, avoid app/browsers find palette hijack noise.
        if (typingContext && (isCtrlK || isCtrlF)) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (isCtrlK) {
            e.preventDefault();
            const btnPalette = document.getElementById("btnCommandPalette");
            if (btnPalette) btnPalette.click();
            return;
        }
        if (handleCtrlGuard(e)) return;
        if (e.key === "Escape" && editorFeatures && typeof editorFeatures.setCloak === "function") {
            editorFeatures.setCloak(false);
            document.body.classList.remove("edge-reveal");
        }

        if (e.key === "F1") {
            e.preventDefault();
            if (window.totHelpOpen) {
                window.totHelpOpen();
            } else {
                const helpModal = document.getElementById("helpModal");
                if (helpModal) setModalActive(helpModal, true);
                document.body.classList.add("help-open");
            }
        }

        if ((e.ctrlKey && e.shiftKey && e.code === "KeyF") || e.key === "F11") { e.preventDefault(); editorFeatures.toggleFullscreen(); }
        if (e.key === "Enter" && document.activeElement === searchInput) document.getElementById("btnSearch").click();
        if (isCtrlF) {
            e.preventDefault();
            if (typeof window.openCommandPalette === "function") window.openCommandPalette("buscar");
        }
        if (handleEscape(e)) return;
        if (!typingContext && handleAltShortcuts(e)) return;

        if (e.ctrlKey || e.metaKey) {
            if (typingContext) return;
            if (e.key === 's') { e.preventDefault(); document.getElementById("btnSave").click(); }
            if (e.key === 'o') { e.preventDefault(); document.getElementById("fileInput").click(); }
        }

        handleTypingRedirect(e);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
}
