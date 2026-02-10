(() => {
    const LANGS = {
        pt: {
            lang_label: "PT",
            mobile_gate_title: "Importar projeto",
            mobile_gate_body: "Abra o scanner e traga sua cápsula .skv",
            mobile_gate_scan: "LER QR CODE",
            mobile_empty_title: "Importe um projeto",
            mobile_empty_body: "O celular guarda o livro inteiro e espera um desktop para despejar.",
            mobile_scan: "LER QR CODE",
            mobile_book_title: "Caderninho",
            mobile_extract: "Extrair",
            mobile_extract_qr: "Extrair por QR",
            mobile_extract_body: "Retire o projeto do celular em qualquer formato.",
            mobile_export_qr: "ENVIAR POR QR",
            mobile_export_save: "SALVAR .SKV",
            mobile_export_b64: "SALVAR .B64",
            mobile_export_copy: "COPIAR B64",
            mobile_support: "Apoie o projeto",
            mobile_support_copied: "Copiado",
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
            mobile_gate_body: "Open the scanner and bring your .skv capsule",
            mobile_gate_scan: "READ QR CODE",
            mobile_empty_title: "Import a project",
            mobile_empty_body: "Your phone keeps the whole book and waits for a desktop to pour it out.",
            mobile_scan: "READ QR CODE",
            mobile_book_title: "Notebook",
            mobile_extract: "Extract",
            mobile_extract_qr: "Extract by QR",
            mobile_extract_body: "Retrieve the project from your phone in any format.",
            mobile_export_qr: "SEND BY QR",
            mobile_export_save: "SAVE .SKV",
            mobile_export_b64: "SAVE .B64",
            mobile_export_copy: "COPY B64",
            mobile_support: "Support the project",
            mobile_support_copied: "Copied",
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
            mobile_gate_body: "Abra el escáner y traiga su cápsula .skv",
            mobile_gate_scan: "LEER QR",
            mobile_empty_title: "Importa un proyecto",
            mobile_empty_body: "El celular guarda todo el libro y espera un escritorio para vaciarlo.",
            mobile_scan: "LEER QR",
            mobile_book_title: "Cuaderno",
            mobile_extract: "Extraer",
            mobile_extract_qr: "Extraer por QR",
            mobile_extract_body: "Retira el proyecto del teléfono en cualquier formato.",
            mobile_export_qr: "ENVIAR POR QR",
            mobile_export_save: "GUARDAR .SKV",
            mobile_export_b64: "GUARDAR .B64",
            mobile_export_copy: "COPIAR B64",
            mobile_support: "Apoya el proyecto",
            mobile_support_copied: "Copiado",
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
            mobile_gate_body: "Ouvrez le scanner et importez votre capsule .skv",
            mobile_gate_scan: "LIRE QR",
            mobile_empty_title: "Importer un projet",
            mobile_empty_body: "Le téléphone garde tout le livre et attend un desktop pour le verser.",
            mobile_scan: "LIRE QR",
            mobile_book_title: "Carnet",
            mobile_extract: "Extraire",
            mobile_extract_qr: "Extraire par QR",
            mobile_extract_body: "Retirez le projet du téléphone dans n'importe quel format.",
            mobile_export_qr: "ENVOYER PAR QR",
            mobile_export_save: "ENREGISTRER .SKV",
            mobile_export_b64: "ENREGISTRER .B64",
            mobile_export_copy: "COPIER B64",
            mobile_support: "Soutenir le projet",
            mobile_support_copied: "Copié",
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

    const STORAGE_KEY = "skrv_mobile_payload";
    const state = {
        lang: (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("en") ? "en"
            : (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("es") ? "es"
            : (localStorage.getItem("lit_lang") || "pt").toLowerCase().includes("fr") ? "fr"
            : "pt"
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
    };

    const savePayload = (payload) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    };

    const loadPayload = () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
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
        if (!archive || !Array.isArray(archive.projects) || !archive.projects.length) return "";
        const active = archive.projects.find(p => p.id === archive.activeId) || archive.projects[0];
        return active && active.name ? String(active.name) : "";
    };

    const STRAP_COLORS = [
        "#f2a900", "#d97706", "#3a6ea5", "#6b8e23",
        "#8b5cf6", "#b45309", "#374151", "#16a34a", "#dc2626"
    ];

    const applyStrapColor = () => {
        if (!els.book) return;
        const strap = els.book.querySelector(".strap");
        if (!strap) return;
        const idx = Math.floor(Math.random() * STRAP_COLORS.length);
        strap.style.background = STRAP_COLORS[idx];
    };

    const cycleStrapColor = () => {
        if (!els.book) return;
        const strap = els.book.querySelector(".strap");
        if (!strap) return;
        const current = strap.style.background || "";
        const currentIdx = STRAP_COLORS.findIndex(c => c.toLowerCase() === current.toLowerCase());
        const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % STRAP_COLORS.length : 0;
        strap.style.background = STRAP_COLORS[nextIdx];
    };

    const renderBook = () => {
        const payload = loadPayload();
        if (!els.book || !els.empty) return;
        if (!payload) {
            els.book.classList.add("hidden");
            els.book.classList.remove("open");
            els.empty.style.display = "grid";
            return;
        }
        els.empty.style.display = "none";
        els.book.classList.remove("hidden");
        els.book.classList.remove("open");
        if (!els.book.classList.contains("manual-pos")) {
            els.book.style.left = "50%";
            els.book.style.top = "50%";
        }
        if (els.bookDate) els.bookDate.textContent = payloadDate(payload);
        const name = payloadProjectName(payload);
        const titleEl = document.getElementById("bookCoverTitle");
        if (titleEl) titleEl.textContent = name || "Projeto";
        applyStrapColor();
    };

    const openGate = () => {
        if (els.gate) els.gate.classList.add("active");
    };

    const closeGate = () => {
        if (els.gate) els.gate.classList.remove("active");
        sessionStorage.setItem("skrv_mobile_gate_done", "1");
    };

    const buildPayload = () => loadPayload();

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

    const importPayload = (payload) => {
        if (!payload || !payload.ARCHIVE_STATE) return false;
        savePayload(payload);
        renderBook();
        closeGate();
        return true;
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
        els.gate = document.getElementById("mobileGate");
        els.gateScan = document.getElementById("mobileGateScan");
        els.book = document.getElementById("mobileTotbook");
        els.bookDate = document.getElementById("bookCoverDate");
        els.empty = document.getElementById("mobileEmpty");
        els.scanPrimary = document.getElementById("mobileScanPrimary");
        els.exportQr = document.getElementById("btnExportQr");
        els.exportFile = document.getElementById("btnExportFile");
        els.exportB64 = document.getElementById("btnExportB64");
        els.exportCopy = document.getElementById("btnCopyB64");
        els.support = document.getElementById("mobileSupport");
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
    };

    const bindEvents = () => {
        if (els.langToggle) els.langToggle.addEventListener("click", cycleLang);
        if (els.gateScan) els.gateScan.addEventListener("click", () => {
            closeGate();
            openScanModal();
        });
        if (els.scanPrimary) els.scanPrimary.addEventListener("click", openScanModal);
        let dragStart = null;
        let dragOffset = null;
        let dragMoved = false;
        let longPressTimer = null;
        let colorLoopTimer = null;
        const clearLongPress = () => {
            if (longPressTimer) clearTimeout(longPressTimer);
            longPressTimer = null;
            if (colorLoopTimer) clearInterval(colorLoopTimer);
            colorLoopTimer = null;
        };
        const startLongPress = () => {
            clearLongPress();
            longPressTimer = setTimeout(() => {
                cycleStrapColor();
                colorLoopTimer = setInterval(cycleStrapColor, 220);
            }, 480);
        };
        const setManualPos = (x, y) => {
            if (!els.book) return;
            const rect = els.book.getBoundingClientRect();
            const maxX = Math.max(0, window.innerWidth - rect.width);
            const maxY = Math.max(0, window.innerHeight - rect.height);
            const nx = Math.max(0, Math.min(maxX, x));
            const ny = Math.max(0, Math.min(maxY, y));
            els.book.style.left = `${nx}px`;
            els.book.style.top = `${ny}px`;
            els.book.classList.add("manual-pos");
        };
        if (els.book) {
            els.book.addEventListener("pointerdown", (e) => {
                if (els.book.classList.contains("open")) return;
                dragStart = { x: e.clientX, y: e.clientY };
                const rect = els.book.getBoundingClientRect();
                dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                dragMoved = false;
                startLongPress();
                els.book.setPointerCapture(e.pointerId);
            });
            els.book.addEventListener("pointermove", (e) => {
                if (!dragStart || !dragOffset) return;
                const dx = Math.abs(e.clientX - dragStart.x);
                const dy = Math.abs(e.clientY - dragStart.y);
                if (dx > 6 || dy > 6) {
                    dragMoved = true;
                    clearLongPress();
                    const x = e.clientX - dragOffset.x;
                    const y = e.clientY - dragOffset.y;
                    setManualPos(x, y);
                }
            });
            els.book.addEventListener("pointerup", (e) => {
                if (!dragStart) return;
                clearLongPress();
                els.book.releasePointerCapture(e.pointerId);
                if (!dragMoved) {
                    els.book.classList.add("open");
                }
                dragStart = null;
                dragOffset = null;
                dragMoved = false;
            });
            els.book.addEventListener("pointercancel", (e) => {
                clearLongPress();
                if (dragStart) els.book.releasePointerCapture(e.pointerId);
                dragStart = null;
                dragOffset = null;
                dragMoved = false;
            });
        }
        document.addEventListener("click", (e) => {
            if (!els.book || !els.book.classList.contains("open")) return;
            if (e.target.closest("#mobileTotbook")) return;
            els.book.classList.remove("open");
        });

        if (els.exportQr) {
            els.exportQr.addEventListener("click", () => {
                openStreamModal();
            });
        }
        if (els.exportFile) {
            els.exportFile.addEventListener("click", () => {
                const payload = buildPayload();
                if (!payload) return;
                const json = JSON.stringify(payload, null, 2);
                const blob = new Blob([json], { type: "application/json;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `SKRV_${Date.now()}.skv`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        if (els.exportB64) {
            els.exportB64.addEventListener("click", () => {
                const payload = buildPayload();
                if (!payload) return;
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
        if (els.exportCopy) {
            els.exportCopy.addEventListener("click", () => {
                const payload = buildPayload();
                if (!payload) return;
                const base64 = buildBase64(payload);
                navigator.clipboard?.writeText(base64).catch(() => {});
            });
        }
        if (els.support) {
            els.support.addEventListener("click", () => {
                const value = els.support.getAttribute("data-copy") || "";
                navigator.clipboard?.writeText(value).catch(() => {});
                els.support.classList.add("is-copied");
                const prev = els.support.textContent;
                els.support.textContent = t("mobile_support_copied");
                setTimeout(() => {
                    els.support.textContent = t("mobile_support");
                    els.support.classList.remove("is-copied");
                }, 1200);
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
        renderBook();

        const gateDone = sessionStorage.getItem("skrv_mobile_gate_done") === "1";
        if (gateDone) {
            closeGate();
        } else {
            openGate();
        }
    };

    window.addEventListener("DOMContentLoaded", init);
})();
