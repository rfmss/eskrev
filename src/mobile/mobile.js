(() => {
    const LANGS = {
        pt: {
            lang_label: "PT",
            mobile_theme: "Tema",
            mobile_gate_title: "Importar projeto",
            mobile_gate_body: "",
            mobile_gate_scan: "LER QR CODE",
            mobile_gate_create: "CRIAR NOVO",
            mobile_gate_hint: "Ou ↑ para criar novo",
            mobile_gate_share: "Compartilhe o eskrev",
            setup_title: "Criar sessão",
            setup_project_ph: "Nome do projeto",
            setup_pass_ph: "Senha provisória",
            setup_pass_confirm_ph: "Confirmar senha",
            setup_error_name: "Digite o nome do projeto.",
            setup_error_pass: "Digite a senha provisória.",
            setup_error_match: "As senhas não coincidem.",
            pomo_25: "25 MIN",
            pomo_55: "50 MIN",
            mobile_import_title: "Projeto importado",
            mobile_import_success: "Projeto {project} importado com sucesso.",
            mobile_import_pass_ph: "Senha provisória",
            mobile_import_pass_confirm_ph: "Confirmar senha",
            mobile_import_confirm: "CONFIRMAR",
            mobile_import_pass_error: "Digite a senha provisória.",
            mobile_import_pass_mismatch: "As senhas não coincidem.",
            notes_title: "Notas",
            notes_search_ph: "Buscar... (#tag /pasta)",
            notes_new: "NOVA NOTA",
            notes_empty_title: "Sem notas ainda.",
            notes_empty_body: "Crie sua primeira nota para começar.",
            notes_empty_cta: "CRIAR PRIMEIRA NOTA",
            notes_back: "VOLTAR",
            notes_delete: "APAGAR",
            notes_folders_title: "PASTAS",
            notes_folders_all: "Todas",
            notes_tags_title: "TAGS",
            notes_tags_all: "Todas",
            notes_pin: "FIXAR",
            notes_title_ph: "Título",
            notes_body_ph: "Texto...",
            notes_tags_ph: "Tags (#tag, #outra)",
            notes_folder_ph: "Pasta (opcional)",
            notes_updated: "Atualizado",
            notes_untitled: "Nota sem título",
            notes_delete_confirm: "Apagar nota?",
            mobile_limit_notes: "Limite de notas atingido (200).",
            mobile_limit_pins: "Limite de notas fixadas atingido (5).",
            mobile_limit_folders: "Limite de pastas atingido (30).",
            mobile_export_title: "EXPORTAR",
            mobile_export_qr: "ENVIAR POR QR",
            mobile_export_save: "SALVAR ARQUIVO",
            mobile_quick_reset: "APAGAR",
            mobile_donate_html: "O eskrev é feito para escrever sem alimentar plataformas. Se fizer sentido, apoie o projeto.",
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
            mobile_theme: "Theme",
            mobile_gate_title: "Import project",
            mobile_gate_body: "",
            mobile_gate_scan: "READ QR CODE",
            mobile_gate_create: "CREATE NEW",
            mobile_gate_hint: "Or ↑ to create new",
            mobile_gate_share: "Share eskrev",
            setup_title: "Create session",
            setup_project_ph: "Project name",
            setup_pass_ph: "Provisional password",
            setup_pass_confirm_ph: "Confirm password",
            setup_error_name: "Enter the project name.",
            setup_error_pass: "Enter the provisional password.",
            setup_error_match: "Passwords do not match.",
            pomo_25: "25 MIN",
            pomo_55: "50 MIN",
            mobile_import_title: "Project imported",
            mobile_import_success: "Project {project} imported successfully.",
            mobile_import_pass_ph: "Provisional password",
            mobile_import_pass_confirm_ph: "Confirm password",
            mobile_import_confirm: "CONFIRM",
            mobile_import_pass_error: "Enter the provisional password.",
            mobile_import_pass_mismatch: "Passwords do not match.",
            notes_title: "Notes",
            notes_search_ph: "Search... (#tag /folder)",
            notes_new: "NEW NOTE",
            notes_empty_title: "No notes yet.",
            notes_empty_body: "Create your first note to begin.",
            notes_empty_cta: "CREATE FIRST NOTE",
            notes_back: "BACK",
            notes_delete: "DELETE",
            notes_folders_title: "FOLDERS",
            notes_folders_all: "All",
            notes_tags_title: "TAGS",
            notes_tags_all: "All",
            notes_pin: "PIN",
            notes_title_ph: "Title",
            notes_body_ph: "Text...",
            notes_tags_ph: "Tags (#tag, #other)",
            notes_folder_ph: "Folder (optional)",
            notes_updated: "Updated",
            notes_untitled: "Untitled note",
            notes_delete_confirm: "Delete note?",
            mobile_limit_notes: "Notes limit reached (200).",
            mobile_limit_pins: "Pinned notes limit reached (5).",
            mobile_limit_folders: "Folders limit reached (30).",
            mobile_export_title: "EXPORT",
            mobile_export_qr: "SEND BY QR",
            mobile_export_save: "SAVE FILE",
            mobile_quick_reset: "DELETE",
            mobile_donate_html: "eskrev is made for writing without feeding platforms. If it makes sense, support the project.",
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
            mobile_theme: "Tema",
            mobile_gate_title: "Importar proyecto",
            mobile_gate_body: "",
            mobile_gate_scan: "LEER QR",
            mobile_gate_create: "CREAR NUEVO",
            mobile_gate_hint: "O ↑ para crear nuevo",
            mobile_gate_share: "Comparte eskrev",
            setup_title: "Crear sesión",
            setup_project_ph: "Nombre del proyecto",
            setup_pass_ph: "Contraseña provisional",
            setup_pass_confirm_ph: "Confirmar contraseña",
            setup_error_name: "Ingrese el nombre del proyecto.",
            setup_error_pass: "Ingrese la contraseña provisional.",
            setup_error_match: "Las contraseñas no coinciden.",
            pomo_25: "25 MIN",
            pomo_55: "50 MIN",
            mobile_import_title: "Proyecto importado",
            mobile_import_success: "Proyecto {project} importado con éxito.",
            mobile_import_pass_ph: "Contraseña provisional",
            mobile_import_pass_confirm_ph: "Confirmar contraseña",
            mobile_import_confirm: "CONFIRMAR",
            mobile_import_pass_error: "Ingrese la contraseña provisional.",
            mobile_import_pass_mismatch: "Las contraseñas no coinciden.",
            notes_title: "Notas",
            notes_search_ph: "Buscar... (#tag /carpeta)",
            notes_new: "NUEVA NOTA",
            notes_empty_title: "Sin notas todavía.",
            notes_empty_body: "Crea tu primera nota para comenzar.",
            notes_empty_cta: "CREAR PRIMERA NOTA",
            notes_back: "VOLVER",
            notes_delete: "BORRAR",
            notes_folders_title: "CARPETAS",
            notes_folders_all: "Todas",
            notes_tags_title: "TAGS",
            notes_tags_all: "Todas",
            notes_pin: "FIJAR",
            notes_title_ph: "Título",
            notes_body_ph: "Texto...",
            notes_tags_ph: "Tags (#tag, #otra)",
            notes_folder_ph: "Carpeta (opcional)",
            notes_updated: "Actualizado",
            notes_untitled: "Nota sin título",
            notes_delete_confirm: "¿Borrar nota?",
            mobile_limit_notes: "Límite de notas alcanzado (200).",
            mobile_limit_pins: "Límite de notas fijadas alcanzado (5).",
            mobile_limit_folders: "Límite de carpetas alcanzado (30).",
            mobile_export_title: "EXPORTAR",
            mobile_export_qr: "ENVIAR POR QR",
            mobile_export_save: "GUARDAR ARCHIVO",
            mobile_quick_reset: "BORRAR",
            mobile_donate_html: "eskrev está hecho para escribir sin alimentar plataformas. Si tiene sentido, apoya el proyecto.",
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
            mobile_theme: "Thème",
            mobile_gate_title: "Importer un projet",
            mobile_gate_body: "",
            mobile_gate_scan: "LIRE QR CODE",
            mobile_gate_create: "CREER NOUVEAU",
            mobile_gate_hint: "Ou ↑ pour créer",
            mobile_gate_share: "Partager eskrev",
            setup_title: "Créer une session",
            setup_project_ph: "Nom du projet",
            setup_pass_ph: "Mot de passe provisoire",
            setup_pass_confirm_ph: "Confirmer le mot de passe",
            setup_error_name: "Entrez le nom du projet.",
            setup_error_pass: "Entrez le mot de passe provisoire.",
            setup_error_match: "Les mots de passe ne correspondent pas.",
            pomo_25: "25 MIN",
            pomo_55: "50 MIN",
            mobile_import_title: "Projet importé",
            mobile_import_success: "Projet {project} importé avec succès.",
            mobile_import_pass_ph: "Mot de passe provisoire",
            mobile_import_pass_confirm_ph: "Confirmer le mot de passe",
            mobile_import_confirm: "CONFIRMER",
            mobile_import_pass_error: "Entrez le mot de passe provisoire.",
            mobile_import_pass_mismatch: "Les mots de passe ne correspondent pas.",
            notes_title: "Notes",
            notes_search_ph: "Rechercher... (#tag /dossier)",
            notes_new: "NOUVELLE NOTE",
            notes_empty_title: "Aucune note.",
            notes_empty_body: "Créez votre première note.",
            notes_empty_cta: "CREER PREMIERE NOTE",
            notes_back: "RETOUR",
            notes_delete: "SUPPRIMER",
            notes_folders_title: "DOSSIERS",
            notes_folders_all: "Tous",
            notes_tags_title: "TAGS",
            notes_tags_all: "Tous",
            notes_pin: "EPINGLER",
            notes_title_ph: "Titre",
            notes_body_ph: "Texte...",
            notes_tags_ph: "Tags (#tag, #autre)",
            notes_folder_ph: "Dossier (optionnel)",
            notes_updated: "Mis à jour",
            notes_untitled: "Note sans titre",
            notes_delete_confirm: "Supprimer la note ?",
            mobile_limit_notes: "Limite de notes atteinte (200).",
            mobile_limit_pins: "Limite d'épingles atteinte (5).",
            mobile_limit_folders: "Limite de dossiers atteinte (30).",
            mobile_export_title: "EXPORTER",
            mobile_export_qr: "ENVOYER PAR QR",
            mobile_export_save: "ENREGISTRER",
            mobile_quick_reset: "SUPPRIMER",
            mobile_donate_html: "eskrev est fait pour écrire sans nourrir les plateformes. Si cela a du sens, soutenez le projet.",
            qr_scan_title: "SCAN QR",
            qr_scan_wait: "EN ATTENTE DU QR...",
            qr_scan_stop: "ARRETER",
            qr_fallback_hint: "Pas de caméra? Importez .b64/.skv ou collez la chaîne.",
            qr_fallback_import: "IMPORTER FICHIER",
            qr_fallback_paste: "Collez la chaîne base64",
            qr_fallback_restore: "RESTAURER",
            qr_stream_title: "STREAM QR",
            qr_stream_active: "STREAM ACTIF",
            qr_stream_pause: "PAUSE",
            qr_stream_resume: "REPRENDRE",
            qr_stream_copy: "COPIER BASE64",
            qr_stream_save: "ENREGISTRER .B64",
            qr_stream_hint: "Fermez pour arrêter.",
            qr_stream_empty: "Rien à envoyer.",
            qr_frame: "FRAME",
            qr_restore_in_progress: "RESTAURATION...",
            qr_decode_fail: "Echec de restauration.",
            qr_camera_blocked: "Caméra bloquée.",
            qr_camera_missing: "Caméra indisponible.",
            qr_no_detector: "Détecteur indisponible.",
            qr_using_fallback: "Fallback en cours.",
            qr_libs_missing: "Bibliothèques manquantes."
        }
    };

    const NOTES_KEY = "skrv_mobile_notes_v1";
    const NOTES_KEY_LEGACY = "tot_mobile_notes_v1";
    const PROJECT_NAME_KEY = "skrv_mobile_project_name";
    const PROJECT_TAG_KEY = "skrv_mobile_project_tag";
    const ARCHIVE_KEY = "skrv_mobile_base_archive";
    const NOTES_LIMIT = 200;
    const FOLDERS_LIMIT = 30;
    const PINNED_LIMIT = 5;
    const THEMES = ["paper", "chumbo", "study"];

    const state = {
        lang: localStorage.getItem("skrv_mobile_lang") || "pt",
        theme: localStorage.getItem("lit_theme_pref") || "paper"
    };

    const els = {};

    const t = (key) => {
        const dict = LANGS[state.lang] || LANGS.pt;
        return dict[key] || LANGS.pt[key] || "";
    };

    const applyTheme = (theme) => {
        const next = THEMES.includes(theme) ? theme : THEMES[0];
        state.theme = next;
        document.body.setAttribute("data-theme", next);
        localStorage.setItem("lit_theme_pref", next);
        if (els.themeToggle) {
            els.themeToggle.textContent = next.toUpperCase();
        }
    };

    const cycleTheme = () => {
        const idx = THEMES.indexOf(state.theme);
        const next = THEMES[(idx + 1) % THEMES.length];
        applyTheme(next);
    };

    const formatLangLabel = (code) => {
        const dict = LANGS[code] || LANGS.pt;
        return dict.lang_label || code.toUpperCase();
    };

    const applyI18n = () => {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            if (!key) return;
            el.textContent = t(key);
        });
        document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
            const key = el.getAttribute("data-i18n-ph");
            if (!key) return;
            el.setAttribute("placeholder", t(key));
        });
        document.querySelectorAll("[data-i18n-title]").forEach((el) => {
            const key = el.getAttribute("data-i18n-title");
            if (!key) return;
            el.setAttribute("title", t(key));
        });
        if (els.langToggle) {
            els.langToggle.textContent = formatLangLabel(state.lang);
        }
    };

    const cycleLang = () => {
        const order = ["pt", "en", "es", "fr"];
        const idx = order.indexOf(state.lang);
        state.lang = order[(idx + 1) % order.length];
        localStorage.setItem("skrv_mobile_lang", state.lang);
        applyI18n();
        renderNotesList();
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

    const notesCache = () => {
        try {
            const raw = localStorage.getItem(NOTES_KEY) || localStorage.getItem(NOTES_KEY_LEGACY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    };

    const saveNotes = (notes) => {
        const list = Array.isArray(notes) ? notes : [];
        localStorage.setItem(NOTES_KEY, JSON.stringify(list));
    };

    const fixedMobileTags = () => {
        const tags = ["mobile"];
        const proj = getProjectTag();
        if (proj) tags.push(proj);
        return tags;
    };

    const normalizeTag = (tag) => String(tag || "").trim().replace(/^#/, "").toLowerCase();
    const normalizeFolder = (folder) => String(folder || "").trim();

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
        return first ? first.trim().slice(0, 48) : t("notes_untitled");
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

    const escapeHtml = (text) => String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const printRawText = (text, title) => {
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`<pre>${escapeHtml(text)}</pre>`);
        win.document.title = title || "eskrev";
        win.document.close();
        win.focus();
        win.print();
    };

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
        pinBtn.innerHTML = note.pinned
            ? `<svg class="icon pin-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
            : `<svg class="icon pin-icon pin-icon-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>`;
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
            printRawText(text, `eskrev - ${titleText || "Nota"}`);
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
        card.onclick = () => openNoteEdit(note.id);
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
                allBtn.textContent = t("notes_folders_all");
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
                allBtn.textContent = t("notes_tags_all");
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
        notesState.stage = stage;
        document.querySelectorAll(".notes-stage").forEach(el => el.classList.remove("is-active"));
        const target = document.querySelector(`.notes-stage-${stage}`);
        if (target) target.classList.add("is-active");
        renderNotesList();
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
        if (metaEl) metaEl.textContent = `${t("notes_updated")}: ${formatDate(note.updatedAt || note.createdAt)}`;
        if (pinToggle) pinToggle.classList.toggle("active", !!note.pinned);
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
            alert(t("mobile_limit_notes"));
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
            alert(t("mobile_limit_notes"));
            return;
        }
        const presetFolder = normalizeFolder(preset.folder);
        if (presetFolder) {
            const folders = Array.from(new Set(notes.map(n => normalizeFolder(n.folder)).filter(Boolean)));
            if (!folders.includes(presetFolder) && folders.length >= FOLDERS_LIMIT) {
                alert(t("mobile_limit_folders"));
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
        if (titleEl) titleEl.value = "";
        if (bodyEl) bodyEl.value = "";
        if (tagsEl) {
            const merged = ensureFixedTags(presetTags);
            tagsEl.value = merged.map(t => `#${normalizeTag(t)}`).join(", ");
        }
        if (folderEl) folderEl.value = presetFolder || "";
        if (metaEl) metaEl.textContent = "";
        setNotesStage("edit");
    };

    const toggleNotePin = (id) => {
        const notes = notesCache();
        const note = notes.find(n => n.id === id);
        if (!note) return;
        const pinnedCount = notes.filter(n => n.pinned).length;
        if (!note.pinned && pinnedCount >= PINNED_LIMIT) {
            alert(t("mobile_limit_pins"));
            return;
        }
        note.pinned = !note.pinned;
        note.updatedAt = new Date().toISOString();
        saveNotes(notes);
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
                alert(t("mobile_limit_folders"));
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
        if (metaEl) metaEl.textContent = `${t("notes_updated")}: ${formatDate(note.updatedAt)}`;
        renderNotesList();
    };

    let updateTimer = null;
    const scheduleUpdate = () => {
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(updateActiveNote, 250);
    };

    const buildBaseArchive = () => {
        return { projects: [], activeId: null, memo: "", mobileNotes: [] };
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
        const notes = notesCache();
        const baseArchive = loadBaseArchive() || buildBaseArchive();
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
        renderNotesList();
        openImportPassword(projectName);
        return true;
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
        if (!streamChunks.length) {
            if (els.streamStatus) els.streamStatus.textContent = t("qr_stream_empty");
            return;
        }
        updateStreamFrame();
        if (streamTimer) clearInterval(streamTimer);
        streamTimer = setInterval(updateStreamFrame, FRAME_INTERVAL_MS);
        setStreamStatus(false);
    };

    const setStreamStatus = (paused) => {
        if (!els.streamStatus) return;
        const status = paused ? t("qr_stream_resume") : t("qr_stream_active");
        els.streamStatus.textContent = `${status} | ID ${streamBackupId}`;
        if (els.streamMeta) {
            els.streamMeta.textContent = `${t("qr_frame")} ${String(streamIndex + 1).padStart(3, "0")} / ${String(streamTotal).padStart(3, "0")}`;
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
        setStreamStatus(false);
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
            if (els.streamPause) els.streamPause.textContent = t("qr_stream_resume");
            setStreamStatus(true);
        } else {
            streamTimer = setInterval(updateStreamFrame, FRAME_INTERVAL_MS);
            if (els.streamPause) els.streamPause.textContent = t("qr_stream_pause");
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

    const openScanModal = () => {
        if (els.scanModal) els.scanModal.classList.add("active");
        startScan();
    };

    const closeScanModal = () => {
        if (els.scanModal) els.scanModal.classList.remove("active");
        stopScan();
    };

    const openGate = () => {
        if (els.gate) els.gate.classList.add("active");
    };

    const closeGate = () => {
        if (els.gate) els.gate.classList.remove("active");
        sessionStorage.setItem("skrv_mobile_gate_done", "1");
    };

    const openSetup = () => {
        if (els.setup) els.setup.classList.add("active");
        if (els.setupName) els.setupName.focus();
    };

    const closeSetup = () => {
        if (els.setup) els.setup.classList.remove("active");
    };

    const openImportPassword = (projectName) => {
        if (!els.importModal) return;
        els.importModal.classList.add("active");
        if (els.importSuccess) {
            els.importSuccess.textContent = t("mobile_import_success").replace("{project}", projectName || "Projeto");
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
        renderNotesList();
        if (duration) {
            localStorage.setItem("skrv_mobile_pomo", String(duration));
        }
    };

    const initElements = () => {
        els.langToggle = document.getElementById("mobileLangToggle");
        els.themeToggle = document.getElementById("mobileThemeToggle");
        els.gate = document.getElementById("mobileGate");
        els.gateScan = document.getElementById("mobileGateScan");
        els.gateCreate = document.getElementById("mobileGateCreate");
        els.gateHint = document.getElementById("mobileGateHint");
        els.gateThemeButtons = document.querySelectorAll(".gate-theme-btn");
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

    const bindEvents = () => {
        if (els.langToggle) els.langToggle.addEventListener("click", cycleLang);
        if (els.themeToggle) els.themeToggle.addEventListener("click", cycleTheme);
        if (els.gateScan) {
            els.gateScan.addEventListener("click", () => {
                closeGate();
                openScanModal();
            });
        }
        if (els.gateThemeButtons && els.gateThemeButtons.length) {
            els.gateThemeButtons.forEach((btn) => {
                btn.addEventListener("click", () => {
                    const theme = btn.getAttribute("data-theme");
                    if (theme) applyTheme(theme);
                });
            });
        }
        if (els.gateCreate) {
            els.gateCreate.addEventListener("click", () => {
                closeGate();
                openSetup();
            });
        }
        if (els.gateHint) {
            els.gateHint.addEventListener("click", () => {
                closeGate();
                openSetup();
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
        if (els.setup25) els.setup25.addEventListener("click", () => setupProject(25));
        if (els.setup50) els.setup50.addEventListener("click", () => setupProject(50));
        if (els.importConfirm) {
            els.importConfirm.addEventListener("click", () => {
                const p1 = (els.importPass1 ? els.importPass1.value : "").trim();
                const p2 = (els.importPass2 ? els.importPass2.value : "").trim();
                if (!p1) {
                    if (els.importMsg) els.importMsg.textContent = t("mobile_import_pass_error");
                    return;
                }
                if (p1 !== p2) {
                    if (els.importMsg) els.importMsg.textContent = t("mobile_import_pass_mismatch");
                    return;
                }
                localStorage.setItem("lit_auth_key", p1);
                closeImportPassword();
                closeGate();
            });
        }
        const notesSearch = document.getElementById("notesSearch");
        const notesNew = document.getElementById("notesNew");
        const notesEmptyCreate = document.getElementById("notesEmptyCreate");
        const notesOverlayClose = document.getElementById("notesOverlayClose");
        const notesOverlayNew = document.getElementById("notesOverlayNew");
        const notesBackToPreview = document.getElementById("notesBackToPreview");
        const notesDelete = document.getElementById("notesDelete");
        const notesFab = document.getElementById("notesFab");
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
            notesDelete.onclick = () => {
                const notes = notesCache();
                const note = notes.find(n => n.id === notesState.activeId);
                if (!note) return;
                const ok = confirm(t("notes_delete_confirm"));
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
                const base64 = buildBase64(buildPayload());
                const blob = new Blob([base64], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `SKRV_QR_${Date.now()}.b64`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }
        if (els.deleteAll) {
            els.deleteAll.addEventListener("click", () => {
                const ok = confirm(t("notes_delete_confirm"));
                if (!ok) return;
                localStorage.removeItem(NOTES_KEY);
                localStorage.removeItem(PROJECT_NAME_KEY);
                localStorage.removeItem(PROJECT_TAG_KEY);
                localStorage.removeItem(ARCHIVE_KEY);
                saveNotes([]);
                renderNotesList();
                openGate();
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
                const base64 = buildBase64(buildPayload());
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
        if (!THEMES.includes(state.theme)) state.theme = THEMES[0];
        applyTheme(state.theme);
        applyI18n();
        renderShareQr();
        bindEvents();
        renderNotesList();

        const existing = getProjectName();
        const gateDone = sessionStorage.getItem("skrv_mobile_gate_done") === "1";
        if (existing && gateDone) {
            closeGate();
        } else {
            openGate();
        }
    };

    window.addEventListener("DOMContentLoaded", init);
})();
