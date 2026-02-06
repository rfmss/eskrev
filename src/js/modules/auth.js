import { store } from './store.js';
import { lang } from './lang.js';
import { ui } from './ui.js';

export const auth = {
    termsVersion: {
        "pt-br": "1.0-ptbr",
        "en": "1.0-en",
        "es": "1.0-es",
        "fr": "1.0-fr"
    },
    pendingCycle: null,
    termsModal: null,
    termsBody: null,
    termsCheck: null,
    termsChoice25: null,
    termsChoice50: null,
    termsBack: null,
    termsClose: null,
    termsLink: null,
    termsScrolledEnough: false,
    privacyModal: null,
    privacyBody: null,
    privacyClose: null,
    privacyLoaded: false,
    privacyLoadedLang: null,
    init() {
        this.setupTerms();
        this.setupPrivacy();
        this.runGatekeeper();
        document.addEventListener("lang:changed", () => {
            this.privacyLoaded = false;
            this.privacyLoadedLang = null;
            if (this.privacyModal && this.privacyModal.classList.contains("active")) {
                this.loadPrivacyContent();
            }
        });
    },

    runGatekeeper() {
        const hasKey = localStorage.getItem('lit_auth_key');
        if (!hasKey) {
            this.showSetup();
        } else {
            const isLocked = localStorage.getItem('lit_is_locked');
            if (isLocked === 'true') {
                this.lock(); 
            } else {
                this.unlock(true); 
            }
        }
        this.setupEvents();
    },

    showManifesto() {
        const modal = document.getElementById("manifestoModal");
        const acceptBtn = document.getElementById("manifestoAccept");
        const body = document.getElementById("manifestoText");
        const langToggle = document.getElementById("manifestoLangToggle");
        const verifyLink = document.getElementById("manifestoVerifyLink");
        const supportBlock = document.getElementById("manifestoSupport");
        const applyManifestoText = () => {
            if (!body) return;
            const key = modal.classList.contains("manifesto-full") ? "manifesto_body_full" : "manifesto_body";
            body.innerHTML = lang.t(key) || lang.t("manifesto_body");
        };
        this.applyManifestoText = applyManifestoText;
        if (!modal) return;
        modal.classList.add("active");
        modal.classList.remove("manifesto-full");
        if (supportBlock) supportBlock.classList.remove("active");
        document.body.classList.add("manifesto-open");
        applyManifestoText();
        document.addEventListener("lang:changed", applyManifestoText);
        if (langToggle) {
            langToggle.onclick = () => lang.cycleLang();
        }
        const acceptManifesto = () => {
            const text = document.getElementById("manifestoText");
            if (text) {
                localStorage.setItem("skrv_manifest_text", text.innerText.trim());
            }
            localStorage.setItem("skrv_manifest_signed", "true");
            localStorage.setItem("skrv_manifest_signed_at", new Date().toISOString());
            modal.classList.remove("active");
            document.body.classList.remove("manifesto-open");
            this.runGatekeeper();
        };
        this.acceptWithDuration = acceptManifesto;
        if (acceptBtn) acceptBtn.onclick = () => acceptManifesto();
        if (verifyLink) verifyLink.onclick = () => {
            const ev = document.getElementById("editorView");
            const bv = document.getElementById("booksView");
            const vv = document.getElementById("verifyView");
            const panel = document.querySelector(".panel");
            if (ev) ev.style.display = "none";
            if (bv) bv.style.display = "none";
            if (vv) vv.style.display = "block";
            if (panel) panel.classList.add("books-active");
            localStorage.setItem("lit_ui_view", "verify");
        };
    },

    openFullManifesto() {
        const modal = document.getElementById("manifestoModal");
        const body = document.getElementById("manifestoText");
        const supportBlock = document.getElementById("manifestoSupport");
        if (!modal || !body) return;
        modal.classList.add("active", "manifesto-full");
        document.body.classList.add("manifesto-open");
        if (supportBlock) supportBlock.classList.add("active");
        if (typeof this.applyManifestoText === "function") {
            this.applyManifestoText();
        } else {
            body.innerHTML = lang.t("manifesto_body_full") || lang.t("manifesto_body");
        }
    },

    setupEvents() {
        // Seleção de Idioma (toggle)
        const setupLangToggle = document.getElementById("setupLangToggle");
        if (setupLangToggle) {
            setupLangToggle.onclick = () => lang.cycleLang();
        }

        const showSetupError = (message) => {
            const msg = document.getElementById("setupMsg");
            if (msg) {
                msg.textContent = message || "";
                msg.style.color = "#ff4444";
            }
        };
        const clearSetupError = () => showSetupError("");
        const updateSetupButtons = () => {
            const projectInput = document.getElementById('setupProjectName');
            const p1 = document.getElementById('setupPass1');
            const p2 = document.getElementById('setupPass2');
            const valid = Boolean(
                projectInput && projectInput.value.trim() &&
                p1 && p1.value.trim() &&
                p2 && p2.value.trim() &&
                p1.value === p2.value
            );
            document.querySelectorAll("#viewSetup [data-duration]").forEach((btn) => {
                btn.disabled = !valid;
            });
        };
        const createSession = (duration) => {
            const projectInput = document.getElementById('setupProjectName');
            const projectName = projectInput ? projectInput.value.trim() : "";
            const p1 = document.getElementById('setupPass1').value;
            const p2 = document.getElementById('setupPass2').value;
            if (!projectName) {
                showSetupError(lang.t("setup_error_name_required"));
                return;
            }
            if (!p1 || !p1.trim()) {
                showSetupError(lang.t("setup_error_pass_required"));
                return;
            }
            if (p1 !== p2) {
                showSetupError(lang.t("setup_error_pass_mismatch"));
                return;
            }
            clearSetupError();
            localStorage.setItem('lit_auth_key', p1);
            const active = store.getActive();
            if (active && active.id) {
                store.renameProject(active.id, projectName);
            } else {
                store.createProject(projectName);
            }
            if (Number.isFinite(duration) && duration > 0) {
                ui.startWork(duration);
            }
            if (window.skrvOnboarding && typeof window.skrvOnboarding.complete === "function") {
                window.skrvOnboarding.complete();
            }
            this.unlock();
        };
        const setupPomoButtons = document.querySelectorAll("#viewSetup [data-duration]");
        setupPomoButtons.forEach((btn) => {
            btn.onclick = () => {
                const duration = parseInt(btn.getAttribute("data-duration"), 10);
                createSession(duration);
            };
        });
        updateSetupButtons();
        const setupInputs = [
            document.getElementById('setupProjectName'),
            document.getElementById('setupPass1'),
            document.getElementById('setupPass2')
        ];
        setupInputs.forEach((input) => {
            if (!input) return;
            input.addEventListener("input", () => {
                clearSetupError();
                updateSetupButtons();
            });
        });

        // Lógica de Desbloqueio
        const tryUnlock = () => {
            const input = document.getElementById('authPass');
            const stored = localStorage.getItem('lit_auth_key');
            
            if (input.value === stored) {
                this.unlock();
            } else {
                this.shakeInput(input);
            }
        };

        document.getElementById('btnUnlock').onclick = tryUnlock;
        document.getElementById('authPass').onkeydown = (e) => { if(e.key === 'Enter') tryUnlock(); };

        // Botão de Pânico (Caveira) - AGORA COM PROTEÇÃO
        document.getElementById('emergencyReset').onclick = async () => {
            const stored = localStorage.getItem('lit_auth_key');
            // Pede a senha para confirmar a destruição
            if (!window.skrvModal) return;
            const pass = await window.skrvModal.prompt(lang.t("reset_prompt"), { title: lang.t("modal_title") });
            
            if (pass === stored) {
                const ok = await window.skrvModal.confirm(lang.db[lang.current].reset_warn, { title: lang.t("modal_title") });
                if (ok) {
                    store.hardReset();
                }
            } else {
                if (window.skrvModal) await window.skrvModal.alert(lang.t("reset_cancel"));
            }
        };

        // Toggle de senha (olho)
        document.querySelectorAll(".password-toggle").forEach((btn) => {
            const targetId = btn.getAttribute("data-target");
            const input = targetId ? document.getElementById(targetId) : null;
            if (!input) return;
            const use = btn.querySelector("use");
            const setState = (visible) => {
                input.type = visible ? "text" : "password";
                btn.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
                if (use) {
                    use.setAttribute(
                        "href",
                        visible
                            ? "src/assets/icons/phosphor-sprite.svg#icon-eye-slash"
                            : "src/assets/icons/phosphor-sprite.svg#icon-eye"
                    );
                }
            };
            setState(false);
            btn.addEventListener("click", () => {
                const isVisible = input.type === "text";
                setState(!isVisible);
                input.focus();
            });
        });
    },

    setupTerms() {
        this.termsModal = document.getElementById("termsModal");
        this.termsBody = document.getElementById("termsBody");
        this.termsCheck = document.getElementById("termsCheck");
        this.termsChoice25 = document.getElementById("termsChoice25");
        this.termsChoice50 = document.getElementById("termsChoice50");
        this.termsBack = document.getElementById("termsBack");
        this.termsClose = document.getElementById("termsClose");

        const updateTermsText = () => {
            if (this.termsBody) this.termsBody.innerHTML = lang.t("terms_body");
        };
        updateTermsText();
        document.addEventListener("lang:changed", updateTermsText);

        if (this.termsModal) {
            this.termsModal.addEventListener("keydown", (e) => this.handleTermsFocusTrap(e));
            this.termsModal.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    e.preventDefault();
                    this.closeTermsModal(true);
                }
            });
            this.termsModal.addEventListener("click", (e) => {
                if (e.target === this.termsModal) {
                    this.closeTermsModal(true);
                }
            });
        }
        if (this.termsClose) {
            this.termsClose.addEventListener("click", () => this.closeTermsModal(true));
        }
    },
    handleTermsFocusTrap(e) {
        if (!this.termsModal || !this.termsModal.classList.contains("active")) return;
        if (e.key !== "Tab") return;
        const focusable = this.termsModal.querySelectorAll("button, input, [href], [tabindex]:not([tabindex='-1'])");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    },

    setupPrivacy() {
        this.privacyModal = document.getElementById("privacyModal");
        this.privacyBody = document.getElementById("privacyBody");
        this.privacyClose = document.getElementById("privacyClose");
        if (!this.privacyModal) return;
        this.privacyModal.addEventListener("keydown", (e) => this.handlePrivacyFocusTrap(e));
        this.privacyModal.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                this.closePrivacyModal(true);
            }
        });
        this.privacyModal.addEventListener("click", (e) => {
            if (e.target === this.privacyModal) {
                this.closePrivacyModal(true);
            }
        });
        if (this.privacyClose) {
            this.privacyClose.addEventListener("click", () => this.closePrivacyModal(true));
        }
    },
    handlePrivacyFocusTrap(e) {
        if (!this.privacyModal || !this.privacyModal.classList.contains("active")) return;
        if (e.key !== "Tab") return;
        const focusable = this.privacyModal.querySelectorAll("button, input, [href], [tabindex]:not([tabindex='-1'])");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    },

    getTermsVersion() {
        const currentLang = lang?.state?.lang || "pt-br";
        return this.termsVersion[currentLang] || this.termsVersion["pt-br"];
    },
    getTermsAcceptedKey() {
        const currentLang = lang?.state?.lang || "pt-br";
        return `termsAccepted_${currentLang}`;
    },
    hasAcceptedTerms() {
        const version = this.getTermsVersion();
        const acceptedKey = this.getTermsAcceptedKey();
        return localStorage.getItem(acceptedKey) === "true" &&
            localStorage.getItem("termsVersion") === version;
    },

    handleManifestoChoice(minutes) {
        if (!this.hasAcceptedTerms()) {
            this.markTermsAccepted();
        }
        if (typeof this.acceptWithDuration === "function") {
            this.acceptWithDuration(minutes);
        }
    },

    openTermsModal() {
        if (!this.termsModal) return;
        document.body.classList.add("terms-open");
        this.termsModal.classList.add("active");
        this.updateTermsScrollState(true);
        if (this.termsClose) this.termsClose.focus();
    },

    closeTermsModal(clearPending = false) {
        if (this.termsModal) this.termsModal.classList.remove("active");
        document.body.classList.remove("terms-open");
        if (clearPending) this.pendingCycle = null;
    },

    updateTermsScrollState(force = false) {
        if (!this.termsBody) return;
        if (force) this.termsBody.scrollTop = 0;
    },

    async openPrivacyModal() {
        if (!this.privacyModal) return;
        document.body.classList.add("privacy-open");
        this.privacyModal.classList.add("active");
        await this.loadPrivacyContent();
        if (this.privacyBody) this.privacyBody.scrollTop = 0;
        if (this.privacyClose) this.privacyClose.focus();
    },

    closePrivacyModal() {
        if (this.privacyModal) this.privacyModal.classList.remove("active");
        document.body.classList.remove("privacy-open");
    },

    async loadPrivacyContent() {
        if (!this.privacyBody) return;
        const langCode = lang.current || "pt";
        if (this.privacyLoaded && this.privacyLoadedLang === langCode) return;
        try {
            this.privacyBody.innerHTML = `<div class="privacy-loading" data-i18n="privacy_loading">${lang.t("privacy_loading")}</div>`;
            const map = {
                "pt": "sobre/privacidade.html",
                "en-uk": "sobre/privacidade.en.html",
                "es": "sobre/privacidade.es.html",
                "fr": "sobre/privacidade.fr.html"
            };
            const url = map[langCode] || map.pt;
            let res = await fetch(url, { cache: "no-store" });
            if (!res.ok && url !== map.pt) {
                res = await fetch(map.pt, { cache: "no-store" });
            }
            if (!res.ok) throw new Error("privacy fetch failed");
            const text = await res.text();
            const doc = new DOMParser().parseFromString(text, "text/html");
            const body = doc.querySelector(".policy-body");
            const subtitle = doc.querySelector(".policy-subtitle");
            const subtitleText = subtitle ? subtitle.textContent.trim() : "";
            if (body) {
                const clone = body.cloneNode(true);
                const sections = clone.querySelectorAll(".policy-section");
                sections.forEach((section) => {
                    const h2 = section.querySelector("h2");
                    const title = h2 ? h2.textContent.trim().toLowerCase() : "";
                    if (title.includes("atualização")) {
                        section.remove();
                    }
                });
                const dateLine = subtitleText
                    ? `<div class="privacy-date">${subtitleText}</div>`
                    : "";
                this.privacyBody.innerHTML = `${dateLine}${clone.innerHTML}`;
            } else if (doc.body) {
                this.privacyBody.innerHTML = doc.body.innerHTML;
            }
            this.privacyLoaded = true;
            this.privacyLoadedLang = langCode;
        } catch (e) {
            this.privacyBody.innerHTML = `<div class="privacy-loading" data-i18n="privacy_error">${lang.t("privacy_error")}</div>`;
        }
    },

    async acceptTermsWithDuration(minutes) {
        const accepted = this.hasAcceptedTerms();
        const hasPending = Number.isFinite(this.pendingCycle);
        if (accepted && !hasPending) {
            this.closeTermsModal();
            return;
        }
        await this.markTermsAccepted();
        const pending = Number.isFinite(minutes) ? minutes : this.pendingCycle;
        this.pendingCycle = null;
        this.closeTermsModal();
        if (Number.isFinite(pending) && typeof this.acceptWithDuration === "function") {
            this.acceptWithDuration(pending);
        }
    },

    async markTermsAccepted() {
        const acceptedKey = this.getTermsAcceptedKey();
        const currentLang = lang?.state?.lang || "pt-br";
        localStorage.setItem(acceptedKey, "true");
        localStorage.setItem(`termsAcceptedAt_${currentLang}`, new Date().toISOString());
        localStorage.setItem("termsVersion", this.getTermsVersion());
        try {
            let text = this.termsBody ? this.termsBody.innerText.trim() : "";
            if (!text) {
                const raw = lang.t("terms_body") || "";
                const temp = document.createElement("div");
                temp.innerHTML = raw;
                text = temp.innerText.trim();
            }
            if (text && window.crypto?.subtle) {
                const data = new TextEncoder().encode(text);
                const hash = await crypto.subtle.digest("SHA-256", data);
                const hashArray = Array.from(new Uint8Array(hash));
                const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
                localStorage.setItem(`termsHash_${currentLang}`, hashHex);
            }
        } catch (e) {
            console.warn("terms hash failed", e);
        }
    },

    // Ação de Bloquear (Chamada pelo Alt+L)
    lock() {
        const gate = document.getElementById('gatekeeper');
        const viewSetup = document.getElementById('viewSetup');
        const viewLock = document.getElementById('viewLock');

        localStorage.setItem('lit_is_locked', 'true'); // Grava que está trancado
        
        gate.classList.add('active');
        gate.style.display = 'flex';
        gate.style.opacity = '1';
        viewSetup.style.display = 'none';
        viewLock.style.display = 'flex';
        
        setTimeout(() => {
            const input = document.getElementById('authPass');
            if(input) input.focus();
        }, 100);
    },

    // Ação de Desbloquear
    unlock(skipAnim = false) {
        const gate = document.getElementById('gatekeeper');
        localStorage.setItem('lit_is_locked', 'false'); // Grava que está livre
        
        if (skipAnim) {
            gate.style.display = 'none';
            gate.classList.remove('active');
        } else {
            gate.style.opacity = '0';
            setTimeout(() => {
                gate.style.display = 'none';
                gate.classList.remove('active');
            }, 500);
        }
        
        // Limpa o input para a próxima vez
        const input = document.getElementById('authPass');
        if(input) input.value = '';

        const shouldPrompt = localStorage.getItem('lit_pomo_prompt') === 'true';
        const hasTarget = localStorage.getItem('lit_pomo_target');
        if (shouldPrompt && !hasTarget) {
            localStorage.removeItem('lit_pomo_prompt');
            setTimeout(() => ui.showChoiceOnly(), 100);
        }
    },

    showSetup() {
        const gate = document.getElementById('gatekeeper');
        if (gate) {
            gate.classList.remove('active');
            gate.style.display = 'none';
            document.getElementById('viewLock').style.display = 'none';
        }
        const projectInput = document.getElementById('setupProjectName');
        if (projectInput) projectInput.value = "";
        const msg = document.getElementById("setupMsg");
        if (msg) msg.textContent = "";
        if (window.skrvOnboarding && typeof window.skrvOnboarding.open === "function") {
            window.skrvOnboarding.open(0);
        } else {
            setTimeout(() => {
                const input = document.getElementById('setupProjectName');
                if (input) input.focus();
            }, 100);
        }
    },

    shakeInput(el) {
        const msg = document.getElementById('authMsg');
        if(msg) {
            msg.innerText = lang.db[lang.current].wrong_pass;
            msg.style.color = '#ff4444';
        }
        el.value = '';
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 500);
    }
};
