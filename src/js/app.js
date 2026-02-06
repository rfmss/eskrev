/* * .skr Writer - CORE MODULE
 * Fixes: Memo persistence bug (Ghost Data)
 */

import { store } from './modules/store.js';
import { ui } from './modules/ui.js';
import { editorFeatures } from './modules/editor.js';
import { lang } from './modules/lang.js';
import { auth } from './modules/auth.js';
import { exportSkrv, importSkrv, buildSkrvPayloadWithChain } from './modules/export_skrv.js';
import { birthTracker } from './modules/birth_tracker.js';
import { qrTransfer } from './modules/qr_transfer.js';


document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add("booting");
    setTimeout(() => document.body.classList.remove("booting"), 2000);
    console.log("🚀 .skr SYSTEM BOOTING v5.5...");

    if (sessionStorage.getItem("skrv_force_clean") === "1") {
        try { localStorage.clear(); } catch (_) {}
        try { sessionStorage.removeItem("skrv_force_clean"); } catch (_) {}
    }

    store.init();
    incrementAccessCount();
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
        document.body.classList.add("mobile-lite");
    }
    ui.init();
    
    lang.init();
    const syncLangToFrames = (code) => {
        const frames = [
            document.getElementById("booksFrame"),
            document.getElementById("verifyFrame")
        ].filter(Boolean);
        frames.forEach((frame) => {
            try {
                frame.contentWindow?.postMessage({ type: "lang", value: code }, window.location.origin);
            } catch (_) {}
        });
    };
    document.addEventListener("lang:changed", (e) => {
        syncLangToFrames(e.detail?.code || lang.current);
    });
    syncLangToFrames(lang.current);
    window.skrvModal = initSystemModal();
    window.skrvOnboarding = initOnboarding();
    auth.init();

    document.querySelectorAll('[data-manifesto-open]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            auth.openFullManifesto();
        });
    });
    document.querySelectorAll('[data-terms-open]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            auth.openTermsModal();
        });
    });
    document.querySelectorAll('[data-privacy-open]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            auth.openPrivacyModal();
        });
    });

    const syncFullscreenIcon = () => {
        const btn = document.getElementById("hudFs");
        if (!btn) return;
        const img = btn.querySelector("img.icon");
        if (!img) return;
        img.src = document.fullscreenElement
            ? "src/assets/icons/minimize-2.svg"
            : "src/assets/icons/maximize-2.svg";
    };
    document.addEventListener("fullscreenchange", syncFullscreenIcon);
    document.addEventListener("click", (e) => {
        const termsTrigger = e.target.closest("[data-terms-open]");
        if (termsTrigger) {
            e.preventDefault();
            auth.openTermsModal();
            return;
        }
        const privacyTrigger = e.target.closest("[data-privacy-open]");
        if (privacyTrigger) {
            e.preventDefault();
            auth.openPrivacyModal();
        }
    });

    
    ui.initPomodoro();
    qrTransfer.init({
        onRestore: (payload) => {
            if (payload && applySkrvPayload(payload)) {
                if (window.skrvModal) window.skrvModal.alert(lang.t("alert_backup_restored"));
                location.reload();
            } else {
                if (window.skrvModal) window.skrvModal.alert(lang.t("alert_backup_invalid"));
            }
        }
    });
    
    const editorEl = document.getElementById("editor");
    editorFeatures.init(editorEl);
    birthTracker.init(editorEl);
    setupCopyGuard(editorEl);
    
    loadActiveDocument();
    editorFeatures.schedulePaginationUpdate();
    editorFeatures.refreshStats();
    setupEventListeners();
    restoreEditorScroll();
    if (isMobile) {
        setupMobileFallbackTriggers();
        ensureMobileModule().catch(() => {});
    }
    setupSupportCopy();
    setupMarqueeCopy();
    setupSupportLinks();
    setupLogoManifesto();

    // TRAVA DE SEGURANÇA (Anti-Close)
    window.addEventListener("beforeunload", (e) => {
        store.persist(true);
        e.preventDefault();
        e.returnValue = lang.t("confirm_exit");
    });

    // BLOQUEIO BFCache: evita restauração fantasma após hard reset
    window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
            location.replace(location.pathname);
        }
    });
    window.addEventListener("pagehide", (e) => {
        if (e.persisted) {
            store.persist(true);
        }
    });

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        });
    }
});

function setupSupportCopy() {
    const items = document.querySelectorAll(".manifesto-support-value[data-copy]");
    if (!items.length) return;
    const copyText = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve) => {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "true");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            document.body.removeChild(area);
            resolve();
        });
    };
    items.forEach((item) => {
        item.addEventListener("click", () => {
            const id = item.getAttribute("data-copy");
            const target = id ? document.getElementById(id) : null;
            if (!target) return;
            const text = (target.textContent || "").trim();
            if (!text) return;
            const original = lang.t("support_copy");
            const done = lang.t("support_copy_done");
            copyText(text).then(() => {
                item.setAttribute("data-tip", done);
                setTimeout(() => {
                    item.setAttribute("data-tip", original);
                }, 900);
            });
        });
    });
}

function setupMarqueeCopy() {
    const items = document.querySelectorAll(".marquee-copy[data-copy]");
    if (!items.length) return;
    const copyText = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve) => {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "true");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            document.body.removeChild(area);
            resolve();
        });
    };
    items.forEach((item) => {
        item.addEventListener("click", () => {
            const value = item.getAttribute("data-copy");
            if (!value) return;
            copyText(value).then(() => {
                item.setAttribute("data-copied-label", lang.t("support_copy_done"));
                item.classList.add("is-copied");
                setTimeout(() => {
                    item.classList.remove("is-copied");
                }, 900);
            });
        });
    });
}

function setupSupportLinks() {
    const link = document.querySelector(".export-support-link");
    if (!link) return;
    link.addEventListener("click", () => {
        const manifesto = document.getElementById("manifestoModal");
        const supportBlock = document.getElementById("manifestoSupport");
        if (!manifesto || !supportBlock) return;
        if (auth?.openFullManifesto) {
            auth.openFullManifesto();
        } else {
            manifesto.classList.add("active");
            document.body.classList.add("manifesto-open");
            supportBlock.classList.add("active");
        }
        supportBlock.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

function setupLogoManifesto() {
    const logo = document.querySelector(".logo-dot");
    if (!logo) return;
    logo.addEventListener("click", () => {
        if (auth?.openFullManifesto) auth.openFullManifesto();
    });
}

function initOnboarding() {
    const modal = document.getElementById("onboardingModal");
    if (!modal) return null;
    const steps = Array.from(modal.querySelectorAll(".onboarding-step"));
    const backBtn = document.getElementById("onboardBack");
    const nextBtn = document.getElementById("onboardNext");
    const stepLabel = document.getElementById("onboardStepLabel");
    const langBtn = document.getElementById("onboardLangToggle");
    const langHint = document.getElementById("onboardLangHint");
    const total = Math.max(steps.length - 1, 1);
    let current = 0;
    let langChosen = localStorage.getItem("skrv_onboard_lang_chosen") === "1";

    const animateOnce = (step) => {
        if (!step || step.dataset.animated === "true") return;
        step.dataset.animated = "true";
        step.classList.add("animate");
    };
    const formatLangLabel = (label) => String(label || "").replace(/^[^\w]*\s*/u, "");
    const updateLangButton = () => {
        if (!langBtn) return;
        const idx = lang.languages.findIndex((l) => l.code === lang.current);
        const next = lang.languages[(idx + 1 + lang.languages.length) % lang.languages.length];
        if (next) langBtn.textContent = formatLangLabel(next.label);
    };
    const update = () => {
        steps.forEach((step) => {
            const stepIndex = parseInt(step.getAttribute("data-step"), 10);
            step.classList.toggle("active", stepIndex === current);
        });
        if (stepLabel) {
            if (current === 0) {
                stepLabel.textContent = "";
                stepLabel.style.display = "none";
            } else {
                stepLabel.textContent = `${current}/${total}`;
                stepLabel.style.display = "inline-flex";
            }
        }
        if (backBtn) {
            backBtn.disabled = current <= 0;
            backBtn.style.display = current <= 0 ? "none" : "inline-flex";
        }
        if (langBtn) {
            langBtn.style.display = current === 0 ? "inline-flex" : "none";
        }
        if (langHint) {
            langHint.style.display = current === 0 ? "block" : "none";
        }
        if (nextBtn) {
            const canAdvance = current < total && (current > 0 || langChosen || lang.current === "pt");
            nextBtn.style.display = canAdvance ? "inline-flex" : "none";
        }
        if (current === total) {
            setTimeout(() => {
                const input = document.getElementById("setupProjectName");
                if (input) input.focus();
            }, 50);
        } else if (nextBtn) {
            nextBtn.focus();
        }
        const activeStep = steps.find((step) => parseInt(step.getAttribute("data-step"), 10) === current);
        animateOnce(activeStep);
        updateLangButton();
        modal.classList.toggle("onboard-step-zero", current === 0);
            if (current === 0) {
                if (backBtn) backBtn.style.display = "none";
                if (nextBtn) nextBtn.style.display = langChosen ? "inline-flex" : "none";
                if (stepLabel) stepLabel.style.display = "none";
            }
    };

    const open = (startStep = 0) => {
        current = Math.min(Math.max(startStep, 1), total);
        if (startStep === 0) current = 0;
        modal.classList.add("active");
        document.body.classList.add("modal-active");
        update();
    };

    const close = () => {
        modal.classList.remove("active");
        document.body.classList.remove("modal-active");
    };

    const complete = () => {
        localStorage.setItem("skrv_onboard_done", "true");
        close();
    };

        if (backBtn) {
            backBtn.addEventListener("click", () => {
            if (current > 0) {
                current -= 1;
                update();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (current < total) {
                current += 1;
                update();
            }
        });
    }
    if (langBtn) {
        langBtn.addEventListener("click", () => {
            lang.cycleLang();
            langChosen = true;
            localStorage.setItem("skrv_onboard_lang_chosen", "1");
            if (current === 1 && nextBtn) nextBtn.style.visibility = "visible";
        });
    }
    document.addEventListener("lang:changed", updateLangButton);
    const keyHandler = (e) => {
        if (!modal.classList.contains("active")) return;
        if (e.key === "Enter") {
            if ((current === 0 || current === 1) && !langChosen && lang.current !== "pt") {
                e.preventDefault();
                return;
            }
            if (current < total) {
                current += 1;
                update();
                e.preventDefault();
            }
        }
        if (e.key === "ArrowRight") {
            if (current < total) {
                current += 1;
                update();
                e.preventDefault();
            }
        }
        if (e.key === "ArrowLeft") {
            if (current > 0) {
                current -= 1;
                update();
                e.preventDefault();
            }
        }
    };
    document.addEventListener("keydown", keyHandler);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            e.preventDefault();
        }
    });

    return {
        open,
        close,
        complete,
        isOpen: () => modal.classList.contains("active")
    };
}

let mobileModulePromise = null;
function ensureMobileModule() {
    if (mobileModulePromise) return mobileModulePromise;
    mobileModulePromise = import("./modules/mobile.js")
        .then((mod) => {
            if (mod && typeof mod.initMobileFeatures === "function") {
                mod.initMobileFeatures();
            }
            return mod;
        });
    return mobileModulePromise;
}

function setupMobileFallbackTriggers() {
    let armed = true;
    const trigger = (e) => {
        if (!armed) return;
        const target = e.target;
        if (!(target instanceof Element)) return;
        if (
            target.closest(".mobile-only") ||
            target.closest(".mobile-memo") ||
            target.closest(".mobile-project-note") ||
            target.closest(".mobile-controls") ||
            target.closest("#mobileIntroModal") ||
            target.id?.startsWith("mobile")
        ) {
            armed = false;
            ensureMobileModule().catch(() => {});
        }
    };
    document.addEventListener("click", trigger, { capture: true });
    document.addEventListener("touchstart", trigger, { capture: true, passive: true });
    document.addEventListener("focusin", trigger, { capture: true });
}

function initSystemModal() {
    const overlay = document.getElementById("systemModal");
    if (!overlay) {
        return {
            alert: async () => {},
            confirm: async () => false,
            prompt: async () => null,
            cancel: () => {}
        };
    }
    const titleEl = document.getElementById("systemModalTitle");
    const msgEl = document.getElementById("systemModalMessage");
    const inputEl = document.getElementById("systemModalInput");
    const btnCancel = document.getElementById("systemModalCancel");
    const btnConfirm = document.getElementById("systemModalConfirm");
    const btnClose = document.getElementById("closeSystemModal");
    const actions = overlay.querySelector(".system-modal-actions");

    let resolver = null;
    let activeType = "alert";

    const setActionsLayout = (showCancel) => {
        if (!actions) return;
        actions.classList.toggle("single", !showCancel);
        if (btnCancel) btnCancel.style.display = showCancel ? "" : "none";
    };

    const close = (result) => {
        overlay.classList.remove("active");
        if (inputEl) inputEl.value = "";
        if (resolver) {
            const resolve = resolver;
            resolver = null;
            resolve(result);
        }
    };

    const open = (type, options = {}) => new Promise((resolve) => {
        resolver = resolve;
        activeType = type;
        const title = options.title || lang.t("modal_title");
        const message = options.message || "";
        const confirmLabel = options.confirmLabel || lang.t("modal_ok");
        const cancelLabel = options.cancelLabel || lang.t("modal_cancel");

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = message;
        if (btnConfirm) btnConfirm.textContent = confirmLabel;
        if (btnCancel) btnCancel.textContent = cancelLabel;

        const wantsInput = type === "prompt";
        if (inputEl) {
            inputEl.style.display = wantsInput ? "block" : "none";
            inputEl.value = wantsInput ? (options.defaultValue || "") : "";
        }
        setActionsLayout(type !== "alert");
        overlay.classList.add("active");
        setTimeout(() => {
            if (wantsInput && inputEl) inputEl.focus();
            else if (btnConfirm) btnConfirm.focus();
        }, 20);
    });

    const handleCancel = () => {
        if (!resolver) return;
        if (activeType === "prompt") close(null);
        else close(false);
    };

    const handleConfirm = () => {
        if (!resolver) return;
        if (activeType === "prompt") close(inputEl ? inputEl.value : "");
        else close(true);
    };

    if (btnCancel) btnCancel.onclick = handleCancel;
    if (btnConfirm) btnConfirm.onclick = handleConfirm;
    if (btnClose) btnClose.onclick = handleCancel;

    overlay.addEventListener("click", (e) => {
        if (e.target !== overlay) return;
        if (activeType === "alert") close(true);
        else handleCancel();
    });

    if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
            }
            if (e.key === "Escape") {
                e.preventDefault();
                handleCancel();
            }
        });
    }

    return {
        alert: (message, options = {}) => open("alert", { ...options, message }),
        confirm: (message, options = {}) => open("confirm", { ...options, message }),
        prompt: (message, options = {}) => open("prompt", { ...options, message }),
        cancel: handleCancel
    };
}

function loadActiveDocument() {
    const activeDoc = store.getActive();
    const editorEl = document.getElementById("editor");
    
    if (activeDoc) {
        // Carrega o conteúdo salvo
        editorEl.innerHTML = activeDoc.content || ""; 
        
        document.getElementById("currentDocLabel").innerText = activeDoc.name;
        
        // [CORREÇÃO v5.5] Força a limpeza do campo Memo
        // Usa o operador || "" para garantir que se for null/undefined, ele limpa o campo visualmente
        document.getElementById("memoArea").value = store.data.memo || "";
        
        if (activeDoc.cursorPos !== undefined && activeDoc.cursorPos !== null) {
            restoreCursorPos(activeDoc.cursorPos);
        } else {
            const gate = document.getElementById("gatekeeper");
            if (!gate || gate.style.display === "none") {
                editorEl.focus(); 
            }
        }
        editorFeatures.schedulePaginationUpdate();
        editorFeatures.refreshStats();
        setTimeout(() => {
            editorFeatures.focusReady = true;
            editorFeatures.triggerFocusMode();
            editorFeatures.scheduleFocusBlockUpdate();
        }, 50);
    }
}

function setupEventListeners() {
    initHelpTabs();

      // Views (Editor / Books / Verify)
    const showEditorView = () => {
        const ev = document.getElementById("editorView");
        const bv = document.getElementById("booksView");
        const vv = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        if (ev) ev.style.display = "";
        if (bv) bv.style.display = "none";
        if (vv) vv.style.display = "none";
        const editorEl = document.getElementById("editor");
        if (editorEl) editorEl.focus();
        if (panel) panel.classList.remove("books-active");
        localStorage.setItem("lit_ui_view", "editor");
    };

    const showBooksView = () => {
        const ev = document.getElementById("editorView");
        const bv = document.getElementById("booksView");
        const vv = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        if (ev) ev.style.display = "none";
        if (bv) bv.style.display = "block";
        if (vv) vv.style.display = "none";
        if (panel) panel.classList.add("books-active");
        localStorage.setItem("lit_ui_view", "books");
    };

    const showVerifyView = () => {
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

    // Template Pane + Novo Texto
    const templateState = {
        open: localStorage.getItem("skrv_template_open") === "true",
        minimized: localStorage.getItem("skrv_template_min") === "true",
        width: parseInt(localStorage.getItem("skrv_template_w"), 10) || 360,
        activeTemplate: null,
        activePersona: null,
        enemThemes: []
    };
    let templateRegistry = null;
    let selectedTemplate = null;
    let selectedPersona = null;

    const loadTemplateRegistry = async () => {
        if (templateRegistry) return templateRegistry;
        const res = await fetch("config/persona-templates.json");
        templateRegistry = await res.json();
        return templateRegistry;
    };

    const parseTemplate = (raw) => {
        const lines = String(raw || "").split(/\r?\n/);
        const blocks = [];
        let current = { title: lang.t("template_section_default"), body: [] };
        lines.forEach((line) => {
            if (line.startsWith("## ")) {
                if (current.body.length) blocks.push(current);
                current = { title: line.replace(/^##\s+/, "").trim(), body: [] };
            } else if (line.startsWith("# ")) {
                if (!blocks.length && !current.body.length) {
                    current.title = line.replace(/^#\s+/, "").trim();
                } else {
                    current.body.push(line);
                }
            } else {
                current.body.push(line);
            }
        });
        if (current.body.length || current.title) blocks.push(current);
        return blocks;
    };

    const renderGuidePane = (template, raw) => {
        const pane = document.getElementById("templatePane");
        const titleEl = document.getElementById("templateTitle");
        const subtitleEl = document.getElementById("templateSubtitle");
        const contentEl = document.getElementById("templateContent");
        if (!pane || !titleEl || !contentEl) return;
        titleEl.textContent = lang.t(template.label) || template.label;
        if (subtitleEl) subtitleEl.textContent = lang.t("template_guide_hint");
        contentEl.innerHTML = "";
        const container = document.createElement("div");
        container.className = "guide-content";

        const toInlineHtml = (text) => {
            const safe = String(text || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            return safe
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>");
        };

        const appendParagraph = (lines) => {
            if (!lines.length) return;
            const p = document.createElement("p");
            p.className = "guide-paragraph";
            p.innerHTML = lines.map(toInlineHtml).join("<br>");
            container.appendChild(p);
        };

        const appendQuote = (text) => {
            const q = document.createElement("blockquote");
            q.className = "guide-quote";
            q.innerHTML = toInlineHtml(text);
            container.appendChild(q);
        };

        const appendHeading = (text, level) => {
            const h = document.createElement("div");
            h.className = level === 1 ? "guide-title" : "guide-section-title";
            h.textContent = text;
            container.appendChild(h);
        };

        const lines = String(raw || "").split(/\r?\n/);
        let paragraph = [];
        let listEl = null;
        const flushList = () => { listEl = null; };

        const insertEnemTheme = () => {
            const block = document.createElement("div");
            block.className = "guide-theme";
            const label = document.createElement("div");
            label.className = "guide-theme-label";
            label.textContent = lang.t("guide_theme_label");
            const text = document.createElement("div");
            text.className = "guide-theme-text";
            const btn = document.createElement("button");
            btn.className = "btn-half";
            btn.type = "button";
            btn.textContent = lang.t("guide_theme_button");
            block.appendChild(label);
            block.appendChild(text);
            block.appendChild(btn);
            container.appendChild(block);

            let themesCache = templateState.enemThemes || [];
            const setRandomTheme = () => {
                if (!themesCache.length) return;
                const next = themesCache[Math.floor(Math.random() * themesCache.length)];
                text.textContent = next;
            };
            if (!themesCache.length) {
                fetch("content/enem/themes.json")
                    .then((res) => res.json())
                    .then((data) => {
                        themesCache = Array.isArray(data.themes) ? data.themes : [];
                        templateState.enemThemes = themesCache;
                        setRandomTheme();
                    });
            } else {
                setRandomTheme();
            }
            btn.onclick = () => setRandomTheme();
        };

        if (template.id === "enem-redacao") {
            insertEnemTheme();
        }

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (!trimmed) {
                appendParagraph(paragraph);
                paragraph = [];
                flushList();
                return;
            }
            if (trimmed === "---") {
                appendParagraph(paragraph);
                paragraph = [];
                flushList();
                const hr = document.createElement("hr");
                hr.className = "guide-hr";
                container.appendChild(hr);
                return;
            }
            if (trimmed.startsWith("# ")) {
                appendParagraph(paragraph);
                paragraph = [];
                flushList();
                appendHeading(trimmed.replace(/^#\s+/, ""), 1);
                return;
            }
            if (trimmed.startsWith("## ")) {
                appendParagraph(paragraph);
                paragraph = [];
                flushList();
                appendHeading(trimmed.replace(/^##\s+/, ""), 2);
                return;
            }
            if (trimmed.startsWith("> ")) {
                appendParagraph(paragraph);
                paragraph = [];
                flushList();
                appendQuote(trimmed.replace(/^>\s+/, ""));
                return;
            }
            if (trimmed.startsWith("- ")) {
                appendParagraph(paragraph);
                paragraph = [];
                if (!listEl) {
                    listEl = document.createElement("ul");
                    listEl.className = "guide-list";
                    container.appendChild(listEl);
                }
                const li = document.createElement("li");
                li.innerHTML = toInlineHtml(trimmed.replace(/^-\s+/, ""));
                listEl.appendChild(li);
                return;
            }
            paragraph.push(trimmed);
        });
        appendParagraph(paragraph);
        contentEl.appendChild(container);
    };

    const applyTemplateLayout = () => {
        const workspace = document.getElementById("workspace");
        const pane = document.getElementById("templatePane");
        const split = document.getElementById("templateSplit");
        const tab = document.getElementById("templateTab");
        if (!pane || !split || !tab) return;
        if (workspace) workspace.style.setProperty("--template-pane-w", `${templateState.width}px`);
        pane.style.setProperty("--template-pane-w", `${templateState.width}px`);
        if (!templateState.activeTemplate) {
            templateState.open = false;
            templateState.minimized = false;
        }
        if (templateState.open) {
            pane.classList.add("open");
            split.classList.add("active");
            tab.classList.remove("show");
        } else {
            pane.classList.remove("open");
            split.classList.remove("active");
            tab.classList.remove("show");
        }
        document.body.classList.toggle("template-open", templateState.open);
        pane.classList.toggle("minimized", templateState.minimized);
        localStorage.setItem("skrv_template_open", templateState.open ? "true" : "false");
        localStorage.setItem("skrv_template_min", templateState.minimized ? "true" : "false");
        localStorage.setItem("skrv_template_w", String(templateState.width));
    };

    const openTemplatePane = async (templateId) => {
        const registry = await loadTemplateRegistry();
        const all = registry.personas.flatMap(p => p.templates.map(t => ({ ...t, persona: p.id })));
        const template = all.find(t => t.id === templateId);
        if (!template) return;
        const res = await fetch(template.file);
        const raw = await res.text();
        templateState.open = true;
        templateState.minimized = false;
        templateState.activeTemplate = template;
        applyTemplateLayout();
        renderGuidePane(template, raw);
        const tab = document.getElementById("templateTab");
        if (tab) tab.textContent = (lang.t(template.label) || template.label).toUpperCase();
    };

    const closeTemplatePane = () => {
        templateState.open = false;
        templateState.minimized = false;
        applyTemplateLayout();
    };

    const minimizeTemplatePane = () => {
        if (!templateState.open) return;
        templateState.minimized = !templateState.minimized;
        applyTemplateLayout();
    };

    const setupTemplateResize = () => {
        const split = document.getElementById("templateSplit");
        const pane = document.getElementById("templatePane");
        if (!split || !pane) return;
        let dragging = false;
        const onMove = (e) => {
            if (!dragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            if (!clientX) return;
            const total = window.innerWidth;
            const width = Math.min(520, Math.max(220, total - clientX));
            templateState.width = width;
            pane.style.setProperty("--template-pane-w", `${width}px`);
        };
        const onUp = () => {
            if (!dragging) return;
            dragging = false;
            localStorage.setItem("skrv_template_w", String(templateState.width));
            document.body.classList.remove("dragging");
        };
        split.addEventListener("mousedown", () => {
            dragging = true;
            document.body.classList.add("dragging");
        });
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    const openNewTextModal = async () => {
        const modal = document.getElementById("newTextModal");
        if (!modal) return;
        const registry = await loadTemplateRegistry();
        selectedPersona = null;
        selectedTemplate = null;
        const personasEl = document.getElementById("newTextPersonas");
        if (personasEl) {
            personasEl.innerHTML = "";
            registry.personas.forEach((persona) => {
                const btn = document.createElement("button");
                btn.className = "newtext-card";
                btn.type = "button";
                btn.textContent = lang.t(persona.label) || persona.label;
                btn.onclick = () => {
                    selectedPersona = persona;
                    const title = document.getElementById("newTextTemplatesTitle");
                    if (title) title.textContent = lang.t(persona.label) || persona.label;
                    const list = document.getElementById("newTextTemplates");
                    if (list) {
                        list.innerHTML = "";
                        persona.templates.forEach((tpl, idx) => {
                            const tplBtn = document.createElement("button");
                            tplBtn.className = "btn-full";
                            tplBtn.type = "button";
                            tplBtn.textContent = lang.t(tpl.label) || tpl.label;
                            tplBtn.onclick = () => {
                                selectedTemplate = tpl;
                                list.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
                                tplBtn.classList.add("active");
                            };
                            if (idx === 0) {
                                selectedTemplate = tpl;
                                tplBtn.classList.add("active");
                            }
                            list.appendChild(tplBtn);
                        });
                    }
                    setNewTextStep(3);
                };
                personasEl.appendChild(btn);
            });
        }
        setNewTextStep(1);
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    };

    const closeNewTextModal = () => {
        const modal = document.getElementById("newTextModal");
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    };

    const setNewTextStep = (step) => {
        document.querySelectorAll(".newtext-step").forEach((el) => el.classList.remove("is-active"));
        const target = document.querySelector(`.newtext-step-${step}`);
        if (target) target.classList.add("is-active");
    };

    const createNewDocument = (title, content = "") => {
        store.createProject(title, content);
        loadActiveDocument();
        renderProjectList();
    };

    const createSimpleProject = () => {
        const base = lang.t("newtext_default_title") || "Novo texto";
        const existing = (store.data.projects || []).map(p => p.name);
        let name = base;
        if (existing.includes(name)) {
            let i = 2;
            while (existing.includes(`${base} ${i}`)) i += 1;
            name = `${base} ${i}`;
        }
        createNewDocument(name, "");
    };

    const applyNewTextTemplate = async (mode) => {
        if (!selectedTemplate && selectedPersona && selectedPersona.templates.length) {
            selectedTemplate = selectedPersona.templates[0];
        }
        if (!selectedTemplate) return;
        const personaLabel = selectedPersona ? (lang.t(selectedPersona.label) || selectedPersona.label) : "";
        const templateLabel = lang.t(selectedTemplate.label) || selectedTemplate.label;
        const title = personaLabel ? `${personaLabel} — ${templateLabel}` : templateLabel;
        const res = await fetch(selectedTemplate.file);
        const raw = await res.text();
        if (mode === "insert") {
            createNewDocument(title, raw);
        } else {
            createNewDocument(title, "");
            openTemplatePane(selectedTemplate.id);
        }
        closeNewTextModal();
    };

    // Gavetas (abrir drawer volta para o editor)
    const notesModal = document.getElementById("notesModal");
    const notesClose = document.getElementById("notesClose");
    const notesState = {
        activeId: null,
        stage: "list",
        search: "",
        folder: "",
        tag: "",
        overlayType: "",
        overlayValue: "",
        draftId: null
    };
    const NOTES_KEY = "skrv_mobile_notes_v1";
    const NOTES_KEY_LEGACY = "tot_mobile_notes_v1";
    const NOTES_LIMIT = 200;
    const FOLDERS_LIMIT = 30;
    const PINNED_LIMIT = 5;
    const notesCache = () => {
        if (Array.isArray(store.data.mobileNotes)) return store.data.mobileNotes;
        try {
            const raw = localStorage.getItem(NOTES_KEY) || localStorage.getItem(NOTES_KEY_LEGACY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    };
    const saveNotes = (notes) => {
        store.data.mobileNotes = Array.isArray(notes) ? notes : [];
        store.persist(true);
        localStorage.setItem(NOTES_KEY, JSON.stringify(store.data.mobileNotes));
    };
    const normalizeTag = (tag) => String(tag || "").trim().replace(/^#/, "").toLowerCase();
    const normalizeFolder = (folder) => String(folder || "").trim();
    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString();
    };
    const noteTitle = (note) => {
        if (note.title && note.title.trim()) return note.title.trim();
        const first = String(note.text || "").split("\n").find(Boolean);
        return first ? first.trim().slice(0, 48) : lang.t("notes_untitled");
    };
    const parseQuery = (raw) => {
        const query = String(raw || "").trim();
        const parts = query.split(/\s+/).filter(Boolean);
        const tags = [];
        let folder = "";
        const text = [];
        parts.forEach(part => {
            if (part.startsWith("#") && part.length > 1) {
                tags.push(normalizeTag(part.slice(1)));
                return;
            }
            if (part.startsWith("/") && part.length > 1) {
                folder = normalizeFolder(part.slice(1));
                return;
            }
            text.push(part);
        });
        return { text: text.join(" ").toLowerCase(), tags, folder };
    };
    const matchesSearch = (note, query) => {
        if (!query.text && !query.tags.length && !query.folder) return true;
        const body = `${note.title || ""} ${note.text || ""}`.toLowerCase();
        if (query.text && !body.includes(query.text)) return false;
        if (query.folder && normalizeFolder(note.folder) !== query.folder) return false;
        if (query.tags.length) {
            const noteTags = (note.tags || []).map(normalizeTag);
            const hasAll = query.tags.every(tag => noteTags.includes(tag));
            if (!hasAll) return false;
        }
        return true;
    };
    const buildNoteCard = (note) => {
        const card = document.createElement("div");
        card.className = "notes-card";
        if (note.pinned) card.classList.add("is-pinned");
        const header = document.createElement("div");
        header.className = "notes-card-header";
        const title = document.createElement("div");
        title.className = "notes-card-title";
        title.textContent = noteTitle(note);
        const pinBtn = document.createElement("button");
        pinBtn.type = "button";
        pinBtn.className = "btn-icon notes-pin-btn" + (note.pinned ? " active" : "");
        if (note.pinned) {
            pinBtn.innerHTML = `<img class="icon pin-icon" src="src/assets/icons/pin.svg" alt="" aria-hidden="true">`;
        } else {
            pinBtn.innerHTML = `<img class="icon pin-icon pin-icon-off" src="src/assets/icons/pin-off.svg" alt="" aria-hidden="true">`;
        }
        pinBtn.onclick = (event) => {
            event.stopPropagation();
            toggleNotePin(note.id);
        };
        const meta = document.createElement("div");
        meta.className = "notes-card-meta";
        meta.textContent = note.folder ? `${note.folder} · ${formatDate(note.updatedAt || note.createdAt)}` : formatDate(note.updatedAt || note.createdAt);
        const excerpt = document.createElement("div");
        excerpt.className = "notes-card-meta";
        excerpt.textContent = String(note.text || "").replace(/\s+/g, " ").trim().slice(0, 64);
        const tags = document.createElement("div");
        tags.className = "notes-tags";
        (note.tags || []).slice(0, 6).forEach(tag => {
            const span = document.createElement("span");
            span.className = "notes-tag";
            span.textContent = `#${normalizeTag(tag)}`;
            tags.appendChild(span);
        });
        header.appendChild(title);
        header.appendChild(pinBtn);
        card.appendChild(header);
        card.appendChild(meta);
        if (excerpt.textContent) card.appendChild(excerpt);
        if (tags.childElementCount) card.appendChild(tags);
        card.onclick = () => openNotePreview(note.id);
        return card;
    };

    const renderNotesList = () => {
        const list = document.getElementById("notesList");
        const empty = document.getElementById("notesEmpty");
        const notesAll = notesCache();
        const parsed = parseQuery(notesState.search);
        const notes = notesAll.filter(n => matchesSearch(n, parsed))
            .filter(n => notesState.folder ? normalizeFolder(n.folder) === notesState.folder : true)
            .filter(n => notesState.tag ? (n.tags || []).map(normalizeTag).includes(notesState.tag) : true);
        if (!list || !empty) return;
        list.innerHTML = "";
        const foldersWrap = document.getElementById("notesFoldersWrap");
        const foldersEl = document.getElementById("notesFolders");
        if (foldersWrap && foldersEl) {
            const folderMeta = new Map();
            notesAll.forEach(n => {
                const folder = normalizeFolder(n.folder);
                if (!folder) return;
                const stamp = new Date(n.updatedAt || n.createdAt || 0).getTime();
                const prev = folderMeta.get(folder) || 0;
                if (stamp > prev) folderMeta.set(folder, stamp);
            });
            const folders = Array.from(folderMeta.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([folder]) => folder);
            const folderList = document.getElementById("notesFolderList");
            if (folderList) {
                folderList.innerHTML = "";
                folders.forEach(folder => {
                    const option = document.createElement("option");
                    option.value = folder;
                    folderList.appendChild(option);
                });
            }
            if (folders.length) {
                foldersWrap.style.display = "grid";
                foldersEl.innerHTML = "";
                const allBtn = document.createElement("button");
                allBtn.className = "notes-filter-btn" + (!notesState.folder ? " active" : "");
                allBtn.type = "button";
                allBtn.textContent = lang.t("notes_folders_all");
                allBtn.onclick = () => {
                    notesState.folder = "";
                    renderNotesList();
                };
                foldersEl.appendChild(allBtn);
                folders.forEach(folder => {
                    const btn = document.createElement("button");
                    btn.className = "notes-filter-btn" + (notesState.folder === folder ? " active" : "");
                    btn.type = "button";
                    btn.textContent = folder;
                    btn.onclick = () => {
                        openNotesOverlay("folder", folder);
                    };
                    foldersEl.appendChild(btn);
                });
            } else {
                foldersWrap.style.display = "none";
                foldersEl.innerHTML = "";
            }
        }
        const tagsWrap = document.getElementById("notesTagsWrap");
        const tagsEl = document.getElementById("notesTagsList");
        if (tagsWrap && tagsEl) {
            const tagMeta = new Map();
            notesAll.forEach(n => {
                const stamp = new Date(n.updatedAt || n.createdAt || 0).getTime();
                (n.tags || []).forEach(tag => {
                    const key = normalizeTag(tag);
                    if (!key) return;
                    const prev = tagMeta.get(key) || 0;
                    if (stamp > prev) tagMeta.set(key, stamp);
                });
            });
            const tags = Array.from(tagMeta.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([tag]) => tag);
            const tagsList = document.getElementById("notesTagsDatalist");
            if (tagsList) {
                tagsList.innerHTML = "";
                tags.forEach(tag => {
                    const option = document.createElement("option");
                    option.value = `#${tag}`;
                    tagsList.appendChild(option);
                });
            }
            if (tags.length) {
                tagsWrap.style.display = "grid";
                tagsEl.innerHTML = "";
                const allBtn = document.createElement("button");
                allBtn.className = "notes-filter-btn" + (!notesState.tag ? " active" : "");
                allBtn.type = "button";
                allBtn.textContent = lang.t("notes_tags_all");
                allBtn.onclick = () => {
                    notesState.tag = "";
                    renderNotesList();
                };
                tagsEl.appendChild(allBtn);
                tags.forEach(tag => {
                    const btn = document.createElement("button");
                    btn.className = "notes-filter-btn" + (notesState.tag === tag ? " active" : "");
                    btn.type = "button";
                    btn.textContent = `#${tag}`;
                    btn.onclick = () => {
                        openNotesOverlay("tag", tag);
                    };
                    tagsEl.appendChild(btn);
                });
            } else {
                tagsWrap.style.display = "none";
                tagsEl.innerHTML = "";
            }
        }
        if (!notes.length) {
            empty.style.display = "flex";
            return;
        }
        empty.style.display = "none";
        const ordered = [
            ...notes.filter(n => n.pinned),
            ...notes.filter(n => !n.pinned)
        ];
        ordered.forEach(note => {
            list.appendChild(buildNoteCard(note));
        });
    };

    const openNotesOverlay = (type, value) => {
        const overlay = document.getElementById("notesOverlay");
        const titleEl = document.getElementById("notesOverlayTitle");
        const listEl = document.getElementById("notesOverlayList");
        if (!overlay || !titleEl || !listEl) return;
        const notesAll = notesCache();
        const filtered = type === "folder"
            ? notesAll.filter(n => normalizeFolder(n.folder) === value)
            : notesAll.filter(n => (n.tags || []).map(normalizeTag).includes(value));
        titleEl.textContent = type === "folder" ? value : `#${value}`;
        listEl.innerHTML = "";
        filtered.forEach(note => listEl.appendChild(buildNoteCard(note)));
        notesState.overlayType = type;
        notesState.overlayValue = value;
        overlay.classList.add("active");
        overlay.setAttribute("aria-hidden", "false");
    };
    const closeNotesOverlay = () => {
        const overlay = document.getElementById("notesOverlay");
        if (!overlay) return;
        overlay.classList.remove("active");
        overlay.setAttribute("aria-hidden", "true");
        notesState.overlayType = "";
        notesState.overlayValue = "";
    };
    const setNotesStage = (stage) => {
        if (stage !== "edit") finalizeDraftIfNeeded();
        notesState.stage = stage;
        document.querySelectorAll(".notes-stage").forEach(el => el.classList.remove("is-active"));
        const target = document.querySelector(`.notes-stage-${stage}`);
        if (target) target.classList.add("is-active");
        if (stage === "list") renderNotesList();
    };
    const openNotePreview = (id) => {
        openNoteEdit(id);
    };
    const openNoteEdit = (id) => {
        const note = notesCache().find(n => n.id === id);
        if (!note) return;
        notesState.activeId = id;
        notesState.draftId = null;
        closeNotesOverlay();
        const titleEl = document.getElementById("notesTitle");
        const bodyEl = document.getElementById("notesBody");
        const tagsEl = document.getElementById("notesTags");
        const folderEl = document.getElementById("notesFolder");
        const metaEl = document.getElementById("notesMeta");
        const pinToggle = document.getElementById("notesPinToggle");
        if (titleEl) titleEl.value = note.title || "";
        if (bodyEl) bodyEl.value = note.text || "";
        if (tagsEl) tagsEl.value = (note.tags || []).map(t => `#${normalizeTag(t)}`).join(", ");
        if (folderEl) folderEl.value = note.folder || "";
        if (metaEl) metaEl.textContent = `${lang.t("notes_updated")}: ${formatDate(note.updatedAt || note.createdAt)}`;
        if (pinToggle) {
            pinToggle.classList.toggle("active", !!note.pinned);
            if (note.pinned) {
                pinToggle.innerHTML = `<img class="icon pin-icon" src="src/assets/icons/pin.svg" alt="" aria-hidden="true">`;
            } else {
                pinToggle.innerHTML = `<img class="icon pin-icon pin-icon-off" src="src/assets/icons/pin-off.svg" alt="" aria-hidden="true">`;
            }
        }
        setNotesStage("edit");
    };
    const readNoteInputs = () => {
        const titleEl = document.getElementById("notesTitle");
        const bodyEl = document.getElementById("notesBody");
        const tagsEl = document.getElementById("notesTags");
        const folderEl = document.getElementById("notesFolder");
        const title = titleEl ? titleEl.value.trim() : "";
        const text = bodyEl ? bodyEl.value : "";
        const tags = tagsEl ? tagsEl.value.split(",").map(normalizeTag).filter(Boolean) : [];
        const folder = folderEl ? normalizeFolder(folderEl.value) : "";
        return { title, text, tags, folder };
    };
    const hasNoteContent = ({ title, text, tags, folder }) => {
        return Boolean(`${title}${text}${folder}${(tags || []).join("")}`.trim());
    };
    const finalizeDraftIfNeeded = () => {
        if (!notesState.draftId) return;
        const data = readNoteInputs();
        if (!hasNoteContent(data)) {
            notesState.draftId = null;
            return;
        }
        const notes = notesCache();
        if (notes.length >= NOTES_LIMIT) {
            if (window.skrvModal?.alert) window.skrvModal.alert(lang.t("mobile_limit_notes"));
            else alert(lang.t("mobile_limit_notes"));
            return;
        }
        const note = {
            id: notesState.draftId,
            title: data.title,
            text: data.text,
            tags: data.tags,
            folder: data.folder,
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.unshift(note);
        saveNotes(notes);
        notesState.activeId = note.id;
        notesState.draftId = null;
    };
    const createNewNote = (preset = {}) => {
        const notes = notesCache();
        if (notes.length >= NOTES_LIMIT) {
            if (window.skrvModal?.alert) window.skrvModal.alert(lang.t("mobile_limit_notes"));
            else alert(lang.t("mobile_limit_notes"));
            return;
        }
        const presetFolder = normalizeFolder(preset.folder);
        if (presetFolder) {
            const folders = Array.from(new Set(notes.map(n => normalizeFolder(n.folder)).filter(Boolean)));
            if (!folders.includes(presetFolder) && folders.length >= FOLDERS_LIMIT) {
                if (window.skrvModal?.alert) window.skrvModal.alert(lang.t("mobile_limit_folders"));
                else alert(lang.t("mobile_limit_folders"));
                return;
            }
        }
        const presetTags = Array.isArray(preset.tags) ? preset.tags.map(normalizeTag).filter(Boolean) : [];
        notesState.activeId = null;
        notesState.draftId = `note_${Date.now()}`;
        closeNotesOverlay();
        const titleEl = document.getElementById("notesTitle");
        const bodyEl = document.getElementById("notesBody");
        const tagsEl = document.getElementById("notesTags");
        const folderEl = document.getElementById("notesFolder");
        const metaEl = document.getElementById("notesMeta");
        const pinToggle = document.getElementById("notesPinToggle");
        if (titleEl) titleEl.value = "";
        if (bodyEl) bodyEl.value = "";
        if (tagsEl) tagsEl.value = presetTags.map(t => `#${t}`).join(", ");
        if (folderEl) folderEl.value = presetFolder || "";
        if (metaEl) metaEl.textContent = "";
        if (pinToggle) pinToggle.classList.remove("active");
        setNotesStage("edit");
    };
    const toggleNotePin = (id) => {
        const notes = notesCache();
        const note = notes.find(n => n.id === id);
        if (!note) return;
        const pinnedCount = notes.filter(n => n.pinned).length;
        if (!note.pinned && pinnedCount >= PINNED_LIMIT) {
            if (window.skrvModal?.alert) window.skrvModal.alert(lang.t("mobile_limit_pins"));
            else alert(lang.t("mobile_limit_pins"));
            return;
        }
        note.pinned = !note.pinned;
        note.updatedAt = new Date().toISOString();
        saveNotes(notes);
        if (notesState.activeId === id) {
            const pinToggle = document.getElementById("notesPinToggle");
            if (pinToggle) {
                pinToggle.classList.toggle("active", note.pinned);
                if (note.pinned) {
                    pinToggle.innerHTML = `<img class="icon pin-icon" src="src/assets/icons/pin.svg" alt="" aria-hidden="true">`;
                } else {
                    pinToggle.innerHTML = `<img class="icon pin-icon pin-icon-off" src="src/assets/icons/pin-off.svg" alt="" aria-hidden="true">`;
                }
            }
        }
        renderNotesList();
    };
    const updateActiveNote = () => {
        if (notesState.draftId) {
            const data = readNoteInputs();
            if (!hasNoteContent(data)) return;
            finalizeDraftIfNeeded();
        }
        const notes = notesCache();
        const note = notes.find(n => n.id === notesState.activeId);
        if (!note) return;
        const { title, text, tags, folder } = readNoteInputs();
        if (folder) {
            const folders = Array.from(new Set(notes.map(n => normalizeFolder(n.folder)).filter(Boolean)));
            if (!folders.includes(folder) && folders.length >= FOLDERS_LIMIT) {
                if (window.skrvModal?.alert) window.skrvModal.alert(lang.t("mobile_limit_folders"));
                else alert(lang.t("mobile_limit_folders"));
                return;
            }
        }
        note.title = title;
        note.text = text;
        note.tags = tags;
        note.folder = folder;
        note.updatedAt = new Date().toISOString();
        saveNotes(notes);
        const metaEl = document.getElementById("notesMeta");
        if (metaEl) metaEl.textContent = `${lang.t("notes_updated")}: ${formatDate(note.updatedAt)}`;
        renderNotesList();
    };
    let updateTimer = null;
    const scheduleUpdate = () => {
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(updateActiveNote, 250);
    };

    const openNotesModal = () => {
        ui.closeDrawer();
        showEditorView();
        const pomo = document.getElementById("pomodoroModal");
        if (pomo && pomo.classList.contains("active")) return;
        if (!notesModal) return;
        notesModal.classList.add("active");
        notesModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("notes-open");
        renderNotesList();
        setNotesStage("list");
    };
    const closeNotesModal = () => {
        if (!notesModal) return;
        finalizeDraftIfNeeded();
        const overlay = document.getElementById("notesOverlay");
        if (overlay) {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
        }
        notesModal.classList.remove("active");
        notesModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("notes-open");
    };
    if (notesClose) notesClose.onclick = () => closeNotesModal();
    document.addEventListener("mousedown", (e) => {
        if (!notesModal || !notesModal.classList.contains("active")) return;
        const panel = notesModal.querySelector(".notes-panel");
        const overlay = document.getElementById("notesOverlay");
        if (overlay && overlay.classList.contains("active")) {
            const insideOverlay = overlay.contains(e.target);
            const insidePanel = panel && panel.contains(e.target);
            if (!insideOverlay && insidePanel) {
                overlay.classList.remove("active");
                overlay.setAttribute("aria-hidden", "true");
            } else if (!insideOverlay && !insidePanel) {
                closeNotesModal();
            }
            return;
        }
        if (panel && !panel.contains(e.target)) {
            closeNotesModal();
        }
    });
    const notesSearch = document.getElementById("notesSearch");
    const notesNew = document.getElementById("notesNew");
    const notesEmptyCreate = document.getElementById("notesEmptyCreate");
    const notesFab = document.getElementById("notesFab");
    const notesOverlayClose = document.getElementById("notesOverlayClose");
    const notesOverlayNew = document.getElementById("notesOverlayNew");
    const notesBackToList = document.getElementById("notesBackToList");
    const notesEdit = document.getElementById("notesEdit");
    const notesBackToPreview = document.getElementById("notesBackToPreview");
    const notesDelete = document.getElementById("notesDelete");
    const notesPinToggle = document.getElementById("notesPinToggle");
    const notesTitle = document.getElementById("notesTitle");
    const notesBody = document.getElementById("notesBody");
    const notesTags = document.getElementById("notesTags");
    const notesFolder = document.getElementById("notesFolder");
    if (notesSearch) {
        notesSearch.addEventListener("input", (e) => {
            notesState.search = e.target.value;
            renderNotesList();
        });
    }
    if (notesNew) notesNew.onclick = () => createNewNote();
    if (notesEmptyCreate) notesEmptyCreate.onclick = () => createNewNote();
    if (notesFab) notesFab.onclick = () => createNewNote();
    if (notesBackToList) notesBackToList.onclick = () => setNotesStage("list");
    if (notesEdit) notesEdit.onclick = () => openNoteEdit(notesState.activeId);
    if (notesBackToPreview) notesBackToPreview.onclick = () => setNotesStage("list");
    if (notesDelete) {
        notesDelete.onclick = async () => {
            const notes = notesCache();
            const note = notes.find(n => n.id === notesState.activeId);
            if (!note) return;
            const ok = window.skrvModal?.confirm ? await window.skrvModal.confirm(lang.t("notes_delete_confirm")) : confirm(lang.t("notes_delete_confirm"));
            if (!ok) return;
            const next = notes.filter(n => n.id !== notesState.activeId);
            saveNotes(next);
            notesState.activeId = null;
            renderNotesList();
            setNotesStage("list");
        };
    }
    if (notesPinToggle) {
        notesPinToggle.onclick = () => {
            if (notesState.activeId) toggleNotePin(notesState.activeId);
        };
    }
    if (notesOverlayClose) notesOverlayClose.onclick = () => closeNotesOverlay();
    if (notesOverlayNew) {
        notesOverlayNew.onclick = () => {
            if (notesState.overlayType === "tag") {
                createNewNote({ tags: [notesState.overlayValue] });
            } else if (notesState.overlayType === "folder") {
                createNewNote({ folder: notesState.overlayValue });
            } else {
                createNewNote();
            }
        };
    }
    [notesTitle, notesBody, notesTags, notesFolder].forEach(el => {
        if (!el) return;
        el.addEventListener("input", scheduleUpdate);
    });

    const newTextModal = document.getElementById("newTextModal");
    const newTextClose = document.getElementById("newTextClose");
    const newTextBlank = document.getElementById("newTextBlank");
    const newTextTemplate = document.getElementById("newTextTemplate");
    const newTextUseRef = document.getElementById("newTextUseRef");
    const newTextInsert = document.getElementById("newTextInsert");
    if (newTextClose) newTextClose.onclick = () => closeNewTextModal();
    if (newTextBlank) newTextBlank.onclick = () => {
        createNewDocument(lang.t("newtext_default_title"), "");
        closeNewTextModal();
    };
    if (newTextTemplate) newTextTemplate.onclick = () => setNewTextStep(2);
    if (newTextUseRef) newTextUseRef.onclick = () => applyNewTextTemplate("reference");
    if (newTextInsert) newTextInsert.onclick = () => applyNewTextTemplate("insert");
    if (newTextModal) {
        newTextModal.addEventListener("click", (e) => {
            if (e.target === newTextModal) closeNewTextModal();
        });
        newTextModal.querySelectorAll("[data-action=\"blank\"]").forEach((btn) => {
            btn.onclick = () => {
                createNewDocument(lang.t("newtext_default_title"), "");
                closeNewTextModal();
            };
        });
        newTextModal.querySelectorAll("[data-action=\"back\"]").forEach((btn) => {
            btn.onclick = () => setNewTextStep(2);
        });
    }

    const templateClose = document.getElementById("templateClose");
    const templateMinimize = document.getElementById("templateMinimize");
    const templateTab = document.getElementById("templateTab");
    if (templateClose) templateClose.onclick = () => closeTemplatePane();
    if (templateMinimize) templateMinimize.onclick = () => minimizeTemplatePane();
    if (templateTab) templateTab.onclick = () => {
        if (!templateState.activeTemplate) return;
        templateState.open = true;
        templateState.minimized = false;
        applyTemplateLayout();
    };
    document.querySelectorAll(".guide-rail-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-guide");
            if (!id) return;
            openTemplatePane(id);
            document.querySelectorAll(".guide-rail-item").forEach((el) => el.classList.remove("active"));
            btn.classList.add("active");
        });
    });
    setupTemplateResize();
    applyTemplateLayout();

    document.getElementById("tabFiles").onclick = () => { showEditorView(); ui.openDrawer('files', { renderFiles: renderProjectList }); closeNotesModal(); };
    document.getElementById("tabNav").onclick = () => { showEditorView(); ui.openDrawer('nav', { renderNav: renderNavigation }); closeNotesModal(); };
    const tabNotes = document.getElementById("tabNotes");
    if (tabNotes) tabNotes.onclick = () => { openNotesModal(); };
    document.getElementById("tabMemo").onclick = () => { showEditorView(); ui.openDrawer('memo', {}); closeNotesModal(); };
    document.getElementById("closeDrawer").onclick = () => ui.closeDrawer();
    document.addEventListener("mobile:openDrawer", () => {
        showEditorView();
        ui.openDrawer('files', { renderFiles: renderProjectList });
    });

    // Books (modo interno via iframe)
    const tabBooks = document.getElementById("tabBooks");
    if (tabBooks) tabBooks.onclick = () => { ui.closeDrawer(); showBooksView(); };
    const mobileTabFiles = document.getElementById("mobileTabFiles");
    const mobileTabNav = document.getElementById("mobileTabNav");
    const mobileTabMemo = document.getElementById("mobileTabMemo");
    const mobileTabTheme = document.getElementById("mobileTabTheme");
    const mobileTabBooks = document.getElementById("mobileTabBooks");
    if (mobileTabFiles) mobileTabFiles.onclick = () => { showEditorView(); ui.openDrawer('files', { renderFiles: renderProjectList }); closeNotesModal(); };
    if (mobileTabNav) mobileTabNav.onclick = () => { showEditorView(); ui.openDrawer('nav', { renderNav: renderNavigation }); closeNotesModal(); };
    if (mobileTabMemo) mobileTabMemo.onclick = () => { openNotesModal(); };
    if (mobileTabTheme) mobileTabTheme.onclick = () => { ui.toggleTheme(); };
    if (mobileTabBooks) mobileTabBooks.onclick = () => { ui.closeDrawer(); showBooksView(); };

    const mobileControlsTrigger = document.getElementById("mobileControlsTrigger");
    const mobileControlsClose = document.getElementById("mobileControlsClose");
    if (mobileControlsTrigger) {
        mobileControlsTrigger.onclick = (e) => {
            e.stopPropagation();
            document.body.classList.add("mobile-controls-open");
        };
    }
    if (mobileControlsClose) {
        mobileControlsClose.onclick = (e) => {
            e.stopPropagation();
            document.body.classList.remove("mobile-controls-open");
        };
    }
    document.addEventListener("click", (e) => {
        if (!document.body.classList.contains("mobile-controls-open")) return;
        const controls = document.querySelector(".controls-inner");
        if (controls && !controls.contains(e.target) && !mobileControlsTrigger?.contains(e.target)) {
            document.body.classList.remove("mobile-controls-open");
        }
    });

    const drawerExport = document.getElementById("drawerExport");
    if (drawerExport) drawerExport.onclick = () => document.getElementById("btnSave").click();
    const drawerReader = document.getElementById("drawerReader");
    if (drawerReader) drawerReader.onclick = () => document.getElementById("btnReader").click();
    const drawerXray = document.getElementById("drawerXray");
    if (drawerXray) drawerXray.onclick = () => document.getElementById("btnXray").click();
    const drawerAudio = document.getElementById("drawerAudio");
    if (drawerAudio) drawerAudio.onclick = () => document.getElementById("btnAudio").click();
    const drawerFont = document.getElementById("drawerFont");
    if (drawerFont) drawerFont.onclick = () => document.getElementById("btnFontType").click();
    const drawerLock = document.getElementById("drawerLock");
    if (drawerLock) drawerLock.onclick = () => document.getElementById("btnLock").click();
    const drawerPomodoro = document.getElementById("drawerPomodoro");
    if (drawerPomodoro) drawerPomodoro.onclick = () => ui.togglePomodoro();

    const drawerSearchInput = document.getElementById("drawerSearchInput");
    const drawerSearchGo = document.getElementById("drawerSearchGo");
    const drawerSearchPrev = document.getElementById("drawerSearchPrev");
    const drawerSearchNext = document.getElementById("drawerSearchNext");
    const drawerSearchClear = document.getElementById("drawerSearchClear");
    const mainSearchInput = document.getElementById("search");
    const syncSearch = () => {
        if (drawerSearchInput && mainSearchInput) {
            mainSearchInput.value = drawerSearchInput.value;
        }
    };
    if (drawerSearchInput) {
        drawerSearchInput.addEventListener("input", syncSearch);
        drawerSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                syncSearch();
                document.getElementById("btnSearch").click();
            }
        });
    }
    if (drawerSearchGo) drawerSearchGo.onclick = () => { syncSearch(); document.getElementById("btnSearch").click(); };
    if (drawerSearchPrev) drawerSearchPrev.onclick = () => document.getElementById("btnSearchPrev").click();
    if (drawerSearchNext) drawerSearchNext.onclick = () => document.getElementById("btnSearchNext").click();
    if (drawerSearchClear) drawerSearchClear.onclick = () => { document.getElementById("btnClear").click(); if (drawerSearchInput) drawerSearchInput.value = ""; };


    document.addEventListener('click', (e) => {
        const d = document.getElementById("drawer");
        const h = document.querySelector(".hud");
        if (e.target.closest('#gatekeeper')) return;
        const manifesto = document.getElementById("manifestoModal");
        if (manifesto && manifesto.classList.contains("active") && e.target === manifesto) {
            manifesto.classList.remove("active");
            document.body.classList.remove("manifesto-open");
            return;
        }
        const insideDrawer = e.target.closest("#drawer");
        const insideHud = e.target.closest(".hud");
        if (d.classList.contains("open") && !insideDrawer && !insideHud) ui.closeDrawer();
    });
    const panelArea = document.querySelector(".panel");
    if (panelArea) {
        panelArea.addEventListener("touchstart", () => {
            if (window.innerWidth <= 900) ui.closeDrawer();
        }, { passive: true });
    }

    // Importar/Exportar
    const btnImport = document.getElementById("btnImport");
    const fileInput = document.getElementById("fileInput");
    btnImport.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (file.name.endsWith('.skr') || file.name.endsWith('.skrv')) {
                const payload = importSkrv(evt.target.result);
                if (payload && applySkrvPayload(payload)) {
                    if (window.skrvModal) window.skrvModal.alert(lang.t("alert_capsule_restored"));
                    location.reload();
                } else {
                    if (window.skrvModal) window.skrvModal.alert(lang.t("alert_capsule_invalid"));
                }
            } else if (file.name.endsWith('.b64') || file.name.endsWith('.qr')) {
                const payload = qrTransfer.decodeBackupBase64(evt.target.result);
                if (payload && applySkrvPayload(payload)) {
                    if (window.skrvModal) window.skrvModal.alert(lang.t("alert_backup_restored"));
                    location.reload();
                } else {
                    if (window.skrvModal) window.skrvModal.alert(lang.t("alert_backup_invalid"));
                }
            } else if (file.name.endsWith('.json')) {
                if (store.importData(evt.target.result)) { 
                    if (window.skrvModal) window.skrvModal.alert(lang.t("alert_backup_restored")); 
                    location.reload(); 
                }
            } else {
                store.createProject(file.name, evt.target.result); 
                loadActiveDocument(); renderProjectList(); ui.closeDrawer();
            }
        };
        reader.readAsText(file);
        fileInput.value = ''; 
    };

    document.getElementById("btnSave").onclick = () => document.getElementById("exportModal").classList.add("active");
    document.getElementById("closeModalExport").onclick = () => document.getElementById("exportModal").classList.remove("active");
    const btnFediverse = document.getElementById("btnFediverseHelp");
    if (btnFediverse) {
        btnFediverse.onclick = () => {
            const modal = document.getElementById("fediverseModal");
            if (modal) modal.classList.add("active");
        };
    }
    const closeFediverse = document.getElementById("closeFediverse");
    if (closeFediverse) {
        closeFediverse.onclick = () => {
            const modal = document.getElementById("fediverseModal");
            if (modal) modal.classList.remove("active");
        };
    }
    document.querySelectorAll(".social-link").forEach((btn) => {
        btn.addEventListener("click", () => {
            const shareText = lang.t("share_message");
            const baseUrl = btn.dataset.url || "";
            const network = (btn.dataset.network || "").toLowerCase();
            let targetUrl = baseUrl;
            if (network === "x") {
                targetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            }
            if (targetUrl) window.open(targetUrl, "_blank", "noopener");
        });
    });

    // Downloads e QR
    // Downloads (JSON / TXT / SKRV)
    const btnMd = document.getElementById("actionDownloadMd");
    if (btnMd) {
        btnMd.onclick = () => {
            store.save(
                document.getElementById("editor").innerHTML,
                document.getElementById("memoArea").value
            );
            const markdown = buildMarkdownExport();
            downloadText(markdown, `SKRV_EXPORT_${Date.now()}.md`, "text/markdown");
            document.getElementById("exportModal").classList.remove("active");
        };
    }

    const btnPrintReport = document.getElementById("actionPrintReport");
    if (btnPrintReport) {
        btnPrintReport.onclick = () => {
            store.save(
                document.getElementById("editor").innerHTML,
                document.getElementById("memoArea").value
            );
            const text = buildReportText();
            printRawText(text, ".skr Writer - CÁPSULA");
            document.getElementById("exportModal").classList.remove("active");
        };
    }

    const btnJson = document.getElementById("actionDownloadJson");
    if (btnJson) {
        btnJson.onclick = () => {
            store.save(
                document.getElementById("editor").innerHTML,
                document.getElementById("memoArea").value
            );
            const active = store.getActive && store.getActive();
            const baseName = active && active.name ? active.name : ".skr";
            const safeName = baseName
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .toLowerCase();
            const slug = safeName || "skrv";
            buildSkrvPayloadWithChain(store).then((payload) => {
                downloadText(JSON.stringify(payload, null, 2), `${slug}-${Date.now()}.skrv`, "application/json");
                document.getElementById("exportModal").classList.remove("active");
            });
        };
    }

    // Nota: export .skrv já é o caminho oficial (actionDownloadJson).

    document.getElementById("closeModalHelp").onclick = () => {
        const overlay = document.getElementById("helpModal");
        if (!overlay) return;
        overlay.classList.remove("active");
        const tabs = overlay.querySelectorAll(".help-tab");
        const panels = overlay.querySelectorAll(".help-panel");
        if (tabs.length && panels.length) {
            tabs.forEach(t => t.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            tabs[0].classList.add("active");
            panels[0].classList.add("active");
        }
    };

    // Evento do Botão Lock
    const btnLock = document.getElementById("btnLock");
    if(btnLock) btnLock.onclick = () => auth.lock();

    const btnLangToggle = document.getElementById("btnLangToggle");
    if (btnLangToggle) btnLangToggle.onclick = () => lang.cycleLang();

    // Teclas
    const searchInput = document.getElementById("search");
    const editorEl = document.getElementById("editor");
    
    document.addEventListener("keydown", (e) => {
        const gate = document.getElementById("gatekeeper");
        if (gate && gate.classList.contains("active")) return;
        const onboarding = document.getElementById("onboardingModal");
        if (onboarding && onboarding.classList.contains("active")) return;

        const isCtrl = e.ctrlKey || e.metaKey;
        const key = e.key.toLowerCase();
        if (isCtrl) {
            const textShortcuts = ["a", "c", "x", "v"];
            const browserShortcuts = ["l", "t", "w", "r", "n"];
            if (key === "s") {
                e.preventDefault();
                document.getElementById("btnSave").click();
                return;
            }
            if (textShortcuts.includes(key)) {
                e.preventDefault();
                editorEl.focus();
                if (key === "a") selectAllInEditor(editorEl);
                if (key === "c") document.execCommand("copy");
                if (key === "x") document.execCommand("cut");
                if (key === "v") document.execCommand("paste");
                return;
            }
            if (browserShortcuts.includes(key)) {
                e.preventDefault();
                return;
            }
        }

        if (e.key === "F1") { 
            e.preventDefault(); 
            if (window.totHelpOpen) {
                window.totHelpOpen();
            } else {
                document.getElementById("helpModal").classList.add("active");
            }
        } 
        
        if ((e.ctrlKey && e.shiftKey && e.code === "KeyF") || e.key === "F11") { e.preventDefault(); editorFeatures.toggleFullscreen(); }
        if (e.key === "Enter" && document.activeElement === searchInput) document.getElementById("btnSearch").click();
        if (e.ctrlKey && e.key === "f") { e.preventDefault(); searchInput.focus(); }

        if (e.key === "Escape") {
            const termsModal = document.getElementById("termsModal");
            if (termsModal && termsModal.classList.contains("active")) {
                auth.closeTermsModal(true);
                return;
            }
            const notesModal = document.getElementById("notesModal");
            if (notesModal && notesModal.classList.contains("active")) {
                const overlay = document.getElementById("notesOverlay");
                if (overlay && overlay.classList.contains("active")) {
                    overlay.classList.remove("active");
                    overlay.setAttribute("aria-hidden", "true");
                    return;
                }
                if (notesState.stage === "edit") {
                    setNotesStage("list");
                } else {
                    closeNotesModal();
                }
                return;
            }
            const systemModal = document.getElementById("systemModal");
            if (systemModal && systemModal.classList.contains("active") && window.skrvModal?.cancel) {
                window.skrvModal.cancel();
                return;
            }
            const manifestoModal = document.getElementById("manifestoModal");
            if (manifestoModal && manifestoModal.classList.contains("active")) {
                manifestoModal.classList.remove("active");
                document.body.classList.remove("manifesto-open");
                return;
            }
            const onboarding = document.getElementById("onboardingModal");
            if (onboarding && onboarding.classList.contains("active")) {
                return;
            }
            if (document.activeElement === searchInput) { document.getElementById("btnClear").click(); searchInput.blur(); }
            let closed = false;
            document.querySelectorAll(".modal-overlay.active").forEach(m => { 
                if (m.id !== "gatekeeper" && m.id !== "pomodoroModal" && m.id !== "termsModal") {
                    m.classList.remove("active"); 
                    if(m.id==="resetModal") {
                        document.getElementById("step2Reset").style.display="none"; 
                        document.getElementById("resetPassInput").value = "";
                        document.getElementById("resetMsg").innerText = "";
                    }
                    closed=true; 
                }
            });
            if(document.getElementById("drawer").classList.contains("open")) { ui.closeDrawer(); closed=true; }
            if(closed) editorEl.focus();
        }

        if (e.altKey) {
            if (e.key === "1") { e.preventDefault(); ui.openDrawer('files', { renderFiles: renderProjectList }); }
            if (e.key === "2") { e.preventDefault(); ui.openDrawer('nav', { renderNav: renderNavigation }); }
            if (e.key === "3") { e.preventDefault(); ui.openDrawer('memo', {}); }
            if (e.key === "0") { e.preventDefault(); ui.closeDrawer(); }
            if (e.code === "KeyL") { e.preventDefault(); auth.lock(); }
            if (e.code === "KeyT" && e.shiftKey) {
                e.preventDefault();
                templateState.open = !templateState.open;
                if (!templateState.open) templateState.minimized = false;
                applyTemplateLayout();
            }
            if (e.code === "KeyT" && !e.shiftKey) { e.preventDefault(); ui.toggleTheme(); }
            if (e.code === "KeyM") { e.preventDefault(); document.getElementById("btnAudio").click(); }
            if (e.code === "KeyP") { e.preventDefault(); ui.togglePomodoro(); }
            if (e.code === "KeyF") { e.preventDefault(); document.getElementById("btnFontType").click(); }
        }

        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') { e.preventDefault(); document.getElementById("btnSave").click(); }
            if (e.key === 'o') { e.preventDefault(); document.getElementById("fileInput").click(); }
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            const activeTag = document.activeElement.tagName.toLowerCase();
            if (activeTag !== 'input' && activeTag !== 'textarea' && document.activeElement !== editorEl) {
                e.preventDefault(); editorEl.focus();   
                const activeDoc = store.getActive();
                if(activeDoc && activeDoc.cursorPos) editorFeatures.setCursorPos(activeDoc.cursorPos);
                document.execCommand("insertText", false, e.key);
                editorFeatures.playSound('type');
                editorFeatures.triggerFocusMode();
            }
        }
    });

    const btnInsert = document.getElementById("btnInsertChapter");
    if (btnInsert) btnInsert.onclick = () => { editorFeatures.insertChapter(); ui.openDrawer('nav', { renderNav: renderNavigation }); };
    const btnVerifyTot = document.getElementById("btnVerifyTot");
    if (btnVerifyTot) btnVerifyTot.onclick = () => { ui.closeDrawer(); showVerifyView(); };

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (overlay.id === "gatekeeper" || overlay.id === "pomodoroModal" || overlay.id === "termsModal" || overlay.id === "manifestoModal" || overlay.id === "onboardingModal") return;
            if (overlay.id === "systemModal") {
                if (e.target === overlay && window.skrvModal?.cancel) window.skrvModal.cancel();
                return;
            }
            if (e.target === overlay) {
                overlay.classList.remove("active");
                if(overlay.id === "resetModal") {
                     document.getElementById("step2Reset").style.display = "none";
                     document.getElementById("btnConfirmReset1").style.display = "none";
                     document.getElementById("step0Reset").style.display = "block";
                     document.getElementById("resetPassInput").value = "";
                     document.getElementById("resetMsg").innerText = "";
                     document.getElementById("resetProofInput").value = "";
                     document.getElementById("resetProofMsg").innerText = "";
                }
            }
        });
    });

    document.getElementById("btnNewProject").onclick = () => createSimpleProject();

    const btnMobileNewProject = document.getElementById("btnMobileNewProject");
    if (btnMobileNewProject) {
        btnMobileNewProject.onclick = () => createSimpleProject();
    }
    
    document.getElementById("btnThemeToggle").onclick = () => ui.toggleTheme();
    document.getElementById("hudFs").onclick = () => editorFeatures.toggleFullscreen();
    
    // --- LÓGICA DA CAVEIRA (Reset Interno) ---
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

    let currentProofWord = "";

    const generateProofWord = () => {
        const text = document.getElementById("editor").innerText || "";
        const words = text.split(/\s+/).map(w => w.trim()).filter(w => w.length >= 4);
        if (words.length === 0) return "";
        return words[Math.floor(Math.random() * words.length)];
    };

    document.getElementById("btnHardReset").onclick = () => {
        resetModal.classList.add("active");
        if (step2) step2.style.display = "none";
        if (btnStep1) btnStep1.style.display = "none";
        if (step0) step0.style.display = "block";
        if (proofInput) proofInput.value = "";
        if (proofMsg) proofMsg.innerText = "";
        if(passInput) passInput.value = "";
        if(msg) msg.innerText = "";
        currentProofWord = generateProofWord();
        if (proofWordEl) proofWordEl.innerText = currentProofWord ? `"${currentProofWord}"` : "[SEM CONTEÚDO]";
        setTimeout(() => { if (proofInput) proofInput.focus(); }, 50);
    };
    
    document.getElementById("closeModalReset").onclick = () => resetModal.classList.remove("active");
    
    if (btnProof) {
        btnProof.onclick = () => {
            const expected = (currentProofWord || "").toLowerCase();
            const got = (proofInput ? proofInput.value : "").trim().toLowerCase();
            if (!expected) {
                if (proofMsg) proofMsg.innerText = lang.t("reset_no_text");
                if (btnStep1) btnStep1.style.display = "block";
                if (step0) step0.style.display = "none";
                return;
            }
            if (got === expected) {
                if (proofMsg) proofMsg.innerText = lang.t("reset_proof_ok");
                if (btnStep1) btnStep1.style.display = "block";
                if (step0) step0.style.display = "none";
                btnStep1.focus();
            } else {
                if (proofMsg) proofMsg.innerText = lang.t("reset_proof_fail");
                if (proofInput) {
                    proofInput.value = "";
                    proofInput.focus();
                    proofInput.classList.add('shake');
                    setTimeout(() => proofInput.classList.remove('shake'), 500);
                }
            }
        };
    }
    if (proofInput) {
        proofInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btnProof?.click();
            }
        });
    }

    if (btnStep1) {
        btnStep1.onclick = () => {
            if (step2) step2.style.display = "block";
            setTimeout(() => { if(passInput) passInput.focus(); }, 100);
        };
    }
    if (btnStep1) {
        btnStep1.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                btnStep1.click();
            }
        });
    }
    
    const triggerReset = () => {
        const storedKey = localStorage.getItem('lit_auth_key');
        const inputVal = passInput ? passInput.value : "";
        
        if (!storedKey || inputVal === storedKey) {
            if(msg) msg.innerText = lang.t("reset_executing");
            setTimeout(() => store.hardReset(), 500); 
        } else {
            if(msg) msg.innerText = lang.t("reset_denied");
            if(passInput) {
                passInput.value = "";
                passInput.focus();
                passInput.classList.add('shake');
                setTimeout(() => passInput.classList.remove('shake'), 500);
            }
        }
    };

    document.getElementById("btnConfirmReset2").onclick = triggerReset;
    
    if(passInput) {
        passInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") triggerReset();
        });
    }

    editorEl.addEventListener("input", () => {
        const cursorPos = editorFeatures.getCursorPos();
        store.save(editorEl.innerHTML, document.getElementById("memoArea").value, cursorPos);
        if (window.innerWidth <= 900) {
            document.body.classList.add("mobile-typing");
            clearTimeout(window.__mobileTypingTimer);
            window.__mobileTypingTimer = setTimeout(() => {
                document.body.classList.remove("mobile-typing");
            }, 800);
        }
    });
    
    editorEl.addEventListener("keyup", () => store.save(undefined, undefined, editorFeatures.getCursorPos()));
    editorEl.addEventListener("click", () => store.save(undefined, undefined, editorFeatures.getCursorPos()));
    
    document.getElementById("memoArea").addEventListener("input", (e) => store.save(undefined, e.target.value));

    const panelEl = document.querySelector(".panel");
    if (panelEl) {
        panelEl.addEventListener("scroll", () => {
            const active = store.getActive();
            const key = (active && active.id) ? `lit_ui_editor_scroll_${active.id}` : "lit_ui_editor_scroll";
            localStorage.setItem(key, panelEl.scrollTop.toString());
        });
    }

    restoreUiState(showEditorView, showBooksView);

    const mobileThemeBtn = document.getElementById("btnMobileTheme");
    if (mobileThemeBtn) {
        mobileThemeBtn.onclick = () => {
            if (window.innerWidth <= 900 && !window.skrvMobileRenderProjects) {
                ensureMobileModule().catch(() => {});
            }
            ui.toggleTheme();
        };
    }
}

// Funções auxiliares mantidas iguais
function restoreUiState(showEditorView, showBooksView) {
    const view = localStorage.getItem("lit_ui_view");
    if (view === "books") {
        showBooksView();
    } else if (view === "editor") {
        showEditorView();
    }

    const drawerOpen = localStorage.getItem("lit_ui_drawer_open") === "true";
    const panel = localStorage.getItem("lit_ui_drawer_panel");
    const callbacks = {
        files: { renderFiles: renderProjectList },
        nav: { renderNav: renderNavigation },
        memo: {}
    };

    if (drawerOpen && callbacks[panel]) {
        ui.openDrawer(panel, callbacks[panel]);
    }
    const isMobile = window.innerWidth <= 900;
    const mobileBooted = localStorage.getItem("lit_mobile_booted") === "true";
    if (isMobile && !drawerOpen && !mobileBooted) {
        ui.openDrawer("notes", {});
        localStorage.setItem("lit_mobile_booted", "true");
    }
}

function restoreEditorScroll() {
    const panelEl = document.querySelector(".panel");
    if (!panelEl) return;
    const active = store.getActive();
    const key = (active && active.id) ? `lit_ui_editor_scroll_${active.id}` : "lit_ui_editor_scroll";
    let stored = parseInt(localStorage.getItem(key), 10);
    if (!Number.isFinite(stored) && key !== "lit_ui_editor_scroll") {
        stored = parseInt(localStorage.getItem("lit_ui_editor_scroll"), 10);
    }
    if (Number.isFinite(stored)) {
        setTimeout(() => { panelEl.scrollTop = stored; }, 0);
    }
}

function incrementAccessCount() {
    const key = "skrv_access_count";
    const legacyKey = "tot_access_count";
    const current = parseInt(localStorage.getItem(key) || localStorage.getItem(legacyKey), 10) || 0;
    localStorage.setItem(key, String(current + 1));
}


function applySkrvPayload(payload) {
    const archive = payload.ARCHIVE_STATE;
    if (!archive) return false;
    if (!Array.isArray(archive.projects)) {
        archive.projects = [];
    }
    if (!archive.projects.length) {
        const fallbackName = lang.t("default_project") || "Projeto";
        archive.projects.push({
            id: Date.now().toString(),
            name: fallbackName,
            content: payload.MASTER_TEXT || "",
            date: new Date().toLocaleString(),
            cursorPos: 0
        });
        archive.activeId = archive.projects[0].id;
    } else {
        archive.projects.forEach((proj) => {
            if (!proj.name) {
                proj.name = lang.t("default_project") || "Projeto";
            }
        });
        if (!archive.activeId) {
            archive.activeId = archive.projects[0].id;
        }
    }

    const previousMemo = store.data && typeof store.data.memo === "string" ? store.data.memo : "";
    store.data = archive;
    if (!Object.prototype.hasOwnProperty.call(archive, "memo")) {
        store.data.memo = previousMemo;
    } else if (store.data.memo === undefined || store.data.memo === null) {
        store.data.memo = "";
    }
    store.persist(true);

    const cfg = payload.SESSION_CONFIG || {};
    if (cfg.theme) localStorage.setItem("lit_theme_pref", cfg.theme);
    if (cfg.fontIndex !== undefined) localStorage.setItem("lit_pref_font", cfg.fontIndex);
    if (cfg.fontSize) localStorage.setItem("lit_pref_font_size", cfg.fontSize);
    if (cfg.lang) localStorage.setItem("lit_lang", cfg.lang);

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key === "skrvbook_registry" || key === "totbook_registry" || key.startsWith("pages_") || key.startsWith("pos_") || key.startsWith("title_") || key.startsWith("color_")) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    const workbench = payload.WORKBENCH_STATE || {};
    if (Array.isArray(workbench.registry)) {
        localStorage.setItem("skrvbook_registry", JSON.stringify(workbench.registry));
    }
    Object.entries(workbench.pages || {}).forEach(([k, v]) => localStorage.setItem(k, v));
    Object.entries(workbench.positions || {}).forEach(([k, v]) => localStorage.setItem(k, v));
    Object.entries(workbench.titles || {}).forEach(([k, v]) => localStorage.setItem(k, v));
    Object.entries(workbench.colors || {}).forEach(([k, v]) => localStorage.setItem(k, v));

    return true;
}

function restoreCursorPos(pos) {
    const attempt = () => editorFeatures.setCursorPos(pos);
    setTimeout(attempt, 0);
    setTimeout(attempt, 120);
}

function selectAllInEditor(editorEl) {
    if (!editorEl) return;
    const range = document.createRange();
    range.selectNodeContents(editorEl);
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
}

function htmlToText(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.innerText || "";
}

function htmlToMarkdown(html) {
    const container = document.createElement("div");
    container.innerHTML = html || "";

    const nodeToMd = (node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
        if (node.nodeType !== Node.ELEMENT_NODE) return "";
        const tag = node.tagName.toLowerCase();
        const childText = Array.from(node.childNodes).map(nodeToMd).join("");

        switch (tag) {
            case "br":
                return "\n";
            case "strong":
            case "b":
                return `**${childText}**`;
            case "em":
            case "i":
                return `*${childText}*`;
            case "h1":
                return `\n\n# ${childText}\n\n`;
            case "h2":
                return `\n\n## ${childText}\n\n`;
            case "h3":
                return `\n\n### ${childText}\n\n`;
            case "li":
                return `${childText}\n`;
            case "ul":
                return `\n${Array.from(node.children).map(li => `- ${nodeToMd(li)}`).join("")}\n`;
            case "ol":
                return `\n${Array.from(node.children).map((li, idx) => `${idx + 1}. ${nodeToMd(li)}`).join("")}\n`;
            case "p":
            case "div":
                return `\n\n${childText}\n\n`;
            default:
                return childText;
        }
    };

    const raw = Array.from(container.childNodes).map(nodeToMd).join("");
    return raw.replace(/\n{3,}/g, "\n\n").trim();
}

function downloadText(text, filename, mime) {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function buildMarkdownExport() {
    const projects = Array.isArray(store.data.projects) ? store.data.projects : [];
    const blocks = [];
    blocks.push("# .skr Writer Export\n");
    blocks.push(`_Gerado em ${new Date().toISOString()}_\n`);
    const manifestText = localStorage.getItem("skrv_manifest_text") || localStorage.getItem("tot_manifest_text");
    const manifestSignedAt = localStorage.getItem("skrv_manifest_signed_at") || localStorage.getItem("tot_manifest_signed_at");
    const accessCount = localStorage.getItem("skrv_access_count") || localStorage.getItem("tot_access_count");
    if (manifestText) {
        blocks.push("\n## Manifesto Assinado\n");
        if (manifestSignedAt) blocks.push(`Assinado em: ${manifestSignedAt}\n`);
        if (accessCount) blocks.push(`Acessos locais: ${accessCount}\n`);
        blocks.push("\n" + manifestText + "\n");
    }

    projects.forEach((proj, idx) => {
        const title = proj.name || `DOC ${idx + 1}`;
        const md = htmlToMarkdown(proj.content || "");
        blocks.push(`\n## ${title}\n`);
        blocks.push(md || "_(vazio)_");
        if (proj.mobileNote) {
            blocks.push(`\n### Nota do projeto\n`);
            blocks.push(proj.mobileNote);
        }
    });

    if (Array.isArray(store.data.mobileNotes) && store.data.mobileNotes.length) {
        blocks.push(`\n## Notas (mobile)\n`);
        store.data.mobileNotes.forEach((note, idx) => {
            const title = note.title ? note.title : `Nota ${idx + 1}`;
            const date = note.updatedAt || note.createdAt || "";
            const folder = note.folder ? `Pasta: ${note.folder}` : "";
            const tags = (note.tags || []).length ? `Tags: ${(note.tags || []).map(t => `#${t}`).join(" ")}` : "";
            blocks.push(`\n### ${title}\n`);
            if (date) blocks.push(`_${new Date(date).toLocaleString()}_\n`);
            if (folder) blocks.push(folder);
            if (tags) blocks.push(tags);
            blocks.push("\n" + (note.text || ""));
        });
    }

    const registryRaw = localStorage.getItem("skrvbook_registry") || localStorage.getItem("totbook_registry");
    let registry = [];
    try { registry = JSON.parse(registryRaw || "[]"); } catch (_) { registry = []; }
    if (registry.length) {
        blocks.push("\n## .skrBooks\n");
        registry.forEach((entry, idx) => {
            const id = typeof entry === "string" ? entry : entry.id;
            if (!id) return;
            const title = localStorage.getItem(`title_${id}`) || `.skrBook ${idx + 1}`;
            blocks.push(`\n### ${title}\n`);
            let pages = [];
            try { pages = JSON.parse(localStorage.getItem(`pages_${id}`) || "[]"); } catch (_) { pages = []; }
            if (!pages.length) {
                blocks.push("_(sem paginas)_");
                return;
            }
            pages.forEach((page, pageIdx) => {
                blocks.push(`\n#### Pagina ${pageIdx + 1}\n`);
                blocks.push(htmlToMarkdown(page || "") || "_(vazio)_");
            });
        });
    }

    return blocks.join("\n").trim() + "\n";
}

function buildReportText() {
    const projects = Array.isArray(store.data.projects) ? store.data.projects : [];
    const blocks = projects.map((proj, idx) => {
        const title = proj.name || `DOC ${idx + 1}`;
        const text = htmlToText(proj.content || "");
        let out = `=== ${title} ===\n\n${text}`;
        if (proj.mobileNote) {
            out += `\n\n--- NOTA DO PROJETO ---\n\n${proj.mobileNote}`;
        }
        return out;
    });
    if (Array.isArray(store.data.mobileNotes) && store.data.mobileNotes.length) {
        blocks.push("=== NOTAS (MOBILE) ===");
        store.data.mobileNotes.forEach((note, idx) => {
            const title = note.title ? note.title : `Nota ${idx + 1}`;
            const date = note.updatedAt || note.createdAt || "";
            const folder = note.folder ? `Pasta: ${note.folder}` : "";
            const tags = (note.tags || []).length ? `Tags: ${(note.tags || []).map(t => `#${t}`).join(" ")}` : "";
            blocks.push(`\n--- ${title} ---`);
            if (date) blocks.push(`${new Date(date).toLocaleString()}`);
            if (folder) blocks.push(folder);
            if (tags) blocks.push(tags);
            blocks.push(`\n${note.text || ""}`);
        });
    }
    const registryRaw = localStorage.getItem("skrvbook_registry") || localStorage.getItem("totbook_registry");
    let registry = [];
    try { registry = JSON.parse(registryRaw || "[]"); } catch (_) { registry = []; }
    if (registry.length) {
        blocks.push("=== .skrBooks ===");
        registry.forEach((entry, idx) => {
            const id = typeof entry === "string" ? entry : entry.id;
            if (!id) return;
            const title = localStorage.getItem(`title_${id}`) || `.skrBook ${idx + 1}`;
            blocks.push(`\n--- ${title} ---`);
            let pages = [];
            try { pages = JSON.parse(localStorage.getItem(`pages_${id}`) || "[]"); } catch (_) { pages = []; }
            if (!pages.length) {
                blocks.push("(sem paginas)");
                return;
            }
            pages.forEach((page, pageIdx) => {
                const text = htmlToText(page || "");
                blocks.push(`\n[Pagina ${pageIdx + 1}]\n${text}`);
            });
        });
    }
    return blocks.join("\n\n");
}

function buildProjectReportText(project) {
    if (!project) return "";
    const title = project.name || "DOC";
    const text = htmlToText(project.content || "");
    let out = `=== ${title} ===\n\n${text}`;
    if (project.mobileNote) {
        out += `\n\n--- NOTA DO PROJETO ---\n\n${project.mobileNote}`;
    }
    return out;
}

// Exposição mínima para módulo mobile (carregamento condicional)
window.skrvLoadActiveDocument = loadActiveDocument;
window.skrvRenderProjectList = renderProjectList;

function printRawText(text, title) {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
        if (window.skrvModal && typeof window.skrvModal.alert === "function") {
            window.skrvModal.alert(lang.t("print_popup_blocked"));
        } else {
            alert(lang.t("print_popup_blocked"));
        }
        return;
    }
    const doc = w.document;
    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; color: #000; background: #fff; margin: 32px; }
pre { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
</style>
</head>
<body>
<pre>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`);
    doc.close();
    w.focus();
    w.onload = () => {
        try { w.print(); } catch (_) {}
    };
}
function initHelpTabs() {
    const tabs = document.querySelectorAll('.help-tab');
    const panels = document.querySelectorAll('.help-panel');
    const helpModal = document.querySelector(".help-modal");
    const sizeHelpModal = () => {
        if (!helpModal) return;
        const panel = helpModal.querySelector(".help-panel.active");
        if (!panel) return;
        const header = helpModal.querySelector(".modal-header");
        const tabsRow = helpModal.querySelector(".help-tabs-container");
        const padding = 24;
        const panelHeight = panel.scrollHeight;
        const base = (header?.offsetHeight || 0) + (tabsRow?.offsetHeight || 0) + padding;
        helpModal.style.height = `${Math.min(520, panelHeight + base)}px`;
    };
    const openHelpModal = () => {
        const overlay = document.getElementById("helpModal");
        if (!overlay) return;
        overlay.classList.add("active");
        if (!tabs.length || !panels.length) return;
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        tabs[0].classList.add("active");
        panels[0].classList.add("active");
        const activeTab = tabs[0];
        sizeHelpModal();
        setTimeout(() => {
            if (activeTab) activeTab.focus();
        }, 50);
    };
    window.totHelpOpen = openHelpModal;

    tabs.forEach((tab, index) => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const panel = document.getElementById(targetId);
            panel.classList.add('active');
            sizeHelpModal();
        };
        tab.addEventListener('keydown', (e) => {
            let targetIndex = null;
            if (e.key === 'ArrowRight') targetIndex = index + 1;
            if (e.key === 'ArrowLeft') targetIndex = index - 1;
            if (targetIndex !== null) {
                if (targetIndex < 0) targetIndex = tabs.length - 1;
                if (targetIndex >= tabs.length) targetIndex = 0;
                tabs[targetIndex].focus(); tabs[targetIndex].click(); 
            }
        });
    });
    sizeHelpModal();
}

function setupCopyGuard(editorEl) {
    if (!editorEl) return;
    // Copy/cut are allowed; paste is already blocked elsewhere.
    // Keep this hook for future policy changes.
}

function renderProjectList() {
    const list = document.getElementById("projectList");
    list.innerHTML = "";
    store.data.projects.forEach(proj => {
        const div = document.createElement("div");
        div.className = `list-item ${proj.id === store.data.activeId ? 'active' : ''}`;
        div.style.display = "flex"; div.style.alignItems = "center"; div.style.justifyContent = "space-between"; div.style.gap = "10px";

        const infoDiv = document.createElement("div");
        infoDiv.style.flex = "1"; infoDiv.style.cursor = "pointer";
        infoDiv.innerHTML = `<div class="file-name-display">${proj.name}</div><div class="list-item-meta">${proj.date.split(',')[0]}</div>`;
        infoDiv.onclick = (e) => {
            e.stopPropagation();
            if (window.innerWidth <= 900) {
                store.setActive(proj.id);
                renderProjectList();
                const run = () => {
                    if (window.skrvMobileOpenProjectNote) {
                        window.skrvMobileOpenProjectNote(proj);
                    }
                };
                if (!window.skrvMobileOpenProjectNote) {
                    ensureMobileModule().then(run).catch(() => {});
                } else {
                    run();
                }
                if (sessionStorage.getItem("mobile_project_hint") !== "1") {
                    if (window.skrvModal) window.skrvModal.alert(lang.t("mobile_project_hint"));
                    sessionStorage.setItem("mobile_project_hint", "1");
                }
                return;
            }
            store.setActive(proj.id);
            loadActiveDocument();
            renderProjectList();
        };

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "file-actions-inline"; actionsDiv.style.display = "flex"; actionsDiv.style.gap = "5px";

        const btnEdit = document.createElement("button");
        btnEdit.className = "btn-icon-small"; btnEdit.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'><path d='M13 21h8'/><path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/></svg>";
        btnEdit.onclick = (e) => { e.stopPropagation(); enableInlineRename(infoDiv, proj.id, proj.name); };

        const btnPrint = document.createElement("button");
        btnPrint.className = "btn-icon-small"; btnPrint.innerHTML = "<img class='icon' src='src/assets/icons/printer.svg' alt='' aria-hidden='true'>";
        btnPrint.onclick = (e) => {
            e.stopPropagation();
            const text = buildProjectReportText(proj);
            printRawText(text, `.skr Writer - ${proj.name || "Documento"}`);
        };

        const btnDel = document.createElement("button");
        btnDel.className = "btn-icon-small danger"; btnDel.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'><use href='src/assets/icons/phosphor-sprite.svg#icon-trash'></use></svg>";
        btnDel.onclick = async (e) => {
            e.stopPropagation();
            if (!window.skrvModal) return;
            const ok = await window.skrvModal.confirm(`${lang.t("project_delete_confirm")} "${proj.name}"?`);
            if (ok) {
                store.deleteProject(proj.id);
                renderProjectList();
                if (store.data.projects.length > 0) loadActiveDocument();
            }
        };

        actionsDiv.appendChild(btnEdit); actionsDiv.appendChild(btnPrint); actionsDiv.appendChild(btnDel);
        div.appendChild(infoDiv); div.appendChild(actionsDiv);
        list.appendChild(div);
    });
    if (document.getElementById("mobileProjectList") && window.skrvMobileRenderProjects) {
        window.skrvMobileRenderProjects();
    }
}

function enableInlineRename(container, id, currentName) {
    container.onclick = null;
    container.innerHTML = `<input type="text" class="inline-rename-input" value="${currentName}">`;
    const input = container.querySelector("input"); input.focus();
    const save = () => { if(input.value.trim()) { store.renameProject(id, input.value); } renderProjectList(); };
    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => { if(e.key === "Enter") input.blur(); });
}

function renderNavigation() {
    const list = document.getElementById("chapterList"); list.innerHTML = "";
    const headers = document.getElementById("editor").querySelectorAll("h1, h2, .chapter-mark");
    if (headers.length === 0) {
        const emptyHint = lang.t("nav_empty_hint");
        const showHint = emptyHint && emptyHint !== "nav_empty_hint";
        list.innerHTML = showHint ? `<div class='help-text'>${emptyHint}</div>` : "";
        return;
    }
    headers.forEach((header, index) => {
        const div = document.createElement("div"); div.className = "list-item"; div.style.justifyContent = "space-between"; div.style.display = "flex"; div.style.alignItems = "center";
        const label = document.createElement("div");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "8px";
        label.style.flex = "1";
        label.innerHTML = `<svg class=\"icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><use href=\"src/assets/icons/phosphor-sprite.svg#icon-caret-right\"></use></svg> ${header.innerText || "Capítulo " + (index+1)}`;
        label.onclick = () => {
            header.scrollIntoView({ behavior: "smooth", block: "center" });
            const sel = window.getSelection();
            if (sel) {
                const range = document.createRange();
                range.selectNodeContents(header);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            editorFeatures.editor.focus();
            editorFeatures.triggerFocusMode();
            editorFeatures.scheduleFocusBlockUpdate();
        };

        const actions = document.createElement("div");
        actions.className = "file-actions-inline";
        actions.style.display = "flex";
        actions.style.gap = "6px";
        const btnDel = document.createElement("button");
        btnDel.className = "btn-icon-small danger";
        btnDel.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'><use href='src/assets/icons/phosphor-sprite.svg#icon-trash'></use></svg>";
        btnDel.onclick = async (e) => {
            e.stopPropagation();
            const label = header.innerText || `Capítulo ${index + 1}`;
            if (!window.skrvModal) return;
            const ok = await window.skrvModal.confirm(`${lang.t("nav_delete_confirm")} "${label}"?`);
            if (ok) {
                header.remove();
                renderNavigation();
            }
        };
        actions.appendChild(btnDel);

        div.appendChild(label);
        div.appendChild(actions);
        list.appendChild(div);
    });
}
