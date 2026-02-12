(() => {
    const LANGS = {
        pt: {
            lang_label: "PTBR",
            mobile_gate_title: "Importar projeto",
            mobile_gate_body: "Abra o scanner e traga seu projeto de um notebook (exportar > stream QR), tablet ou outra carteira eskrev em outro celular.",
            mobile_gate_scan: "LER QR CODE",
            mobile_intro: "Aqui é sua carteira de projetos. No desktop: Mesa > puxar do celular ou abrir .skv. (faça backups)",
            mobile_top_note: "Nada é enviado. Nada é rastreado. Tudo fica local.",
            mobile_empty_title: "Importe um projeto",
            mobile_empty_body: "O celular guarda o livro inteiro e espera um desktop para despejar.",
            mobile_scan: "TRAZER PROJETO",
            mobile_book_title: "Caderninho",
            mobile_extract: "Extrair",
            mobile_extract_qr: "Extrair por QR",
            mobile_extract_body: "Retire o projeto do celular em qualquer formato.",
            mobile_demo_book: "Me toque",
            mobile_demo_title: "Como usar",
            mobile_demo_body: "Toque para abrir.\nArraste para baixo e solte para apagar.\nMáximo: 6 projetos (use outro navegador para mais).\nUse TRAZER PROJETO para importar um .skv.",
            mobile_export_qr: "ENVIAR POR QR",
            mobile_export_save: "SALVAR .SKV",
            mobile_export_b64: "SALVAR .B64",
            mobile_export_copy: "COPIAR B64",
            mobile_footer_note: "Eskrev é grátis. Se foi útil pra você, considere apoiar o projeto para manter domínio, hospedagem e manutenção:",
            mobile_footer_support: "apoie: <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
            mobile_limit: "Limite máximo de projetos salvos.",
            mobile_delete_label: "Deletar",
            mobile_delete_confirm: "Deletar projeto?",
            mobile_cancel_label: "Cancelar",
            cancel_label: "Cancelar",
            delete_label: "Deletar",
            mobile_trash: "Apagar",
            close_label: "OK",
            qr_scan_title: "SCAN QR",
            qr_scan_wait: "AGUARDANDO QR...",
            qr_scan_stop: "PARAR SCAN",
            qr_fallback_hint: "Sem câmera? Importe o arquivo .b64/.skv ou cole a string.",
            qr_fallback_import: "IMPORTAR ARQUIVO",
            qr_fallback_paste: "Cole a string base64",
            qr_fallback_restore: "RESTAURAR",
            qr_stream_title: "STREAM QR",
            qr_stream_active: "STREAM ATIVO",
            qr_stream_pause: "PAUSAR",
            qr_stream_resume: "CONTINUAR",
            qr_stream_copy: "COPIAR BASE64",
            qr_stream_save: "SALVAR .B64",
            qr_stream_hint: "Feche para encerrar o envio.",
            qr_stream_empty: "Nada para enviar.",
            qr_frame: "FRAME",
            qr_restore_in_progress: "RESTAURANDO...",
            qr_decode_fail: "Falha ao restaurar.",
            qr_camera_blocked: "Câmera bloqueada.",
            qr_camera_missing: "Câmera indisponível.",
            qr_no_detector: "Detector não disponível.",
            qr_using_fallback: "Usando fallback.",
            qr_libs_missing: "Bibliotecas ausentes."
        },
        en: {
            lang_label: "EN",
            mobile_gate_title: "Import project",
            mobile_gate_body: "Open the scanner and bring your project from a notebook (export > stream QR), tablet, or another eskrev wallet on a different phone.",
            mobile_gate_scan: "READ QR CODE",
            mobile_intro: "This is your project wallet. On desktop: Desk > pull from phone or open .skv. (make backups)",
            mobile_top_note: "Nothing is sent. Nothing is tracked. Everything stays local.",
            mobile_empty_title: "Import a project",
            mobile_empty_body: "Your phone keeps the whole book and waits for a desktop to pour it out.",
            mobile_scan: "BRING PROJECT",
            mobile_book_title: "Notebook",
            mobile_extract: "Extract",
            mobile_extract_qr: "Extract by QR",
            mobile_extract_body: "Retrieve the project from your phone in any format.",
            mobile_demo_book: "Touch me",
            mobile_demo_title: "How it works",
            mobile_demo_body: "Tap to open.\nDrag down and release to delete.\nMax: 6 projects (use another browser for more).\nUse BRING PROJECT to import a .skv.",
            mobile_export_qr: "SEND BY QR",
            mobile_export_save: "SAVE .SKV",
            mobile_export_b64: "SAVE .B64",
            mobile_export_copy: "COPY B64",
            mobile_footer_note: "Eskrev is free. If you found it useful, consider supporting the project to keep domain, hosting, and maintenance:",
            mobile_footer_support: "support: <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
            mobile_limit: "Maximum projects saved.",
            mobile_delete_label: "Delete",
            mobile_delete_confirm: "Delete project?",
            mobile_cancel_label: "Cancel",
            cancel_label: "Cancel",
            delete_label: "Delete",
            mobile_trash: "Delete",
            close_label: "OK",
            qr_scan_title: "SCAN QR",
            qr_scan_wait: "WAITING FOR QR...",
            qr_scan_stop: "STOP SCAN",
            qr_fallback_hint: "No camera? Import .b64/.skv or paste the string.",
            qr_fallback_import: "IMPORT FILE",
            qr_fallback_paste: "Paste base64 string",
            qr_fallback_restore: "RESTORE",
            qr_stream_title: "QR STREAM",
            qr_stream_active: "STREAM ACTIVE",
            qr_stream_pause: "PAUSE",
            qr_stream_resume: "RESUME",
            qr_stream_copy: "COPY BASE64",
            qr_stream_save: "SAVE .B64",
            qr_stream_hint: "Close to stop sending.",
            qr_stream_empty: "Nothing to send.",
            qr_frame: "FRAME",
            qr_restore_in_progress: "RESTORING...",
            qr_decode_fail: "Failed to restore.",
            qr_camera_blocked: "Camera blocked.",
            qr_camera_missing: "Camera unavailable.",
            qr_no_detector: "Detector not available.",
            qr_using_fallback: "Using fallback.",
            qr_libs_missing: "Libraries missing."
        },
        es: {
            lang_label: "ES",
            mobile_gate_title: "Importar proyecto",
            mobile_gate_body: "Abre el escáner y trae tu proyecto desde un notebook (exportar > stream QR), tablet u otra billetera eskrev en otro celular.",
            mobile_gate_scan: "LEER QR",
            mobile_intro: "Esta es tu cartera de proyectos. En desktop: Mesa > traer desde el celular o abrir .skv. (haz backups)",
            mobile_top_note: "Nada se envía. Nada se rastrea. Todo queda local.",
            mobile_empty_title: "Importa un proyecto",
            mobile_empty_body: "El celular guarda todo el libro y espera un escritorio para vaciarlo.",
            mobile_scan: "TRAER PROYECTO",
            mobile_book_title: "Cuaderno",
            mobile_extract: "Extraer",
            mobile_extract_qr: "Extraer por QR",
            mobile_extract_body: "Retira el proyecto del teléfono en cualquier formato.",
            mobile_demo_book: "Tócame",
            mobile_demo_title: "Cómo usar",
            mobile_demo_body: "Toca para abrir.\nArrastra hacia abajo y suelta para borrar.\nMáximo: 6 proyectos (usa otro navegador para más).\nUsa TRAER PROYECTO para importar un .skv.",
            mobile_export_qr: "ENVIAR POR QR",
            mobile_export_save: "GUARDAR .SKV",
            mobile_export_b64: "GUARDAR .B64",
            mobile_export_copy: "COPIAR B64",
            mobile_footer_note: "Eskrev es gratis. Si te resultó útil, considera apoyar el proyecto para mantener dominio, hosting y mantenimiento:",
            mobile_footer_support: "apoya: <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
            mobile_limit: "Límite máximo de proyectos guardados.",
            mobile_delete_label: "Borrar",
            mobile_delete_confirm: "¿Borrar proyecto?",
            mobile_cancel_label: "Cancelar",
            cancel_label: "Cancelar",
            delete_label: "Borrar",
            mobile_trash: "Borrar",
            close_label: "OK",
            qr_scan_title: "SCAN QR",
            qr_scan_wait: "ESPERANDO QR...",
            qr_scan_stop: "DETENER",
            qr_fallback_hint: "Sin cámara? Importa .b64/.skv o pega la cadena.",
            qr_fallback_import: "IMPORTAR ARCHIVO",
            qr_fallback_paste: "Pega la cadena base64",
            qr_fallback_restore: "RESTAURAR",
            qr_stream_title: "STREAM QR",
            qr_stream_active: "STREAM ACTIVO",
            qr_stream_pause: "PAUSAR",
            qr_stream_resume: "CONTINUAR",
            qr_stream_copy: "COPIAR BASE64",
            qr_stream_save: "GUARDAR .B64",
            qr_stream_hint: "Cierra para detener.",
            qr_stream_empty: "Nada para enviar.",
            qr_frame: "FRAME",
            qr_restore_in_progress: "RESTAURANDO...",
            qr_decode_fail: "Fallo al restaurar.",
            qr_camera_blocked: "Cámara bloqueada.",
            qr_camera_missing: "Cámara no disponible.",
            qr_no_detector: "Detector no disponible.",
            qr_using_fallback: "Usando fallback.",
            qr_libs_missing: "Bibliotecas ausentes."
        },
        fr: {
            lang_label: "FR",
            mobile_gate_title: "Importer un projet",
            mobile_gate_body: "Ouvrez le scanner et importez votre projet depuis un notebook (exporter > stream QR), une tablette ou un autre portefeuille eskrev sur un autre téléphone.",
            mobile_gate_scan: "LIRE QR",
            mobile_intro: "Ici, c'est votre portefeuille de projets. Sur desktop : Table > récupérer du mobile ou ouvrir .skv. (faites des sauvegardes)",
            mobile_top_note: "Rien n'est envoyé. Rien n'est suivi. Tout reste local.",
            mobile_empty_title: "Importer un projet",
            mobile_empty_body: "Le téléphone garde tout le livre et attend un desktop pour le verser.",
            mobile_scan: "APPORTER PROJET",
            mobile_book_title: "Carnet",
            mobile_extract: "Extraire",
            mobile_extract_qr: "Extraire par QR",
            mobile_extract_body: "Retirez le projet du téléphone dans n'importe quel format.",
            mobile_demo_book: "Touchez-moi",
            mobile_demo_title: "Comment utiliser",
            mobile_demo_body: "Touchez pour ouvrir.\nFaites glisser vers le bas et relâchez pour supprimer.\nMax: 6 projets (utilisez un autre navigateur pour plus).\nUtilisez APPORTER PROJET pour importer un .skv.",
            mobile_export_qr: "ENVOYER PAR QR",
            mobile_export_save: "ENREGISTRER .SKV",
            mobile_export_b64: "ENREGISTRER .B64",
            mobile_export_copy: "COPIER B64",
            mobile_footer_note: "Eskrev est gratuit. Si vous l’avez trouvé utile, vous pouvez soutenir le projet pour assurer domaine, hébergement et maintenance:",
            mobile_footer_support: "soutenez : <span class=\"marquee-copy\" data-copy=\"BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP\">BC1QUX0NG3WYLXESMFCWWP5D3QEMSVRL8TENL2HNVP</span> | <span class=\"marquee-copy\" data-copy=\"eskrev@disroot.org\">eskrev@disroot.org</span> pix/paypal",
            mobile_limit: "Limite maximum de projets enregistrés.",
            mobile_delete_label: "Supprimer",
            mobile_delete_confirm: "Supprimer le projet ?",
            mobile_cancel_label: "Annuler",
            cancel_label: "Annuler",
            delete_label: "Supprimer",
            mobile_trash: "Supprimer",
            close_label: "OK",
            qr_scan_title: "SCAN QR",
            qr_scan_wait: "EN ATTENTE...",
            qr_scan_stop: "ARRETER",
            qr_fallback_hint: "Pas de caméra? Importez .b64/.skv ou collez la chaîne.",
            qr_fallback_import: "IMPORTER",
            qr_fallback_paste: "Collez la chaîne base64",
            qr_fallback_restore: "RESTAURER",
            qr_stream_title: "STREAM QR",
            qr_stream_active: "STREAM ACTIF",
            qr_stream_pause: "PAUSE",
            qr_stream_resume: "CONTINUER",
            qr_stream_copy: "COPIER BASE64",
            qr_stream_save: "ENREGISTRER .B64",
            qr_stream_hint: "Fermez pour arrêter.",
            qr_stream_empty: "Rien à envoyer.",
            qr_frame: "FRAME",
            qr_restore_in_progress: "RESTAURATION...",
            qr_decode_fail: "Échec de restauration.",
            qr_camera_blocked: "Caméra bloquée.",
            qr_camera_missing: "Caméra indisponible.",
            qr_no_detector: "Détecteur indisponible.",
            qr_using_fallback: "Fallback utilisé.",
            qr_libs_missing: "Bibliothèques manquantes."
        }
    };

    const STORAGE_KEY = "skrv_mobile_payloads";
    const DEMO_DISMISSED_KEY = "skrv_mobile_demo_dismissed";
    const MAX_BOOKS = 6;
    const state = {
        lang: (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("en") ? "en"
            : (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("es") ? "es"
            : (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("fr") ? "fr"
            : "pt",
        activeId: null
    };

    const els = {};

    const t = (key) => {
        const dict = LANGS[state.lang] || LANGS.pt;
        return dict[key] || LANGS.pt[key] || key;
    };

    const applyI18n = () => {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (key) el.textContent = t(key);
        });
        document.querySelectorAll("[data-i18n-html]").forEach((el) => {
            const key = el.getAttribute("data-i18n-html");
            if (key) el.innerHTML = t(key);
        });
        document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
            const key = el.getAttribute("data-i18n-ph");
            if (key) el.setAttribute("placeholder", t(key));
        });
        document.querySelectorAll("[data-i18n-title]").forEach((el) => {
            const key = el.getAttribute("data-i18n-title");
            if (key) el.setAttribute("title", t(key));
        });
        if (els.langToggle) els.langToggle.textContent = t("lang_label");
    };

    const cycleLang = () => {
        const order = ["pt", "en", "es", "fr"];
        const idx = order.indexOf(state.lang);
        state.lang = order[(idx + 1) % order.length];
        localStorage.setItem("lit_lang", state.lang);
        applyI18n();
        renderBooks();
        if (els.bookModal && els.bookModal.classList.contains("active")) {
            renderBookModal();
        }
    };

    const buildDemoPayload = () => ({
        HEADER: { CREATED: new Date().toISOString() },
        ARCHIVE_STATE: {
            skvTitle: t("mobile_demo_book"),
            projects: [{
                id: "demo",
                name: t("mobile_demo_book"),
                content: "",
                date: new Date().toLocaleString(),
                cursorPos: 0
            }],
            activeId: "demo",
            memo: ""
        }
    });

    const savePayloads = (items) => {
        const list = Array.isArray(items) ? items : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    };

    const loadPayloads = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            if (!list.length && localStorage.getItem(DEMO_DISMISSED_KEY) !== "1") {
                return [{ id: "demo", payload: buildDemoPayload(), demo: true }];
            }
            return list;
        } catch (_) {
            return [];
        }
    };

    const payloadDate = (payload) => {
        const iso = payload && payload.HEADER && payload.HEADER.CREATED ? payload.HEADER.CREATED : "";
        const d = iso ? new Date(iso) : new Date();
        if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString();
        return d.toLocaleDateString();
    };

    const payloadProjectName = (payload) => {
        const archive = payload && payload.ARCHIVE_STATE ? payload.ARCHIVE_STATE : null;
        if (archive && archive.skvTitle) return String(archive.skvTitle);
        if (!archive || !Array.isArray(archive.projects) || !archive.projects.length) return "";
        const active = archive.projects.find(p => p.id === archive.activeId) || archive.projects[0];
        return active && active.name ? String(active.name) : "";
    };

    const STRAP_COLORS = [
        "#f9d976", "#ffd6a5", "#fbcfe8", "#c7d2fe",
        "#bae6fd", "#a7f3d0", "#bbf7d0", "#fde68a",
        "#fecaca", "#e9d5ff", "#fce7f3", "#d1fae5"
    ];

    const pickStrapColor = () => STRAP_COLORS[Math.floor(Math.random() * STRAP_COLORS.length)];

    const getGridConfig = () => {
        const isLandscape = window.matchMedia && window.matchMedia("(orientation: landscape)").matches;
        return isLandscape
            ? { cols: 6, rows: 1 }
            : { cols: 3, rows: 2 };
    };

    const renderBooks = () => {
        const items = loadPayloads();
        if (!els.grid || !els.empty || !els.library) return;
        els.grid.innerHTML = "";
        if (!items.length) {
            els.empty.classList.remove("is-hidden");
        } else {
            els.empty.classList.add("is-hidden");
        }

        const { cols, rows } = getGridConfig();
        const libRect = els.library.getBoundingClientRect();
        const slotW = libRect.width / cols;
        const slotH = libRect.height / rows;
        const bookW = Math.min(120, slotW * 0.9);
        const bookH = Math.min(170, slotH * 0.9);

        items.slice(0, MAX_BOOKS).forEach((item, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const left = col * slotW + (slotW - bookW) / 2;
            const top = row * slotH + (slotH - bookH) / 2;
            const book = document.createElement("div");
            book.className = `totbook${item.demo ? " demo" : ""}`;
            book.dataset.id = item.id;
            book.dataset.slotLeft = String(left);
            book.dataset.slotTop = String(top);
            book.dataset.slotWidth = String(bookW);
            book.dataset.slotHeight = String(bookH);
            if (item.demo) book.dataset.demo = "1";
            book.style.left = `${left}px`;
            book.style.top = `${top}px`;
            book.style.width = `${bookW}px`;
            book.style.height = `${bookH}px`;
            const strapColor = item.strapColor || pickStrapColor();
            item.strapColor = strapColor;
            const bookTitle = item.demo ? t("mobile_demo_title") : t("mobile_extract");
            const bookBodyRaw = item.demo ? t("mobile_demo_body") : t("mobile_extract_body");
            const bookBody = bookBodyRaw.replace(/\n/g, "<br>");

            book.innerHTML = `
                <div class="cover">
                    <div class="sheen"></div>
                    <div class="cover-date">${payloadDate(item.payload)}</div>
                    <div class="strap" style="background:${strapColor};"><span>${payloadProjectName(item.payload) || "Projeto"}</span></div>
                </div>
                <div class="delete-overlay"><span>${t("mobile_delete_label")}</span></div>
                <div class="elastic"></div>
                <div class="drag-handle"><div class="dots"></div></div>
                <div class="pages">
                    <div class="page-viewport">
                        <div class="sheet">
                            <div class="book-inner">
                                <div class="book-inner-title">${bookTitle}</div>
                                <div class="book-inner-body">${bookBody}</div>
                                <div class="book-inner-actions">
                                    <button class="btn-full primary" data-action="export-qr">${t("mobile_export_qr")}</button>
                                    <button class="btn-full" data-action="export-skv">${t("mobile_export_save")}</button>
                                    <button class="btn-full" data-action="export-b64">${t("mobile_export_b64")}</button>
                                    <button class="btn-full" data-action="copy-b64">${t("mobile_export_copy")}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="pagination">
                        <button class="prev" disabled aria-hidden="true">‹</button>
                        <span class="page-count">1/1</span>
                        <button class="next" disabled aria-hidden="true">›</button>
                    </div>
                </div>
            `;
            els.grid.appendChild(book);
        });

        const realItems = items.filter(item => !item.demo).slice(0, MAX_BOOKS);
        savePayloads(realItems);

        if (els.scanPrimary && els.limit) {
            if (items.length >= MAX_BOOKS) {
                els.scanPrimary.style.display = "none";
                els.limit.classList.add("active");
            } else {
                els.scanPrimary.style.display = "inline-flex";
                els.limit.classList.remove("active");
            }
        }
    };


    const openGate = () => {
        if (els.gate) els.gate.classList.add("active");
    };

    const closeGate = () => {
        if (els.gate) els.gate.classList.remove("active");
        sessionStorage.setItem("skrv_mobile_gate_done", "1");
    };

    const getPayloadById = (id) => {
        const items = loadPayloads();
        const item = items.find(i => i.id === id);
        return item ? item.payload : null;
    };

    const buildPayload = () => {
        if (state.activeId) return getPayloadById(state.activeId);
        const items = loadPayloads();
        return items[0] ? items[0].payload : null;
    };

    const renderBookModal = () => {
        if (!els.bookModalHeader || !els.bookModalBody || !els.bookModalActions) return;
        const payload = buildPayload();
        const isDemo = state.activeId === "demo";
        const projectName = payloadProjectName(payload) || t("mobile_book_title");
        const title = isDemo ? t("mobile_demo_title") : t("mobile_extract");
        const bodyRaw = isDemo ? t("mobile_demo_body") : t("mobile_extract_body");
        const body = bodyRaw.replace(/\n/g, "<br>");
        els.bookModalHeader.innerHTML = `
            <div class="book-modal-kicker">${projectName}</div>
            <div class="book-modal-title">${title}</div>
        `;
        els.bookModalBody.innerHTML = body;
        els.bookModalActions.innerHTML = `
            <button class="btn-full primary" data-action="export-qr">${t("mobile_export_qr")}</button>
            <button class="btn-full" data-action="export-skv">${t("mobile_export_save")}</button>
            <button class="btn-full" data-action="export-b64">${t("mobile_export_b64")}</button>
            <button class="btn-full" data-action="copy-b64">${t("mobile_export_copy")}</button>
        `;
    };

    const openBookModal = () => {
        if (!els.bookModal) return;
        renderBookModal();
        els.bookModal.classList.add("active");
        document.body.classList.add("has-open-book");
    };

    const closeBookModal = () => {
        if (!els.bookModal) return;
        els.bookModal.classList.remove("active");
        document.body.classList.remove("has-open-book");
    };

    const buildBase64 = (payload) => {
        if (!payload || !window.LZString) return "";
        const json = JSON.stringify(payload);
        return window.LZString.compressToBase64(json);
    };

    const parsePayloadFromJson = (json) => {
        try {
            const parsed = JSON.parse(json);
            if (!parsed || typeof parsed !== "object") return null;
            if (!parsed.HEADER || !parsed.ARCHIVE_STATE) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    };

    const decodeBase64 = (base64) => {
        if (!window.LZString) return null;
        const json = window.LZString.decompressFromBase64(base64.trim());
        if (!json) return null;
        return parsePayloadFromJson(json);
    };

    const addPayload = (payload) => {
        if (!payload || !payload.ARCHIVE_STATE) return false;
        const items = loadPayloads();
        if (items.length >= MAX_BOOKS) return false;
        const id = `mb_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
        items.push({
            id,
            payload,
            strapColor: pickStrapColor(),
            addedAt: new Date().toISOString()
        });
        savePayloads(items);
        state.activeId = id;
        return true;
    };

    const importPayload = (payload) => {
        const ok = addPayload(payload);
        renderBooks();
        if (ok) closeGate();
        return ok;
    };

    const openScanModal = () => {
        if (els.scanModal) els.scanModal.classList.add("active");
        startScan();
    };

    const closeScanModal = () => {
        if (els.scanModal) els.scanModal.classList.remove("active");
        stopScan();
    };

    let scanActive = false;
    let scanBusy = false;
    let scanStream = null;
    let scanDetector = null;
    let scanSession = null;
    let scanCanvas = null;
    let scanCtx = null;

    const parseFrame = (raw) => {
        const parts = raw.split("|");
        if (parts.length < 6) return null;
        const [version, id, idxRaw, totalRaw, checksum, data] = parts;
        if (version !== QR_VERSION) return null;
        const index = parseInt(idxRaw, 10);
        const total = parseInt(totalRaw, 10);
        if (!Number.isFinite(index) || !Number.isFinite(total)) return null;
        if (!id || !data) return null;
        if (crc32(data) !== checksum) return null;
        return { id, index, total, data };
    };

    const updateScanStatus = (text) => {
        if (els.scanStatus) els.scanStatus.textContent = text;
    };

    const initScanGrid = (total) => {
        if (!els.scanGrid) return;
        const columns = Math.ceil(Math.sqrt(total));
        els.scanGrid.innerHTML = "";
        els.scanGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        for (let i = 0; i < total; i += 1) {
            const cell = document.createElement("div");
            cell.style.background = "rgba(243,239,230,0.08)";
            cell.style.borderRadius = "3px";
            cell.style.paddingBottom = "100%";
            els.scanGrid.appendChild(cell);
        }
    };

    const markCell = (index) => {
        if (!els.scanGrid) return;
        const cell = els.scanGrid.children[index - 1];
        if (cell) cell.style.background = "rgba(31,79,255,0.6)";
    };

    const handleFrame = (frame) => {
        if (!frame) return;
        if (!scanSession || scanSession.id !== frame.id) {
            scanSession = {
                id: frame.id,
                total: frame.total,
                received: new Map()
            };
            initScanGrid(frame.total);
        }
        if (scanSession.total !== frame.total) return;
        if (scanSession.received.has(frame.index)) return;
        scanSession.received.set(frame.index, frame.data);
        markCell(frame.index);
        const receivedCount = scanSession.received.size;
        updateScanStatus(`${t("qr_scan_wait")} ${receivedCount}/${scanSession.total}`);
        if (els.scanProgress) {
            const pct = Math.max(0, Math.min(100, (receivedCount / scanSession.total) * 100));
            els.scanProgress.style.width = `${pct}%`;
        }
        if (receivedCount === scanSession.total) {
            const ordered = [];
            for (let i = 1; i <= scanSession.total; i += 1) {
                ordered.push(scanSession.received.get(i) || "");
            }
            const base64 = ordered.join("");
            const payload = decodeBase64(base64);
            if (payload) {
                importPayload(payload);
            } else {
                updateScanStatus(t("qr_decode_fail"));
            }
            stopScan();
            closeScanModal();
        }
    };

    const scanLoop = async () => {
        if (!scanActive || scanBusy) return;
        if (!els.scanVideo || els.scanVideo.readyState < 2) {
            requestAnimationFrame(scanLoop);
            return;
        }
        scanBusy = true;
        try {
            if (scanDetector) {
                const codes = await scanDetector.detect(els.scanVideo);
                if (codes && codes.length) handleFrame(parseFrame(codes[0].rawValue || ""));
            } else if (scanCtx && scanCanvas && window.jsQR) {
                const width = els.scanVideo.videoWidth || 640;
                const height = els.scanVideo.videoHeight || 480;
                scanCanvas.width = width;
                scanCanvas.height = height;
                scanCtx.drawImage(els.scanVideo, 0, 0, width, height);
                const imageData = scanCtx.getImageData(0, 0, width, height);
                const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                if (code && code.data) handleFrame(parseFrame(code.data));
            }
        } catch (_) {
            // ignore
        }
        scanBusy = false;
        requestAnimationFrame(scanLoop);
    };

    const startScan = async () => {
        if (!els.scanVideo || !navigator.mediaDevices) {
            updateScanStatus(t("qr_camera_missing"));
            return;
        }
        try {
            scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            els.scanVideo.srcObject = scanStream;
            await els.scanVideo.play();
            if ("BarcodeDetector" in window) {
                scanDetector = new BarcodeDetector({ formats: ["qr_code"] });
            } else if (window.jsQR) {
                scanCanvas = document.createElement("canvas");
                scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
            } else {
                updateScanStatus(t("qr_no_detector"));
                return;
            }
            scanActive = true;
            updateScanStatus(t("qr_scan_wait"));
            scanLoop();
        } catch (_) {
            updateScanStatus(t("qr_camera_blocked"));
        }
    };

    const stopScan = () => {
        scanActive = false;
        scanBusy = false;
        if (scanStream) {
            scanStream.getTracks().forEach(track => track.stop());
            scanStream = null;
        }
        if (els.scanVideo) els.scanVideo.srcObject = null;
        scanDetector = null;
        scanCanvas = null;
        scanCtx = null;
        scanSession = null;
    };

    const QR_VERSION = "v1";
    const CHUNK_SIZE = 200;
    const FRAME_INTERVAL_MS = 450;

    let streamTimer = null;
    let streamIndex = 0;
    let streamChunks = [];
    let streamTotal = 0;
    let streamBackupId = "";
    let qrInstance = null;

    const crc32 = (str) => {
        let crc = 0 ^ -1;
        for (let i = 0; i < str.length; i += 1) {
            const byte = str.charCodeAt(i);
            crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
        }
        return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
    };

    const CRC_TABLE = (() => {
        const table = [];
        for (let i = 0; i < 256; i += 1) {
            let c = i;
            for (let j = 0; j < 8; j += 1) {
                c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table.push(c >>> 0);
        }
        return table;
    })();

    const setupStreamFromBase64 = (base64) => {
        streamBackupId = Date.now().toString().slice(-6);
        streamChunks = base64.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [];
        streamTotal = streamChunks.length;
        streamIndex = 0;
    };

    const updateStreamMeta = () => {
        if (!els.streamMeta) return;
        els.streamMeta.textContent = `${t("qr_frame")}: ${streamIndex + 1}/${streamTotal}`;
    };

    const emitStreamFrame = () => {
        if (!streamChunks.length || !els.streamCode || !window.QRCode) return;
        const chunk = streamChunks[streamIndex];
        const payload = [QR_VERSION, streamBackupId, streamIndex, streamTotal, crc32(chunk), chunk].join("|");
        if (!qrInstance) {
            // eslint-disable-next-line no-undef
            qrInstance = new QRCode(els.streamCode, {
                text: payload,
                width: 220,
                height: 220,
                colorDark: "#2d2a26",
                colorLight: "#f5f3ec",
                correctLevel: QRCode.CorrectLevel.L
            });
        } else {
            qrInstance.clear();
            qrInstance.makeCode(payload);
        }
        if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_active");
        updateStreamMeta();
        streamIndex = (streamIndex + 1) % streamTotal;
    };

    const startStream = (payload) => {
        if (!payload) {
            if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_empty");
            return;
        }
        const base64 = buildBase64(payload);
        if (!base64) {
            if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_empty");
            return;
        }
        setupStreamFromBase64(base64);
        emitStreamFrame();
        streamTimer = setInterval(emitStreamFrame, FRAME_INTERVAL_MS);
    };

    const stopStream = () => {
        if (streamTimer) clearInterval(streamTimer);
        streamTimer = null;
        streamChunks = [];
        streamIndex = 0;
        streamTotal = 0;
        if (qrInstance) {
            qrInstance.clear();
            qrInstance = null;
        }
    };

    const toggleStreamPause = () => {
        if (streamTimer) {
            stopStream();
            if (els.streamPause) els.streamPause.textContent = t("qr_stream_resume");
        } else {
            startStream(buildPayload());
            if (els.streamPause) els.streamPause.textContent = t("qr_stream_pause");
        }
    };

    const openStreamModal = () => {
        if (els.streamModal) els.streamModal.classList.add("active");
        startStream(buildPayload());
    };

        const closeStreamModal = () => {
            if (els.streamModal) els.streamModal.classList.remove("active");
            stopStream();
        };


    const initElements = () => {
        els.langToggle = document.getElementById("mobileLangToggle");
        els.gateLangToggle = document.getElementById("mobileGateLangToggle");
        els.library = document.getElementById("library");
        els.gate = document.getElementById("mobileGate");
        els.gateScan = document.getElementById("mobileGateScan");
        els.grid = document.getElementById("booksGrid");
        els.empty = document.getElementById("mobileEmpty");
        els.scanPrimary = document.getElementById("mobileScanPrimary");
        els.limit = document.getElementById("mobileLimit");
        els.support = document.querySelector(".mobile-support");
        els.confirm = document.getElementById("deleteConfirm");
        els.deleteOk = document.getElementById("deleteOk");
        els.deleteCancel = document.getElementById("deleteCancel");
        els.scanModal = document.getElementById("qrScanModal");
        els.scanVideo = document.getElementById("qrScanVideo");
        els.scanStatus = document.getElementById("qrScanStatus");
        els.scanProgress = document.getElementById("qrScanProgress");
        els.scanGrid = document.getElementById("qrScanGrid");
        els.scanStop = document.getElementById("qrScanStop");
        els.scanImport = document.getElementById("qrScanImport");
        els.scanFile = document.getElementById("qrScanFile");
        els.scanPaste = document.getElementById("qrScanPaste");
        els.scanRestore = document.getElementById("qrScanRestore");
        els.streamModal = document.getElementById("qrStreamModal");
        els.streamCode = document.getElementById("qrStreamCode");
        els.streamStatus = document.getElementById("qrStreamStatus");
        els.streamMeta = document.getElementById("qrStreamMeta");
        els.streamPause = document.getElementById("qrStreamPause");
        els.streamCopy = document.getElementById("qrStreamCopy");
        els.streamSave = document.getElementById("qrStreamSave");
        els.streamClose = document.getElementById("qrStreamClose");
        els.bookModal = document.getElementById("bookModal");
        els.bookModalHeader = document.getElementById("bookModalHeader");
        els.bookModalBody = document.getElementById("bookModalBody");
        els.bookModalActions = document.getElementById("bookModalActions");
    };

    const bindEvents = () => {
        if (els.langToggle) els.langToggle.addEventListener("click", cycleLang);
        if (els.gateLangToggle) els.gateLangToggle.addEventListener("click", cycleLang);
        if (els.gateScan) els.gateScan.addEventListener("click", () => {
            closeGate();
            openScanModal();
        });
        if (els.scanPrimary) els.scanPrimary.addEventListener("click", openScanModal);
        let dragBook = null;
        let dragStart = null;
        let dragMoved = false;
        let moveRaf = null;
        let lastDy = 0;
        let pendingDeleteId = null;
        const getSlot = (book) => ({
            left: parseFloat(book.dataset.slotLeft || "0"),
            top: parseFloat(book.dataset.slotTop || "0")
        });
        const setBookTop = (book, top) => {
            if (!els.library) return;
            const libRect = els.library.getBoundingClientRect();
            const maxY = Math.max(0, libRect.height - book.offsetHeight);
            const ny = Math.max(0, Math.min(maxY, top));
            book.style.top = `${ny}px`;
        };
        const closeAllBooks = () => {
            state.activeId = null;
            closeBookModal();
        };
        const openBook = (book) => {
            if (!book) return;
            state.activeId = book.dataset.id || null;
            openBookModal();
        };
        const setDeleteProgress = (book, pct) => {
            if (!book) return;
            const clamped = Math.max(0, Math.min(1, pct));
            book.style.setProperty("--delete-progress", clamped.toString());
            book.classList.toggle("is-deleting", clamped > 0.05);
        };
        const showDeleteConfirm = (id) => {
            pendingDeleteId = id;
            if (els.confirm) els.confirm.classList.add("active");
        };
        const hideDeleteConfirm = () => {
            pendingDeleteId = null;
            if (els.confirm) els.confirm.classList.remove("active");
        };
        if (els.grid) {
            els.grid.addEventListener("pointerdown", (e) => {
                const book = e.target.closest(".totbook");
                if (!book || book.classList.contains("open")) return;
                dragBook = book;
                dragStart = { x: e.clientX, y: e.clientY };
                dragMoved = false;
                document.body.classList.add("is-dragging");
                book.setPointerCapture(e.pointerId);
            });
            els.grid.addEventListener("pointermove", (e) => {
                if (!dragBook || !dragStart) return;
                const dy = e.clientY - dragStart.y;
                if (dy > 6) {
                    dragMoved = true;
                    lastDy = dy;
                    if (moveRaf) return;
                    moveRaf = requestAnimationFrame(() => {
                        if (!dragBook || !dragStart) {
                            moveRaf = null;
                            return;
                        }
                        const slot = getSlot(dragBook);
                        setBookTop(dragBook, slot.top + lastDy);
                        setDeleteProgress(dragBook, lastDy / 140);
                        moveRaf = null;
                    });
                }
            });
            els.grid.addEventListener("pointerup", (e) => {
                if (!dragBook) return;
                if (moveRaf) {
                    cancelAnimationFrame(moveRaf);
                    moveRaf = null;
                }
                dragBook.releasePointerCapture(e.pointerId);
                document.body.classList.remove("is-dragging");
                const dy = dragStart ? (e.clientY - dragStart.y) : 0;
                const over = dy > 100;
                if (over) {
                    showDeleteConfirm(dragBook.dataset.id || null);
                }
                if (!dragMoved) {
                    openBook(dragBook);
                } else {
                    const slot = getSlot(dragBook);
                    dragBook.style.left = `${slot.left}px`;
                    dragBook.style.top = `${slot.top}px`;
                }
                setDeleteProgress(dragBook, 0);
                dragBook = null;
                dragStart = null;
                dragMoved = false;
            });
            els.grid.addEventListener("pointercancel", (e) => {
                if (!dragBook) return;
                if (moveRaf) {
                    cancelAnimationFrame(moveRaf);
                    moveRaf = null;
                }
                dragBook.releasePointerCapture(e.pointerId);
                document.body.classList.remove("is-dragging");
                setDeleteProgress(dragBook, 0);
                const slot = getSlot(dragBook);
                dragBook.style.left = `${slot.left}px`;
                dragBook.style.top = `${slot.top}px`;
                dragBook = null;
                dragStart = null;
                dragMoved = false;
            });
        }
        document.addEventListener("click", (e) => {
            if (els.bookModal && els.bookModal.classList.contains("active")) {
                if (e.target === els.bookModal) closeAllBooks();
                return;
            }
            if (!els.grid) return;
            if (e.target.closest(".totbook")) return;
            closeAllBooks();
        });

        if (els.deleteCancel) {
            els.deleteCancel.addEventListener("click", (e) => {
                e.preventDefault();
                hideDeleteConfirm();
            });
        }
        if (els.deleteOk) {
            els.deleteOk.addEventListener("click", (e) => {
                e.preventDefault();
                if (!pendingDeleteId) return;
                if (pendingDeleteId === "demo") {
                    localStorage.setItem(DEMO_DISMISSED_KEY, "1");
                }
                const items = loadPayloads().filter(item => item.id !== pendingDeleteId);
                savePayloads(items);
                hideDeleteConfirm();
                renderBooks();
            });
        }

        const handleBookAction = (action) => {
            const payload = buildPayload();
            if (!payload) return;
            if (action === "export-qr") {
                openStreamModal();
                return;
            }
            if (action === "export-skv") {
                const title = payloadProjectName(payload) || "skv";
                const safeName = title
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                    .toLowerCase();
                const slug = safeName || "skv";
                const json = JSON.stringify(payload, null, 2);
                const blob = new Blob([json], { type: "application/json;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${slug}_${Date.now()}.skv`;
                a.click();
                URL.revokeObjectURL(url);
                return;
            }
            if (action === "export-b64") {
                const title = payloadProjectName(payload) || "skv";
                const safeName = title
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")
                    .toLowerCase();
                const slug = safeName || "skv";
                const base64 = buildBase64(payload);
                const blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${slug}_${Date.now()}.b64`;
                a.click();
                URL.revokeObjectURL(url);
                return;
            }
            if (action === "copy-b64") {
                const base64 = buildBase64(payload);
                navigator.clipboard?.writeText(base64).catch(() => {});
            }
        };

        if (els.grid) {
            els.grid.addEventListener("click", (e) => {
                const actionEl = e.target.closest("[data-action]");
                if (actionEl) {
                    const action = actionEl.getAttribute("data-action") || "";
                    const book = e.target.closest(".totbook");
                    if (book) state.activeId = book.dataset.id || null;
                    handleBookAction(action);
                    return;
                }
            });
        }
        if (els.bookModalActions) {
            els.bookModalActions.addEventListener("click", (e) => {
                const actionEl = e.target.closest("[data-action]");
                if (!actionEl) return;
                const action = actionEl.getAttribute("data-action") || "";
                handleBookAction(action);
            });
        }
        if (els.support) {
            els.support.addEventListener("click", (e) => {
                const target = e.target.closest(".marquee-copy");
                if (!target) return;
                const value = target.getAttribute("data-copy");
                if (!value) return;
                navigator.clipboard?.writeText(value).catch(() => {});
                target.classList.add("is-copied");
                setTimeout(() => {
                    target.classList.remove("is-copied");
                }, 900);
            });
        }

        if (els.scanStop) els.scanStop.addEventListener("click", closeScanModal);
        if (els.scanImport && els.scanFile) {
            els.scanImport.addEventListener("click", () => els.scanFile.click());
            els.scanFile.addEventListener("change", (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    const raw = String(reader.result || "");
                    const payload = raw.trim().startsWith("{") ? parsePayloadFromJson(raw) : decodeBase64(raw);
                    if (payload) {
                        importPayload(payload);
                        closeScanModal();
                    }
                };
                reader.readAsText(file);
            });
        }
        if (els.scanPaste && els.scanRestore) {
            const update = () => {
                const raw = (els.scanPaste.value || "").trim();
                els.scanRestore.disabled = !raw;
            };
            els.scanPaste.addEventListener("input", update);
            els.scanRestore.addEventListener("click", () => {
                const raw = (els.scanPaste.value || "").trim();
                const payload = decodeBase64(raw);
                if (payload) {
                    importPayload(payload);
                    closeScanModal();
                }
            });
            update();
        }

        if (els.streamPause) els.streamPause.addEventListener("click", toggleStreamPause);
        if (els.streamCopy) {
            els.streamCopy.addEventListener("click", () => {
                const payload = buildPayload();
                const base64 = buildBase64(payload);
                navigator.clipboard?.writeText(base64).catch(() => {});
            });
        }
        if (els.streamSave) {
            els.streamSave.addEventListener("click", () => {
                const payload = buildPayload();
                const base64 = buildBase64(payload);
                const blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `SKRV_QR_${Date.now()}.b64`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        if (els.streamClose) {
            els.streamClose.addEventListener("click", closeStreamModal);
        }
    };

    const init = () => {
        initElements();
        applyI18n();
        bindEvents();
        renderBooks();
        window.addEventListener("resize", () => {
            renderBooks();
        });
        closeGate();
    };

    window.addEventListener("DOMContentLoaded", init);
})();
