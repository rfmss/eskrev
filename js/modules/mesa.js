/*
 * mesa.js — gerenciamento de projetos para onep
 * Usa "skrv_data" — mesma chave do fullm, projetos sincronizados
 */
import { removePage, checkOverflow, savePagesState, addPage } from "./pageFlow.js";
import { savePostits, restorePostits } from "./postits.js";

const NOTES_KEY    = "skrv_mobile_notes_v1";
const POSTITS_KEY  = "skrv_postits_v1";
const PAGES_KEY    = "eskrev:onep:pages:v2";

// Lê o texto do editor excluindo slices embutidos (contenteditable=false).
// Slices vivem dentro do .pageContent mas seu innerText não é texto do escritor.
function getPageText(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll(".slice").forEach(s => s.remove());
  return clone.innerText || "";
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text || "");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Templates de livro ────────────────────────────────────────────
const BOOK_TEMPLATE = [
  { key: "capa",              title: "Capa",              body: "A capa apresenta o livro ao leitor.\n\nAqui entram o título, o subtítulo (se houver)\ne o nome do autor.\n\nA capa não explica o conteúdo.\nEla anuncia que o livro existe." },
  { key: "folha-rosto",       title: "Folha de rosto",    body: "A folha de rosto identifica formalmente a obra.\n\nCostuma repetir o título e o nome do autor\ne pode incluir editora, local e ano.\n\nÉ a primeira página oficial do livro." },
  { key: "ficha-catalografica", title: "Ficha catalográfica", body: "A ficha catalográfica organiza os dados técnicos do livro.\n\nEla é usada por bibliotecas, editoras e universidades.\n\nNormalmente é preparada depois do texto pronto." },
  { key: "dedicatoria",       title: "Dedicatória",       body: "A dedicatória é um espaço pessoal.\n\nPode ser breve, direta ou simbólica.\n\nNão precisa explicar nada além do gesto." },
  { key: "epigrafe",          title: "Epígrafe",          body: "A epígrafe é uma citação que dialoga com o livro.\n\nEla não resume nem antecipa.\n\nFunciona como um tom inicial." },
  { key: "sumario",           title: "Sumário",           body: "O sumário organiza a leitura.\n\nEle mostra a estrutura do livro\ne a ordem dos capítulos.\n\nGeralmente é ajustado após o texto final." },
  { key: "introducao",        title: "Introdução",        body: "A introdução prepara o leitor.\n\nAqui você apresenta o tema, o recorte\ne o caminho que o livro percorre.\n\nNão é o desenvolvimento do argumento.\nÉ a entrada." },
  { key: "capitulo-1",        title: "Capítulo 1 (modelo)", body: "Um capítulo desenvolve uma ideia completa,\numa etapa do argumento ou uma parte da narrativa.\n\nEle se sustenta sozinho,\nmas faz sentido dentro do conjunto.\n\n(Capítulos seguintes reutilizam este texto)" },
  { key: "conclusao",         title: "Conclusão",         body: "A conclusão retoma o percurso do livro.\n\nAqui você pode fechar argumentos,\napontar consequências\nou abrir novas questões.\n\nConcluir não é repetir.\nÉ dar forma ao que ficou." },
  { key: "agradecimentos",    title: "Agradecimentos",    body: "Espaço para reconhecer pessoas e apoios\nque participaram do processo do livro.\n\nCostuma ser breve e direto." },
  { key: "notas",             title: "Notas",             body: "As notas complementam o texto principal.\n\nServem para esclarecimentos,\nreferências pontuais\nou comentários laterais." },
  { key: "referencias",       title: "Referências",       body: "Lista das obras citadas ou consultadas.\n\nPode seguir normas acadêmicas,\ndependendo do tipo de livro." },
  { key: "quarta-capa",       title: "Quarta capa",       body: "A quarta capa conversa com o leitor antes da leitura.\n\nPode conter um texto curto sobre o livro,\num trecho destacado\nou informações sobre o autor.\n\nÉ o último contato antes da abertura." },
];

const BOOK_TEMPLATE_FICTION = [
  { key: "capa",          title: "Capa",                    body: "A capa é o primeiro contato com a história.\n\nEla não conta o enredo.\nSugere um mundo, um clima, uma promessa.\n\nÀs vezes, basta um título que não explica tudo." },
  { key: "folha-rosto",   title: "Folha de rosto",          body: "Aqui a história se apresenta formalmente.\n\nTítulo, autor, e o livro assume sua forma.\n\nÉ o ponto em que a ficção vira objeto." },
  { key: "dedicatoria",   title: "Dedicatória (opcional)",  body: "A dedicatória é um gesto silencioso.\n\nPode ser íntima, simbólica ou enigmática.\n\nNão precisa ser entendida por todos." },
  { key: "epigrafe",      title: "Epígrafe (opcional)",     body: "Uma frase antes da história começar.\n\nNão resume.\nNão antecipa.\n\nApenas inclina o leitor na direção certa." },
  { key: "sumario",       title: "Sumário",                 body: "O sumário mostra o ritmo do livro.\n\nCapítulos curtos, longos,\ntítulos nomeados ou numerados.\n\nEle já conta algo sobre a narrativa." },
  { key: "prologo",       title: "Prólogo (opcional)",      body: "O prólogo acontece antes da história,\nmas não necessariamente antes do tempo.\n\nPode apresentar um evento,\num tom ou uma pergunta.\n\nNem todo livro precisa de um." },
  { key: "capitulo-1",    title: "Capítulo 1 (modelo)",     body: "Um capítulo é uma unidade de movimento.\n\nPode conter uma cena,\num conflito,\numa mudança.\n\nAlgo precisa sair diferente do que entrou.\n\n(Capítulos seguintes reutilizam este placeholder)" },
  { key: "climax",        title: "Clímax",                  body: "Aqui a história atinge seu ponto máximo.\n\nO conflito central se resolve,\nou se transforma definitivamente.\n\nNão é o fim.\nÉ o ponto sem retorno." },
  { key: "desfecho",      title: "Desfecho",                body: "O desfecho mostra o que ficou depois.\n\nNão precisa explicar tudo.\n\nÀs vezes, basta deixar o leitor\nsozinho com as consequências." },
  { key: "quarta-capa",   title: "Quarta capa",             body: "A quarta capa fala com quem ainda não leu.\n\nPode sugerir o conflito,\napresentar o universo\nou destacar um trecho.\n\nEla não revela.\nEla chama." },
];

const BOOK_TEMPLATE_POETRY = [
  { key: "capa",          title: "Capa",                    body: "Um título já é um poema.\n\nÀs vezes, o livro começa aqui." },
  { key: "folha-rosto",   title: "Folha de rosto",          body: "O livro assume seu nome.\n\nAutor, título.\n\nNada mais precisa acontecer ainda." },
  { key: "dedicatoria",   title: "Dedicatória (opcional)",  body: "Um gesto breve.\n\nPode ser uma linha.\nPode ser um nome.\nPode ficar em branco." },
  { key: "epigrafe",      title: "Epígrafe (opcional)",     body: "Uma frase que inclina o livro.\n\nNão explica.\n\nApenas toca o tom." },
  { key: "nota-inicial",  title: "Nota inicial (opcional)", body: "Algumas palavras antes dos poemas.\n\nNão para explicar.\n\nPara abrir o espaço." },
  { key: "poemas",        title: "Poemas",                  body: "Cada poema é um corpo independente.\n\nA ordem cria um ritmo.\n\nO conjunto cria outra coisa." },
  { key: "ultimo-poema",  title: "Último poema",            body: "Nem sempre é o melhor.\n\nÉ o que fica por último.\n\nO livro se despede aqui." },
  { key: "quarta-capa",   title: "Quarta capa",             body: "Poucas linhas.\n\nUm trecho.\nUm gesto.\nUm silêncio.\n\nO suficiente para chamar alguém." },
];

const BOOK_FOLDERS = [
  { id: "nonfiction", title: "Livro",           template: BOOK_TEMPLATE,         openDefault: true },
  { id: "fiction",    title: "Livro (ficção)",   template: BOOK_TEMPLATE_FICTION, openDefault: false },
  { id: "poetry",     title: "Livro (poesia)",   template: BOOK_TEMPLATE_POETRY,  openDefault: false },
];

// Set of all template bodies — used to detect unedited placeholder content
const TEMPLATE_BODY_SET = new Set(
  [...BOOK_TEMPLATE, ...BOOK_TEMPLATE_FICTION, ...BOOK_TEMPLATE_POETRY].map(t => t.body)
);
function isUnedited(proj) {
  return proj.bookPart && TEMPLATE_BODY_SET.has(proj.content || "");
}

// ── Store ─────────────────────────────────────────────────────────
const STORE_KEY = "skrv_data";

const mesaStore = {
  data: { projects: [], activeId: null, memo: "", mobileNotes: [] },
  _timer: null,

  init() {
    try {
      const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem("tot_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = parsed;
        if (!Array.isArray(this.data.projects)) this.data.projects = [];
        if (!Array.isArray(this.data.mobileNotes)) this.data.mobileNotes = [];
      } else {
        this._createDefaultProject();
      }
    } catch (_) {
      this._createDefaultProject();
    }
    ensureBookTemplateProjects(this);
  },

  _createDefaultProject() {
    const id = Date.now().toString();
    this.data = {
      projects: [{ id, name: "Projeto", content: "", date: new Date().toLocaleString(), cursorPos: 0 }],
      activeId: id,
      memo: "",
      mobileNotes: [],
    };
    this.persist(true);
  },

  persist(immediate = false) {
    if (immediate) {
      clearTimeout(this._timer);
      this._timer = null;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (_) {}
      return;
    }
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.data)); } catch (_) {}
      this._timer = null;
    }, 500);
  },

  getActive() {
    const all = this.data.projects || [];
    let proj = all.find(p => p.id === this.data.activeId);
    if (!proj && all.length) {
      proj = all[0];
      this.data.activeId = proj.id;
      this.persist(true);
    }
    return proj || null;
  },

  setActive(id) {
    this.data.activeId = id;
    this.persist(true);
  },

  createProject(name, content = "") {
    const id = Date.now().toString();
    const proj = { id, name, content, date: new Date().toLocaleString(), cursorPos: 0 };
    if (!Array.isArray(this.data.projects)) this.data.projects = [];
    this.data.projects.unshift(proj);
    this.data.activeId = id;
    this.persist(true);
    return proj;
  },

  renameProject(id, newName) {
    const p = (this.data.projects || []).find(p => p.id === id);
    if (p) { p.name = newName; this.persist(true); }
  },

  deleteProject(id) {
    this.data.projects = (this.data.projects || []).filter(p => p.id !== id);
    if (this.data.activeId === id) {
      this.data.activeId = this.data.projects.length ? this.data.projects[0].id : null;
    }
    this.persist(true);
  },

  saveContent(html) {
    const proj = this.getActive();
    if (!proj) return;
    proj.content = html;
    proj.date = new Date().toLocaleString();
    this.persist();
  },
};

// ── Book template helpers ─────────────────────────────────────────
function ensureBookTemplateProjects(store) {
  if (!Array.isArray(store.data.projects)) store.data.projects = [];
  const existing = new Map();
  store.data.projects.forEach(p => {
    if (p && p.bookPartKey && p.bookPartGroup)
      existing.set(`${p.bookPartGroup}:${p.bookPartKey}`, p);
  });
  let changed = false;
  BOOK_FOLDERS.forEach(folder => {
    folder.template.forEach(part => {
      const k = `${folder.id}:${part.key}`;
      if (!existing.has(k)) {
        store.data.projects.push({
          id: `${folder.id}_${part.key}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: part.title,
          content: part.body,
          date: new Date().toLocaleString(),
          cursorPos: 0,
          bookPart: true,
          bookPartKey: part.key,
          bookPartGroup: folder.id,
        });
        changed = true;
      } else {
        const found = existing.get(k);
        if (!found.bookPart) { found.bookPart = true; changed = true; }
        if (found.bookPartGroup !== folder.id) { found.bookPartGroup = folder.id; changed = true; }
      }
    });
  });
  if (changed) store.persist(true);
}

function getBookParts(store, groupId) {
  return (store.data.projects || []).filter(p => p && p.bookPart && p.bookPartGroup === groupId);
}

// ── Print helpers ─────────────────────────────────────────────────
function printProjectText(proj) {
  const text = proj.content || "";
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${proj.name}</title><style>
    body{font-family:Georgia,serif;font-size:12pt;line-height:1.6;max-width:65ch;margin:2cm auto;color:#000}
    pre{white-space:pre-wrap}
  </style></head><body><pre>${text.replace(/</g, "&lt;")}</pre></body></html>`);
  win.document.close();
  win.print();
}

// ── Render project list ───────────────────────────────────────────
function renderProjectList(listEl, store, onSwitch) {
  if (!listEl) return;
  listEl.innerHTML = "";
  ensureBookTemplateProjects(store);
  const all = store.data.projects || [];
  const otherProjects = all.filter(p => !p?.bookPart);

  const createItem = (proj, { isBookPart = false } = {}) => {
    const div = document.createElement("div");
    div.className = "mesa-item" + (proj.id === store.data.activeId ? " is-active" : "") + (isBookPart ? " is-book-part" : "");

    const info = document.createElement("div");
    info.className = "mesa-item-info";
    const name = document.createElement("div");
    name.className = "mesa-item-name";
    name.textContent = proj.name;
    const meta = document.createElement("div");
    meta.className = "mesa-item-meta";
    meta.textContent = (proj.date || "").split(",")[0];
    info.appendChild(name);
    info.appendChild(meta);
    info.onclick = (e) => {
      e.stopPropagation();
      onSwitch(proj.id);
    };

    const actions = document.createElement("div");
    actions.className = "mesa-item-actions";

    if (!isBookPart) {
      const btnEdit = document.createElement("button");
      btnEdit.className = "mesa-btn-icon";
      btnEdit.title = "Renomear";
      btnEdit.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>`;
      btnEdit.onclick = (e) => {
        e.stopPropagation();
        enableInlineRename(info, proj.id, proj.name, store, listEl, onSwitch);
      };
      actions.appendChild(btnEdit);
    }

    const btnPrint = document.createElement("button");
    btnPrint.className = "mesa-btn-icon";
    btnPrint.title = "Imprimir";
    btnPrint.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`;
    btnPrint.onclick = (e) => { e.stopPropagation(); printProjectText(proj); };
    actions.appendChild(btnPrint);

    if (!isBookPart) {
      const btnDel = document.createElement("button");
      btnDel.className = "mesa-btn-icon is-danger";
      btnDel.title = "Apagar";
      btnDel.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
      btnDel.onclick = (e) => {
        e.stopPropagation();
        const ok = confirm(`Apagar "${proj.name}"? Esta ação não pode ser desfeita.`);
        if (!ok) return;
        store.deleteProject(proj.id);
        renderProjectList(listEl, store, onSwitch);
        if (proj.id === store.data.activeId || store.data.projects.length === 0) onSwitch(store.data.activeId);
      };
      actions.appendChild(btnDel);
    }

    div.appendChild(info);
    div.appendChild(actions);
    return div;
  };

  // Book folders
  BOOK_FOLDERS.forEach(folderConfig => {
    const parts = getBookParts(store, folderConfig.id);
    if (!parts.length) return;

    const folder = document.createElement("div");
    folder.className = "mesa-folder";

    const header = document.createElement("div");
    header.className = "mesa-folder-header";

    const caret = document.createElement("span");
    caret.className = "mesa-folder-caret";

    const label = document.createElement("div");
    label.className = "mesa-folder-label";
    const skvTitle = store.data.skvTitle || "";
    label.innerHTML = `<strong>${folderConfig.title}</strong>${skvTitle ? `<span class="mesa-folder-meta">${skvTitle}</span>` : ""}`;

    const folderActions = document.createElement("div");
    folderActions.className = "mesa-folder-actions";

    const btnPrintAll = document.createElement("button");
    btnPrintAll.className = "mesa-btn-icon";
    btnPrintAll.title = "Imprimir livro completo";
    btnPrintAll.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`;
    btnPrintAll.onclick = (e) => {
      e.stopPropagation();
      const allText = parts.map(p => `=== ${p.name} ===\n\n${p.content || ""}`).join("\n\n\n");
      const title = store.data.skvTitle || folderConfig.title;
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`<!doctype html><html><head><title>${title}</title><style>
        body{font-family:Georgia,serif;font-size:12pt;line-height:1.6;max-width:65ch;margin:2cm auto;color:#000}
        pre{white-space:pre-wrap}
        @media print{pre{page-break-inside:auto}}
      </style></head><body><pre>${allText.replace(/</g, "&lt;")}</pre></body></html>`);
      win.document.close();
      win.print();
    };
    folderActions.appendChild(btnPrintAll);

    header.appendChild(caret);
    header.appendChild(label);
    header.appendChild(folderActions);

    const items = document.createElement("div");
    items.className = "mesa-folder-items";
    const storageKey = `skrv_book_folder_open_${folderConfig.id}`;
    const stored = localStorage.getItem(storageKey);
    const open = stored === null ? Boolean(folderConfig.openDefault) : stored !== "0";
    if (!open) items.classList.add("is-collapsed");
    caret.textContent = open ? "▾" : "▸";

    header.onclick = () => {
      const isOpen = !items.classList.contains("is-collapsed");
      items.classList.toggle("is-collapsed", isOpen);
      caret.textContent = isOpen ? "▸" : "▾";
      try { localStorage.setItem(storageKey, isOpen ? "0" : "1"); } catch (_) {}
    };

    parts.forEach(p => items.appendChild(createItem(p, { isBookPart: true })));
    folder.appendChild(header);
    folder.appendChild(items);
    listEl.appendChild(folder);
  });

  // Other (non-book) projects
  otherProjects.forEach(proj => {
    if (!proj) return;
    listEl.appendChild(createItem(proj));
  });
}

function enableInlineRename(infoEl, id, currentName, store, listEl, onSwitch) {
  infoEl.onclick = null;
  infoEl.innerHTML = `<input class="mesa-rename-input" value="${currentName.replace(/"/g, '&quot;')}">`;
  const input = infoEl.querySelector("input");
  if (input) {
    input.focus();
    const save = () => {
      const v = input.value.trim();
      if (v) store.renameProject(id, v);
      renderProjectList(listEl, store, onSwitch);
    };
    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") input.blur(); });
  }
}

// ── Export .skv ───────────────────────────────────────────────────
export async function exportSkv() {
  // 1. Flush página ativa para o store
  const pages = document.querySelectorAll(".pageContent");
  const allText = Array.from(pages).map(el => getPageText(el)).join("");
  mesaStore.saveContent(allText);
  mesaStore.persist(true);

  // 2. Captura snapshot completo
  const data = mesaStore.data;
  const active = mesaStore.getActive();

  // 2a. HTML das páginas (preserva formatação)
  let pagesHtml = [];
  try {
    const raw = localStorage.getItem(PAGES_KEY);
    if (raw) pagesHtml = JSON.parse(raw);
  } catch (_) {}

  // 2b. Notas laterais
  let notes = [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) notes = JSON.parse(raw);
  } catch (_) {}

  // 2c. Post-its
  let postits = [];
  try {
    const raw = localStorage.getItem(POSTITS_KEY);
    if (raw) postits = JSON.parse(raw);
  } catch (_) {}

  // 2d. Proof: hash SHA-256 do texto completo + timestamp
  const contentHash = await sha256Hex(allText);
  const proof = {
    content_hash: contentHash,
    created_at: new Date().toISOString(),
    chars: allText.length,
    words: allText.trim() ? allText.trim().split(/\s+/).length : 0,
  };

  const snapshot = {
    ...data,
    pagesHtml,
    notes,
    postits,
    proof,
    skv_version: 2,
  };

  // 3. Gera filename e dispara download
  const rawName = data.skvTitle || active?.name || "eskrev";
  const safe = (s) =>
    String(s || "eskrev")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .substring(0, 32) || "eskrev";

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ms = Date.now();
  const filename = `${safe(rawName)}_${stamp}_${ms}.skv`;

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return filename;
}

// ── Mesa init ─────────────────────────────────────────────────────
export function initMesa(ctx) {
  const sidebar  = document.getElementById("filesSidebar");
  if (!sidebar) return;

  const closeBtn  = sidebar.querySelector(".filesSidebarClose");
  const listEl    = document.getElementById("mesaProjectList");
  const newBtn    = document.getElementById("mesaNewBtn");
  const openBtn   = document.getElementById("mesaOpenBtn");
  const fileInput = document.getElementById("mesaFileInput");

  mesaStore.init();

  function getEditor() { return document.getElementById("page1"); }

  // Save current editor content (all pages) to active project before switching
  function saveCurrentToStore() {
    const pages = ctx.state?.pages;
    const text = pages && pages.length
      ? pages.map(el => getPageText(el)).join("")
      : getPageText(getEditor() || document.createElement("div"));
    mesaStore.saveContent(text);
  }

  // Remove all pages beyond the first and redistribute content
  function clearExtraPages() {
    const pages = ctx.state?.pages;
    if (!pages) return;
    while (pages.length > 1) removePage(ctx, pages.length - 1);
  }

  // Load a project into the editor
  function applyToEditor(editor, proj) {
    if (isUnedited(proj)) {
      // Template ainda não editado — mostrar como placeholder, não como texto real
      editor.innerText = "";
      editor.classList.add("is-empty");
      editor.setAttribute("data-placeholder", proj.content || "");
    } else {
      editor.setAttribute("data-placeholder", "");
      editor.innerText = proj.content || "";
      editor.classList.toggle("is-empty", !(proj.content || "").trim());
    }
  }

  function loadProject(id) {
    if (!id) return;
    saveCurrentToStore();
    mesaStore.setActive(id);
    const proj = mesaStore.getActive();
    const editor = getEditor();
    if (!editor || !proj) return;

    // Slices pertencem à sessão, não ao projeto — levanta antes de trocar, reinjeta depois.
    const liveSlices = Array.from(
      document.querySelectorAll(".pageContent .slice")
    ).map(s => { s.remove(); return s; });

    clearExtraPages();
    applyToEditor(editor, proj);

    if (liveSlices.length) {
      liveSlices.forEach(s => editor.appendChild(s));
    }

    requestAnimationFrame(() => {
      checkOverflow(ctx, editor);
      savePagesState(ctx);
    });
    ctx.setStatus?.(`projeto: ${proj.name}`);
    renderProjectList(listEl, mesaStore, loadProject);
    ctx.integrations?.persistence?.bind?.(editor);
    editor.focus();
  }

  // Initial project load: bridge onep with skrv_data
  // If page1 has content but skrv_data active project is empty → save onep content to project
  const editor = getEditor();
  const active = mesaStore.getActive();
  if (editor && active && !active.content && getPageText(editor).trim()) {
    active.content = getPageText(editor).trim();
    mesaStore.persist(true);
  } else if (editor && active && active.content && !getPageText(editor).trim()) {
    clearExtraPages();
    applyToEditor(editor, active);
    requestAnimationFrame(() => {
      checkOverflow(ctx, editor);
      savePagesState(ctx);
    });
  }

  // Auto-save: listen to page1 input to keep skrv_data in sync
  if (editor) {
    let syncTimer = null;
    editor.addEventListener("input", () => {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => mesaStore.saveContent(getPageText(editor)), 2000);
    });
  }

  // Render list when sidebar opens
  const observer = new MutationObserver(() => {
    const isOpen = sidebar.classList.contains("is-open");
    sidebar.setAttribute("aria-hidden", isOpen ? "false" : "true");
    if (isOpen) {
      saveCurrentToStore();
      renderProjectList(listEl, mesaStore, loadProject);
    }
  });
  observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("is-open");
      getEditor()?.focus();
    });
  }

  // Esc closes sidebar
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && sidebar.classList.contains("is-open")) {
      sidebar.classList.remove("is-open");
      getEditor()?.focus();
    }
  });

  // + NOVO
  if (newBtn) {
    newBtn.addEventListener("click", () => {
      saveCurrentToStore();
      const name = `Projeto ${new Date().toLocaleDateString("pt-BR")}`;
      mesaStore.createProject(name, "");
      const editor = getEditor();
      if (editor) {
        clearExtraPages();
        editor.innerText = "";
        savePagesState(ctx);
        ctx.integrations?.persistence?.bind?.(editor);
        editor.focus();
      }
      ctx.setStatus?.(`novo projeto: ${name}`);
      renderProjectList(listEl, mesaStore, loadProject);
    });
  }

  // ABRIR (.skv)
  if (openBtn && fileInput) {
    openBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const raw = ev.target?.result;
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);

          // ── Formato principal: { projects: [...], activeId, [pagesHtml, notes, postits] }
          if (Array.isArray(parsed.projects)) {
            saveCurrentToStore();

            // Projetos
            mesaStore.data = {
              projects: parsed.projects,
              activeId: parsed.activeId || (parsed.projects[0]?.id ?? null),
              memo: parsed.memo || "",
              mobileNotes: parsed.mobileNotes || [],
              skvTitle: parsed.skvTitle || "",
            };
            if (!Array.isArray(mesaStore.data.projects)) mesaStore.data.projects = [];
            ensureBookTemplateProjects(mesaStore);
            mesaStore.persist(true);

            // Notas laterais
            if (Array.isArray(parsed.notes)) {
              try { localStorage.setItem(NOTES_KEY, JSON.stringify(parsed.notes)); } catch (_) {}
            }

            // Post-its: grava no localStorage e restaura no DOM
            const postitLayer = document.getElementById("postitLayer");
            if (postitLayer) {
              // Remove post-its existentes antes de restaurar
              postitLayer.querySelectorAll(".postit").forEach(n => n.remove());
            }
            if (Array.isArray(parsed.postits) && parsed.postits.length) {
              try { localStorage.setItem(POSTITS_KEY, JSON.stringify(parsed.postits)); } catch (_) {}
              restorePostits(ctx);
            } else {
              try { localStorage.removeItem(POSTITS_KEY); } catch (_) {}
            }

            // Páginas HTML (preserva formatação)
            const editor = getEditor();
            if (Array.isArray(parsed.pagesHtml) && parsed.pagesHtml.length && editor) {
              try { localStorage.setItem(PAGES_KEY, JSON.stringify(parsed.pagesHtml)); } catch (_) {}
              clearExtraPages();
              editor.innerHTML = parsed.pagesHtml[0] || "";
              for (let i = 1; i < parsed.pagesHtml.length; i++) {
                const prev = ctx.state?.pages?.[i - 1];
                if (!prev) break;
                const newPage = addPage(ctx, prev, false);
                if (newPage) newPage.innerHTML = parsed.pagesHtml[i] || "";
              }
              ctx.integrations?.persistence?.bind?.(editor);
            } else if (editor) {
              // Fallback: usa innerText do projeto ativo
              const active = mesaStore.getActive();
              if (active) {
                clearExtraPages();
                applyToEditor(editor, active);
                ctx.integrations?.persistence?.bind?.(editor);
              }
            }

            requestAnimationFrame(() => {
              const ed = getEditor();
              if (ed) checkOverflow(ctx, ed);
            });
            ctx.setStatus?.(`importado: ${file.name}`);

          // ── Formato onep legado: { html, title }
          } else if (parsed.html) {
            saveCurrentToStore();
            const editor = getEditor();
            if (editor) {
              editor.innerHTML = parsed.html;
              ctx.integrations?.persistence?.bind?.(editor);
            }
            if (parsed.title) mesaStore.renameProject(mesaStore.data.activeId, parsed.title);
            ctx.setStatus?.(`importado: ${file.name}`);
          }
        } catch (_) {
          // Fallback: texto plano
          const editor = getEditor();
          if (editor) {
            editor.innerText = raw;
            saveCurrentToStore();
          }
          ctx.setStatus?.(`importado: ${file.name}`);
        }
        fileInput.value = "";
        renderProjectList(listEl, mesaStore, loadProject);
      };
      reader.readAsText(file, "utf-8");
    });
  }

  // Initial render
  renderProjectList(listEl, mesaStore, loadProject);
}
