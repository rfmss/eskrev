const PERSONA_ALIASES = {
  conto: ["conto", "shortstory"],
  romance: ["romance", "novel"],
  roteiro: ["roteiro", "script"],
  ensaio: ["ensaio", "cronica", "artigo"],
  universitario: ["universitario", "academico", "abnt"],
  enem: ["enem", "redacao"],
  poesia: ["poesia", "poema"],
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function createPersonaTransplantPackage() {
  let registryCache = null;
  let templateTextCache = new Map();

  async function getRegistry() {
    if (!registryCache) {
      const res = await fetch("config/persona-templates.json", { cache: "no-store" });
      if (!res.ok) throw new Error("config/persona-templates.json indisponível");
      registryCache = await res.json();
    }
    return registryCache;
  }

  async function getTemplateText(file) {
    if (templateTextCache.has(file)) return templateTextCache.get(file);
    const res = await fetch(file, { cache: "no-store" });
    if (!res.ok) throw new Error(`Template indisponível: ${file}`);
    const text = await res.text();
    templateTextCache.set(file, text);
    return text;
  }

  function findPersona(registry, token) {
    const t = normalize(token);
    if (!t) return null;
    const personas = Array.isArray(registry?.personas) ? registry.personas : [];
    return personas.find((p) => {
      const pid = normalize(p.id);
      if (pid === t) return true;
      const aliases = PERSONA_ALIASES[pid] || [];
      return aliases.some((a) => normalize(a) === t);
    }) || null;
  }

  async function allTemplates(registry) {
    const personas = Array.isArray(registry?.personas) ? registry.personas : [];
    const out = [];
    personas.forEach((p) => {
      (Array.isArray(p.templates) ? p.templates : []).forEach((t) => {
        out.push({
          persona: p.id,
          id: t.id,
          label: t.label,
          file: t.file,
        });
      });
    });
    return out;
  }

  return {
    async list() {
      const registry = await getRegistry();
      const personas = Array.isArray(registry?.personas) ? registry.personas : [];
      return personas.map((p) => ({
        id: p.id,
        aliases: PERSONA_ALIASES[normalize(p.id)] || [p.id],
        templates: Array.isArray(p.templates) ? p.templates.map((t) => ({ id: t.id, file: t.file })) : [],
      }));
    },

    async resolve(token) {
      const registry = await getRegistry();
      const persona = findPersona(registry, token);
      if (!persona) return null;

      const templates = Array.isArray(persona.templates) ? persona.templates : [];
      const rendered = [];
      for (const tpl of templates) {
        if (!tpl?.file) continue;
        const text = await getTemplateText(tpl.file);
        rendered.push({
          id: tpl.id,
          file: tpl.file,
          text: String(text || "").trim(),
        });
      }

      return {
        id: persona.id,
        templates: rendered,
      };
    },

    async listTemplates() {
      const registry = await getRegistry();
      return allTemplates(registry);
    },

    async resolveTemplate(token) {
      const t = normalize(token);
      if (!t) return null;
      const registry = await getRegistry();
      const templates = await allTemplates(registry);
      const hit = templates.find((x) => normalize(x.id) === t || normalize(x.file) === t || normalize(x.persona) === t);
      if (!hit) return null;
      const text = await getTemplateText(hit.file);
      return {
        persona: hit.persona,
        id: hit.id,
        file: hit.file,
        text: String(text || "").trim(),
      };
    },
  };
}
