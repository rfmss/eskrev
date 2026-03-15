/*
 * notes.js — painel de notas standalone para onep
 * Armazenamento: localStorage "skrv_mobile_notes_v1" (compatível com fullm)
 */

const NOTES_KEY    = "skrv_mobile_notes_v1";
const NOTES_LIMIT  = 200;
const FOLDERS_LIMIT = 30;
const PINNED_LIMIT  = 5;

// ── Data helpers ────────────────────────────────────────────────
function notesCache() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) { return []; }
}

function saveNotes(notes) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(Array.isArray(notes) ? notes : [])); } catch (_) {}
}

const normalizeTag    = (t) => String(t || "").trim().replace(/^#/, "").toLowerCase();
const normalizeFolder = (f) => String(f || "").trim();

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

function noteTitle(note) {
  if (note.title && note.title.trim()) return note.title.trim();
  const first = String(note.text || "").split("\n").find(Boolean);
  return first ? first.trim().slice(0, 48) : "sem título";
}

function parseQuery(raw) {
  const parts = String(raw || "").trim().split(/\s+/).filter(Boolean);
  const tags = []; let folder = ""; const text = [];
  parts.forEach(p => {
    if (p.startsWith("#") && p.length > 1) { tags.push(normalizeTag(p.slice(1))); return; }
    if (p.startsWith("/") && p.length > 1) { folder = normalizeFolder(p.slice(1)); return; }
    text.push(p);
  });
  return { text: text.join(" ").toLowerCase(), tags, folder };
}

function matchesSearch(note, q) {
  if (!q.text && !q.tags.length && !q.folder) return true;
  const body = `${note.title || ""} ${note.text || ""}`.toLowerCase();
  if (q.text && !body.includes(q.text)) return false;
  if (q.folder && normalizeFolder(note.folder) !== q.folder) return false;
  if (q.tags.length && !q.tags.every(t => (note.tags || []).map(normalizeTag).includes(t))) return false;
  return true;
}

// ── Sidebar init ─────────────────────────────────────────────────
export function initNotesSidebar() {
  const sidebar = document.getElementById("notesSidebar");
  if (!sidebar) return;

  const state = {
    activeId: null,
    stage: "list",
    search: "",
    folder: "",
    tag: "",
    overlayType: "",
    overlayValue: "",
    draftId: null,
    updateTimer: null,
  };

  const $ = (id) => document.getElementById(id);
  const closeBtn = sidebar.querySelector(".notesSidebarClose");

  // ── Stage ────────────────────────────────────────────────────
  function setStage(stage) {
    state.stage = stage;
    sidebar.querySelectorAll(".notes-stage").forEach(el => el.classList.remove("is-active"));
    const target = sidebar.querySelector(`.notes-stage-${stage}`);
    if (target) target.classList.add("is-active");
    if (stage === "list") renderNotesList();
  }

  // ── Overlay ──────────────────────────────────────────────────
  function openOverlay(type, value) {
    state.overlayType = type;
    state.overlayValue = value;
    const overlay  = $("onepNotesOverlay");
    const titleEl  = $("onepNotesOverlayTitle");
    const listEl   = $("onepNotesOverlayList");
    if (!overlay || !listEl) return;
    const all = notesCache();
    const items = type === "folder"
      ? all.filter(n => normalizeFolder(n.folder) === value)
      : all.filter(n => (n.tags || []).map(normalizeTag).includes(value));
    if (titleEl) titleEl.textContent = value;
    listEl.innerHTML = "";
    items.forEach(note => listEl.appendChild(buildNoteCard(note)));
    overlay.classList.add("active");
  }

  function closeOverlay() {
    const overlay = $("onepNotesOverlay");
    if (overlay) overlay.classList.remove("active");
    state.overlayType = "";
    state.overlayValue = "";
  }

  // ── Render list ───────────────────────────────────────────────
  function renderNotesList() {
    const listEl   = $("onepNotesList");
    const emptyEl  = $("onepNotesEmpty");
    if (!listEl || !emptyEl) return;

    const all    = notesCache();
    const parsed = parseQuery(state.search);
    let notes = all
      .filter(n => matchesSearch(n, parsed))
      .filter(n => state.folder ? normalizeFolder(n.folder) === state.folder : true)
      .filter(n => state.tag ? (n.tags || []).map(normalizeTag).includes(state.tag) : true);

    // Folders section
    const foldersWrap = $("onepNotesFoldersWrap");
    const foldersEl   = $("onepNotesFolders");
    if (foldersWrap && foldersEl) {
      const folderMeta = new Map();
      all.forEach(n => {
        const f = normalizeFolder(n.folder);
        if (!f) return;
        const stamp = new Date(n.updatedAt || n.createdAt || 0).getTime();
        if (stamp > (folderMeta.get(f) || 0)) folderMeta.set(f, stamp);
      });
      const folders = Array.from(folderMeta.entries()).sort((a, b) => b[1] - a[1]).map(([f]) => f);
      if (folders.length) {
        foldersWrap.style.display = "grid";
        foldersEl.innerHTML = "";
        const allBtn = document.createElement("button");
        allBtn.className = "notes-filter-btn" + (!state.folder ? " active" : "");
        allBtn.type = "button";
        allBtn.textContent = "tudo";
        allBtn.onclick = () => { state.folder = ""; renderNotesList(); };
        foldersEl.appendChild(allBtn);
        folders.forEach(f => {
          const btn = document.createElement("button");
          btn.className = "notes-filter-btn" + (state.folder === f ? " active" : "");
          btn.type = "button";
          btn.textContent = f;
          btn.onclick = () => openOverlay("folder", f);
          foldersEl.appendChild(btn);
        });
      } else {
        foldersWrap.style.display = "none";
      }
    }

    // Tags section
    const tagsWrap = $("onepNotesTagsWrap");
    const tagsEl   = $("onepNotesTagsList");
    if (tagsWrap && tagsEl) {
      const tagMeta = new Map();
      all.forEach(n => (n.tags || []).map(normalizeTag).filter(Boolean).forEach(t => {
        const stamp = new Date(n.updatedAt || n.createdAt || 0).getTime();
        if (stamp > (tagMeta.get(t) || 0)) tagMeta.set(t, stamp);
      }));
      const tags = Array.from(tagMeta.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t);
      if (tags.length) {
        tagsWrap.style.display = "grid";
        tagsEl.innerHTML = "";
        const allBtn = document.createElement("button");
        allBtn.className = "notes-filter-btn" + (!state.tag ? " active" : "");
        allBtn.type = "button";
        allBtn.textContent = "todas";
        allBtn.onclick = () => { state.tag = ""; renderNotesList(); };
        tagsEl.appendChild(allBtn);
        tags.forEach(t => {
          const btn = document.createElement("button");
          btn.className = "notes-filter-btn" + (state.tag === t ? " active" : "");
          btn.type = "button";
          btn.textContent = `#${t}`;
          btn.onclick = () => openOverlay("tag", t);
          tagsEl.appendChild(btn);
        });
      } else {
        tagsWrap.style.display = "none";
      }
    }

    listEl.innerHTML = "";
    if (!notes.length) {
      emptyEl.style.display = "flex";
      return;
    }
    emptyEl.style.display = "none";
    const sorted = [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)];
    sorted.forEach(note => listEl.appendChild(buildNoteCard(note)));
  }

  // ── Build note card ───────────────────────────────────────────
  function buildNoteCard(note) {
    const card = document.createElement("div");
    card.className = "notes-card" + (note.pinned ? " is-pinned" : "");

    const header = document.createElement("div");
    header.className = "notes-card-header";

    const title = document.createElement("div");
    title.className = "notes-card-title";
    title.textContent = noteTitle(note);

    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.className = "notes-pin-btn" + (note.pinned ? " active" : "");
    pinBtn.innerHTML = note.pinned
      ? `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>`;
    pinBtn.onclick = (e) => { e.stopPropagation(); togglePin(note.id); };

    const meta = document.createElement("div");
    meta.className = "notes-card-meta";
    meta.textContent = note.folder
      ? `${note.folder} · ${formatDate(note.updatedAt || note.createdAt)}`
      : formatDate(note.updatedAt || note.createdAt);

    const excerpt = document.createElement("div");
    excerpt.className = "notes-card-meta";
    excerpt.textContent = String(note.text || "").replace(/\s+/g, " ").trim().slice(0, 80);

    const tagsEl = document.createElement("div");
    tagsEl.className = "notes-tags";
    (note.tags || []).slice(0, 6).forEach(t => {
      const span = document.createElement("span");
      span.className = "notes-tag";
      span.textContent = `#${normalizeTag(t)}`;
      tagsEl.appendChild(span);
    });

    header.appendChild(title);
    header.appendChild(pinBtn);
    card.appendChild(header);
    card.appendChild(meta);
    if (excerpt.textContent) card.appendChild(excerpt);
    if (tagsEl.childElementCount) card.appendChild(tagsEl);
    card.onclick = () => openNoteEdit(note.id);
    return card;
  }

  // ── Open note for editing ─────────────────────────────────────
  function openNoteEdit(id) {
    const note = notesCache().find(n => n.id === id);
    if (!note) return;
    state.activeId = id;
    state.draftId = null;

    const titleEl  = $("onepNotesTitle");
    const bodyEl   = $("onepNotesBody");
    const tagsEl   = $("onepNotesTags");
    const folderEl = $("onepNotesFolder");
    const metaEl   = $("onepNotesMeta");
    const pinToggle = $("onepNotesPinToggle");

    if (titleEl)  titleEl.value  = note.title || "";
    if (bodyEl)   bodyEl.value   = note.text || "";
    if (tagsEl)   tagsEl.value   = (note.tags || []).map(t => `#${normalizeTag(t)}`).join(", ");
    if (folderEl) folderEl.value = note.folder || "";
    if (metaEl)   metaEl.textContent = `atualizado: ${formatDate(note.updatedAt || note.createdAt)}`;
    if (pinToggle) pinToggle.classList.toggle("active", !!note.pinned);

    setStage("edit");
    bodyEl?.focus();
  }

  // ── Create new note ───────────────────────────────────────────
  function createNewNote(preset = {}) {
    const all = notesCache();
    if (all.length >= NOTES_LIMIT) { alert("Limite de notas atingido."); return; }

    const presetFolder = normalizeFolder(preset.folder || "");
    if (presetFolder) {
      const existingFolders = Array.from(new Set(all.map(n => normalizeFolder(n.folder)).filter(Boolean)));
      if (!existingFolders.includes(presetFolder) && existingFolders.length >= FOLDERS_LIMIT) {
        alert("Limite de pastas atingido."); return;
      }
    }

    state.activeId = null;
    state.draftId  = `note_${Date.now()}`;
    closeOverlay();

    const titleEl  = $("onepNotesTitle");
    const bodyEl   = $("onepNotesBody");
    const tagsEl   = $("onepNotesTags");
    const folderEl = $("onepNotesFolder");
    const metaEl   = $("onepNotesMeta");
    const pinToggle = $("onepNotesPinToggle");

    if (titleEl)  titleEl.value  = "";
    if (bodyEl)   bodyEl.value   = "";
    if (tagsEl)   tagsEl.value   = (preset.tags || []).map(t => `#${normalizeTag(t)}`).join(", ");
    if (folderEl) folderEl.value = presetFolder;
    if (metaEl)   metaEl.textContent = "";
    if (pinToggle) pinToggle.classList.remove("active");

    setStage("edit");
    bodyEl?.focus();
  }

  // ── Read edit inputs ──────────────────────────────────────────
  function readInputs() {
    const titleEl  = $("onepNotesTitle");
    const bodyEl   = $("onepNotesBody");
    const tagsEl   = $("onepNotesTags");
    const folderEl = $("onepNotesFolder");
    const title  = titleEl ? titleEl.value.trim() : "";
    const text   = bodyEl  ? bodyEl.value : "";
    const tags   = tagsEl  ? tagsEl.value.split(",").map(normalizeTag).filter(Boolean) : [];
    const folder = folderEl ? normalizeFolder(folderEl.value) : "";
    return { title, text, tags, folder };
  }

  function hasContent({ title, text, folder, tags }) {
    return Boolean(`${title}${text}${folder}${(tags || []).join("")}`.trim());
  }

  // ── Finalize draft ────────────────────────────────────────────
  function finalizeDraft() {
    if (!state.draftId) return;
    const data = readInputs();
    if (!hasContent(data)) { state.draftId = null; return; }
    const all = notesCache();
    if (all.length >= NOTES_LIMIT) { state.draftId = null; return; }
    const note = {
      id: state.draftId,
      title: data.title,
      text: data.text,
      tags: data.tags,
      folder: data.folder,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(note);
    saveNotes(all);
    state.activeId = note.id;
    state.draftId  = null;
  }

  // ── Update active note ────────────────────────────────────────
  function updateActive() {
    if (state.draftId) {
      if (hasContent(readInputs())) finalizeDraft();
      return;
    }
    const all  = notesCache();
    const note = all.find(n => n.id === state.activeId);
    if (!note) return;
    const { title, text, tags, folder } = readInputs();
    if (folder) {
      const folders = Array.from(new Set(all.map(n => normalizeFolder(n.folder)).filter(Boolean)));
      if (!folders.includes(folder) && folders.length >= FOLDERS_LIMIT) {
        alert("Limite de pastas atingido."); return;
      }
    }
    note.title = title;
    note.text  = text;
    note.tags  = tags;
    note.folder = folder;
    note.updatedAt = new Date().toISOString();
    saveNotes(all);
    const metaEl = $("onepNotesMeta");
    if (metaEl) metaEl.textContent = `atualizado: ${formatDate(note.updatedAt)}`;
  }

  function scheduleUpdate() {
    clearTimeout(state.updateTimer);
    state.updateTimer = setTimeout(updateActive, 280);
  }

  // ── Pin ───────────────────────────────────────────────────────
  function togglePin(id) {
    const all  = notesCache();
    const note = all.find(n => n.id === id);
    if (!note) return;
    const pinnedCount = all.filter(n => n.pinned).length;
    if (!note.pinned && pinnedCount >= PINNED_LIMIT) { alert("Limite de fixados atingido."); return; }
    note.pinned = !note.pinned;
    note.updatedAt = new Date().toISOString();
    saveNotes(all);
    const pinToggle = $("onepNotesPinToggle");
    if (state.activeId === id && pinToggle) {
      pinToggle.classList.toggle("active", note.pinned);
    }
    renderNotesList();
  }

  // ── Delete note ───────────────────────────────────────────────
  function deleteNote() {
    const all  = notesCache();
    const note = all.find(n => n.id === state.activeId);
    if (!note) return;
    const ok = confirm(`Apagar "${noteTitle(note)}"? Esta ação não pode ser desfeita.`);
    if (!ok) return;
    saveNotes(all.filter(n => n.id !== state.activeId));
    state.activeId = null;
    setStage("list");
  }

  // ── Wire DOM ──────────────────────────────────────────────────
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (state.stage === "edit") finalizeDraft();
      sidebar.classList.remove("is-open");
      document.getElementById("page1")?.focus();
    });
  }

  // aria-hidden sync + Esc
  const observer = new MutationObserver(() => {
    const isOpen = sidebar.classList.contains("is-open");
    sidebar.setAttribute("aria-hidden", isOpen ? "false" : "true");
    if (isOpen && state.stage === "list") renderNotesList();
  });
  observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && sidebar.classList.contains("is-open")) {
      if (state.stage === "edit") {
        finalizeDraft();
        setStage("list");
      } else {
        sidebar.classList.remove("is-open");
        document.getElementById("page1")?.focus();
      }
    }
  });

  // Search
  const searchEl = $("onepNotesSearch");
  if (searchEl) {
    searchEl.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderNotesList();
    });
  }

  // New note buttons
  const newBtn         = $("onepNotesNew");
  const emptyCreateBtn = $("onepNotesEmptyCreate");
  const fabBtn         = $("onepNotesFab");
  if (newBtn)         newBtn.onclick         = () => createNewNote();
  if (emptyCreateBtn) emptyCreateBtn.onclick = () => createNewNote();
  if (fabBtn)         fabBtn.onclick         = () => createNewNote();

  // Back / pin / delete in edit stage
  const backBtn    = $("onepNotesBack");
  const pinBtn     = $("onepNotesPinToggle");
  const deleteBtn  = $("onepNotesDelete");
  if (backBtn)   backBtn.onclick   = () => { finalizeDraft(); setStage("list"); };
  if (pinBtn)    pinBtn.onclick    = () => { if (state.activeId) togglePin(state.activeId); };
  if (deleteBtn) deleteBtn.onclick = deleteNote;

  // Edit inputs — schedule auto-save
  ["onepNotesTitle", "onepNotesBody", "onepNotesTags", "onepNotesFolder"].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener("input", scheduleUpdate);
  });

  // Overlay close / new
  const overlayCloseBtn = $("onepNotesOverlayClose");
  const overlayNewBtn   = $("onepNotesOverlayNew");
  if (overlayCloseBtn) overlayCloseBtn.onclick = closeOverlay;
  if (overlayNewBtn)   overlayNewBtn.onclick = () => {
    if (state.overlayType === "tag") createNewNote({ tags: [state.overlayValue] });
    else if (state.overlayType === "folder") createNewNote({ folder: state.overlayValue });
    else createNewNote();
  };

  // Initial render (hidden until sidebar opens via MutationObserver)
}
