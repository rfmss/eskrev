const MODAL_SPECS = [
  { id: "gatekeeper", badge: "20", title: "LOCK", aliases: ["lock", "gate", "senha"] },
  { id: "dedicationModal", badge: "21", title: "DEDICATION", aliases: ["dedication", "dedic"] },
  { id: "mobileGateModal", badge: "22", title: "MOBILE GATE", aliases: ["mobilegate", "mgate"] },
  { id: "mobileImportTargetModal", badge: "23", title: "MOBILE IMPORT", aliases: ["mobileimport", "mimport"] },
  { id: "onboardingModal", badge: "24", title: "ONBOARDING", aliases: ["onboarding", "onboard"] },
  { id: "termsModal", badge: "25", title: "TERMS", aliases: ["terms"] },
  { id: "privacyModal", badge: "26", title: "PRIVACY", aliases: ["privacy"] },
  { id: "manifestoModal", badge: "27", title: "MANIFESTO", aliases: ["manifesto"] },
  { id: "notesModal", badge: "28", title: "NOTES", aliases: ["notes", "memo"] },
  { id: "newTextModal", badge: "29", title: "NEW TEXT", aliases: ["newtext", "new"] },
  { id: "exportModal", badge: "30", title: "EXPORT", aliases: ["export", "save"] },
  { id: "fediverseModal", badge: "31", title: "FEDIVERSE", aliases: ["fediverse", "fedi", "social"] },
  { id: "socialShareModal", badge: "32", title: "SHARE", aliases: ["share"] },
  { id: "readerModal", badge: "33", title: "READER", aliases: ["reader", "overview", "thumbs"] },
  { id: "qrStreamModal", badge: "34", title: "QR STREAM", aliases: ["qrstream", "qrs", "qr"] },
  { id: "qrScanModal", badge: "35", title: "QR SCAN", aliases: ["qrscan"] },
  { id: "mobileIntroModal", badge: "36", title: "MOBILE INTRO", aliases: ["mobileintro"] },
  { id: "resetModal", badge: "37", title: "RESET", aliases: ["reset"] },
  { id: "importSessionModal", badge: "38", title: "IMPORT SESSION", aliases: ["importsession", "import", "open"] },
  { id: "pomodoroModal", badge: "39", title: "POMODORO", aliases: ["pomodoro", "pomo"] },
  { id: "goalModal", badge: "40", title: "GOAL", aliases: ["goal"] },
  { id: "helpModal", badge: "41", title: "HELP", aliases: ["helpmodal"] },
  { id: "systemModal", badge: "42", title: "SYSTEM", aliases: ["system", "theme", "music", "zen", "mini", "mode"] },
  { id: "pasteChoiceModal", badge: "43", title: "PASTE CHOICE", aliases: ["pastechoice", "paste"] },
  { id: "commandPaletteModal", badge: "44", title: "COMMAND PALETTE", aliases: ["commandpalette", "palette"] },
  { id: "consultModal", badge: "45", title: "CONSULT LEGACY", aliases: ["consultlegacy"] },
  { id: "figuresModal", badge: "46", title: "FIGURES", aliases: ["figures"] },
];

const BUILTINS = new Set([
  "modal", "modals", "h", "help", "d", "define", "v", "vocab", "c", "consult",
  "persona", "figures", "templates", "template", "guide",
]);

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadOldDocument() {
  const res = await fetch("index_old.html", { cache: "no-store" });
  if (!res.ok) throw new Error("index_old.html indisponível");
  const html = await res.text();
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

function extractModalBody(doc, modalId) {
  const modal = doc.getElementById(modalId);
  if (!modal) return "";
  const node = modal.querySelector(".modal-body") || modal.querySelector(".modal-box") || modal;
  const clone = node.cloneNode(true);
  clone.querySelectorAll("button, input, textarea, select, svg, img, video, audio, iframe, canvas").forEach((el) => el.remove());
  return normalizeText(clone.textContent || "");
}

function buildIndex() {
  const byAlias = new Map();
  for (const spec of MODAL_SPECS) {
    byAlias.set(normalize(spec.id), spec);
    for (const alias of spec.aliases || []) byAlias.set(normalize(alias), spec);
  }
  return byAlias;
}

export function createModalTransplantPackage(_ctx) {
  let cacheDoc = null;
  const aliasIndex = buildIndex();

  async function getDoc() {
    if (!cacheDoc) cacheDoc = await loadOldDocument();
    return cacheDoc;
  }

  function getByToken(token) {
    return aliasIndex.get(normalize(token)) || null;
  }

  return {
    list() {
      return MODAL_SPECS.map((meta) => ({
        cmd: `--${(meta.aliases && meta.aliases[0]) || meta.id}`,
        id: meta.id,
        title: meta.title,
        aliases: meta.aliases || [],
      }));
    },

    isLegacyCommand(token) {
      const t = normalize(token);
      if (!t || BUILTINS.has(t)) return false;
      return Boolean(getByToken(t));
    },

    async resolveCommand(token, fallbackToken = "") {
      const info = getByToken(token) || getByToken(fallbackToken);
      if (!info) return null;
      try {
        const doc = await getDoc();
        const body = extractModalBody(doc, info.id);
        return {
          ok: true,
          badge: info.badge,
          title: info.title,
          kindKey: "legacy-modal",
          meta: `transplante de ${info.id}`,
          body: body || "(sem conteúdo textual no modal legado)",
        };
      } catch (error) {
        return {
          ok: false,
          badge: info.badge,
          title: info.title,
          kindKey: "legacy-modal",
          meta: `falha em ${info.id}`,
          body: `Não foi possível carregar o modal legado.\n\n${error?.message || String(error)}`,
        };
      }
    },
  };
}
