export function createCtrlGuardHandler(deps) {
    const {
        editorEl,
        onSave,
        onSelectAll,
        onCopy,
        onCut,
        onPaste
    } = deps;

    return (e) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        if (!isCtrl) return false;

        const key = e.key.toLowerCase();
        const textShortcuts = ["a", "c", "x", "v"];
        const browserShortcuts = ["l", "t", "w", "r", "n"];

        if (key === "s") {
            e.preventDefault();
            onSave();
            return true;
        }

        if (textShortcuts.includes(key)) {
            e.preventDefault();
            if (editorEl) editorEl.focus();
            if (key === "a") onSelectAll();
            if (key === "c") onCopy();
            if (key === "x") onCut();
            if (key === "v") onPaste();
            return true;
        }

        if (browserShortcuts.includes(key)) {
            e.preventDefault();
            return true;
        }

        return false;
    };
}

export function createAltShortcutHandler(deps) {
    const {
        openFilesDrawer,
        openNavDrawer,
        openMemoDrawer,
        closeDrawer,
        lockSession,
        toggleTemplatePane,
        toggleTheme,
        toggleAudio,
        togglePomodoro,
        toggleFont
    } = deps;

    return (e) => {
        if (!e.altKey) return false;

        if (e.key === "1") { e.preventDefault(); openFilesDrawer(); return true; }
        if (e.key === "2") { e.preventDefault(); openNavDrawer(); return true; }
        if (e.key === "3") { e.preventDefault(); openMemoDrawer(); return true; }
        if (e.key === "0") { e.preventDefault(); closeDrawer(); return true; }
        if (e.code === "KeyL") { e.preventDefault(); lockSession(); return true; }

        if (e.code === "KeyT" && e.shiftKey) {
            e.preventDefault();
            toggleTemplatePane();
            return true;
        }

        if (e.code === "KeyT" && !e.shiftKey) { e.preventDefault(); toggleTheme(); return true; }
        if (e.code === "KeyM") { e.preventDefault(); toggleAudio(); return true; }
        if (e.code === "KeyP") { e.preventDefault(); togglePomodoro(); return true; }
        if (e.code === "KeyF") { e.preventDefault(); toggleFont(); return true; }

        return false;
    };
}

export function createTypingRedirectHandler(deps) {
    const {
        editorEl,
        getActiveDoc,
        restoreCursorPos,
        insertText,
        onTypeFeedback
    } = deps;

    return (e) => {
        if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return false;
        const activeTag = document.activeElement.tagName.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea" || document.activeElement === editorEl) return false;

        e.preventDefault();
        editorEl.focus();
        const activeDoc = getActiveDoc();
        if (activeDoc && activeDoc.cursorPos) restoreCursorPos(activeDoc.cursorPos);
        insertText(e.key);
        onTypeFeedback();
        return true;
    };
}

export function createEscapeHandler(deps) {
    const {
        searchInput,
        onCloseTerms,
        isNotesModalActive,
        isNotesEditStage,
        setNotesListStage,
        closeNotesModal,
        closeNotesOverlayIfActive,
        canCancelSystemModal,
        cancelSystemModal,
        closeManifestoModal,
        isOnboardingActive,
        isDedicationActive,
        getActiveOverlays,
        closeOverlayById,
        closeDrawerIfOpen,
        focusEditor,
        resetCleanupFallback
    } = deps;

    return (e) => {
        if (e.key !== "Escape") return false;

        if (onCloseTerms()) return true;

        if (isNotesModalActive()) {
            if (closeNotesOverlayIfActive()) return true;
            if (isNotesEditStage()) setNotesListStage();
            else closeNotesModal();
            return true;
        }

        if (canCancelSystemModal()) {
            cancelSystemModal();
            return true;
        }

        if (closeManifestoModal()) return true;
        if (isOnboardingActive()) return true;
        if (isDedicationActive()) return true;

        if (document.activeElement === searchInput) {
            const clearBtn = document.getElementById("btnClear");
            if (clearBtn) clearBtn.click();
            if (searchInput) searchInput.blur();
        }

        let closed = false;
        getActiveOverlays().forEach((overlayId) => {
            if (overlayId === "gatekeeper" || overlayId === "pomodoroModal" || overlayId === "termsModal" || overlayId === "importSessionModal") {
                return;
            }
            closeOverlayById(overlayId);
            if (overlayId === "helpModal") document.body.classList.remove("help-open");
            if (overlayId === "resetModal") resetCleanupFallback();
            closed = true;
        });

        if (closeDrawerIfOpen()) closed = true;
        if (closed) focusEditor();
        return true;
    };
}
