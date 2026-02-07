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
                notes: document.getElementById("panelNotes"),
                memo: document.getElementById("panelMemo"),
                actions: document.getElementById("panelActions")
            }
        };
        this.initTheme();
        this.bindFaviconScheme();
        this.initMobile();
        this.initScrollHints();
        this.bindClipboardMarker();
        this.bindMemoSanitizer();
        document.addEventListener("lang:changed", () => this.refreshDrawerTitle());
    },
    bindClipboardMarker() {
        const handler = (e) => {
            const target = e.target;
            if (target && target.id === "memoArea") return;
            const isInput = target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT");
            if (!isInput || !e.clipboardData) return;
            const start = target.selectionStart ?? 0;
            const end = target.selectionEnd ?? 0;
            if (start === end) return;
            const value = target.value || "";
            const selected = value.slice(start, end);
            e.preventDefault();
            e.clipboardData.setData("text/plain", selected);
            e.clipboardData.setData("text/x-skv", "native");
            if (e.type === "cut") {
                target.value = value.slice(0, start) + value.slice(end);
                const next = start;
                if (typeof target.setSelectionRange === "function") {
                    target.setSelectionRange(next, next);
                }
                target.dispatchEvent(new Event("input"));
            }
        };
        document.addEventListener("copy", handler, true);
        document.addEventListener("cut", handler, true);
    },
    bindFaviconScheme() {
        if (!window.matchMedia) return;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => this.updateFavicon();
        if (media.addEventListener) {
            media.addEventListener("change", onChange);
        } else if (media.addListener) {
            media.addListener(onChange);
        }
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
        const ensureMask = () => {
            if (!memoArea._skrvMask || memoArea._skrvMask.length !== memoArea.value.length) {
                memoArea._skrvMask = "n".repeat(memoArea.value.length);
            }
        };
        const applyReplace = (start, end, insertLen, originChar) => {
            ensureMask();
            const mask = memoArea._skrvMask;
            const insert = originChar ? originChar.repeat(insertLen) : "";
            memoArea._skrvMask = mask.slice(0, start) + insert + mask.slice(end);
        };
        const diffRange = (prev, next) => {
            let start = 0;
            const prevLen = prev.length;
            const nextLen = next.length;
            while (start < prevLen && start < nextLen && prev[start] === next[start]) start += 1;
            let endPrev = prevLen;
            let endNext = nextLen;
            while (endPrev > start && endNext > start && prev[endPrev - 1] === next[endNext - 1]) {
                endPrev -= 1;
                endNext -= 1;
            }
            return { start, end: endPrev, insertLen: endNext - start };
        };
        const cleanText = (text) => {
            if (!text) return "";
            return text
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
                .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, "");
        };
        const warnExternal = () => {
            const msg = lang.t("copy_native_only") || "Conteúdo externo ignorado. Só o texto nativo foi copiado.";
            if (window.skrvModal && typeof window.skrvModal.alert === "function") {
                window.skrvModal.alert(msg);
            } else {
                alert(msg);
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
            const nativeFlag = clip && clip.getData("text/x-skv") === "native";
            applyReplace(start, end, clean.length, nativeFlag ? "n" : "e");
            memoArea._skrvSkipInput = true;
            memoArea.dispatchEvent(new Event("input"));
        });
        memoArea.addEventListener("beforeinput", (e) => {
            memoArea._skrvPrevValue = memoArea.value;
            memoArea._skrvLastInputType = e.inputType;
        });
        memoArea.addEventListener("input", () => {
            if (memoArea._skrvSkipInput) {
                memoArea._skrvSkipInput = false;
                memoArea._skrvPrevValue = memoArea.value;
                return;
            }
            const prev = memoArea._skrvPrevValue ?? "";
            const next = memoArea.value || "";
            if (prev !== next) {
                const { start, end, insertLen } = diffRange(prev, next);
                applyReplace(start, end, insertLen, "n");
            }
            memoArea._skrvPrevValue = memoArea.value;
        });
        memoArea.addEventListener("copy", (e) => {
            const start = memoArea.selectionStart || 0;
            const end = memoArea.selectionEnd || 0;
            if (start === end) return;
            ensureMask();
            const mask = memoArea._skrvMask;
            const value = memoArea.value || "";
            let native = "";
            let hasExternal = false;
            for (let i = start; i < end; i += 1) {
                if (mask[i] === "e") {
                    hasExternal = true;
                } else {
                    native += value[i];
                }
            }
            if (!e.clipboardData) return;
            e.preventDefault();
            e.clipboardData.setData("text/plain", native);
            if (native) e.clipboardData.setData("text/x-skv", "native");
            if (hasExternal) warnExternal();
        });
        memoArea.addEventListener("cut", (e) => {
            const start = memoArea.selectionStart || 0;
            const end = memoArea.selectionEnd || 0;
            if (start === end) return;
            ensureMask();
            const mask = memoArea._skrvMask;
            const value = memoArea.value || "";
            let native = "";
            let keptExternal = "";
            let hasExternal = false;
            for (let i = start; i < end; i += 1) {
                if (mask[i] === "e") {
                    hasExternal = true;
                    keptExternal += value[i];
                } else {
                    native += value[i];
                }
            }
            if (!e.clipboardData) return;
            e.preventDefault();
            e.clipboardData.setData("text/plain", native);
            if (native) e.clipboardData.setData("text/x-skv", "native");
            if (hasExternal) warnExternal();
            const before = value.slice(0, start);
            const after = value.slice(end);
            memoArea.value = before + keptExternal + after;
            memoArea._skrvMask = (mask.slice(0, start)) + ("e".repeat(keptExternal.length)) + (mask.slice(end));
            const cursor = start + keptExternal.length;
            memoArea.setSelectionRange(cursor, cursor);
            memoArea._skrvPrevValue = memoArea.value;
            memoArea.dispatchEvent(new Event("input"));
        });
    },

    // --- POMODORO SOBERANO (TIMESTAMP) ---
    initPomodoro() {
        // Cria o botão na interface se não existir
        const controls = document.querySelector(".controls-inner");
        if (controls && !document.getElementById("pomodoroBtn")) {
            const div = document.createElement("div"); div.className = "divider"; controls.appendChild(div);
            const btn = document.createElement("button");
            btn.className = "btn"; btn.id = "pomodoroBtn";
            btn.innerHTML = `<img class="icon" src="src/assets/icons/timer.svg" alt="" aria-hidden="true"> 25:00`;
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
            btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle></svg> 25:00`;
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
                btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle></svg> ${label} ${min}:${sec}`.trim();
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
        document.body.classList.add("pomo-active");
        this.hidePomodoroModal();
        this.startTicker();
    },

    startBreak() {
        const targetTime = Date.now() + (6 * 60 * 1000);
        localStorage.setItem("lit_pomo_target", targetTime);
        localStorage.setItem("lit_pomo_phase", "break");
        document.body.classList.add("pomo-active");
        this.showBreakModal();
        this.startTicker();
        new Audio("src/assets/audio/enter.wav").play().catch(()=>{}); 
    },

    showBreakModal() {
        if (!this.pomoModal) return;
        this.pomoModal.classList.add("active");
        const notesModal = document.getElementById("notesModal");
        if (notesModal && notesModal.classList.contains("active")) {
            notesModal.classList.remove("active");
            notesModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("notes-open");
        }
        if (this.pomoBreakView) this.pomoBreakView.style.display = "block";
        if (this.pomoUnlockView) this.pomoUnlockView.style.display = "none";
        this.updateBreakCountdown("06:00");
    },

    showUnlockModal() {
        clearInterval(this.pomodoroInterval);
        localStorage.removeItem("lit_pomo_target");
        localStorage.setItem("lit_pomo_phase", "await_unlock");
        document.body.classList.add("pomo-active");
        if (!this.pomoModal) return;
        this.pomoModal.classList.add("active");
        const notesModal = document.getElementById("notesModal");
        if (notesModal && notesModal.classList.contains("active")) {
            notesModal.classList.remove("active");
            notesModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("notes-open");
        }
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
        document.body.classList.add("pomo-active");
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
        document.body.classList.remove("pomo-active");
    },

    updateBreakCountdown(value) {
        if (this.pomoCountdown) this.pomoCountdown.innerText = value;
    },

    tryUnlockPomodoro() {},

    // --- TEMA E UI (Mantido inalterado, apenas encapsulado corretamente) ---
    updateFavicon() {
        const favicon = document.getElementById("appFavicon");
        if (!favicon) return;
        const lightIcon = "src/assets/icons/logoEskrev-favicon-dark.svg";
        const darkIcon = "src/assets/icons/logoEskrev-favicon-cream.svg";
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const useLight = !prefersDark;
        const next = useLight ? lightIcon : darkIcon;
        if (favicon.getAttribute("href") !== next) {
            favicon.setAttribute("href", next);
        }
    },

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
        this.updateFavicon();
    },

    toggleTheme() {
        const themes = ["paper", "chumbo", "study"];
        const current = document.body.getAttribute("data-theme");
        let nextIndex = themes.indexOf(current) + 1;
        if (nextIndex >= themes.length) nextIndex = 0;
        const newTheme = themes[nextIndex];
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("lit_theme_pref", newTheme);
        this.updateFavicon();
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
        const resolvedPanel = isMobile ? "notes" : panelName;
        if (isMobile) {
            if (panels.notes) panels.notes.style.display = "block";
            drawer.classList.add("mobile-all");
        } else if (panels[resolvedPanel]) {
            panels[resolvedPanel].style.display = resolvedPanel === "memo" ? "flex" : "block";
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
            notes: lang.t("drawer_notes"),
            memo: lang.t("drawer_memo")
        };
        this.elements.drawerTitle.innerText = isMobile ? (titles.notes || lang.t("drawer_notes")) : (titles[resolvedPanel] || "");

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
            notes: lang.t("drawer_notes"),
            memo: lang.t("drawer_memo")
        };
        if (this.elements.drawerTitle && titles[panel]) {
            this.elements.drawerTitle.innerText = titles[panel];
        }
    }
};
