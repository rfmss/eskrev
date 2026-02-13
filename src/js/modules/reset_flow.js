import { setModalActive } from './modal_state.js';

export function setupResetFlow({ lang, hardReset }) {
    const resetModal = document.getElementById("resetModal");
    const step2 = document.getElementById("step2Reset");
    const passInput = document.getElementById("resetPassInput");
    const msg = document.getElementById("resetMsg");
    const step0 = document.getElementById("step0Reset");
    const proofWordEl = document.getElementById("resetProofWord");
    const proofInput = document.getElementById("resetProofInput");
    const proofMsg = document.getElementById("resetProofMsg");
    const btnProof = document.getElementById("btnConfirmReset0");
    const btnStep1 = document.getElementById("btnConfirmReset1");
    const btnConfirmReset2 = document.getElementById("btnConfirmReset2");
    const closeResetBtn = document.getElementById("closeModalReset");
    const debugReset = (typeof window !== "undefined" && typeof window.debugReset === "function")
        ? window.debugReset
        : () => {};

    if (!resetModal) {
        return {
            openResetModal: () => {},
            closeResetModal: () => {},
            resetOverlayStateFallback: () => {}
        };
    }

    const resetOverlayStateFallback = () => {
        if (step2) step2.style.display = "none";
        if (btnStep1) btnStep1.style.display = "none";
        if (step0) step0.style.display = "block";
        if (passInput) passInput.value = "";
        if (msg) msg.innerText = "";
        if (proofInput) proofInput.value = "";
        if (proofMsg) proofMsg.innerText = "";
    };

    const closeResetModal = () => {
        debugReset("close reset modal");
        setModalActive(resetModal, false);
        resetOverlayStateFallback();
    };

    let currentProofWord = "";

    const generateProofWord = () => {
        const editor = document.getElementById("editor");
        const text = editor ? editor.innerText : "";
        const words = text.split(/\s+/).map((w) => w.trim()).filter((w) => w.length >= 4);
        if (!words.length) return "";
        return words[Math.floor(Math.random() * words.length)];
    };

    const openResetModal = () => {
        setModalActive(resetModal, true);
        resetOverlayStateFallback();
        currentProofWord = generateProofWord();
        if (proofWordEl) proofWordEl.innerText = currentProofWord ? `"${currentProofWord}"` : "[SEM CONTEÚDO]";
        setTimeout(() => { if (proofInput) proofInput.focus(); }, 50);
    };

    const shakeInput = (input) => {
        if (!input) return;
        input.classList.add("shake");
        setTimeout(() => input.classList.remove("shake"), 500);
    };

    const setProofApprovedState = () => {
        if (btnStep1) btnStep1.style.display = "block";
        if (step0) step0.style.display = "none";
    };

    const validateResetProof = () => {
        const expected = (currentProofWord || "").toLowerCase();
        const got = (proofInput ? proofInput.value : "").trim().toLowerCase();
        if (!expected) {
            if (proofMsg) proofMsg.innerText = lang.t("reset_no_text");
            setProofApprovedState();
            return;
        }
        if (got === expected) {
            if (proofMsg) proofMsg.innerText = lang.t("reset_proof_ok");
            setProofApprovedState();
            if (btnStep1) btnStep1.focus();
            return;
        }
        if (proofMsg) proofMsg.innerText = lang.t("reset_proof_fail");
        if (proofInput) {
            proofInput.value = "";
            proofInput.focus();
        }
        shakeInput(proofInput);
    };

    const goToResetStep2 = () => {
        if (step2) step2.style.display = "block";
        setTimeout(() => { if (passInput) passInput.focus(); }, 100);
    };

    const triggerReset = () => {
        const storedKey = localStorage.getItem("lit_auth_key");
        const inputVal = passInput ? passInput.value : "";
        if (!storedKey || inputVal === storedKey) {
            if (msg) msg.innerText = lang.t("reset_executing");
            setTimeout(() => hardReset(), 500);
            return;
        }
        if (msg) msg.innerText = lang.t("reset_denied");
        if (passInput) {
            passInput.value = "";
            passInput.focus();
            shakeInput(passInput);
        }
    };

    const resetBtn = document.getElementById("btnHardReset");
    if (resetBtn) {
        resetBtn.onclick = () => {
            openResetModal();
        };
    }
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest && e.target.closest("#btnHardReset, .danger-trigger");
        if (!trigger) return;
        e.preventDefault();
        openResetModal();
    });

    if (closeResetBtn) {
        closeResetBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeResetModal();
        });
    }

    resetModal.addEventListener("click", (e) => {
        const target = e.target.closest && e.target.closest("#closeModalReset");
        if (!target) return;
        e.preventDefault();
        e.stopPropagation();
        closeResetModal();
    });

    if (btnProof) btnProof.onclick = validateResetProof;
    if (proofInput) {
        proofInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btnProof?.click();
            }
        });
    }

    if (btnStep1) btnStep1.onclick = goToResetStep2;
    if (btnStep1) {
        btnStep1.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btnStep1.click();
            }
        });
    }

    if (btnConfirmReset2) btnConfirmReset2.onclick = triggerReset;
    if (passInput) {
        passInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") triggerReset();
        });
    }

    return {
        openResetModal,
        closeResetModal,
        resetOverlayStateFallback
    };
}
