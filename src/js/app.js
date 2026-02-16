/* * .skv Writer - CORE MODULE
 * Fixes: Memo persistence bug (Ghost Data)
 */

import { store } from './modules/store.js';
import { ui } from './modules/ui.js';
import { editorFeatures } from './modules/editor.js';
import { lang } from './modules/lang.js';
import { auth } from './modules/auth.js';
import { exportSkrv, importSkrv, buildSkrvPayloadWithChain } from './modules/export_skrv.js';
import { birthTracker } from './modules/birth_tracker.js';
import { processTracker } from './modules/process_tracker.js';
import { qrTransfer } from './modules/qr_transfer.js';
import { createCtrlGuardHandler, createAltShortcutHandler, createTypingRedirectHandler, createEscapeHandler } from './modules/keyboard.js';
import { setupModalFocusTrap, createBootModalBlocker, createOverlayBackdropHandler } from './modules/modal_accessibility.js';
import { setupResetFlow } from './modules/reset_flow.js';
import { setupPersistenceBindings } from './modules/persistence_bindings.js';
import { copyToClipboard, bindCopyTargets } from './modules/clipboard.js';
import { setNextLangButtonLabel } from './modules/lang_ui.js';
import { setModalActive } from './modules/modal_state.js';


const BOOK_TEMPLATE = [
    {
        key: "capa",
        title: "Capa",
        body: "A capa apresenta o livro ao leitor.\n\nAqui entram o título, o subtítulo (se houver)\ne o nome do autor.\n\nA capa não explica o conteúdo.\nEla anuncia que o livro existe."
    },
    {
        key: "folha-rosto",
        title: "Folha de rosto",
        body: "A folha de rosto identifica formalmente a obra.\n\nCostuma repetir o título e o nome do autor\ne pode incluir editora, local e ano.\n\nÉ a primeira página oficial do livro."
    },
    {
        key: "ficha-catalografica",
        title: "Ficha catalográfica",
        body: "A ficha catalográfica organiza os dados técnicos do livro.\n\nEla é usada por bibliotecas, editoras e universidades.\n\nNormalmente é preparada depois do texto pronto."
    },
    {
        key: "dedicatoria",
        title: "Dedicatória",
        body: "A dedicatória é um espaço pessoal.\n\nPode ser breve, direta ou simbólica.\n\nNão precisa explicar nada além do gesto."
    },
    {
        key: "epigrafe",
        title: "Epígrafe",
        body: "A epígrafe é uma citação que dialoga com o livro.\n\nEla não resume nem antecipa.\n\nFunciona como um tom inicial."
    },
    {
        key: "sumario",
        title: "Sumário",
        body: "O sumário organiza a leitura.\n\nEle mostra a estrutura do livro\ne a ordem dos capítulos.\n\nGeralmente é ajustado após o texto final."
    },
    {
        key: "introducao",
        title: "Introdução",
        body: "A introdução prepara o leitor.\n\nAqui você apresenta o tema, o recorte\ne o caminho que o livro percorre.\n\nNão é o desenvolvimento do argumento.\nÉ a entrada."
    },
    {
        key: "capitulo-1",
        title: "Capítulo 1 (modelo)",
        body: "Um capítulo desenvolve uma ideia completa,\numa etapa do argumento ou uma parte da narrativa.\n\nEle se sustenta sozinho,\nmas faz sentido dentro do conjunto.\n\n(Capítulos seguintes reutilizam este texto)"
    },
    {
        key: "conclusao",
        title: "Conclusão",
        body: "A conclusão retoma o percurso do livro.\n\nAqui você pode fechar argumentos,\napontar consequências\nou abrir novas questões.\n\nConcluir não é repetir.\nÉ dar forma ao que ficou."
    },
    {
        key: "agradecimentos",
        title: "Agradecimentos",
        body: "Espaço para reconhecer pessoas e apoios\nque participaram do processo do livro.\n\nCostuma ser breve e direto."
    },
    {
        key: "notas",
        title: "Notas",
        body: "As notas complementam o texto principal.\n\nServem para esclarecimentos,\nreferências pontuais\nou comentários laterais."
    },
    {
        key: "referencias",
        title: "Referências",
        body: "Lista das obras citadas ou consultadas.\n\nPode seguir normas acadêmicas,\ndependendo do tipo de livro."
    },
    {
        key: "quarta-capa",
        title: "Quarta capa",
        body: "A quarta capa conversa com o leitor antes da leitura.\n\nPode conter um texto curto sobre o livro,\num trecho destacado\nou informações sobre o autor.\n\nÉ o último contato antes da abertura."
    }
];

const BOOK_TEMPLATE_FICTION = [
    {
        key: "capa",
        title: "Capa",
        body: "A capa é o primeiro contato com a história.\n\nEla não conta o enredo.\nSugere um mundo, um clima, uma promessa.\n\nÀs vezes, basta um título que não explica tudo."
    },
    {
        key: "folha-rosto",
        title: "Folha de rosto",
        body: "Aqui a história se apresenta formalmente.\n\nTítulo, autor, e o livro assume sua forma.\n\nÉ o ponto em que a ficção vira objeto."
    },
    {
        key: "dedicatoria",
        title: "Dedicatória (opcional)",
        body: "A dedicatória é um gesto silencioso.\n\nPode ser íntima, simbólica ou enigmática.\n\nNão precisa ser entendida por todos."
    },
    {
        key: "epigrafe",
        title: "Epígrafe (opcional)",
        body: "Uma frase antes da história começar.\n\nNão resume.\nNão antecipa.\n\nApenas inclina o leitor na direção certa."
    },
    {
        key: "sumario",
        title: "Sumário",
        body: "O sumário mostra o ritmo do livro.\n\nCapítulos curtos, longos,\ntítulos nomeados ou numerados.\n\nEle já conta algo sobre a narrativa."
    },
    {
        key: "prologo",
        title: "Prólogo (opcional)",
        body: "O prólogo acontece antes da história,\nmas não necessariamente antes do tempo.\n\nPode apresentar um evento,\num tom ou uma pergunta.\n\nNem todo livro precisa de um."
    },
    {
        key: "capitulo-1",
        title: "Capítulo 1 (modelo)",
        body: "Um capítulo é uma unidade de movimento.\n\nPode conter uma cena,\num conflito,\numa mudança.\n\nAlgo precisa sair diferente do que entrou.\n\n(Capítulos seguintes reutilizam este placeholder)"
    },
    {
        key: "interludio",
        title: "Interlúdio (opcional)",
        body: "Um interlúdio interrompe o fluxo.\n\nPode mudar de voz,\nde tempo,\nou de perspectiva.\n\nServe para respirar — ou tensionar."
    },
    {
        key: "climax",
        title: "Clímax",
        body: "Aqui a história atinge seu ponto máximo.\n\nO conflito central se resolve,\nou se transforma definitivamente.\n\nNão é o fim.\nÉ o ponto sem retorno."
    },
    {
        key: "desfecho",
        title: "Desfecho",
        body: "O desfecho mostra o que ficou depois.\n\nNão precisa explicar tudo.\n\nÀs vezes, basta deixar o leitor\nsozinho com as consequências."
    },
    {
        key: "agradecimentos",
        title: "Agradecimentos (opcional)",
        body: "Espaço para reconhecer quem acompanhou\no processo de escrita.\n\nLeitores, escutas, apoios invisíveis."
    },
    {
        key: "nota-autor",
        title: "Nota do autor (opcional)",
        body: "Aqui o autor pode falar diretamente.\n\nSobre o processo,\no contexto,\nou o que ficou fora da história.\n\nNão é parte da ficção — é conversa."
    },
    {
        key: "quarta-capa",
        title: "Quarta capa",
        body: "A quarta capa fala com quem ainda não leu.\n\nPode sugerir o conflito,\napresentar o universo\nou destacar um trecho.\n\nEla não revela.\nEla chama."
    }
];

const BOOK_TEMPLATE_POETRY = [
    {
        key: "capa",
        title: "Capa",
        body: "Um título já é um poema.\n\nÀs vezes, o livro começa aqui."
    },
    {
        key: "folha-rosto",
        title: "Folha de rosto",
        body: "O livro assume seu nome.\n\nAutor, título.\n\nNada mais precisa acontecer ainda."
    },
    {
        key: "dedicatoria",
        title: "Dedicatória (opcional)",
        body: "Um gesto breve.\n\nPode ser uma linha.\nPode ser um nome.\nPode ficar em branco."
    },
    {
        key: "epigrafe",
        title: "Epígrafe (opcional)",
        body: "Uma frase que inclina o livro.\n\nNão explica.\n\nApenas toca o tom."
    },
    {
        key: "nota-inicial",
        title: "Nota inicial (opcional)",
        body: "Algumas palavras antes dos poemas.\n\nNão para explicar.\n\nPara abrir o espaço."
    },
    {
        key: "poemas",
        title: "Poemas",
        body: "Cada poema é um corpo independente.\n\nA ordem cria um ritmo.\n\nO conjunto cria outra coisa."
    },
    {
        key: "secao",
        title: "Seção (opcional)",
        body: "Às vezes, os poemas pedem agrupamento.\n\nPor tema.\nPor tempo.\nPor respiração.\n\nUma seção é uma pausa longa."
    },
    {
        key: "interludio",
        title: "Interlúdio (opcional)",
        body: "Um texto que não é poema.\n\nOu um poema que não se comporta.\n\nServe para quebrar o fluxo."
    },
    {
        key: "ultimo-poema",
        title: "Último poema",
        body: "Nem sempre é o melhor.\n\nÉ o que fica por último.\n\nO livro se despede aqui."
    },
    {
        key: "nota-autor",
        title: "Nota do autor (opcional)",
        body: "Se quiser falar depois.\n\nSobre o processo,\no tempo,\nou o que ficou de fora.\n\nSem obrigação."
    },
    {
        key: "quarta-capa",
        title: "Quarta capa",
        body: "Poucas linhas.\n\nUm trecho.\nUm gesto.\nUm silêncio.\n\nO suficiente para chamar alguém."
    }
];

const BOOK_FOLDERS = [
    { id: "nonfiction", title: "Livro", template: BOOK_TEMPLATE, openDefault: true },
    { id: "fiction", title: "Livro (ficção)", template: BOOK_TEMPLATE_FICTION, openDefault: false },
    { id: "poetry", title: "Livro (poesia)", template: BOOK_TEMPLATE_POETRY, openDefault: false }
];

let skrvImportMode = "replace";
function setImportMode(mode) {
    skrvImportMode = mode === "append_active" ? "append_active" : "replace";
}
function consumeImportMode() {
    const mode = skrvImportMode;
    skrvImportMode = "replace";
    return mode;
}

function initInkTransition() {
    const overlay = document.getElementById("inkTransition");
    if (!overlay) return;
    let running = false;
    window.skrvInkTransition = (callback) => {
        if (running) {
            if (typeof callback === "function") callback();
            return;
        }
        running = true;
        document.body.classList.add("bar-morphing");
        overlay.classList.remove("reveal");
        overlay.classList.add("active");
        setTimeout(() => {
            if (typeof callback === "function") callback();
            overlay.classList.add("reveal");
        }, 520);
        setTimeout(() => {
            overlay.classList.remove("active", "reveal");
            document.body.classList.remove("bar-morphing");
            running = false;
        }, 1500);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add("booting");
    setTimeout(() => document.body.classList.remove("booting"), 2000);

    if (sessionStorage.getItem("skrv_force_clean") === "1") {
        try { localStorage.clear(); } catch (_) {}
        try { sessionStorage.removeItem("skrv_force_clean"); } catch (_) {}
    }

    store.init();
    ensureBookTemplateProjects();
    incrementAccessCount();
    const forcedMobile = window.__SKRV_FORCE_MOBILE === true;
    const uaMobile = navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean"
        ? navigator.userAgentData.mobile
        : /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent || "");
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const hoverNone = window.matchMedia && window.matchMedia("(hover: none)").matches;
    const touchPoints = navigator.maxTouchPoints || 0;
    const isMobile = forcedMobile || uaMobile || (coarse && hoverNone && touchPoints > 0);
    const forceMobileNotes = /(?:^|[?&])mobile=notes(?:&|$)/.test(location.search);
    const forceMobileStandalone = forceMobileNotes && /(?:^|[?&])standalone=1(?:&|$)/.test(location.search);
    const notesStandaloneMode = forceMobileNotes && forceMobileStandalone;
    const onMobilePage = /mobile\.html$/.test(location.pathname);
    if (!forcedMobile && isMobile && !onMobilePage && !location.search.includes("fallback=1") && !forceMobileNotes) {
        location.replace("mobile.html");
        return;
    }
    if (isMobile || notesStandaloneMode) {
        document.body.classList.add("mobile-lite");
        if (forceMobileStandalone) document.body.classList.add("mobile-only-page");
    }
    ui.init();
    initInkTransition();
    
    lang.init();
    window.skrvLoading = initGlobalPending();
    const mobileGateActive = (isMobile && !forceMobileNotes) ? initMobileGate() : false;
    const introDone = localStorage.getItem("skrv_intro_done") === "1";
    if (!mobileGateActive && !introDone && !forceMobileNotes) initDedication();
    const syncLangToFrames = (code) => {
        const frames = [
            document.getElementById("booksFrame"),
            document.getElementById("verifyFrame")
        ].filter(Boolean);
        frames.forEach((frame) => {
            if (!frame.getAttribute("src")) return;
            try {
                frame.contentWindow?.postMessage({ type: "lang", value: code }, window.location.origin);
            } catch (_) {}
        });
    };
    document.addEventListener("lang:changed", (e) => {
        syncLangToFrames(e.detail?.code || lang.current);
        const state = window.templateState;
        const render = window.skrvRenderGuidePane;
        if (state && render && state.activeTemplate && state.activeRaw) {
            render(state.activeTemplate, state.activeRaw);
            const tab = document.getElementById("templateTab");
            if (tab) tab.textContent = (lang.t(state.activeTemplate.label) || state.activeTemplate.label).toUpperCase();
        }
        setupMarqueeCopy();
    });
    syncLangToFrames(lang.current);
    window.skrvModal = initSystemModal();
    window.skrvOnboarding = forceMobileStandalone ? null : initOnboarding();
    // Safety: if dedication already done but onboarding didn't open, force it.
    if (!forceMobileStandalone && !mobileGateActive && introDone) {
        const onboardDone = localStorage.getItem("skrv_onboard_done") === "true";
        const dedicationActive = document.getElementById("dedicationModal")?.classList.contains("active");
        const onboardingActive = document.getElementById("onboardingModal")?.classList.contains("active");
        if (!onboardDone && !dedicationActive && !onboardingActive && window.skrvOnboarding) {
            window.skrvOnboarding.open(0);
        }
    }
    auth.init();
    initImportSessionModal();

    if (forceMobileNotes) {
        ui.openDrawer("notes", {});
        localStorage.setItem("lit_ui_drawer_open", "true");
        localStorage.setItem("lit_ui_drawer_panel", "notes");
        if (forceMobileStandalone) {
            const notesPanel = document.getElementById("panelNotes");
            const drawer = document.getElementById("drawer");
            if (notesPanel) notesPanel.style.display = "block";
            if (drawer) drawer.classList.add("open", "mobile-all");
            document.body.classList.add("drawer-open", "mobile-drawer-open");
        }
    }

    // Safety: avoid stuck white overlay if modal-active remains without active modal.
    setTimeout(() => {
        const activeModal = document.querySelector(".modal-overlay.active");
        if (!activeModal && document.body.classList.contains("modal-active")) {
            document.body.classList.remove("modal-active");
        }
    }, 200);

    // Safety: if UI gets stuck without visible content, force editor view.
    setTimeout(() => {
        const activeModal = document.querySelector(".modal-overlay.active");
        if (activeModal) return;
        const editorView = document.getElementById("editorView");
        const booksView = document.getElementById("booksView");
        const verifyView = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        if (!editorView) return;
        const editorVisible = editorView.style.display !== "none";
        if (editorVisible) return;
        if (booksView) booksView.style.display = "none";
        if (verifyView) verifyView.style.display = "none";
        editorView.style.display = "";
        if (panel) panel.classList.remove("books-active");
        document.body.classList.remove("modal-active");
    }, 1800);

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
            const mode = consumeImportMode();
            const ok = mode === "append_active"
                ? appendPayloadToActiveProject(payload)
                : applySkrvPayload(payload);
            if (payload && ok) {
                handleImportSuccess("alert_backup_restored", buildImportMergeSummary(payload, mode), { source: "qr" });
            } else {
                showImportInvalidError("qr");
            }
        }
    });

    const qrBtnFallback = document.getElementById("btnScanQr");
    if (qrBtnFallback && !qrBtnFallback.dataset.bound) {
        qrBtnFallback.addEventListener("click", () => {
            const requestedMode = qrBtnFallback.dataset.importMode === "append_active" ? "append_active" : "replace";
            setImportMode(requestedMode);
            delete qrBtnFallback.dataset.importMode;
            const modal = document.getElementById("qrScanModal");
            if (modal) setModalActive(modal, true);
            if (qrTransfer.startScan) qrTransfer.startScan();
        });
        qrBtnFallback.dataset.bound = "1";
    }
    document.addEventListener("click", (e) => {
        const scanTrigger = e.target.closest && e.target.closest("#btnScanQr");
        if (!scanTrigger) return;
        const modal = document.getElementById("qrScanModal");
        if (modal) setModalActive(modal, true);
        if (qrTransfer.startScan) qrTransfer.startScan();
    });
    
    const editorEl = document.getElementById("editor");
    editorFeatures.init(editorEl);
    birthTracker.init(editorEl);
    processTracker.init(editorEl);
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
    window.skvOpenReader = () => editorFeatures.openReaderMode();
    window.skvOpenExport = () => {
        const modal = document.getElementById("exportModal");
        if (modal) setModalActive(modal, true);
    };
    window.skvOpenReset = () => {
        const btn = document.getElementById("btnHardReset");
        if (btn) btn.click();
    };
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
            navigator.serviceWorker.register("./sw.js").then(() => {
                navigator.serviceWorker.ready.then((reg) => {
                    const target = reg && reg.active ? reg.active : navigator.serviceWorker.controller;
                    if (target && target.postMessage) {
                        target.postMessage({ type: "cache-extras" });
                    }
                }).catch(() => {});
            }).catch(() => {});
        });
    }

    setupOfflineProgress();
});

function setupSupportCopy() {
    bindCopyTargets(".manifesto-support-value[data-copy]", (item) => {
        const id = item.getAttribute("data-copy");
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        const text = (target.textContent || "").trim();
        if (!text) return;
        const original = lang.t("support_copy");
        const done = lang.t("support_copy_done");
        copyToClipboard(text).then(() => {
            item.setAttribute("data-tip", done);
            setTimeout(() => {
                item.setAttribute("data-tip", original);
            }, 900);
        });
    });
}

function initDedication() {
    const modal = document.getElementById("dedicationModal");
    if (!modal) return;
    const body = document.getElementById("dedicationBody");
    const langBtn = document.getElementById("dedicationLangToggle");
    const fioNote = document.getElementById("dedicationFioNote");
    const continueBtn = document.getElementById("dedicationContinue");
    const done = localStorage.getItem("skrv_dedication_done") === "1";
    if (done) return;

    const updateLangButton = () => {
        setNextLangButtonLabel(lang, langBtn);
    };
    const renderMarkdown = (md) => {
        const escape = (text) => String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
        const text = escape(md || "");
        const strong = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        const paras = strong.split(/\n{2,}/g).map((chunk) => {
            const html = chunk.replace(/\n/g, "<br>");
            return `<p>${html}</p>`;
        }).join("");
        return paras;
    };
    const updateContent = () => {
        if (body) {
            const md = lang.t("dedication_body_md");
            body.innerHTML = renderMarkdown(md);
        }
        if (fioNote) {
            const md = lang.t("dedication_fio_note_md");
            fioNote.innerHTML = renderMarkdown(md);
        }
        updateLangButton();
    };
    updateContent();
    document.addEventListener("lang:changed", updateContent);

    if (langBtn) {
        langBtn.addEventListener("click", () => lang.cycleLang());
    }

    const finish = () => {
        const visitsKey = "skrv_dedication_enter_count";
        const current = parseInt(localStorage.getItem(visitsKey) || "0", 10);
        const nextCount = Number.isFinite(current) ? current + 1 : 1;
        localStorage.setItem(visitsKey, String(nextCount));
        setModalActive(modal, false);
        document.body.classList.remove("modal-active");
        localStorage.setItem("skrv_dedication_done", "1");
        localStorage.setItem("skrv_intro_done", "1");
        const onboardDone = localStorage.getItem("skrv_onboard_done") === "true";
        if (!onboardDone && window.skrvOnboarding && typeof window.skrvOnboarding.open === "function") {
            window.skrvOnboarding.open(0);
        }
        document.removeEventListener("keydown", handleEnter);
    };

    const handleEnter = (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        finish();
    };

    setModalActive(modal, true);
    document.body.classList.add("modal-active");
    document.addEventListener("keydown", handleEnter);
    if (continueBtn) continueBtn.addEventListener("click", finish);
}

function initMobileGate() {
    const modal = document.getElementById("mobileGateModal");
    if (!modal) return false;
    if (window.innerWidth > 900) return false;
    if (sessionStorage.getItem("skrv_mobile_gate_done") === "1") return false;

    const langBtn = document.getElementById("mobileGateLangToggle");
    const qrWrap = document.getElementById("mobileGateQrCode");
    const btnScan = document.getElementById("mobileGateScan");
    const qrBtn = document.getElementById("btnScanQr");
    const isMobileOnly = document.body.classList.contains("mobile-only-page");
    const openMobileSetup = () => {
        if (window.skrvOnboarding && typeof window.skrvOnboarding.open === "function") {
            window.skrvOnboarding.open(6);
        }
    };
    const closeGate = (showDedication = true, startSetup = false) => {
        setModalActive(modal, false);
        document.body.classList.remove("modal-active");
        sessionStorage.setItem("skrv_mobile_gate_done", "1");
        if (isMobileOnly) {
            if (startSetup) openMobileSetup();
            return;
        }
        if (showDedication) initDedication();
    };

    const updateLangButton = () => {
        setNextLangButtonLabel(lang, langBtn);
    };
    updateLangButton();
    document.addEventListener("lang:changed", updateLangButton);
    if (langBtn) {
        langBtn.addEventListener("click", () => lang.cycleLang());
    }

    if (btnScan) {
        btnScan.onclick = () => {
            closeGate(false);
            if (qrBtn) {
                setTimeout(() => qrBtn.click(), 50);
            }
        };
    }

    let startY = null;
    modal.addEventListener("touchstart", (e) => {
        const touch = e.touches && e.touches[0];
        if (!touch) return;
        startY = touch.clientY;
    }, { passive: true });
    modal.addEventListener("touchend", (e) => {
        if (startY === null) return;
        const touch = e.changedTouches && e.changedTouches[0];
        if (!touch) return;
        const delta = startY - touch.clientY;
        startY = null;
        if (delta > 60) {
            closeGate(true, true);
        }
    });

    setModalActive(modal, true);
    document.body.classList.add("modal-active");
    initMobileGateQr(qrWrap);
    return true;
}

function initMobileGateQr(target) {
    if (!target) return;
    const url = "https://eskrev.rafa.pro.br/";
    const render = () => {
        try {
            target.innerHTML = "";
            // eslint-disable-next-line no-undef
            new QRCode(target, {
                text: url,
                width: 160,
                height: 160,
                colorDark: "#3f3b33",
                colorLight: "#f1efe7",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (_) {}
    };
    if (window.QRCode && window.QRCode.CorrectLevel) {
        render();
        return;
    }
    const existing = document.querySelector('script[data-qr-lib="QRCode"]');
    if (existing) {
        existing.addEventListener("load", render, { once: true });
        return;
    }
    const script = document.createElement("script");
    script.src = "src/assets/js/qrcode.min.js";
    script.async = true;
    script.dataset.qrLib = "QRCode";
    script.onload = render;
    document.head.appendChild(script);
}

function setupOfflineProgress() {
    const bar = document.querySelector(".offline-bar");
    const label = document.querySelector(".offline-label");
    const hint = document.getElementById("offlineHint");
    if (!bar || !label || !("serviceWorker" in navigator)) return;
    if (typeof window !== "undefined") {
        window.skrvOfflineReady = false;
    }

    let finished = false;
    let fallbackUnlocked = false;
    let lastPct = null;
    let statusReceived = false;
    const unlock = () => {
        if (typeof window !== "undefined") {
            window.skrvOfflineReady = true;
            window.dispatchEvent(new Event("skrv:offline-ready"));
        }
    };
    const showFallback = () => {
        if (finished || fallbackUnlocked) return;
        fallbackUnlocked = true;
        if (label) label.textContent = lang.t("onboard_offline_fallback");
        if (hint) {
            hint.textContent = lang.t("onboard_offline_fallback_hint");
            hint.style.display = "";
        }
        unlock();
    };
    const setProgress = (cached, total) => {
        if (!Number.isFinite(total) || total <= 0) return;
        statusReceived = true;
        const pct = Math.max(0, Math.min(100, Math.round((cached / total) * 100)));
        lastPct = pct;
        bar.style.width = `${pct}%`;
        if (pct >= 100) {
            label.textContent = lang.t("onboard_offline_ready");
            if (hint) hint.style.display = "none";
            finished = true;
            unlock();
        } else {
            label.textContent = `${pct}%`;
            if (hint) hint.style.display = "";
        }
    };

    const requestStatus = (target) => {
        if (!target) return;
        try {
            target.postMessage({ type: "cache-status" });
        } catch (_) {
            // ignore
        }
    };

    navigator.serviceWorker.addEventListener("message", (e) => {
        if (!e.data || e.data.type !== "cache-status") return;
        setProgress(e.data.cached, e.data.total);
    });

    const poll = () => {
        if (finished) return;
        if (navigator.serviceWorker.controller) {
            requestStatus(navigator.serviceWorker.controller);
            return;
        }
        navigator.serviceWorker.ready.then((reg) => {
            if (reg && reg.active) requestStatus(reg.active);
        });
    };

    poll();
    const fallbackTimer = setTimeout(() => {
        if (!finished) showFallback();
    }, 14000);
    const timer = setInterval(() => {
        if (finished) {
            clearInterval(timer);
            clearTimeout(fallbackTimer);
            return;
        }
        poll();
    }, 1200);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") poll();
    });
    window.addEventListener("focus", poll);
    document.addEventListener("lang:changed", () => {
        if (lastPct === null && !fallbackUnlocked) return;
        if (finished || lastPct >= 100) {
            label.textContent = lang.t("onboard_offline_ready");
            if (hint) hint.style.display = "none";
            unlock();
        } else if (fallbackUnlocked && !statusReceived) {
            label.textContent = lang.t("onboard_offline_fallback");
            if (hint) {
                hint.textContent = lang.t("onboard_offline_fallback_hint");
                hint.style.display = "";
            }
        } else {
            label.textContent = `${lastPct}%`;
            if (hint) hint.style.display = "";
        }
    });
}

function setupMarqueeCopy() {
    bindCopyTargets(".marquee-copy[data-copy]", (item) => {
        const value = item.getAttribute("data-copy");
        if (!value) return;
        copyToClipboard(value).then(() => {
            item.setAttribute("data-copied-label", lang.t("support_copy_done"));
            item.classList.add("is-copied");
            setTimeout(() => {
                item.classList.remove("is-copied");
            }, 900);
        });
    });
}

function initGlobalPending() {
    const box = document.getElementById("globalPending");
    if (!box) return null;
    const label = box.querySelector(".global-pending-label");
    let counter = 0;
    let timer = null;
    const show = (textKey) => {
        if (label) label.textContent = lang.t(textKey || "loading_label");
        box.classList.add("show");
        box.setAttribute("aria-hidden", "false");
    };
    const hide = () => {
        box.classList.remove("show");
        box.setAttribute("aria-hidden", "true");
    };
    const start = (textKey) => {
        counter += 1;
        if (timer) return;
        timer = setTimeout(() => {
            show(textKey);
        }, 4000);
    };
    const stop = () => {
        counter = Math.max(0, counter - 1);
        if (counter > 0) return;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        hide();
    };
    return { start, stop };
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
    let ignoreNextEnter = false;

    const animateOnce = (step) => {
        if (!step || step.dataset.animated === "true") return;
        step.dataset.animated = "true";
        step.classList.add("animate");
    };
    const updateLangButton = () => {
        setNextLangButtonLabel(lang, langBtn);
    };
    let keyboardTimer = null;
    const update = () => {
        const isMobileOnboard = document.body.classList.contains("mobile-lite") || document.body.classList.contains("mobile-only-page");
        const offlineReady = window.skrvOfflineReady !== false;
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
            const canAdvance = current < total && (isMobileOnboard || current > 0 || langChosen || lang.current === "pt");
            nextBtn.style.display = (canAdvance && (current !== 0 || offlineReady)) ? "inline-flex" : "none";
            nextBtn.disabled = !offlineReady && current === 0;
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
        if (activeStep && current === 1) {
            const tabletIcons = Array.from(activeStep.querySelectorAll(".tablet-icon"));
            const tabletIcon = tabletIcons[tabletIcons.length - 1];
            if (tabletIcon) {
                tabletIcon.classList.remove("animate-tablet");
                void tabletIcon.offsetWidth;
                tabletIcon.classList.add("animate-tablet");
            }
            if (keyboardTimer) {
                clearTimeout(keyboardTimer);
                keyboardTimer = null;
            }
        }
        updateLangButton();
        modal.classList.toggle("onboard-step-zero", current === 0);
            if (current === 0) {
                if (backBtn) backBtn.style.display = "none";
                if (nextBtn) {
                    nextBtn.style.display = ((isMobileOnboard || langChosen || lang.current === "pt") && offlineReady) ? "inline-flex" : "none";
                    nextBtn.disabled = !offlineReady;
                }
                if (stepLabel) stepLabel.style.display = "none";
            }
    };

    const open = (startStep = 0) => {
        current = Math.min(Math.max(startStep, 1), total);
        if (startStep === 0) current = 0;
        setModalActive(modal, true);
        document.body.classList.add("modal-active");
        update();
        if (startStep === 0) {
            ignoreNextEnter = true;
            setTimeout(() => { ignoreNextEnter = false; }, 300);
        }
    };

    const close = () => {
        setModalActive(modal, false);
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
        const isMobileOnboard = document.body.classList.contains("mobile-lite") || document.body.classList.contains("mobile-only-page");
        const offlineReady = window.skrvOfflineReady !== false;
        if (e.key === "Enter") {
            if (ignoreNextEnter) {
                e.preventDefault();
                return;
            }
            if (current === 0 && !offlineReady) {
                e.preventDefault();
                return;
            }
            if (!isMobileOnboard && (current === 0 || current === 1) && !langChosen && lang.current !== "pt") {
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
            if (current === 0 && !offlineReady) {
                e.preventDefault();
                return;
            }
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

    window.addEventListener("skrv:offline-ready", () => {
        if (modal.classList.contains("active")) update();
    });

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

function openMobileNotesView() {
    if (!isMobileContext()) return;
    ensureMobileModule()
        .then(() => {
            const drawer = document.querySelector(".drawer");
            const notesPanel = document.getElementById("panelNotes");
            const isOpen = drawer && drawer.classList.contains("open") && notesPanel && notesPanel.style.display === "block";
            if (isOpen) return;
            ui.openDrawer("notes", {});
        })
        .catch(() => {});
}
window.skrvOpenMobileNotes = openMobileNotesView;
window.skrvHardReset = (full = false) => {
    if (full) {
        try { sessionStorage.setItem("skrv_force_full_reset", "1"); } catch (_) {}
    }
    store.hardReset();
};

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
        setModalActive(overlay, false);
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
        setModalActive(overlay, true);
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
        const placeholder = activeDoc.placeholder || lang.t("editor_placeholder");
        if (placeholder) {
            editorEl.setAttribute("data-placeholder", placeholder);
        }
        
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
    const ensureFrameLoaded = (id) => {
        const frame = document.getElementById(id);
        if (!frame) return null;
        const currentSrc = frame.getAttribute("src");
        const lazySrc = frame.getAttribute("data-src");
        if (!currentSrc && lazySrc) frame.setAttribute("src", lazySrc);
        return frame;
    };

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
        const booksFrame = ensureFrameLoaded("booksFrame");
        if (ev) ev.style.display = "none";
        if (bv) bv.style.display = "block";
        if (vv) vv.style.display = "none";
        if (panel) panel.classList.add("books-active");
        if (booksFrame) {
            try {
                booksFrame.contentWindow?.postMessage({ type: "lang", value: lang.current }, window.location.origin);
            } catch (_) {}
        }
        localStorage.setItem("lit_ui_view", "books");
    };

    const showVerifyView = () => {
        const ev = document.getElementById("editorView");
        const bv = document.getElementById("booksView");
        const vv = document.getElementById("verifyView");
        const panel = document.querySelector(".panel");
        const verifyFrame = ensureFrameLoaded("verifyFrame");
        if (ev) ev.style.display = "none";
        if (bv) bv.style.display = "none";
        if (vv) vv.style.display = "block";
        if (panel) panel.classList.add("books-active");
        if (verifyFrame) {
            try {
                verifyFrame.contentWindow?.postMessage({ type: "lang", value: lang.current }, window.location.origin);
            } catch (_) {}
        }
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
    window.templateState = templateState;
    let templateRegistry = null;
    let selectedTemplate = null;
    let selectedPersona = null;

    const loadTemplateRegistry = async () => {
        if (templateRegistry) return templateRegistry;
        const res = await fetch("config/persona-templates.json");
        templateRegistry = await res.json();
        return templateRegistry;
    };

    let figuresRegistry = null;
    const figuresState = { tab: null, openId: null, data: null };
    const loadFiguresRegistry = async () => {
        if (figuresRegistry) return figuresRegistry;
        const res = await fetch("src/assets/figures/figures_ptbr.json");
        if (!res.ok) return { figures: [] };
        figuresRegistry = await res.json();
        return figuresRegistry;
    };

    const renderFiguresTabs = (tabs) => {
        const tabsEl = document.getElementById("figuresTabs");
        if (!tabsEl) return;
        tabsEl.innerHTML = "";
        tabs.forEach((tab) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "figures-tab";
            if (figuresState.tab === tab.id) btn.classList.add("active");
            btn.textContent = lang.t(tab.label) || tab.label;
            btn.addEventListener("click", () => {
                figuresState.tab = tab.id;
                figuresState.openId = null;
                renderFiguresModal();
            });
            tabsEl.appendChild(btn);
        });
    };

    const renderFiguresCards = (items) => {
        const list = document.getElementById("figuresCards");
        const empty = document.getElementById("figuresEmpty");
        if (!list || !empty) return;
        list.innerHTML = "";
        if (!items || !items.length) {
            empty.style.display = "block";
            return;
        }
        empty.style.display = "none";
        items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "figures-card";
            if (!figuresState.openId) figuresState.openId = item.id;
            if (figuresState.openId === item.id) card.classList.add("open");

            const head = document.createElement("button");
            head.type = "button";
            head.className = "figures-card-head";
            const title = document.createElement("span");
            title.className = "figures-card-title";
            title.textContent = item.title || "—";
            const chevron = document.createElement("span");
            chevron.className = "figures-muted";
            chevron.textContent = figuresState.openId === item.id ? "–" : "+";
            head.appendChild(title);
            head.appendChild(chevron);
            head.addEventListener("click", () => {
                figuresState.openId = figuresState.openId === item.id ? null : item.id;
                renderFiguresModal();
            });

            const body = document.createElement("div");
            body.className = "figures-card-body";

            const addBlock = (labelKey, text, cls = "figures-text") => {
                if (!text) return;
                const label = document.createElement("div");
                label.className = "figures-label";
                label.textContent = lang.t(labelKey);
                const content = document.createElement("div");
                content.className = cls;
                content.textContent = text;
                body.appendChild(label);
                body.appendChild(content);
            };

            addBlock("figures_label_recognize", item.recognize);
            addBlock("figures_label_example_recognize", item.example_recognize, "figures-example recognize");
            addBlock("figures_label_definition", item.definition, "figures-muted");
            addBlock("figures_label_example_use", item.example_use, "figures-example");
            addBlock("figures_label_example_interpret", item.example_interpret, "figures-example");
            if (item.not_confuse) {
                addBlock("figures_label_not_confuse", item.not_confuse, "figures-muted");
            }

            card.appendChild(head);
            card.appendChild(body);
            list.appendChild(card);
        });
    };

    function closeFiguresModal() {
        const modal = document.getElementById("figuresModal");
        if (!modal) return;
        setModalActive(modal, false);
        document.body.classList.remove("figures-open");
    }

    async function openFiguresModal(personaId = null) {
        const modal = document.getElementById("figuresModal");
        const note = document.getElementById("figuresNote");
        if (!modal) return;
        figuresState.persona = personaId;
        const registry = await loadFiguresRegistry();
        figuresState.data = registry || {};
        if (!figuresState.tab && registry?.tabs?.length) {
            figuresState.tab = registry.tabs[0].id;
        }
        renderFiguresModal();
        if (note) note.style.display = lang.current === "pt" ? "none" : "block";
        const support = document.getElementById("figuresSupport");
        if (support) support.style.display = lang.current === "pt" ? "none" : "grid";
        setModalActive(modal, true);
        document.body.classList.add("figures-open");
    }
    window.skrvOpenFiguresModal = openFiguresModal;

    const renderFiguresModal = () => {
        const data = figuresState.data || {};
        const tabs = Array.isArray(data.tabs) ? data.tabs : [];
        if (!tabs.length) {
            renderFiguresCards([]);
            return;
        }
        const persona = figuresState.persona;
        const filterItems = (items) => {
            if (!persona) return items;
            return items.filter(item => !item.personas || item.personas.includes(persona) || item.personas.includes("all"));
        };
        const filteredTabs = tabs
            .map(tab => ({ ...tab, items: filterItems(Array.isArray(tab.items) ? tab.items : []) }))
            .filter(tab => tab.items.length);
        if (!filteredTabs.length) {
            renderFiguresCards([]);
            return;
        }
        if (!filteredTabs.find(t => t.id === figuresState.tab)) {
            figuresState.tab = filteredTabs[0].id;
            figuresState.openId = null;
        }
        renderFiguresTabs(filteredTabs);
        const active = filteredTabs.find(t => t.id === figuresState.tab) || filteredTabs[0];
        const items = Array.isArray(active.items) ? active.items : [];
        renderFiguresCards(items);
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

        const callout = document.createElement("div");
        callout.className = "guide-figures-callout";
        const calloutText = document.createElement("div");
        calloutText.className = "guide-figures-text";
        calloutText.textContent = lang.t("figures_callout");
        const calloutBtn = document.createElement("button");
        calloutBtn.className = "btn-half";
        calloutBtn.type = "button";
        calloutBtn.textContent = lang.t("figures_callout_btn");
        calloutBtn.addEventListener("click", () => openFiguresModal(template.persona));
        callout.appendChild(calloutText);
        callout.appendChild(calloutBtn);
        contentEl.appendChild(callout);
    };
    window.skrvRenderGuidePane = renderGuidePane;

    const applyTemplateLayout = () => {
        const workspace = document.getElementById("workspace");
        const pane = document.getElementById("templatePane");
        const split = document.getElementById("templateSplit");
        const tab = document.getElementById("templateTab");
        if (!pane || !split || !tab) return;
        const effectiveWidth = templateState.minimized ? 40 : templateState.width;
        if (workspace) workspace.style.setProperty("--template-pane-w", `${effectiveWidth}px`);
        pane.style.setProperty("--template-pane-w", `${effectiveWidth}px`);
        if (!templateState.activeTemplate) {
            templateState.open = false;
            templateState.minimized = false;
        }
        if (templateState.open && !templateState.minimized) {
            pane.classList.add("open");
            split.classList.add("active");
            tab.classList.remove("show");
        } else {
            pane.classList.remove("open");
            split.classList.remove("active");
            tab.classList.remove("show");
        }
        if (templateState.open && templateState.minimized) {
            pane.classList.add("open");
            split.classList.remove("active");
        }
        pane.setAttribute("aria-hidden", templateState.open ? "false" : "true");
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
        templateState.activeRaw = raw;
        applyTemplateLayout();
        renderGuidePane(template, raw);
        const tab = document.getElementById("templateTab");
        if (tab) tab.textContent = (lang.t(template.label) || template.label).toUpperCase();
    };

    const closeTemplatePane = () => {
        templateState.open = false;
        templateState.minimized = false;
        applyTemplateLayout();
        const editorEl = document.getElementById("editor");
        if (editorEl) editorEl.focus();
    };

    const minimizeTemplatePane = () => {
        if (!templateState.open) return;
        templateState.minimized = !templateState.minimized;
        applyTemplateLayout();
    };

    const setupTemplateResize = () => {
        const split = document.getElementById("templateSplit");
        const pane = document.getElementById("templatePane");
        const workspace = document.getElementById("workspace");
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
            if (workspace) workspace.style.setProperty("--template-pane-w", `${width}px`);
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
        setModalActive(modal, true);
    };

    const closeNewTextModal = () => {
        const modal = document.getElementById("newTextModal");
        if (!modal) return;
        setModalActive(modal, false);
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
    const fixedMobileTags = () => {
        if (!isMobileContext()) return [];
        const tags = ["mobile"];
        const proj = getMobileProjectTag();
        if (proj) tags.push(proj);
        return tags;
    };
    const ensureFixedTags = (tags) => {
        const set = new Set((tags || []).map(normalizeTag));
        fixedMobileTags().forEach((tag) => set.add(normalizeTag(tag)));
        return Array.from(set);
    };
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
            pinBtn.innerHTML = `<svg class="icon pin-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`;
        } else {
            pinBtn.innerHTML = `<svg class="icon pin-icon pin-icon-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>`;
        }
        pinBtn.onclick = (event) => {
            event.stopPropagation();
            toggleNotePin(note.id);
        };
        const printBtn = document.createElement("button");
        printBtn.type = "button";
        printBtn.className = "btn-icon notes-print-btn";
        printBtn.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/><path d='M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6'/><rect x='6' y='14' width='12' height='8' rx='1'/></svg>";
        printBtn.onclick = (event) => {
            event.stopPropagation();
            const titleText = noteTitle(note);
            const bodyText = String(note.text || "").trim();
            const text = `=== ${titleText} ===\n\n${bodyText}`;
            printRawText(text, `.skv Writer - ${titleText || "Nota"}`);
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
        header.appendChild(printBtn);
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
        setModalActive(overlay, true);
    };
    const closeNotesOverlay = () => {
        const overlay = document.getElementById("notesOverlay");
        if (!overlay) return;
        setModalActive(overlay, false);
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
        if (tagsEl) {
            const merged = ensureFixedTags(note.tags || []);
            tagsEl.value = merged.map(t => `#${normalizeTag(t)}`).join(", ");
        }
        if (folderEl) folderEl.value = note.folder || "";
        if (metaEl) metaEl.textContent = `${lang.t("notes_updated")}: ${formatDate(note.updatedAt || note.createdAt)}`;
        if (pinToggle) {
            pinToggle.classList.toggle("active", !!note.pinned);
            if (note.pinned) {
                pinToggle.innerHTML = `<svg class="icon pin-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`;
            } else {
                pinToggle.innerHTML = `<svg class="icon pin-icon pin-icon-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>`;
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
        let tags = tagsEl ? tagsEl.value.split(",").map(normalizeTag).filter(Boolean) : [];
        tags = ensureFixedTags(tags);
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
            if (window.skvModal?.alert) window.skvModal.alert(lang.t("mobile_limit_notes"));
            else alert(lang.t("mobile_limit_notes"));
            return;
        }
        const note = {
            id: notesState.draftId,
            title: data.title,
            text: data.text,
            tags: ensureFixedTags(data.tags),
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
            if (window.skvModal?.alert) window.skvModal.alert(lang.t("mobile_limit_notes"));
            else alert(lang.t("mobile_limit_notes"));
            return;
        }
        const presetFolder = normalizeFolder(preset.folder);
        if (presetFolder) {
            const folders = Array.from(new Set(notes.map(n => normalizeFolder(n.folder)).filter(Boolean)));
            if (!folders.includes(presetFolder) && folders.length >= FOLDERS_LIMIT) {
                if (window.skvModal?.alert) window.skvModal.alert(lang.t("mobile_limit_folders"));
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
        if (tagsEl) {
            const merged = ensureFixedTags(presetTags);
            tagsEl.value = merged.map(t => `#${normalizeTag(t)}`).join(", ");
        }
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
            if (window.skvModal?.alert) window.skvModal.alert(lang.t("mobile_limit_pins"));
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
                if (window.skvModal?.alert) window.skvModal.alert(lang.t("mobile_limit_folders"));
                else alert(lang.t("mobile_limit_folders"));
                return;
            }
        }
        note.title = title;
        note.text = text;
        note.tags = ensureFixedTags(tags);
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
        setModalActive(notesModal, true);
        document.body.classList.add("notes-open");
        renderNotesList();
        setNotesStage("list");
    };
    const closeNotesModal = () => {
        if (!notesModal) return;
        finalizeDraftIfNeeded();
        const overlay = document.getElementById("notesOverlay");
        if (overlay) {
            setModalActive(overlay, false);
        }
        setModalActive(notesModal, false);
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
                setModalActive(overlay, false);
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
    if (notesBackToPreview) notesBackToPreview.onclick = () => setNotesStage("list");
    if (notesDelete) {
        notesDelete.onclick = async () => {
            const notes = notesCache();
            const note = notes.find(n => n.id === notesState.activeId);
            if (!note) return;
            const ok = window.skvModal?.confirm ? await window.skvModal.confirm(lang.t("notes_delete_confirm")) : confirm(lang.t("notes_delete_confirm"));
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
    if (templateClose) templateClose.onclick = (e) => {
        if (e) e.stopPropagation();
        closeTemplatePane();
    };
    if (templateMinimize) templateMinimize.onclick = (e) => {
        if (e) e.stopPropagation();
        minimizeTemplatePane();
    };
    const templatePane = document.getElementById("templatePane");
    if (templatePane) {
        templatePane.addEventListener("click", (e) => {
            if (!templateState.open || !templateState.minimized) return;
            if (e.target && e.target.closest(".template-actions")) {
                templateState.minimized = false;
                applyTemplateLayout();
                return;
            }
            templateState.minimized = false;
            applyTemplateLayout();
        });
    }
    if (templateTab) templateTab.onclick = () => {
        if (!templateState.activeTemplate) return;
        templateState.open = true;
        templateState.minimized = false;
        applyTemplateLayout();
    };
    const figuresClose = document.getElementById("figuresClose");
    const figuresModal = document.getElementById("figuresModal");
    if (figuresClose) figuresClose.onclick = () => closeFiguresModal();
    if (figuresModal) {
        figuresModal.addEventListener("click", (e) => {
            if (e.target === figuresModal) closeFiguresModal();
        });
    }
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
    const btnProjectsQuick = document.getElementById("btnProjectsQuick");
    if (btnProjectsQuick) {
        btnProjectsQuick.onclick = () => { showEditorView(); ui.openDrawer('files', { renderFiles: renderProjectList }); closeNotesModal(); };
    }

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
    const drawerProjects = document.getElementById("drawerProjects");
    if (drawerProjects) drawerProjects.onclick = () => { showEditorView(); ui.openDrawer('files', { renderFiles: renderProjectList }); closeNotesModal(); };
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
    btnImport.onclick = () => {
        if (!fileInput.dataset.importMode) setImportMode("replace");
        fileInput.click();
    };
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const mode = fileInput.dataset.importMode === "append_active" ? "append_active" : consumeImportMode();
        delete fileInput.dataset.importMode;
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (file.name.endsWith('.skv')) {
                const payload = importSkrv(evt.target.result);
                const ok = mode === "append_active"
                    ? appendPayloadToActiveProject(payload)
                    : applySkrvPayload(payload);
                if (payload && ok) {
                    handleImportSuccess("alert_capsule_restored", buildImportMergeSummary(payload, mode), { source: "file" });
                } else {
                    showImportInvalidError("file");
                }
            } else if (file.name.endsWith('.b64') || file.name.endsWith('.qr')) {
                const payload = qrTransfer.decodeBackupBase64(evt.target.result);
                const ok = mode === "append_active"
                    ? appendPayloadToActiveProject(payload)
                    : applySkrvPayload(payload);
                if (payload && ok) {
                    handleImportSuccess("alert_backup_restored", buildImportMergeSummary(payload, mode), { source: "file" });
                } else {
                    showImportInvalidError("file");
                }
            } else if (file.name.endsWith('.json')) {
                if (store.importData(evt.target.result)) { 
                    handleImportSuccess("alert_backup_restored");
                }
            } else {
                store.createProject(file.name, evt.target.result); 
                loadActiveDocument(); renderProjectList(); ui.closeDrawer();
            }
        };
        reader.readAsText(file);
        fileInput.value = ''; 
    };

    document.getElementById("btnSave").onclick = () => {
        const modal = document.getElementById("exportModal");
        if (modal) setModalActive(modal, true);
    };
    document.getElementById("closeModalExport").onclick = () => {
        const modal = document.getElementById("exportModal");
        if (modal) setModalActive(modal, false);
    };
    const closeFediverse = document.getElementById("closeFediverse");
    if (closeFediverse) {
        closeFediverse.onclick = () => {
            const modal = document.getElementById("fediverseModal");
            if (modal) setModalActive(modal, false);
        };
    }
    const openElementApp = () => {
        const fallback = "https://element.io/download";
        const start = Date.now();
        window.location.href = "element://";
        setTimeout(() => {
            if (Date.now() - start < 1600) {
                window.open(fallback, "_blank", "noopener");
            }
        }, 1200);
    };
    document.querySelectorAll(".social-link").forEach((btn) => {
        btn.addEventListener("click", () => {
            const shareText = lang.t("share_message");
            const baseUrl = btn.dataset.url || "";
            const network = (btn.dataset.network || "").toLowerCase();
            const encoded = encodeURIComponent(shareText);
            const siteUrl = encodeURIComponent(window.location.origin);
            let targetUrl = baseUrl;
            if (network === "element") {
                openElementApp();
                return;
            }
            if (network === "x") {
                targetUrl = `https://twitter.com/intent/tweet?text=${encoded}`;
            } else if (network === "whatsapp") {
                targetUrl = `https://wa.me/?text=${encoded}`;
            } else if (network === "mastodon") {
                targetUrl = `https://mastodon.social/share?text=${encoded}`;
            } else if (network === "lemmy") {
                targetUrl = `https://lemmy.world/create_post?body=${encoded}`;
            } else if (network === "bluesky") {
                targetUrl = `https://bsky.app/intent/compose?text=${encoded}`;
            } else if (network === "facebook") {
                targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${siteUrl}&quote=${encoded}`;
            } else if (network === "linkedin") {
                targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}`;
            }
            if (targetUrl) window.open(targetUrl, "_blank", "noopener");
        });
    });

    const revealExportSupport = () => {
        const support = document.getElementById("exportSupport");
        if (!support) return;
        support.classList.add("active");
        support.setAttribute("aria-hidden", "false");
    };

    // Downloads e QR
    // Downloads (JSON / TXT / SKV)
    const btnJson = document.getElementById("actionDownloadJson");
    if (btnJson) {
        btnJson.onclick = () => {
            store.save(
                document.getElementById("editor").innerHTML,
                document.getElementById("memoArea").value
            );
            const active = store.getActive && store.getActive();
            const baseName = (store.data && store.data.skvTitle)
                ? store.data.skvTitle
                : (active && active.name ? active.name : ".skv");
            const safeName = baseName
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .toLowerCase();
            const slug = safeName || "skv";
            const now = new Date();
            const stamp = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0")
            ].join("-") + "_" + [
                String(now.getHours()).padStart(2, "0"),
                String(now.getMinutes()).padStart(2, "0")
            ].join("");
            buildSkrvPayloadWithChain(store).then((payload) => {
                downloadText(JSON.stringify(payload, null, 2), `${slug}_${stamp}.skv`, "application/json");
                revealExportSupport();
            });
        };
    }

    // Nota: export .skv já é o caminho oficial (actionDownloadJson).

    document.getElementById("closeModalHelp").onclick = () => {
        const overlay = document.getElementById("helpModal");
        if (!overlay) return;
        setModalActive(overlay, false);
        document.body.classList.remove("help-open");
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
    if(btnLock) {
        btnLock.onclick = () => {
            if (typeof window.skrvInkTransition === "function") {
                window.skrvInkTransition(() => auth.lock());
                return;
            }
            auth.lock();
        };
    }

    const btnLangToggle = document.getElementById("btnLangToggle");
    if (btnLangToggle) btnLangToggle.onclick = () => lang.cycleLang();

    setupModalFocusTrap();

    // Teclas
    const searchInput = document.getElementById("search");
    const editorEl = document.getElementById("editor");
    const isBootModalBlockingKeyboard = createBootModalBlocker();
    const handleCtrlGuard = createCtrlGuardHandler({
        editorEl,
        onSave: () => document.getElementById("btnSave").click(),
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
    
    document.addEventListener("keydown", (e) => {
        if (isBootModalBlockingKeyboard()) return;
        if (handleCtrlGuard(e)) return;

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
        if (e.ctrlKey && e.key === "f") { e.preventDefault(); searchInput.focus(); }
        if (handleEscape(e)) return;
        if (handleAltShortcuts(e)) return;

        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') { e.preventDefault(); document.getElementById("btnSave").click(); }
            if (e.key === 'o') { e.preventDefault(); document.getElementById("fileInput").click(); }
        }

        handleTypingRedirect(e);
    });

    const btnInsert = document.getElementById("btnInsertChapter");
    if (btnInsert) btnInsert.onclick = () => { editorFeatures.insertChapter(); ui.openDrawer('nav', { renderNav: renderNavigation }); };
    const btnVerifyTot = document.getElementById("btnVerifyTot");
    if (btnVerifyTot) btnVerifyTot.onclick = () => { ui.closeDrawer(); showVerifyView(); };

    const NON_CLOSABLE_OVERLAYS = new Set([
        "gatekeeper",
        "pomodoroModal",
        "termsModal",
        "manifestoModal",
        "onboardingModal",
        "dedicationModal",
        "importSessionModal"
    ]);
    let resetOverlayStateFallback = () => {};
    const handleOverlayBackdropClick = createOverlayBackdropHandler({
        nonClosableOverlays: NON_CLOSABLE_OVERLAYS,
        onSystemOverlayClick: (event, overlay) => {
            if (event.target === overlay && window.skvModal?.cancel) window.skvModal.cancel();
        },
        onResetOverlayClose: () => resetOverlayStateFallback()
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            handleOverlayBackdropClick(overlay, e);
        });
    });

    document.getElementById("btnNewProject").onclick = () => createSimpleProject();

    document.getElementById("btnThemeToggle").onclick = () => ui.toggleTheme();
    document.getElementById("hudFs").onclick = () => editorFeatures.toggleFullscreen();
    const resetFlow = setupResetFlow({
        lang,
        hardReset: () => store.hardReset()
    });
    resetOverlayStateFallback = resetFlow.resetOverlayStateFallback;

    setupPersistenceBindings({
        editorEl,
        memoEl: document.getElementById("memoArea"),
        panelEl: document.querySelector(".panel"),
        store,
        editorFeatures
    });

    restoreUiState(showEditorView, showBooksView);

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

function isMobileContext() {
    return document.body.classList.contains("mobile-only-page") || document.body.classList.contains("mobile-lite");
}

function slugifyProjectName(name) {
    const base = String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return base
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}

function setMobileProjectMeta(name) {
    const cleanName = String(name || "").trim();
    if (cleanName) {
        localStorage.setItem("skrv_mobile_project_name", cleanName);
    }
    const slug = slugifyProjectName(cleanName);
    if (slug) {
        localStorage.setItem("skrv_mobile_project_tag", `proj:${slug}`);
    }
}

function getMobileProjectTag() {
    const stored = localStorage.getItem("skrv_mobile_project_tag");
    if (stored) return stored;
    const fallback = localStorage.getItem("skrv_mobile_project_name") || store.getActive()?.name || "";
    setMobileProjectMeta(fallback);
    return localStorage.getItem("skrv_mobile_project_tag") || "";
}

function trackMobileFunnelEvent(eventName, meta = {}) {
    if (!eventName) return;
    if (typeof window.skrvMobileFunnelTrack === "function") {
        window.skrvMobileFunnelTrack(eventName, meta);
        return;
    }
    try {
        const key = "skrv_mobile_funnel_v1";
        const raw = localStorage.getItem(key);
        const state = raw ? JSON.parse(raw) : {};
        const now = Date.now();
        state.version = 1;
        state.updatedAt = now;
        state.counters = state.counters || {};
        state.events = Array.isArray(state.events) ? state.events : [];
        state.counters[eventName] = (state.counters[eventName] || 0) + 1;
        if (eventName === "mobile_open" && !state.firstOpenAt) state.firstOpenAt = now;
        if (eventName === "note_created" && !state.firstNoteAt) state.firstNoteAt = now;
        if (eventName === "import_success" && !state.firstImportSuccessAt) state.firstImportSuccessAt = now;
        state.events.push({ event: eventName, ts: now, meta });
        if (state.events.length > 80) state.events = state.events.slice(-80);
        localStorage.setItem(key, JSON.stringify(state));
    } catch (_) {}
}

window.skrvSetMobileProjectMeta = setMobileProjectMeta;
window.skrvSetImportMode = setImportMode;

function initImportSessionModal() {
    if (!isMobileContext()) return;
    const modal = document.getElementById("importSessionModal");
    if (!modal) return;
    if (sessionStorage.getItem("skrv_mobile_import_pending") !== "1") return;
    const projectName = sessionStorage.getItem("skrv_mobile_import_name") || (store.getActive()?.name || "");
    const successEl = document.getElementById("importSessionSuccess");
    const flowEl = document.getElementById("importSessionFlow");
    const mergeEl = document.getElementById("importSessionMerge");
    const pass1 = document.getElementById("importSessionPass1");
    const pass2 = document.getElementById("importSessionPass2");
    const msg = document.getElementById("importSessionMsg");
    const btn = document.getElementById("importSessionConfirm");
    if (successEl) {
        const text = lang.t("mobile_import_success") || "Projeto {project} importado com sucesso.";
        successEl.textContent = text.replace("{project}", projectName);
    }
    if (flowEl) {
        const source = sessionStorage.getItem("skrv_mobile_import_source") || "";
        const target = sessionStorage.getItem("skrv_mobile_import_target") || "";
        const mode = sessionStorage.getItem("skrv_mobile_import_mode") || "";
        const sourceLabel = source === "qr"
            ? (lang.t("mobile_import_source_qr") || "QR")
            : source === "file"
                ? (lang.t("mobile_import_source_file") || "Arquivo")
                : (lang.t("mobile_import_source_unknown") || "Indefinida");
        const targetLabel = target === "new"
            ? (lang.t("mobile_import_target_new") || "novo projeto")
            : target === "active"
                ? (lang.t("mobile_import_target_active") || "projeto ativo")
                : (lang.t("mobile_import_target_unknown") || "indefinido");
        const actionLabel = mode === "replace"
            ? (lang.t("mobile_import_action_replace") || "substituir")
            : (lang.t("mobile_import_action_append") || "adicionar");
        const template = lang.t("mobile_import_flow") || "Origem: {source} · Destino: {target} · Ação: {action}";
        flowEl.textContent = template
            .replace("{source}", sourceLabel)
            .replace("{target}", targetLabel)
            .replace("{action}", actionLabel);
    }
    if (mergeEl) {
        const raw = sessionStorage.getItem("skrv_mobile_import_merge");
        let summary = null;
        if (raw) {
            try { summary = JSON.parse(raw); } catch (_) {}
        }
        mergeEl.textContent = formatImportMergeSummary(summary);
        mergeEl.style.display = mergeEl.textContent ? "" : "none";
    }
    const showError = (text) => {
        if (msg) {
            msg.textContent = text || "";
            msg.style.color = "#ff4444";
        }
    };
    const clearError = () => showError("");
    const updateBtn = () => {
        if (!btn) return;
        const v1 = pass1 ? pass1.value.trim() : "";
        const v2 = pass2 ? pass2.value.trim() : "";
        btn.disabled = !(v1 && v2 && v1 === v2);
    };
    const confirm = () => {
        const v1 = pass1 ? pass1.value.trim() : "";
        const v2 = pass2 ? pass2.value.trim() : "";
        if (!v1) {
            showError(lang.t("mobile_import_pass_error"));
            return;
        }
        if (v1 !== v2) {
            showError(lang.t("mobile_import_pass_mismatch"));
            return;
        }
        clearError();
        localStorage.setItem("lit_auth_key", v1);
        sessionStorage.removeItem("skrv_mobile_import_pending");
        sessionStorage.removeItem("skrv_mobile_import_name");
        sessionStorage.removeItem("skrv_mobile_import_merge");
        sessionStorage.removeItem("skrv_mobile_import_source");
        sessionStorage.removeItem("skrv_mobile_import_mode");
        sessionStorage.removeItem("skrv_mobile_import_target");
        setModalActive(modal, false);
        document.body.classList.remove("modal-active");
        setTimeout(() => openMobileNotesView(), 80);
    };
    if (btn) btn.onclick = confirm;
    [pass1, pass2].forEach((input) => {
        if (!input) return;
        input.addEventListener("input", () => {
            clearError();
            updateBtn();
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                confirm();
            }
        });
    });
    updateBtn();
    setModalActive(modal, true);
    document.body.classList.add("modal-active");
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
    if (!archive.skvTitle) {
        const active = archive.projects.find(p => p.id === archive.activeId) || archive.projects[0];
        archive.skvTitle = (active && active.name) ? active.name : (lang.t("default_project") || "Projeto");
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

    ensureBookTemplateProjects();
    return true;
}

function extractPayloadMainText(payload) {
    if (!payload) return "";
    const direct = String(payload.MASTER_TEXT || "").trim();
    if (direct) return direct;
    const archive = payload.ARCHIVE_STATE;
    if (!archive || !Array.isArray(archive.projects) || !archive.projects.length) return "";
    const active = archive.projects.find((p) => p.id === archive.activeId) || archive.projects[0];
    return String((active && active.content) || "").trim();
}

function appendPayloadToActiveProject(payload) {
    const incoming = extractPayloadMainText(payload);
    if (!incoming) return false;
    let active = store.getActive();
    if (!active) {
        const fallbackName = lang.t("default_project") || "Projeto";
        store.createProject(fallbackName, "");
        active = store.getActive();
    }
    if (!active) return false;
    const currentText = String(active.content || "").trim();
    active.content = currentText ? `${currentText}\n\n${incoming}` : incoming;
    active.date = new Date().toLocaleString();
    store.data.skvTitle = active.name || store.data.skvTitle;
    store.persist(true);
    return true;
}

function buildImportMergeSummary(payload, mode = "replace") {
    if (!payload) return null;
    const archive = payload.ARCHIVE_STATE || {};
    const projectCount = Array.isArray(archive.projects) ? archive.projects.length : 0;
    const incoming = extractPayloadMainText(payload);
    const incomingWords = incoming ? incoming.split(/\s+/).filter(Boolean).length : 0;
    const normalizedMode = mode === "append_active" ? "append_active" : "replace";
    const createdItems = normalizedMode === "append_active"
        ? (incoming ? 1 : 0)
        : Math.max(projectCount, incoming ? 1 : 0);
    const updatedItems = normalizedMode === "append_active"
        ? (incoming ? 1 : 0)
        : Math.max(projectCount, 1);
    return {
        mode: normalizedMode,
        createdItems,
        updatedItems,
        conflicts: 0,
        incomingWords
    };
}

function showImportInvalidError(source = "unknown") {
    if (!window.skvModal) return;
    if (!isMobileContext()) {
        const key = source === "file" ? "alert_capsule_invalid" : "alert_backup_invalid";
        window.skvModal.alert(lang.t(key));
        return;
    }
    const template = lang.t("mobile_import_invalid") || "Importação inválida ({source}).";
    const sourceLabel = source === "file"
        ? (lang.t("mobile_import_source_file") || "Arquivo")
        : source === "qr"
            ? (lang.t("mobile_import_source_qr") || "QR")
            : (lang.t("mobile_import_source_unknown") || "Indefinida");
    window.skvModal.alert(template.replace("{source}", sourceLabel));
}

function formatImportMergeSummary(summary) {
    if (!summary) return "";
    const createdLabel = lang.t("mobile_import_merge_created") || "Novos";
    const updatedLabel = lang.t("mobile_import_merge_updated") || "Atualizados";
    const conflictsLabel = lang.t("mobile_import_merge_conflicts") || "Conflitos";
    const wordsLabel = lang.t("mobile_import_merge_words") || "Palavras";
    return [
        `${createdLabel}: ${summary.createdItems || 0}`,
        `${updatedLabel}: ${summary.updatedItems || 0}`,
        `${conflictsLabel}: ${summary.conflicts || 0}`,
        `${wordsLabel}: ${summary.incomingWords || 0}`
    ].join("\n");
}

function handleImportSuccess(messageKey, mergeSummary = null, context = {}) {
    if (isMobileContext()) {
        const active = store.getActive();
        const projectName = store.data && store.data.skvTitle
            ? store.data.skvTitle
            : (active && active.name ? active.name : (lang.t("default_project") || "Projeto"));
        trackMobileFunnelEvent("import_success", {
            projectName,
            mode: (mergeSummary && mergeSummary.mode) || "replace",
            words: (mergeSummary && mergeSummary.incomingWords) || 0
        });
        setMobileProjectMeta(projectName);
        localStorage.removeItem("lit_auth_key");
        sessionStorage.setItem("skrv_mobile_import_pending", "1");
        sessionStorage.setItem("skrv_mobile_import_name", projectName);
        sessionStorage.setItem("skrv_mobile_import_source", context.source || "unknown");
        sessionStorage.setItem("skrv_mobile_import_mode", (mergeSummary && mergeSummary.mode) || "replace");
        if (mergeSummary) {
            sessionStorage.setItem("skrv_mobile_import_merge", JSON.stringify(mergeSummary));
        } else {
            sessionStorage.removeItem("skrv_mobile_import_merge");
        }
        location.reload();
        return;
    }
    if (messageKey && window.skvModal) window.skvModal.alert(lang.t(messageKey));
    location.reload();
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

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function textToParagraphs(text) {
    const clean = String(text || "").replace(/\r\n/g, "\n").trim();
    if (!clean) return "<p></p>";
    return clean
        .split(/\n\s*\n/)
        .map(block => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
        .join("");
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

function ensureBookTemplateProjects() {
    if (!store || !store.data) return;
    if (!Array.isArray(store.data.projects)) store.data.projects = [];
    const existing = new Map();
    store.data.projects.forEach((proj) => {
        if (proj && proj.bookPartKey && proj.bookPartGroup) {
            existing.set(`${proj.bookPartGroup}:${proj.bookPartKey}`, proj);
        }
    });
    const templateMap = new Map();
    BOOK_FOLDERS.forEach((folder) => {
        folder.template.forEach((part) => {
            templateMap.set(`${folder.id}:${part.key}`, part);
        });
    });
    let changed = false;
    BOOK_FOLDERS.forEach((folder) => {
        folder.template.forEach((part, idx) => {
            const mapKey = `${folder.id}:${part.key}`;
            const found = existing.get(mapKey);
            if (!found) {
                store.data.projects.unshift({
                    id: `bookpart_${folder.id}_${part.key}`,
                    name: part.title,
                    content: "",
                    placeholder: part.body,
                    date: new Date().toLocaleString(),
                    cursorPos: 0,
                    bookPart: true,
                    bookPartKey: part.key,
                    bookPartGroup: folder.id,
                    bookOrder: idx
                });
                changed = true;
                return;
            }
            if (!found.bookPart) {
                found.bookPart = true;
                changed = true;
            }
            if (found.bookPartGroup !== folder.id) {
                found.bookPartGroup = folder.id;
                changed = true;
            }
            if (found.bookOrder !== idx) {
                found.bookOrder = idx;
                changed = true;
            }
            const template = templateMap.get(mapKey);
            if (template) {
                if (!found.placeholder) {
                    found.placeholder = template.body;
                    changed = true;
                }
                const currentText = htmlToText(found.content || "").trim();
                if (currentText && template.body && currentText === template.body.trim()) {
                    found.content = "";
                    changed = true;
                }
            }
        });
    });
    if (changed) store.persist(true);
}

function getBookParts(groupId) {
    return (store.data.projects || [])
        .filter(p => p && p.bookPart && p.bookPartGroup === groupId)
        .sort((a, b) => (a.bookOrder || 0) - (b.bookOrder || 0));
}

function buildBookPdfHtml(title, parts) {
    const safeTitle = escapeHtml(title || "Livro");
    let body = `<section class="title-page"><h1>${safeTitle}</h1></section>`;
    parts.forEach((part) => {
        const text = htmlToText(part.content || "");
        body += `<section class="book-section"><h2>${escapeHtml(part.name || "")}</h2>${textToParagraphs(text)}</section>`;
    });
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${safeTitle}</title>
<style>
@page { size: A4; margin: 2.5cm; }
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.6; color: #000; background: #fff; }
h1 { text-align: center; margin: 200px 0 0; font-size: 26pt; letter-spacing: 0.5pt; }
h2 { font-size: 14pt; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.8pt; }
p { margin: 0 0 12px; text-align: left; }
.title-page { page-break-after: always; }
.book-section { page-break-before: always; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function exportBookPdf(groupId) {
    const parts = getBookParts(groupId);
    const title = store.data && store.data.skvTitle ? store.data.skvTitle : "Livro";
    const html = buildBookPdfHtml(title, parts);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
        const message = lang.t("print_popup_blocked_fallback") || lang.t("print_popup_blocked");
        if (window.skvModal && typeof window.skvModal.alert === "function") {
            window.skvModal.alert(message);
        } else {
            alert(message);
        }
        return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.onload = () => {
        try { w.print(); } catch (_) {}
    };
}

function buildBookPrintText(groupId) {
    const title = store.data && store.data.skvTitle ? store.data.skvTitle : "Livro";
    const folder = BOOK_FOLDERS.find((f) => f.id === groupId);
    const header = folder ? folder.title : "Livro";
    const blocks = [`=== ${header} ===`, title];
    const parts = getBookParts(groupId);
    parts.forEach((part) => {
        const text = htmlToText(part.content || "");
        blocks.push(`\n--- ${part.name || ""} ---\n${text}`);
    });
    return blocks.join("\n\n");
}

function printBookAll(groupId) {
    const title = store.data && store.data.skvTitle ? store.data.skvTitle : "Livro";
    const folder = BOOK_FOLDERS.find((f) => f.id === groupId);
    const header = folder ? folder.title : "Livro";
    const text = buildBookPrintText(groupId);
    printRawText(text, `.skv Writer - ${header} - ${title}`);
}

// Exposição mínima para módulo mobile (carregamento condicional)
window.skvLoadActiveDocument = loadActiveDocument;
window.skvRenderProjectList = renderProjectList;

function printRawText(text, title) {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
        const message = lang.t("print_popup_blocked_fallback") || lang.t("print_popup_blocked");
        if (window.skvModal && typeof window.skvModal.alert === "function") {
            window.skvModal.alert(message);
        } else {
            alert(message);
        }
        const safeName = String(title || "skrv_print")
            .replace(/[^\w]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 60) || "skrv_print";
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${safeName}.txt`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.remove();
        }, 0);
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
        const padding = 28;
        const panelHeight = panel.scrollHeight;
        const base = (header?.offsetHeight || 0) + (tabsRow?.offsetHeight || 0) + padding;
        const maxModal = Math.min(window.innerHeight * 0.72, 560);
        const target = Math.min(maxModal, panelHeight + base);
        helpModal.style.height = `${target}px`;
        panel.style.maxHeight = `${Math.max(200, target - base)}px`;
    };
    const openHelpModal = () => {
        const overlay = document.getElementById("helpModal");
        if (!overlay) return;
        setModalActive(overlay, true);
        if (!tabs.length || !panels.length) return;
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        tabs[0].classList.add("active");
        panels[0].classList.add("active");
        const activeTab = tabs[0];
        sizeHelpModal();
        setTimeout(() => {
            if (activeTab) activeTab.focus({ preventScroll: true });
        }, 80);
        setTimeout(() => {
            if (activeTab) activeTab.focus({ preventScroll: true });
        }, 180);
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
    ensureBookTemplateProjects();
    const projects = Array.isArray(store.data.projects) ? store.data.projects : [];
    const otherProjects = projects.filter(p => !p || !p.bookPart);

    const createProjectItem = (proj, { isBookPart = false } = {}) => {
        const div = document.createElement("div");
        div.className = `list-item ${proj.id === store.data.activeId ? 'active' : ''}`;
        if (isBookPart) div.classList.add("book-part-item");
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
                    if (window.skvMobileOpenProjectNote) {
                        window.skvMobileOpenProjectNote(proj);
                    }
                };
                if (!window.skvMobileOpenProjectNote) {
                    ensureMobileModule().then(run).catch(() => {});
                } else {
                    run();
                }
                if (sessionStorage.getItem("mobile_project_hint") !== "1") {
                    if (window.skvModal) window.skvModal.alert(lang.t("mobile_project_hint"));
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

        if (!isBookPart) {
            const btnEdit = document.createElement("button");
            btnEdit.className = "btn-icon-small"; btnEdit.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'><path d='M13 21h8'/><path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/></svg>";
            btnEdit.onclick = (e) => { e.stopPropagation(); enableInlineRename(infoDiv, proj.id, proj.name); };
            actionsDiv.appendChild(btnEdit);
        }

        const btnPrint = document.createElement("button");
        btnPrint.className = "btn-icon-small"; btnPrint.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/><path d='M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6'/><rect x='6' y='14' width='12' height='8' rx='1'/></svg>";
        btnPrint.onclick = (e) => {
            e.stopPropagation();
            const text = buildProjectReportText(proj);
            printRawText(text, `.skv Writer - ${proj.name || "Documento"}`);
        };
        actionsDiv.appendChild(btnPrint);

        if (!isBookPart) {
            const btnDel = document.createElement("button");
            btnDel.className = "btn-icon-small danger"; btnDel.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'><use href='src/assets/icons/phosphor-sprite.svg#icon-trash'></use></svg>";
            btnDel.onclick = async (e) => {
                e.stopPropagation();
                if (!window.skvModal) return;
                const ok = await window.skvModal.confirm(`${lang.t("project_delete_confirm")} "${proj.name}"?`);
                if (ok) {
                    store.deleteProject(proj.id);
                    renderProjectList();
                    if (store.data.projects.length > 0) loadActiveDocument();
                }
            };
            actionsDiv.appendChild(btnDel);
        }

        div.appendChild(infoDiv); div.appendChild(actionsDiv);
        return div;
    };

    BOOK_FOLDERS.forEach((folderConfig) => {
        const parts = getBookParts(folderConfig.id);
        if (!parts.length) return;
        const folder = document.createElement("div");
        folder.className = "list-folder";

        const header = document.createElement("div");
        header.className = "list-folder-header";
        const caret = document.createElement("span");
        caret.className = "folder-caret";
        const title = store.data && store.data.skvTitle ? store.data.skvTitle : "Livro";
        const label = document.createElement("div");
        label.className = "folder-title";
        label.innerHTML = `<strong>${folderConfig.title}</strong><span class="folder-title-meta">${title}</span>`;
        const actions = document.createElement("div");
        actions.className = "folder-actions";
        const btnPdf = document.createElement("button");
        btnPdf.className = "btn-icon-small";
        btnPdf.title = "Exportar PDF";
        btnPdf.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true'><path d='M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z'/><path d='M14 2v6h6'/><path d='M8 13h8'/><path d='M8 17h6'/></svg>";
        btnPdf.onclick = (e) => {
            e.stopPropagation();
            exportBookPdf(folderConfig.id);
        };
        actions.appendChild(btnPdf);
        const btnPrintAll = document.createElement("button");
        btnPrintAll.className = "btn-icon-small";
        btnPrintAll.title = "Imprimir livro";
        btnPrintAll.innerHTML = "<svg class='icon' viewBox='0 0 24 24' aria-hidden='true' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/><path d='M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6'/><rect x='6' y='14' width='12' height='8' rx='1'/></svg>";
        btnPrintAll.onclick = (e) => {
            e.stopPropagation();
            printBookAll(folderConfig.id);
        };
        actions.appendChild(btnPrintAll);

        header.appendChild(caret);
        header.appendChild(label);
        header.appendChild(actions);

        const items = document.createElement("div");
        items.className = "list-folder-items";
        const storageKey = `skrv_book_folder_open_${folderConfig.id}`;
        const stored = localStorage.getItem(storageKey);
        const open = stored === null ? Boolean(folderConfig.openDefault) : stored !== "0";
        if (!open) items.classList.add("is-collapsed");
        caret.textContent = open ? "▾" : "▸";

        header.onclick = () => {
            const isOpen = !items.classList.contains("is-collapsed");
            items.classList.toggle("is-collapsed", isOpen);
            caret.textContent = isOpen ? "▸" : "▾";
            localStorage.setItem(storageKey, isOpen ? "0" : "1");
        };

        parts.forEach((proj) => {
            items.appendChild(createProjectItem(proj, { isBookPart: true }));
        });

        folder.appendChild(header);
        folder.appendChild(items);
        list.appendChild(folder);
    });

    otherProjects.forEach((proj) => {
        if (!proj) return;
        list.appendChild(createProjectItem(proj));
    });
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
            if (!window.skvModal) return;
            const ok = await window.skvModal.confirm(`${lang.t("nav_delete_confirm")} "${label}"?`);
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
