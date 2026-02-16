import { store } from './store.js';
import { ui } from './ui.js';
import { lang } from './lang.js';
import { qrTransfer } from './qr_transfer.js';
import { setModalActive } from './modal_state.js';

const MOBILE_NOTES_KEY = "skrv_mobile_notes_v1";
const MOBILE_NOTES_KEY_LEGACY = "tot_mobile_notes_v1";
const MOBILE_FUNNEL_KEY = "skrv_mobile_funnel_v1";
const MOBILE_NOTES_LIMIT = 200;
const MOBILE_FOLDERS_LIMIT = 30;
let mobileNotesCache = [];
let mobileNotesFilter = { search: "", folder: "" };
let mobileEditingId = null;
let mobileDebugEnabled = false;

const resolveMobileDebugMode = () => {
    try {
        const params = new URLSearchParams(window.location.search || "");
        const param = params.get("debug");
        if (param === "1") localStorage.setItem("skrv_debug_mobile", "1");
        if (param === "0") localStorage.removeItem("skrv_debug_mobile");
        mobileDebugEnabled = localStorage.getItem("skrv_debug_mobile") === "1";
        document.body.classList.toggle("mobile-debug-on", mobileDebugEnabled);
    } catch (_) {
        mobileDebugEnabled = false;
    }
    return mobileDebugEnabled;
};

const readMobileFunnel = () => {
    try {
        const raw = localStorage.getItem(MOBILE_FUNNEL_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return typeof parsed === "object" && parsed ? parsed : {};
    } catch (_) {
        return {};
    }
};
const writeMobileFunnel = (state) => {
    try {
        localStorage.setItem(MOBILE_FUNNEL_KEY, JSON.stringify(state || {}));
    } catch (_) {}
};
const trackMobileFunnel = (eventName, meta = {}) => {
    if (!eventName) return;
    const now = Date.now();
    const state = readMobileFunnel();
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
    writeMobileFunnel(state);
    if (typeof window.skrvRenderMobileFunnelDebug === "function") {
        window.skrvRenderMobileFunnelDebug();
    }
};
const trackMobileFirstAction = (meta = {}) => {
    if (sessionStorage.getItem("skrv_mobile_funnel_first_action_logged") === "1") return;
    trackMobileFunnel("first_action", meta);
    sessionStorage.setItem("skrv_mobile_funnel_first_action_logged", "1");
};
const fmtPct = (num) => `${Math.max(0, Math.min(100, Math.round(num || 0)))}%`;
const renderMobileFunnelKpi = (state) => {
    const el = document.getElementById("mobileFunnelKpi");
    if (!el) return;
    const counters = (state && state.counters) || {};
    const opens = counters.mobile_open || 0;
    const firstActions = counters.first_action || 0;
    const attempts = (counters.import_attempt_qr || 0) + (counters.import_attempt_file || 0);
    const importSuccess = counters.import_success || 0;
    const importRate = attempts > 0 ? (importSuccess / attempts) * 100 : 0;
    const noteCount = counters.note_created || 0;
    const noteToImportRate = noteCount > 0 ? (importSuccess / noteCount) * 100 : 0;
    const abandonRate = opens > 0 ? ((opens - Math.min(firstActions, opens)) / opens) * 100 : 0;
    const firstOpenAt = Number(state && state.firstOpenAt) || 0;
    const firstNoteAt = Number(state && state.firstNoteAt) || 0;
    const firstImportSuccessAt = Number(state && state.firstImportSuccessAt) || 0;
    const ttvSec = (firstOpenAt > 0 && firstNoteAt > firstOpenAt)
        ? Math.round((firstNoteAt - firstOpenAt) / 1000)
        : null;
    const firstImportSec = (firstOpenAt > 0 && firstImportSuccessAt > firstOpenAt)
        ? Math.round((firstImportSuccessAt - firstOpenAt) / 1000)
        : null;
    const ttvLabel = lang.t("mobile_funnel_kpi_ttv") || "TTV";
    const importLabel = lang.t("mobile_funnel_kpi_import_rate") || "Sucesso import";
    const abandonLabel = lang.t("mobile_funnel_kpi_abandon_rate") || "Abandono inicial";
    const firstImportLabel = lang.t("mobile_funnel_kpi_first_import") || "Tempo ate 1o import";
    const noteToImportLabel = lang.t("mobile_funnel_kpi_note_to_import") || "Conversao nota->import";
    const noData = lang.t("mobile_funnel_kpi_no_data") || "sem dados";
    el.textContent = [
        `${ttvLabel}: ${ttvSec === null ? noData : `${ttvSec}s`}`,
        `${firstImportLabel}: ${firstImportSec === null ? noData : `${firstImportSec}s`}`,
        `${importLabel}: ${fmtPct(importRate)} (${importSuccess}/${attempts})`,
        `${noteToImportLabel}: ${fmtPct(noteToImportRate)} (${importSuccess}/${noteCount})`,
        `${abandonLabel}: ${fmtPct(abandonRate)} (${opens - Math.min(firstActions, opens)}/${opens})`
    ].join("\n");
};
const renderMobileFunnelDebug = () => {
    const out = document.getElementById("mobileFunnelDebugOut");
    if (!out) return;
    const state = readMobileFunnel();
    renderMobileFunnelKpi(state);
    const hasData = state && state.counters && Object.keys(state.counters).length > 0;
    if (!hasData) {
        out.textContent = lang.t("mobile_funnel_debug_empty") || "Sem dados ainda.";
        return;
    }
    out.textContent = JSON.stringify(state, null, 2);
};
const initMobileFunnelDebugPanel = () => {
    const panel = document.getElementById("mobileFunnelDebug");
    if (!panel) return;
    if (!mobileDebugEnabled) {
        panel.open = false;
        return;
    }
    const btnRefresh = document.getElementById("btnMobileFunnelRefresh");
    const btnReset = document.getElementById("btnMobileFunnelReset");
    window.skrvRenderMobileFunnelDebug = renderMobileFunnelDebug;
    if (btnRefresh) {
        btnRefresh.onclick = () => renderMobileFunnelDebug();
    }
    if (btnReset) {
        btnReset.onclick = () => {
            try { localStorage.removeItem(MOBILE_FUNNEL_KEY); } catch (_) {}
            try { sessionStorage.removeItem("skrv_mobile_funnel_first_action_logged"); } catch (_) {}
            renderMobileFunnelDebug();
        };
    }
    panel.addEventListener("toggle", () => {
        if (panel.open) renderMobileFunnelDebug();
    });
    renderMobileFunnelDebug();
};

const normalizeTag = (tag) => String(tag || "").trim().replace(/^#/, "").toLowerCase();
const normalizeFolder = (folder) => String(folder || "").trim();
const slugifyProjectName = (name) => {
    const base = String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return base
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
};
const setMobileProjectMeta = (name) => {
    const cleanName = String(name || "").trim();
    if (cleanName) {
        localStorage.setItem("skrv_mobile_project_name", cleanName);
    }
    const slug = slugifyProjectName(cleanName);
    if (slug) {
        localStorage.setItem("skrv_mobile_project_tag", `proj:${slug}`);
    }
};
const getMobileProjectTag = () => {
    const stored = localStorage.getItem("skrv_mobile_project_tag");
    if (stored) return stored;
    const fallback = localStorage.getItem("skrv_mobile_project_name") || getActiveProject()?.name || "";
    setMobileProjectMeta(fallback);
    return localStorage.getItem("skrv_mobile_project_tag") || "";
};
const fixedMobileTags = () => {
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
const getActiveProject = () => (store.getActive && store.getActive());
const updateMobileNotesTitle = () => {
    const titleEl = document.getElementById("mobileNotesSection");
    const badge = document.getElementById("mobileProjectBadge");
    if (!titleEl) return;
    const active = getActiveProject();
    if (active && active.name) {
        const template = lang.t("mobile_notes_title_project") || "NOTAS de {project}";
        titleEl.textContent = template.replace("{project}", active.name);
        if (badge) badge.style.display = "inline-block";
    } else {
        titleEl.textContent = lang.t("mobile_notes_title");
        if (badge) badge.style.display = "none";
    }
};
const getUniqueProjectName = (baseName) => {
    const base = String(baseName || "").trim() || (lang.t("default_project") || "Projeto");
    const used = new Set((store.data.projects || []).map((p) => String((p && p.name) || "").trim().toLowerCase()));
    if (!used.has(base.toLowerCase())) return base;
    let n = 2;
    while (used.has(`${base} ${n}`.toLowerCase())) n += 1;
    return `${base} ${n}`;
};
const createMobileImportProject = () => {
    const baseName = lang.t("mobile_import_new_project_name") || "Projeto importado";
    const name = getUniqueProjectName(baseName);
    store.createProject(name, "");
    setMobileProjectMeta(name);
    updateMobileNotesTitle();
    return name;
};
    const pickMobileImportTarget = () => {
    const modal = document.getElementById("mobileImportTargetModal");
    const btnActive = document.getElementById("mobileImportDestActive");
    const btnNew = document.getElementById("mobileImportDestNew");
    const btnCancel = document.getElementById("mobileImportDestCancel");
    const activeHint = document.getElementById("mobileImportActiveHint");
    if (!modal || !btnActive || !btnNew || !btnCancel) return Promise.resolve("active");
    const active = getActiveProject();
    const activeName = (active && active.name) || (lang.t("mobile_project_note_empty") || "Sem projeto");
    const hintLabel = lang.t("mobile_import_dest_active_hint") || "Projeto ativo";
    if (activeHint) activeHint.textContent = `${hintLabel}: ${activeName}`;
    return new Promise((resolve) => {
        let settled = false;
        const finish = (target) => {
            if (settled) return;
            settled = true;
            cleanup();
            setModalActive(modal, false);
            trackMobileFunnel("import_target_selected", { target: target || "cancel" });
            if (target === "active" || target === "new") {
                try { sessionStorage.setItem("skrv_mobile_import_target", target); } catch (_) {}
            } else {
                try { sessionStorage.removeItem("skrv_mobile_import_target"); } catch (_) {}
            }
            resolve(target);
        };
        const onActive = () => finish("active");
        const onNew = () => finish("new");
        const onCancel = () => finish(null);
        const onBackdrop = (e) => {
            if (e.target === modal) finish(null);
        };
        const onKeydown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                finish(null);
            }
        };
        const cleanup = () => {
            btnActive.removeEventListener("click", onActive);
            btnNew.removeEventListener("click", onNew);
            btnCancel.removeEventListener("click", onCancel);
            modal.removeEventListener("click", onBackdrop);
            document.removeEventListener("keydown", onKeydown);
        };
        btnActive.addEventListener("click", onActive);
        btnNew.addEventListener("click", onNew);
        btnCancel.addEventListener("click", onCancel);
        modal.addEventListener("click", onBackdrop);
        document.addEventListener("keydown", onKeydown);
        setModalActive(modal, true);
        setTimeout(() => btnActive.focus(), 10);
    });
};

const buildNoteExcerpt = (text) => {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (!clean) return lang.t("mobile_memo_ph");
    return clean.length > 140 ? `${clean.slice(0, 140)}…` : clean;
};

const loadMobileNotes = () => {
    if (Array.isArray(store.data.mobileNotes) && store.data.mobileNotes.length) return store.data.mobileNotes;
    try {
        const raw = localStorage.getItem(MOBILE_NOTES_KEY) || localStorage.getItem(MOBILE_NOTES_KEY_LEGACY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
};

const saveMobileNotes = (notes) => {
    store.data.mobileNotes = Array.isArray(notes) ? notes : [];
    store.persist(true);
    localStorage.setItem(MOBILE_NOTES_KEY, JSON.stringify(notes));
};

const updateMobileViewCounts = () => {
    const notesCount = document.getElementById("mobileNotesCount");
    const filesCount = document.getElementById("mobileFilesCount");
    const favCount = document.getElementById("mobileFavCount");
    const tagsCount = document.getElementById("mobileTagsCount");
    if (notesCount) notesCount.textContent = mobileNotesCache.length;
    const folders = Array.from(new Set(mobileNotesCache.map(n => normalizeFolder(n.folder)).filter(Boolean)));
    if (filesCount) filesCount.textContent = folders.length;
    const tags = new Set();
    mobileNotesCache.forEach(note => (note.tags || []).forEach(tag => tags.add(normalizeTag(tag))));
    if (tagsCount) tagsCount.textContent = tags.size;
    const favs = mobileNotesCache.filter(note => (note.tags || []).map(normalizeTag).includes("fav") || (note.tags || []).map(normalizeTag).includes("favorito"));
    if (favCount) favCount.textContent = favs.length;
};

const renderMobileFolders = () => {
    const list = document.getElementById("mobileFoldersList");
    if (!list) return;
    const folders = Array.from(new Set(mobileNotesCache.map(n => normalizeFolder(n.folder)).filter(Boolean)));
    list.innerHTML = "";
    if (!folders.length) {
        list.innerHTML = `<span class="mobile-memo-meta">${lang.t("mobile_files_hint")}</span>`;
        return;
    }
    const allBtn = document.createElement("button");
    allBtn.className = "mobile-memo-tag";
    allBtn.type = "button";
    allBtn.textContent = lang.t("mobile_files_all");
    allBtn.onclick = () => {
        mobileNotesFilter.folder = "";
        renderMobileNotes();
    };
    list.appendChild(allBtn);
    folders.forEach(folder => {
        const btn = document.createElement("button");
        btn.className = "mobile-memo-tag";
        btn.type = "button";
        btn.textContent = folder;
        btn.onclick = () => {
            mobileNotesFilter.folder = folder;
            renderMobileNotes();
        };
        list.appendChild(btn);
    });
    updateMobileViewCounts();
};

const renderMobileTags = () => {
    const list = document.getElementById("mobileTagsList");
    if (!list) return;
    const tags = new Set();
    mobileNotesCache.forEach(note => {
        (note.tags || []).forEach(tag => tags.add(normalizeTag(tag)));
    });
    list.innerHTML = "";
    if (!tags.size) {
        list.innerHTML = `<span class="mobile-memo-meta">${lang.t("mobile_memo_tags")}</span>`;
        return;
    }
    Array.from(tags).forEach(tag => {
        const btn = document.createElement("button");
        btn.className = "mobile-memo-tag";
        btn.type = "button";
        btn.textContent = `#${tag}`;
        btn.onclick = () => {
            const search = document.getElementById("mobileMemoSearch");
            if (search) search.value = `#${tag}`;
            mobileNotesFilter.search = `#${tag}`;
            renderMobileNotes();
        };
        list.appendChild(btn);
    });
    updateMobileViewCounts();
};

const renderMobileNotes = () => {
    const list = document.getElementById("mobileMemoList");
    if (!list) return;
    updateMobileNotesTitle();
    let notes = [...mobileNotesCache];
    const search = String(mobileNotesFilter.search || "").trim();
    const folder = normalizeFolder(mobileNotesFilter.folder);
    if (folder) notes = notes.filter(n => normalizeFolder(n.folder) === folder);
    if (search) {
        if (search.startsWith("#")) {
            const tag = normalizeTag(search);
            notes = notes.filter(n => (n.tags || []).map(normalizeTag).includes(tag));
        } else {
            const q = search.toLowerCase();
            notes = notes.filter(n => (n.text || "").toLowerCase().includes(q));
        }
    }
    list.innerHTML = "";
    notes.forEach(note => {
        const card = document.createElement("div");
        card.className = "mobile-memo-card";
        const meta = document.createElement("div");
        meta.className = "mobile-memo-meta";
        const folderLabel = note.folder ? `• ${note.folder}` : "";
        meta.textContent = `${new Date(note.updatedAt || note.createdAt).toLocaleDateString()} ${folderLabel}`.trim();
        card.appendChild(meta);
        const text = document.createElement("div");
        text.textContent = buildNoteExcerpt(note.text);
        card.appendChild(text);
        if (note.tags && note.tags.length) {
            const tags = document.createElement("div");
            tags.className = "mobile-memo-tags-list";
            note.tags.forEach(tag => {
                const chip = document.createElement("span");
                chip.className = "mobile-memo-tag";
                chip.textContent = `#${tag}`;
                tags.appendChild(chip);
            });
            card.appendChild(tags);
        }
        const actions = document.createElement("div");
        actions.className = "mobile-memo-actions-row";
        const editBtn = document.createElement("button");
        editBtn.className = "mobile-memo-btn";
        editBtn.textContent = lang.t("mobile_memo_edit") || "EDITAR";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            const input = document.getElementById("mobileMemoInput");
            const tags = document.getElementById("mobileMemoTags");
            const folderInput = document.getElementById("mobileMemoFolder");
            if (input) input.value = note.text || "";
            if (tags) {
                const merged = ensureFixedTags(note.tags || []);
                tags.value = merged.length ? merged.map(t => `#${t}`).join(", ") : "#mobile";
            }
            if (folderInput) folderInput.value = note.folder || "";
            mobileEditingId = note.id;
        };
        actions.appendChild(editBtn);
        const copyBtn = document.createElement("button");
        copyBtn.className = "mobile-memo-btn";
        copyBtn.textContent = lang.t("mobile_memo_to_project") || "NO PROJETO";
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            const input = document.getElementById("mobileMemoInput");
            if (!input) return;
            const next = (input.value || "").trim();
            input.value = next ? `${next}\n\n${note.text}` : note.text;
            input.dispatchEvent(new Event("input"));
        };
        actions.appendChild(copyBtn);
        const delBtn = document.createElement("button");
        delBtn.className = "mobile-memo-btn danger";
        delBtn.textContent = lang.t("mobile_memo_delete");
        delBtn.onclick = (e) => {
            e.stopPropagation();
            mobileNotesCache = mobileNotesCache.filter(n => n.id !== note.id);
            saveMobileNotes(mobileNotesCache);
            renderMobileNotes();
            renderMobileFolders();
            renderMobileTags();
        };
        actions.appendChild(delBtn);
        card.appendChild(actions);
        list.appendChild(card);
    });
    updateMobileViewCounts();
};

const addOrUpdateMobileNote = (text, tagsRaw, folderRaw) => {
    const baseTags = tagsRaw
        .split(",")
        .map(normalizeTag)
        .filter(Boolean)
        .filter(tag => tag !== "mobile" && !tag.startsWith("proj:"));
    const tags = ensureFixedTags(baseTags);
    const folder = normalizeFolder(folderRaw);
    const now = new Date().toISOString();
    if (mobileEditingId) {
        const existing = mobileNotesCache.find(n => n.id === mobileEditingId);
        if (existing) {
            existing.text = text;
            existing.tags = tags;
            existing.folder = folder;
            existing.updatedAt = now;
        }
        mobileEditingId = null;
    } else {
        if (mobileNotesCache.length >= MOBILE_NOTES_LIMIT) {
            const msg = lang.t("mobile_limit_notes") || "Limite de notas atingido.";
            if (window.skvModal && typeof window.skvModal.alert === "function") {
                window.skvModal.alert(msg);
            } else {
                alert(msg);
            }
            return;
        }
        if (folder) {
            const folders = Array.from(new Set(mobileNotesCache.map(n => normalizeFolder(n.folder)).filter(Boolean)));
            if (!folders.includes(folder) && folders.length >= MOBILE_FOLDERS_LIMIT) {
                const msg = lang.t("mobile_limit_folders") || "Limite de pastas atingido.";
                if (window.skvModal && typeof window.skvModal.alert === "function") {
                    window.skvModal.alert(msg);
                } else {
                    alert(msg);
                }
                return;
            }
        }
        mobileNotesCache.unshift({
            id: `note_${Date.now()}`,
            text,
            tags,
            folder,
            createdAt: now,
            updatedAt: now
        });
    }
    saveMobileNotes(mobileNotesCache);
};

const initMobileMemos = () => {
    const memoInput = document.getElementById("mobileMemoInput");
    const memoTags = document.getElementById("mobileMemoTags");
    const memoFolder = document.getElementById("mobileMemoFolder");
    const memoSearch = document.getElementById("mobileMemoSearch");
    const viewItems = document.querySelectorAll(".mobile-view-item");
    const addBtn = document.getElementById("btnAddMobileMemo");
    if (!memoInput) return;
    updateMobileNotesTitle();
    const cleanText = (text) => {
        if (!text) return "";
        return text
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu, "");
    };
    const applyClean = () => {
        const clean = cleanText(memoInput.value);
        if (clean !== memoInput.value) {
            const pos = memoInput.selectionStart || 0;
            memoInput.value = clean;
            const next = Math.min(pos, clean.length);
            memoInput.setSelectionRange(next, next);
        }
    };
    const cleanTagsText = (value) => {
        const clean = cleanText(value || "");
        return clean.replace(/[\n\r]+/g, " ").trim();
    };
    const enforceMobileTag = () => {
        if (!memoTags) return;
        const tags = cleanTagsText(memoTags.value)
            .split(",")
            .map(normalizeTag)
            .filter(Boolean)
            .filter(tag => tag !== "mobile" && !tag.startsWith("proj:"));
        const merged = ensureFixedTags(tags);
        memoTags.value = merged.length ? merged.map(t => `#${t}`).join(", ") : "#mobile";
    };
    memoInput.addEventListener("paste", (e) => {
        e.preventDefault();
        const clip = e.clipboardData || window.clipboardData;
        const text = clip ? clip.getData("text/plain") : "";
        const clean = cleanText(text);
        const start = memoInput.selectionStart || 0;
        const end = memoInput.selectionEnd || 0;
        const value = memoInput.value || "";
        memoInput.value = value.slice(0, start) + clean + value.slice(end);
        const cursor = start + clean.length;
        memoInput.setSelectionRange(cursor, cursor);
        memoInput.dispatchEvent(new Event("input"));
    });
    memoInput.addEventListener("input", applyClean);
    if (memoTags) {
        memoTags.addEventListener("input", () => {
            memoTags.value = cleanTagsText(memoTags.value);
            enforceMobileTag();
        });
        enforceMobileTag();
    }


    mobileNotesCache = loadMobileNotes().map((note) => {
        const next = ensureFixedTags(note.tags || []);
        if (JSON.stringify(next) !== JSON.stringify(note.tags || [])) {
            return { ...note, tags: next };
        }
        return note;
    });
    saveMobileNotes(mobileNotesCache);
    renderMobileNotes();
    renderMobileFolders();
    renderMobileTags();

    if (memoSearch) {
        memoSearch.addEventListener("input", (e) => {
            mobileNotesFilter.search = e.target.value;
            renderMobileNotes();
        });
    }

    if (viewItems && viewItems.length) {
        const setActiveView = (activeBtn) => {
            viewItems.forEach((item) => {
                const isActive = item === activeBtn;
                item.classList.toggle("is-active", isActive);
                if (isActive) item.setAttribute("aria-current", "true");
                else item.removeAttribute("aria-current");
            });
        };
        setActiveView(viewItems[0]);
        viewItems.forEach(btn => {
            btn.addEventListener("click", () => {
                setActiveView(btn);
                const target = btn.getAttribute("data-target");
                const filter = btn.getAttribute("data-filter");
                if (filter) {
                    if (memoSearch) memoSearch.value = filter;
                    mobileNotesFilter.search = filter;
                    renderMobileNotes();
                }
                if (target) {
                    const el = document.querySelector(target);
                    if (el && el.scrollIntoView) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            });
        });
    }

    if (addBtn) {
        addBtn.onclick = () => {
            const text = memoInput.value.trim();
            if (!text) return;
            const beforeCount = mobileNotesCache.length;
            addOrUpdateMobileNote(text, memoTags ? memoTags.value : "", memoFolder ? memoFolder.value : "");
            const afterCount = mobileNotesCache.length;
            if (afterCount > beforeCount) {
                trackMobileFirstAction({ source: "note_created" });
                trackMobileFunnel("note_created", { totalNotes: afterCount });
            }
            memoInput.value = "";
            if (memoTags) {
                memoTags.value = "";
                enforceMobileTag();
            }
            if (memoFolder) memoFolder.value = "";
            renderMobileNotes();
            renderMobileFolders();
            renderMobileTags();
        };
    }

    const btnMobileReader = document.getElementById("btnMobileReader");
    if (btnMobileReader) {
        btnMobileReader.onclick = () => {
            if (typeof window.skvOpenReader === "function") window.skvOpenReader();
        };
    }
    const btnMobileExport = document.getElementById("btnMobileExport");
    if (btnMobileExport) {
        btnMobileExport.onclick = () => {
            if (typeof window.skvOpenExport === "function") window.skvOpenExport();
        };
    }
    const btnMobileExportProject = document.getElementById("btnMobileExportProject");
    if (btnMobileExportProject) {
        btnMobileExportProject.onclick = () => {
            if (typeof window.skvOpenExport === "function") window.skvOpenExport();
        };
    }
    const btnMobileSaveProject = document.getElementById("btnMobileSaveProject");
    if (btnMobileSaveProject) {
        btnMobileSaveProject.onclick = () => {
            qrTransfer.downloadBase64Backup();
        };
    }
    const btnMobileScanQr = document.getElementById("btnMobileScanQr");
    if (btnMobileScanQr) {
        btnMobileScanQr.onclick = async () => {
            trackMobileFirstAction({ source: "import_qr" });
            trackMobileFunnel("import_attempt_qr");
            const target = await pickMobileImportTarget();
            if (!target) return;
            if (target === "new") createMobileImportProject();
            const scanBtn = document.getElementById("btnScanQr");
            if (scanBtn) {
                scanBtn.dataset.importMode = "append_active";
                scanBtn.click();
            }
        };
    }
    const btnMobileImportFile = document.getElementById("btnMobileImportFile");
    if (btnMobileImportFile) {
        btnMobileImportFile.onclick = async () => {
            trackMobileFirstAction({ source: "import_file" });
            trackMobileFunnel("import_attempt_file");
            const target = await pickMobileImportTarget();
            if (!target) return;
            if (target === "new") createMobileImportProject();
            if (typeof window.skrvSetImportMode === "function") {
                window.skrvSetImportMode("append_active");
            }
            const fileInput = document.getElementById("fileInput");
            if (fileInput) fileInput.dataset.importMode = "append_active";
            const importBtn = document.getElementById("btnImport");
            if (importBtn) importBtn.click();
        };
    }
    const btnMobileReset = document.getElementById("btnMobileReset");
    if (btnMobileReset) {
        btnMobileReset.onclick = () => {
            if (typeof window.skvOpenReset === "function") window.skvOpenReset();
        };
    }
    const btnMobileCtaNewNote = document.getElementById("btnMobileCtaNewNote");
    if (btnMobileCtaNewNote) {
        btnMobileCtaNewNote.onclick = () => {
            trackMobileFirstAction({ source: "cta_new_note" });
            trackMobileFunnel("cta_new_note");
            const section = document.getElementById("mobileNotesSection");
            if (section && section.scrollIntoView) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            setTimeout(() => memoInput.focus(), 120);
        };
    }
    const btnMobileCtaScanQr = document.getElementById("btnMobileCtaScanQr");
    if (btnMobileCtaScanQr) {
        btnMobileCtaScanQr.onclick = () => {
            trackMobileFirstAction({ source: "cta_import_qr" });
            trackMobileFunnel("cta_import_qr");
            const source = document.getElementById("btnMobileScanQr");
            if (source) source.click();
        };
    }
    const btnMobileCtaImportFile = document.getElementById("btnMobileCtaImportFile");
    if (btnMobileCtaImportFile) {
        btnMobileCtaImportFile.onclick = () => {
            trackMobileFirstAction({ source: "cta_import_file" });
            trackMobileFunnel("cta_import_file");
            const source = document.getElementById("btnMobileImportFile");
            if (source) source.click();
        };
    }

};

const initMobileIntro = () => {
    if (window.innerWidth > 900) return;
    if (document.getElementById("mobileGateModal")) return;
    const intro = document.getElementById("mobileIntroModal");
    const close = document.getElementById("closeMobileIntro");
    const ok = document.getElementById("mobileIntroOk");
    const seen = localStorage.getItem("lit_mobile_intro") === "true";
    if (!intro || seen) return;
    setModalActive(intro, true);
    const dismiss = () => {
        setModalActive(intro, false);
        localStorage.setItem("lit_mobile_intro", "true");
    };
    if (close) close.onclick = dismiss;
    if (ok) ok.onclick = dismiss;
    const btnScan = document.getElementById("btnScanQr");
    if (btnScan) btnScan.click();
};

const initMobileEdgeHandle = () => {
    if (window.innerWidth > 900) return;
    let edgeTimer = null;
    const showEdge = () => {
        document.body.classList.add("mobile-edge");
        if (edgeTimer) clearTimeout(edgeTimer);
        edgeTimer = setTimeout(() => {
            document.body.classList.remove("mobile-edge");
        }, 1200);
    };
    document.addEventListener("touchstart", (e) => {
        const touch = e.touches && e.touches[0];
        if (!touch) return;
        if (touch.clientX <= 18) {
            showEdge();
        }
    }, { passive: true });
};

const enforceMobileLitePanels = () => {
    const isLite = document.body.classList.contains("mobile-lite");
    const panelActions = document.getElementById("panelActions");
    const panelNav = document.getElementById("panelNav");
    if (!panelActions || !panelNav) return;
    if (isLite) {
        panelActions.style.display = "none";
        panelNav.style.display = "none";
    } else {
        panelActions.style.display = "";
        panelNav.style.display = "";
    }
};

export const initMobileFeatures = () => {
    if (window.innerWidth > 900) return;
    resolveMobileDebugMode();
    initMobileFunnelDebugPanel();
    if (sessionStorage.getItem("skrv_mobile_funnel_open_logged") !== "1") {
        trackMobileFunnel("mobile_open", { path: window.location.pathname });
        sessionStorage.setItem("skrv_mobile_funnel_open_logged", "1");
    }
    window.skrvMobileFunnelTrack = trackMobileFunnel;
    initMobileMemos();
    initMobileIntro();
    enforceMobileLitePanels();
    initMobileEdgeHandle();
};
