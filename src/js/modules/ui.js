import { lang } from './lang.js';

export const ui = {
    elements: {},
    pomodoroInterval: null,
    
    init() {
        this.elements = {
            hud: document.querySelector(".hud"),
            drawer: document.getElementById("drawer"),
            drawerTitle: document.getElementById("drawerTitle"),
            projectList: document.getElementById("projectList"),
            chapterList: document.getElementById("chapterList"),
            memoArea: document.getElementById("memoArea"),
            mobileTrigger: document.getElementById("mobileTrigger"),
            panels: {
                files: document.getElementById("panelFiles"),
                nav: document.getElementById("panelNav"),
                memo: document.getElementById("panelMemo"),
                actions: document.getElementById("panelActions")
            }
        };
        this.initTheme();
        this.initMobile();
        this.initScrollHints();
        this.bindMemoSanitizer();
        document.addEventListener("lang:changed", () => this.refreshDrawerTitle());
    },
    initScrollHints() {
        const hud = this.elements.hud;
        const controls = document.querySelector(".controls-inner");
        if (!hud || !controls) return;
        const update = () => {
            const isMobile = document.body.classList.contains("mobile-lite") || window.innerWidth <= 900;
            if (isMobile) {
                hud.classList.remove("has-overflow");
                controls.classList.remove("has-overflow");
                return;
            }
            const hudOverflow = hud.scrollHeight - hud.clientHeight > 2;
            const controlsOverflow = controls.scrollWidth - controls.clientWidth > 2;
            hud.classList.toggle("has-overflow", hudOverflow);
            controls.classList.toggle("has-overflow", controlsOverflow);
        };
        const onHudScroll = () => update();
        const onControlsScroll = () => update();
        hud.addEventListener("scroll", onHudScroll);
        controls.addEventListener("scroll", onControlsScroll);
        window.addEventListener("resize", update);
        setTimeout(update, 200);
    },
    bindMemoSanitizer() {
        const memoArea = this.elements.memoArea;
        if (!memoArea) return;
        const cleanText = (text) => {
            if (!text) return "";
            return text
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
                .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, "");
        };
        const applyClean = () => {
            const clean = cleanText(memoArea.value);
            if (clean !== memoArea.value) {
                const pos = memoArea.selectionStart || 0;
                memoArea.value = clean;
                const next = Math.min(pos, clean.length);
                memoArea.setSelectionRange(next, next);
            }
        };
        memoArea.addEventListener("paste", (e) => {
            e.preventDefault();
            const clip = e.clipboardData || window.clipboardData;
            const text = clip ? clip.getData("text/plain") : "";
            const clean = cleanText(text);
            const start = memoArea.selectionStart || 0;
            const end = memoArea.selectionEnd || 0;
            const value = memoArea.value || "";
            memoArea.value = value.slice(0, start) + clean + value.slice(end);
            const cursor = start + clean.length;
            memoArea.setSelectionRange(cursor, cursor);
            memoArea.dispatchEvent(new Event("input"));
        });
        memoArea.addEventListener("input", applyClean);
    },

    // --- POMODORO SOBERANO (TIMESTAMP) ---
    initPomodoro() {
        // Cria o botão na interface se não existir
        const controls = document.querySelector(".controls-inner");
        if (controls && !document.getElementById("pomodoroBtn")) {
            const div = document.createElement("div"); div.className = "divider"; controls.appendChild(div);
            const btn = document.createElement("button");
            btn.className = "btn"; btn.id = "pomodoroBtn";
            btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="src/assets/icons/phosphor-sprite.svg#icon-tomato"></use></svg> 25:00`;
            const pomoHint = lang.t("help_pomo_short") || lang.t("pomo_btn") || "Pomodoro";
            btn.setAttribute("data-i18n-title", "help_pomo_short");
            btn.setAttribute("data-i18n-tip", "help_pomo_short");
            btn.setAttribute("aria-label", pomoHint);
            btn.setAttribute("data-tip", pomoHint);
            btn.onclick = () => this.togglePomodoro();
            controls.appendChild(btn);
        }
        this.cachePomodoroElements();
        this.bindPomodoroModal();

        // Verifica se já existe um timer rodando (Resistência a F5)
        this.checkPomodoroState();
    },

    togglePomodoro() {
        const activeTarget = localStorage.getItem("lit_pomo_target");
        if (activeTarget) {
            return;
        }
        this.showChoiceOnly();
    },

    stopPomodoro() {
        clearInterval(this.pomodoroInterval);
        localStorage.removeItem("lit_pomo_target");
        localStorage.removeItem("lit_pomo_phase");
        localStorage.removeItem("lit_pomo_duration");
        this.hidePomodoroModal();
        const btn = document.getElementById("pomodoroBtn");
        if(btn) {
            btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="src/assets/icons/phosphor-sprite.svg#icon-tomato"></use></svg> 25:00`;
            btn.classList.remove("active");
        }
    },

    checkPomodoroState() {
        const target = localStorage.getItem("lit_pomo_target");
        const phase = localStorage.getItem("lit_pomo_phase") || "work";
        if (target) {
            // Se existe um alvo salvo, verifica se ainda é válido
            if (parseInt(target) > Date.now()) {
                if (phase === "break") this.showBreakModal();
                this.startTicker(); // O tempo ainda não acabou, retoma o contador
            } else {
                if (phase === "work") {
                    this.startBreak();
                } else {
                    this.showUnlockModal();
                }
            }
        } else if (phase === "await_unlock") {
            this.showUnlockModal();
        }
    },

    startTicker() {
        const btn = document.getElementById("pomodoroBtn");
        if(!btn) return;
        
        btn.classList.add("active");
        
        // Limpa qualquer intervalo anterior para evitar duplicidade
        clearInterval(this.pomodoroInterval);

        this.pomodoroInterval = setInterval(() => {
            const target = parseInt(localStorage.getItem("lit_pomo_target"));
            if (!target) { this.stopPomodoro(); return; }
            const phase = localStorage.getItem("lit_pomo_phase") || "work";

            const now = Date.now();
            const diff = target - now;

            if (diff <= 0) {
                if (phase === "work") {
                    this.startBreak();
                } else {
                    this.showUnlockModal();
                }
            } else {
                // ATUALIZA VISOR
                const min = Math.floor((diff / 1000) / 60).toString().padStart(2, '0');
                const sec = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
                const label = phase === "break" ? lang.t("pomo_break_label") : "";
                btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="src/assets/icons/phosphor-sprite.svg#icon-tomato"></use></svg> ${label} ${min}:${sec}`.trim();
                if (phase === "break") this.updateBreakCountdown(`${min}:${sec}`);
            }
        }, 1000); // Atualiza a cada segundo
    },

    cachePomodoroElements() {
        this.pomoModal = document.getElementById("pomodoroModal");
        this.pomoBreakView = document.getElementById("pomoBreakView");
        this.pomoUnlockView = document.getElementById("pomoUnlockView");
        this.pomoCountdown = document.getElementById("pomoCountdown");
        this.pomoChoice = document.getElementById("pomoChoice");
        this.pomoMsg = document.getElementById("pomoMsg");
    },

    bindPomodoroModal() {
        if (!this.pomoModal) return;
        if (this.pomoChoice) {
            this.pomoChoice.querySelectorAll("[data-duration]").forEach((btn) => {
                btn.onclick = () => {
                    const value = parseInt(btn.getAttribute("data-duration"), 10);
                    if (Number.isFinite(value)) this.startWork(value);
                };
            });
        }
    },

    startWork(minutes) {
        const targetTime = Date.now() + (minutes * 60 * 1000);
        localStorage.setItem("lit_pomo_target", targetTime);
        localStorage.setItem("lit_pomo_phase", "work");
        localStorage.setItem("lit_pomo_duration", String(minutes));
        this.hidePomodoroModal();
        this.startTicker();
    },

    startBreak() {
        const targetTime = Date.now() + (6 * 60 * 1000);
        localStorage.setItem("lit_pomo_target", targetTime);
        localStorage.setItem("lit_pomo_phase", "break");
        this.showBreakModal();
        this.startTicker();
        new Audio("src/assets/audio/enter.wav").play().catch(()=>{}); 
    },

    showBreakModal() {
        if (!this.pomoModal) return;
        this.pomoModal.classList.add("active");
        if (this.pomoBreakView) this.pomoBreakView.style.display = "block";
        if (this.pomoUnlockView) this.pomoUnlockView.style.display = "none";
        this.updateBreakCountdown("06:00");
    },

    showUnlockModal() {
        clearInterval(this.pomodoroInterval);
        localStorage.removeItem("lit_pomo_target");
        localStorage.setItem("lit_pomo_phase", "await_unlock");
        if (!this.pomoModal) return;
        this.pomoModal.classList.add("active");
        if (this.pomoBreakView) this.pomoBreakView.style.display = "none";
        if (this.pomoUnlockView) this.pomoUnlockView.style.display = "block";
        const unlockPrompt = document.getElementById("pomoUnlockPrompt");
        if (unlockPrompt) unlockPrompt.style.display = "";
        if (this.pomoChoice) this.pomoChoice.style.display = "block";
        if (this.pomoMsg) this.pomoMsg.innerText = "";
        if (this.pomoChoice) {
            this.pomoChoice.querySelectorAll("[data-duration]").forEach((btn) => {
                btn.disabled = false;
            });
        }
    },

    showChoiceOnly() {
        if (!this.pomoModal) return;
        this.pomoModal.classList.add("active");
        if (this.pomoBreakView) this.pomoBreakView.style.display = "none";
        if (this.pomoUnlockView) this.pomoUnlockView.style.display = "block";
        const unlockPrompt = document.getElementById("pomoUnlockPrompt");
        if (unlockPrompt) unlockPrompt.style.display = "none";
        if (this.pomoPassInput) this.pomoPassInput.style.display = "none";
        if (this.pomoUnlockBtn) this.pomoUnlockBtn.style.display = "none";
        if (this.pomoChoice) this.pomoChoice.style.display = "block";
        if (this.pomoMsg) this.pomoMsg.innerText = "";
        if (this.pomoChoice) {
            this.pomoChoice.querySelectorAll("[data-duration]").forEach((btn) => {
                btn.disabled = false;
            });
        }
    },

    hidePomodoroModal() {
        if (this.pomoModal) this.pomoModal.classList.remove("active");
    },

    updateBreakCountdown(value) {
        if (this.pomoCountdown) this.pomoCountdown.innerText = value;
    },

    tryUnlockPomodoro() {},

    // --- TEMA E UI (Mantido inalterado, apenas encapsulado corretamente) ---
    initTheme() {
        const allowed = ["paper", "chumbo", "study"];
        let currentTheme = localStorage.getItem("lit_theme_pref") || "paper";
        const legacyMap = {
            "ibm-blue": "chumbo",
            "ibm-dark": "chumbo",
            "journal": "paper",
            "mist": "paper"
        };
        if (legacyMap[currentTheme]) currentTheme = legacyMap[currentTheme];
        if (!allowed.includes(currentTheme)) currentTheme = "paper";
        document.body.setAttribute("data-theme", currentTheme);
        localStorage.setItem("lit_theme_pref", currentTheme);
    },

    toggleTheme() {
        const themes = ["paper", "chumbo", "study"];
        const current = document.body.getAttribute("data-theme");
        let nextIndex = themes.indexOf(current) + 1;
        if (nextIndex >= themes.length) nextIndex = 0;
        const newTheme = themes[nextIndex];
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("lit_theme_pref", newTheme);
        const verifyFrame = document.getElementById("verifyFrame");
        if (verifyFrame && verifyFrame.contentWindow) {
            verifyFrame.contentWindow.postMessage({ type: "theme", value: newTheme }, window.location.origin);
        }
        const booksFrame = document.getElementById("booksFrame");
        if (booksFrame && booksFrame.contentWindow) {
            booksFrame.contentWindow.postMessage({ type: "theme", value: newTheme }, window.location.origin);
        }
    },

    initMobile() {
        if(this.elements.mobileTrigger) {
            this.elements.mobileTrigger.onclick = (e) => {
                e.stopPropagation();
                const drawerOpen = this.elements.drawer.classList.contains("open");
                if (drawerOpen) {
                    this.closeDrawer();
                } else {
                    document.dispatchEvent(new CustomEvent("mobile:openDrawer"));
                }
            };
        }
    },

    openDrawer(panelName, callbacks) {
        const { drawer, panels, hud } = this.elements;
        if (drawer.classList.contains("open") && panels[panelName] && panels[panelName].style.display === "block") {
            this.closeDrawer();
            return;
        }
        Object.values(panels).forEach(p => { if (p) p.style.display = "none"; });
        document.querySelectorAll(".hud-btn").forEach(b => b.classList.remove("active"));
        const isMobile = window.innerWidth <= 900;
        const resolvedPanel = isMobile ? "memo" : panelName;
        if (isMobile) {
            if (panels.memo) panels.memo.style.display = "block";
            drawer.classList.add("mobile-all");
        } else if (panels[resolvedPanel]) {
            panels[resolvedPanel].style.display = "block";
            drawer.classList.remove("mobile-all");
        }
        drawer.classList.add("open");
        if(isMobile) {
            document.body.classList.add("mobile-drawer-open");
        }
        document.body.classList.add("drawer-open");

        const titles = {
            files: lang.t("drawer_files"),
            nav: lang.t("drawer_nav"),
            memo: lang.t("drawer_memo")
        };
        this.elements.drawerTitle.innerText = isMobile ? (titles.memo || lang.t("drawer_memo")) : (titles[resolvedPanel] || "");

        if(resolvedPanel === 'files' && callbacks.renderFiles) callbacks.renderFiles();
        if(resolvedPanel === 'nav' && callbacks.renderNav) callbacks.renderNav();
        localStorage.setItem("lit_ui_drawer_open", "true");
        localStorage.setItem("lit_ui_drawer_panel", resolvedPanel);
    },

    closeDrawer() {
        this.elements.drawer.classList.remove("open");
        this.elements.drawer.classList.remove("mobile-all");
        document.querySelectorAll(".hud-btn").forEach(b => b.classList.remove("active"));
        if(window.innerWidth <= 900) {
            document.body.classList.remove("mobile-drawer-open");
        }
        document.body.classList.remove("drawer-open");
        Object.values(this.elements.panels || {}).forEach(p => { if (p) p.style.display = "none"; });
        localStorage.setItem("lit_ui_drawer_open", "false");
    }
    ,
    refreshDrawerTitle() {
        const panel = localStorage.getItem("lit_ui_drawer_panel");
        const titles = {
            files: lang.t("drawer_files"),
            nav: lang.t("drawer_nav"),
            memo: lang.t("drawer_memo")
        };
        if (this.elements.drawerTitle && titles[panel]) {
            this.elements.drawerTitle.innerText = titles[panel];
        }
    }
};
