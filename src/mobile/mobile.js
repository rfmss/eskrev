(() => {
    const LANGS = {
        pt: {
            lang_label: "PT",
            gate_title: "Importar projeto",
            gate_body: "",
            gate_scan: "LER QR CODE",
            gate_hint: "Ou ↑ para criar novo",
            gate_share: "Compartilhe o eskrev",
            setup_title: "Criar sessão",
            setup_project_label: "Nome do projeto",
            setup_project_ph: "Nome do projeto",
            setup_pass_label: "Senha provisória",
            setup_pass_ph: "Senha provisória",
            setup_pass_confirm_ph: "Confirmar senha",
            setup_error_name: "Digite o nome do projeto.",
            setup_error_pass: "Digite a senha provisória.",
            setup_error_match: "As senhas não coincidem.",
            setup_25: "25 MIN",
            setup_50: "50 MIN",
            import_title: "Projeto importado",
            import_success: "Projeto {project} importado com sucesso.",
            import_confirm: "CONFIRMAR",
            notes_title: "Notas de {project}",
            notes_placeholder: "Nota rápida...",
            notes_tags_ph: "Tags (opcional)",
            notes_folder_ph: "Pasta (opcional)",
            notes_save: "SALVAR NOTA",
            export_title: "Exportar",
            export_qr: "ENVIAR POR QR",
            export_file: "SALVAR .SKV",
            export_b64: "SALVAR .B64",
            export_hint: "Exporte para levar ao desktop.",
            scan_title: "Scan QR",
            scan_wait: "Aguardando QR...",
            scan_stop: "PARAR SCAN",
            scan_import: "IMPORTAR ARQUIVO",
            scan_restore: "RESTAURAR",
            scan_paste: "Cole a string base64",
            scan_fallback: "Sem câmera? Importe o arquivo .b64/.skv ou cole a string.",
            stream_title: "Enviar por QR",
            stream_pause: "PAUSAR",
            stream_resume: "CONTINUAR",
            stream_copy: "COPIAR BASE64",
            stream_save: "SALVAR .B64",
            stream_hint: "Feche para encerrar o envio.",
            donate: "O eskrev é feito para escrever sem alimentar plataformas. Se fizer sentido, apoie o projeto.",
            delete_all: "APAGAR TUDO",
            delete_confirm: "Apagar tudo deste dispositivo?",
            empty_notes: "Sem notas ainda."
        },
        en: {
            lang_label: "EN",
            gate_title: "Import project",
            gate_body: "",
            gate_scan: "READ QR CODE",
            gate_hint: "Or ↑ to create new",
            gate_share: "Share eskrev",
            setup_title: "Create session",
            setup_project_label: "Project name",
            setup_project_ph: "Project name",
            setup_pass_label: "Provisional password",
            setup_pass_ph: "Provisional password",
            setup_pass_confirm_ph: "Confirm password",
            setup_error_name: "Enter the project name.",
            setup_error_pass: "Enter the provisional password.",
            setup_error_match: "Passwords do not match.",
            setup_25: "25 MIN",
            setup_50: "50 MIN",
            import_title: "Project imported",
            import_success: "Project {project} imported successfully.",
            import_confirm: "CONFIRM",
            notes_title: "Notes of {project}",
            notes_placeholder: "Quick note...",
            notes_tags_ph: "Tags (optional)",
            notes_folder_ph: "Folder (optional)",
            notes_save: "SAVE NOTE",
            export_title: "Export",
            export_qr: "SEND BY QR",
            export_file: "SAVE .SKV",
            export_b64: "SAVE .B64",
            export_hint: "Export to move to desktop.",
            scan_title: "Scan QR",
            scan_wait: "Waiting for QR...",
            scan_stop: "STOP SCAN",
            scan_import: "IMPORT FILE",
            scan_restore: "RESTORE",
            scan_paste: "Paste base64 string",
            scan_fallback: "No camera? Import .b64/.skv or paste the string.",
            stream_title: "Send by QR",
            stream_pause: "PAUSE",
            stream_resume: "RESUME",
            stream_copy: "COPY BASE64",
            stream_save: "SAVE .B64",
            stream_hint: "Close to stop sending.",
            donate: "eskrev is made for writing without feeding platforms. If it makes sense, support the project.",
            delete_all: "DELETE ALL",
            delete_confirm: "Delete everything on this device?",
            empty_notes: "No notes yet."
        },
        es: {
            lang_label: "ES",
            gate_title: "Importar proyecto",
            gate_body: "",
            gate_scan: "LEER QR",
            gate_hint: "O ↑ para crear nuevo",
            gate_share: "Comparte eskrev",
            setup_title: "Crear sesión",
            setup_project_label: "Nombre del proyecto",
            setup_project_ph: "Nombre del proyecto",
            setup_pass_label: "Contraseña provisional",
            setup_pass_ph: "Contraseña provisional",
            setup_pass_confirm_ph: "Confirmar contraseña",
            setup_error_name: "Ingrese el nombre del proyecto.",
            setup_error_pass: "Ingrese la contraseña provisional.",
            setup_error_match: "Las contraseñas no coinciden.",
            setup_25: "25 MIN",
            setup_50: "50 MIN",
            import_title: "Proyecto importado",
            import_success: "Proyecto {project} importado con éxito.",
            import_confirm: "CONFIRMAR",
            notes_title: "Notas de {project}",
            notes_placeholder: "Nota rápida...",
            notes_tags_ph: "Tags (opcional)",
            notes_folder_ph: "Carpeta (opcional)",
            notes_save: "GUARDAR NOTA",
            export_title: "Exportar",
            export_qr: "ENVIAR POR QR",
            export_file: "GUARDAR .SKV",
            export_b64: "GUARDAR .B64",
            export_hint: "Exporta para llevar al desktop.",
            scan_title: "Scan QR",
            scan_wait: "Esperando QR...",
            scan_stop: "DETENER",
            scan_import: "IMPORTAR ARCHIVO",
            scan_restore: "RESTAURAR",
            scan_paste: "Pega la cadena base64",
            scan_fallback: "Sin cámara? Importa .b64/.skv o pega la cadena.",
            stream_title: "Enviar por QR",
            stream_pause: "PAUSAR",
            stream_resume: "CONTINUAR",
            stream_copy: "COPIAR BASE64",
            stream_save: "GUARDAR .B64",
            stream_hint: "Cierra para detener.",
            donate: "eskrev está hecho para escribir sin alimentar plataformas. Si tiene sentido, apoya el proyecto.",
            delete_all: "BORRAR TODO",
            delete_confirm: "¿Borrar todo en este dispositivo?",
            empty_notes: "Sin notas todavía."
        },
        fr: {
            lang_label: "FR",
            gate_title: "Importer un projet",
            gate_body: "",
            gate_scan: "LIRE QR CODE",
            gate_hint: "Ou ↑ pour créer",
            gate_share: "Partager eskrev",
            setup_title: "Créer une session",
            setup_project_label: "Nom du projet",
            setup_project_ph: "Nom du projet",
            setup_pass_label: "Mot de passe provisoire",
            setup_pass_ph: "Mot de passe provisoire",
            setup_pass_confirm_ph: "Confirmer le mot de passe",
            setup_error_name: "Entrez le nom du projet.",
            setup_error_pass: "Entrez le mot de passe provisoire.",
            setup_error_match: "Les mots de passe ne correspondent pas.",
            setup_25: "25 MIN",
            setup_50: "50 MIN",
            import_title: "Projet importé",
            import_success: "Projet {project} importé avec succès.",
            import_confirm: "CONFIRMER",
            notes_title: "Notes de {project}",
            notes_placeholder: "Note rapide...",
            notes_tags_ph: "Tags (optionnel)",
            notes_folder_ph: "Dossier (optionnel)",
            notes_save: "ENREGISTRER",
            export_title: "Exporter",
            export_qr: "ENVOYER PAR QR",
            export_file: "ENREGISTRER .SKV",
            export_b64: "ENREGISTRER .B64",
            export_hint: "Exportez vers le desktop.",
            scan_title: "Scan QR",
            scan_wait: "En attente du QR...",
            scan_stop: "ARRETER",
            scan_import: "IMPORTER FICHIER",
            scan_restore: "RESTAURER",
            scan_paste: "Collez la chaîne base64",
            scan_fallback: "Pas de caméra? Importez .b64/.skv ou collez la chaîne.",
            stream_title: "Envoyer par QR",
            stream_pause: "PAUSE",
            stream_resume: "REPRENDRE",
            stream_copy: "COPIER BASE64",
            stream_save: "ENREGISTRER .B64",
            stream_hint: "Fermez pour arrêter.",
            donate: "eskrev est fait pour écrire sans nourrir les plateformes. Si cela a du sens, soutenez le projet.",
            delete_all: "TOUT SUPPRIMER",
            delete_confirm: "Supprimer tout sur cet appareil ?",
            empty_notes: "Aucune note pour l'instant."
        }
    };

    const NOTES_KEY = "skrv_mobile_notes_v1";
    const PROJECT_NAME_KEY = "skrv_mobile_project_name";
    const PROJECT_TAG_KEY = "skrv_mobile_project_tag";
    const ARCHIVE_KEY = "skrv_mobile_base_archive";

    const state = {
        lang: localStorage.getItem("skrv_mobile_lang") || "pt",
        notes: []
    };

    const els = {};

    const t = (key) => {
        const dict = LANGS[state.lang] || LANGS.pt;
        return dict[key] || LANGS.pt[key] || "";
    };

    const formatLangLabel = (code) => {
        const dict = LANGS[code] || LANGS.pt;
        return dict.lang_label || code.toUpperCase();
    };

    const applyI18n = () => {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
            const key = el.getAttribute('data-i18n-ph');
            el.setAttribute('placeholder', t(key));
        });
        if (els.langToggle) {
            els.langToggle.textContent = formatLangLabel(state.lang);
        }
        renderNotesTitle();
    };

    const cycleLang = () => {
        const order = ["pt", "en", "es", "fr"];
        const idx = order.indexOf(state.lang);
        state.lang = order[(idx + 1) % order.length];
        localStorage.setItem("skrv_mobile_lang", state.lang);
        applyI18n();
    };

    const slugify = (name) => String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

    const getProjectName = () => localStorage.getItem(PROJECT_NAME_KEY) || "";
    const setProjectName = (name) => {
        const clean = String(name || "").trim();
        if (!clean) return;
        localStorage.setItem(PROJECT_NAME_KEY, clean);
        const slug = slugify(clean);
        if (slug) localStorage.setItem(PROJECT_TAG_KEY, `proj:${slug}`);
    };

    const getProjectTag = () => localStorage.getItem(PROJECT_TAG_KEY) || "proj:mobile";

    const loadNotes = () => {
        try {
            const raw = localStorage.getItem(NOTES_KEY);
            const data = raw ? JSON.parse(raw) : [];
            return Array.isArray(data) ? data : [];
        } catch (_) {
            return [];
        }
    };

    const saveNotes = (notes) => {
        state.notes = Array.isArray(notes) ? notes : [];
        localStorage.setItem(NOTES_KEY, JSON.stringify(state.notes));
    };

    const loadBaseArchive = () => {
        try {
            const raw = localStorage.getItem(ARCHIVE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    };

    const saveBaseArchive = (archive) => {
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
    };

    const escapeHtml = (text) => String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const notesToHtml = (notes) => {
        if (!notes.length) return "";
        const rows = notes.map((note) => {
            const date = new Date(note.createdAt || Date.now()).toLocaleString();
            const text = escapeHtml(note.text || "").replace(/\n/g, "<br>");
            return `<p><strong>${date}</strong><br>${text}</p>`;
        }).join("");
        return `<!-- skrv-mobile-notes --><section><h3>Notas do mobile</h3>${rows}</section><!-- /skrv-mobile-notes -->`;
    };

    const injectNotesIntoContent = (content, notesHtml) => {
        const start = "<!-- skrv-mobile-notes -->";
        const end = "<!-- /skrv-mobile-notes -->";
        const base = String(content || "");
        const re = new RegExp(`${start}[\\s\\S]*?${end}`, "g");
        const cleaned = base.replace(re, "").trim();
        if (!notesHtml) return cleaned;
        return `${cleaned}\n${notesHtml}`.trim();
    };

    const buildArchiveForExport = () => {
        const notes = loadNotes();
        const baseArchive = loadBaseArchive() || { projects: [], activeId: null, memo: "", mobileNotes: [] };
        const archive = { ...baseArchive };
        archive.projects = Array.isArray(baseArchive.projects) ? baseArchive.projects.map(p => ({ ...p })) : [];
        if (!archive.projects.length) {
            const name = getProjectName() || "Projeto";
            const id = `proj_${Date.now()}`;
            archive.projects = [{ id, name, content: "", date: new Date().toLocaleString(), cursorPos: 0 }];
            archive.activeId = id;
        }
        if (!archive.activeId) archive.activeId = archive.projects[0].id;
        const active = archive.projects.find(p => p.id === archive.activeId) || archive.projects[0];
        const notesHtml = notesToHtml(notes);
        active.content = injectNotesIntoContent(active.content || "", notesHtml);
        archive.mobileNotes = notes;
        return archive;
    };

    const buildPayload = () => {
        const archive = buildArchiveForExport();
        const active = archive.projects.find(p => p.id === archive.activeId) || archive.projects[0];
        const text = active && active.content ? active.content.replace(/<[^>]+>/g, "") : "";
        return {
            protocol: ".skv Mobile",
            version: "1.0",
            created_with: "eskrev",
            HEADER: {
                VERSION: "SKV/2",
                APP: "eskrev mobile",
                CREATED: new Date().toISOString(),
                CERT: "MOBILE"
            },
            SESSION_CONFIG: {
                lang: state.lang
            },
            MASTER_TEXT: text,
            ARCHIVE_STATE: archive
        };
    };

    const parsePayloadFromJson = (json) => {
        try {
            const parsed = JSON.parse(json);
            if (!parsed || typeof parsed !== "object") return null;
            if (!parsed.ARCHIVE_STATE) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    };

    const importPayload = (payload) => {
        const archive = payload && payload.ARCHIVE_STATE ? payload.ARCHIVE_STATE : null;
        if (!archive) return false;
        saveBaseArchive(archive);
        const active = Array.isArray(archive.projects) ? archive.projects.find(p => p.id === archive.activeId) || archive.projects[0] : null;
        const projectName = active && active.name ? active.name : (getProjectName() || "Projeto");
        setProjectName(projectName);
        const notes = Array.isArray(archive.mobileNotes) ? archive.mobileNotes : [];
        saveNotes(notes);
        renderNotes();
        openImportPassword(projectName);
        return true;
    };

    const initElements = () => {
        els.langToggle = document.getElementById("mobileLangToggle");
        els.gate = document.getElementById("mobileGate");
        els.gateScan = document.getElementById("mobileGateScan");
        els.gateHint = document.getElementById("mobileGateHint");
        els.shareQr = document.getElementById("shareQrCode");

        els.setup = document.getElementById("mobileSetup");
        els.setupName = document.getElementById("setupProjectName");
        els.setupPass1 = document.getElementById("setupPass1");
        els.setupPass2 = document.getElementById("setupPass2");
        els.setupMsg = document.getElementById("setupMsg");
        els.setup25 = document.getElementById("setupPomo25");
        els.setup50 = document.getElementById("setupPomo50");

        els.importModal = document.getElementById("importSessionModal");
        els.importSuccess = document.getElementById("importSessionSuccess");
        els.importPass1 = document.getElementById("importSessionPass1");
        els.importPass2 = document.getElementById("importSessionPass2");
        els.importMsg = document.getElementById("importSessionMsg");
        els.importConfirm = document.getElementById("importSessionConfirm");

        els.notesView = document.getElementById("notesView");
        els.notesTitle = document.getElementById("notesTitle");
        els.noteInput = document.getElementById("mobileMemoInput");
        els.noteTags = document.getElementById("mobileMemoTags");
        els.noteFolder = document.getElementById("mobileMemoFolder");
        els.noteSave = document.getElementById("btnAddMobileMemo");
        els.notesList = document.getElementById("mobileMemoList");
        els.fixedTags = document.getElementById("fixedTags");

        els.exportQr = document.getElementById("btnExportQr");
        els.exportFile = document.getElementById("btnExportFile");
        els.exportB64 = document.getElementById("btnExportB64");
        els.deleteAll = document.getElementById("btnDeleteAll");

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

    const renderNotesTitle = () => {
        if (!els.notesTitle) return;
        const name = getProjectName() || "Projeto";
        els.notesTitle.textContent = t("notes_title").replace("{project}", name);
        renderFixedTags();
    };

    const renderFixedTags = () => {
        if (!els.fixedTags) return;
        const projTag = getProjectTag();
        els.fixedTags.innerHTML = "";
        const tags = ["#mobile", `#${projTag}`];
        tags.forEach((tag) => {
            const span = document.createElement("span");
            span.className = "tag locked";
            span.textContent = tag;
            els.fixedTags.appendChild(span);
        });
    };

    const renderNotes = () => {
        const notes = loadNotes();
        if (!els.notesList) return;
        if (!notes.length) {
            els.notesList.innerHTML = `<div class="help">${t("empty_notes")}</div>`;
            return;
        }
        els.notesList.innerHTML = "";
        notes.forEach((note) => {
            const card = document.createElement("div");
            card.className = "note-card";
            const meta = document.createElement("div");
            meta.className = "note-meta";
            const date = new Date(note.createdAt || Date.now()).toLocaleString();
            meta.textContent = date;
            const body = document.createElement("div");
            body.className = "note-body";
            body.textContent = note.text || "";
            const tags = document.createElement("div");
            tags.className = "fixed-tags";
            (note.tags || []).forEach((tag) => {
                const span = document.createElement("span");
                span.className = "tag";
                span.textContent = `#${tag}`;
                tags.appendChild(span);
            });
            const actions = document.createElement("div");
            actions.className = "note-actions";
            const del = document.createElement("button");
            del.className = "danger";
            del.textContent = "X";
            del.onclick = () => {
                const updated = loadNotes().filter(n => n.id !== note.id);
                saveNotes(updated);
                renderNotes();
            };
            actions.appendChild(del);
            card.appendChild(meta);
            card.appendChild(body);
            if (note.tags && note.tags.length) card.appendChild(tags);
            card.appendChild(actions);
            els.notesList.appendChild(card);
        });
    };

    const parseTags = (raw) => {
        const extra = String(raw || "")
            .split(/,|\s+/)
            .map(t => t.trim())
            .filter(Boolean)
            .map(t => t.replace(/^#/, "").toLowerCase());
        const fixed = ["mobile", getProjectTag().toLowerCase()];
        const merged = [...new Set([...fixed, ...extra])];
        return merged;
    };

    const openGate = () => {
        if (!els.gate) return;
        els.gate.classList.add("active");
    };

    const closeGate = () => {
        if (!els.gate) return;
        els.gate.classList.remove("active");
        sessionStorage.setItem("skrv_mobile_gate_done", "1");
    };

    const openSetup = () => {
        if (!els.setup) return;
        els.setup.classList.add("active");
        if (els.setupName) els.setupName.focus();
    };

    const closeSetup = () => {
        if (!els.setup) return;
        els.setup.classList.remove("active");
    };

    const openNotes = () => {
        if (els.notesView) els.notesView.classList.remove("hidden");
    };

    const closeNotes = () => {
        if (els.notesView) els.notesView.classList.add("hidden");
    };

    const openImportPassword = (projectName) => {
        if (!els.importModal) return;
        els.importModal.classList.add("active");
        if (els.importSuccess) {
            els.importSuccess.textContent = t("import_success").replace("{project}", projectName || "Projeto");
        }
        if (els.importPass1) els.importPass1.value = "";
        if (els.importPass2) els.importPass2.value = "";
        if (els.importMsg) els.importMsg.textContent = "";
    };

    const closeImportPassword = () => {
        if (els.importModal) els.importModal.classList.remove("active");
    };

    const setupProject = (duration) => {
        const name = (els.setupName ? els.setupName.value : "").trim();
        const p1 = (els.setupPass1 ? els.setupPass1.value : "").trim();
        const p2 = (els.setupPass2 ? els.setupPass2.value : "").trim();
        if (!name) {
            if (els.setupMsg) els.setupMsg.textContent = t("setup_error_name");
            return;
        }
        if (!p1) {
            if (els.setupMsg) els.setupMsg.textContent = t("setup_error_pass");
            return;
        }
        if (p1 !== p2) {
            if (els.setupMsg) els.setupMsg.textContent = t("setup_error_match");
            return;
        }
        localStorage.setItem("lit_auth_key", p1);
        setProjectName(name);
        if (!loadBaseArchive()) {
            const id = `proj_${Date.now()}`;
            saveBaseArchive({
                projects: [{ id, name, content: "", date: new Date().toLocaleString(), cursorPos: 0 }],
                activeId: id,
                memo: "",
                mobileNotes: []
            });
        }
        closeSetup();
        closeGate();
        openNotes();
        renderNotesTitle();
        renderNotes();
        if (duration) {
            localStorage.setItem("skrv_mobile_pomo", String(duration));
        }
    };

    const bindGate = () => {
        if (els.langToggle) els.langToggle.addEventListener("click", cycleLang);
        if (els.gateScan) {
            els.gateScan.addEventListener("click", () => {
                closeGate();
                openScanModal();
            });
        }
        let startY = null;
        if (els.gate) {
            els.gate.addEventListener("touchstart", (e) => {
                const touch = e.touches && e.touches[0];
                if (!touch) return;
                startY = touch.clientY;
            }, { passive: true });
            els.gate.addEventListener("touchend", (e) => {
                if (startY === null) return;
                const touch = e.changedTouches && e.changedTouches[0];
                if (!touch) return;
                const delta = startY - touch.clientY;
                startY = null;
                if (delta > 60) {
                    closeGate();
                    openSetup();
                }
            });
        }
    };

    const bindSetup = () => {
        if (els.setup25) els.setup25.addEventListener("click", () => setupProject(25));
        if (els.setup50) els.setup50.addEventListener("click", () => setupProject(50));
    };

    const bindNotes = () => {
        if (els.noteSave) {
            els.noteSave.addEventListener("click", () => {
                const text = (els.noteInput ? els.noteInput.value : "").trim();
                if (!text) return;
                const tags = parseTags(els.noteTags ? els.noteTags.value : "");
                const folder = (els.noteFolder ? els.noteFolder.value : "").trim();
                const now = new Date().toISOString();
                const notes = loadNotes();
                notes.unshift({
                    id: `note_${Date.now()}`,
                    text,
                    tags,
                    folder,
                    createdAt: now,
                    updatedAt: now
                });
                saveNotes(notes);
                if (els.noteInput) els.noteInput.value = "";
                if (els.noteTags) els.noteTags.value = "";
                if (els.noteFolder) els.noteFolder.value = "";
                renderNotes();
            });
        }
        if (els.exportQr) {
            els.exportQr.addEventListener("click", () => {
                openStreamModal();
                startStream(buildPayload());
            });
        }
        if (els.exportFile) {
            els.exportFile.addEventListener("click", () => {
                const payload = buildPayload();
                const json = JSON.stringify(payload, null, 2);
                downloadText(json, `SKRV_${Date.now()}.skv`);
            });
        }
        if (els.exportB64) {
            els.exportB64.addEventListener("click", () => {
                const base64 = buildBase64(buildPayload());
                downloadText(base64, `SKRV_QR_${Date.now()}.b64`);
            });
        }
        if (els.deleteAll) {
            els.deleteAll.addEventListener("click", () => {
                if (!confirm(t("delete_confirm"))) return;
                localStorage.removeItem(NOTES_KEY);
                localStorage.removeItem(PROJECT_NAME_KEY);
                localStorage.removeItem(PROJECT_TAG_KEY);
                localStorage.removeItem(ARCHIVE_KEY);
                saveNotes([]);
                renderNotes();
                openGate();
                closeNotes();
            });
        }
    };

    const bindImportPassword = () => {
        if (!els.importConfirm) return;
        els.importConfirm.addEventListener("click", () => {
            const p1 = (els.importPass1 ? els.importPass1.value : "").trim();
            const p2 = (els.importPass2 ? els.importPass2.value : "").trim();
            if (!p1) {
                if (els.importMsg) els.importMsg.textContent = t("setup_error_pass");
                return;
            }
            if (p1 !== p2) {
                if (els.importMsg) els.importMsg.textContent = t("setup_error_match");
                return;
            }
            localStorage.setItem("lit_auth_key", p1);
            closeImportPassword();
            closeGate();
            openNotes();
            renderNotesTitle();
        });
    };

    const downloadText = (text, filename) => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const buildBase64 = (payload) => {
        if (!window.LZString) return "";
        const json = JSON.stringify(payload);
        return window.LZString.compressToBase64(json);
    };

    const decodeBase64 = (base64) => {
        if (!window.LZString) return null;
        const json = window.LZString.decompressFromBase64(base64.trim());
        if (!json) return null;
        return parsePayloadFromJson(json);
    };

    const renderShareQr = () => {
        if (!els.shareQr || !window.QRCode) return;
        els.shareQr.innerHTML = "";
        // eslint-disable-next-line no-undef
        new QRCode(els.shareQr, {
            text: "https://eskrev.rafa.pro.br/",
            width: 160,
            height: 160,
            colorDark: "#3f3b33",
            colorLight: "#f1efe7",
            correctLevel: QRCode.CorrectLevel.H
        });
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
        if (!qrInstance && els.streamCode) {
            // eslint-disable-next-line no-undef
            qrInstance = new QRCode(els.streamCode, {
                width: 240,
                height: 240,
                colorLight: "#f1efe7",
                correctLevel: QRCode.CorrectLevel.Q
            });
        }
        if (!streamChunks.length) return;
        updateStreamFrame();
        if (streamTimer) clearInterval(streamTimer);
        streamTimer = setInterval(updateStreamFrame, FRAME_INTERVAL_MS);
        updateStreamStatus(false);
    };

    const updateStreamStatus = (paused) => {
        if (!els.streamStatus) return;
        const status = paused ? t("stream_resume") : t("stream_pause");
        els.streamStatus.textContent = `${status} | ID ${streamBackupId}`;
        if (els.streamMeta) {
            els.streamMeta.textContent = `QR ${String(streamIndex + 1).padStart(3, "0")} / ${String(streamTotal).padStart(3, "0")}`;
        }
    };

    const updateStreamFrame = () => {
        if (!streamChunks.length || !qrInstance) return;
        const chunk = streamChunks[streamIndex];
        const checksum = crc32(chunk);
        const frame = `${QR_VERSION}|${streamBackupId}|${streamIndex + 1}|${streamTotal}|${checksum}|${chunk}`;
        qrInstance.clear();
        qrInstance.makeCode(frame);
        streamIndex = (streamIndex + 1) % streamTotal;
        updateStreamStatus(false);
    };

    const stopStream = () => {
        if (streamTimer) {
            clearInterval(streamTimer);
            streamTimer = null;
        }
    };

    const toggleStreamPause = () => {
        if (streamTimer) {
            stopStream();
            if (els.streamPause) els.streamPause.textContent = t("stream_resume");
            updateStreamStatus(true);
        } else {
            streamTimer = setInterval(updateStreamFrame, FRAME_INTERVAL_MS);
            if (els.streamPause) els.streamPause.textContent = t("stream_pause");
        }
    };

    const openStreamModal = () => {
        if (els.streamModal) els.streamModal.classList.add("active");
    };

    const closeStreamModal = () => {
        if (els.streamModal) els.streamModal.classList.remove("active");
        stopStream();
    };

    const startStream = (payload) => {
        const base64 = buildBase64(payload);
        if (!base64) return;
        setupStreamFromBase64(base64);
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
        if (cell) cell.style.background = "rgba(242,178,75,0.6)";
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
        updateScanStatus(`${t("scan_wait")} ${receivedCount}/${scanSession.total}`);
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
        if (!els.scanVideo || !navigator.mediaDevices) return;
        try {
            scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
            els.scanVideo.srcObject = scanStream;
            await els.scanVideo.play();
            if ("BarcodeDetector" in window) {
                scanDetector = new BarcodeDetector({ formats: ["qr_code"] });
            } else if (window.jsQR) {
                scanCanvas = document.createElement("canvas");
                scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
            }
            scanActive = true;
            updateScanStatus(t("scan_wait"));
            scanLoop();
        } catch (_) {
            updateScanStatus("Camera bloqueada");
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

    const openScanModal = () => {
        if (els.scanModal) els.scanModal.classList.add("active");
        startScan();
    };

    const closeScanModal = () => {
        if (els.scanModal) els.scanModal.classList.remove("active");
        stopScan();
    };

    const bindScan = () => {
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
    };

    const bindStream = () => {
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
                const base64 = buildBase64(buildPayload());
                downloadText(base64, `SKRV_QR_${Date.now()}.b64`);
            });
        }
        if (els.streamClose) {
            els.streamClose.addEventListener("click", closeStreamModal);
        }
    };

    const init = () => {
        initElements();
        applyI18n();
        renderShareQr();
        bindGate();
        bindSetup();
        bindNotes();
        bindImportPassword();
        bindScan();
        bindStream();

        const existing = getProjectName();
        const gateDone = sessionStorage.getItem("skrv_mobile_gate_done") === "1";
        if (existing && gateDone) {
            closeGate();
            openNotes();
        } else {
            openGate();
            closeNotes();
        }
        renderNotesTitle();
        renderNotes();
    };

    window.addEventListener("DOMContentLoaded", init);
})();
