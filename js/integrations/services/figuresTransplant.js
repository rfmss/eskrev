function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const PERSONA_EQ = {
  conto: ["conto", "shortstory"],
  romance: ["romance", "novel"],
  roteiro: ["roteiro", "script"],
  ensaio: ["ensaio", "cronica", "artigo"],
  universitario: ["universitario", "academico", "abnt"],
  enem: ["enem", "redacao"],
  poesia: ["poesia", "poema"],
};

function canonicalPersona(token) {
  const t = normalize(token);
  if (!t) return "";
  for (const [key, aliases] of Object.entries(PERSONA_EQ)) {
    if (key === t) return key;
    if (aliases.some((a) => normalize(a) === t)) return key;
  }
  return t;
}

export function createFiguresTransplantPackage() {
  let cache = null;

  async function getData() {
    if (!cache) {
      const res = await fetch("src/assets/figures/figures_ptbr.json", { cache: "no-store" });
      if (!res.ok) throw new Error("figures_ptbr.json indisponível");
      cache = await res.json();
    }
    return cache;
  }

  return {
    async resolve(personaToken = "") {
      const data = await getData();
      const p = canonicalPersona(personaToken);
      const tabs = Array.isArray(data?.tabs) ? data.tabs : [];
      const selected = tabs.map((tab) => {
        const items = Array.isArray(tab.items) ? tab.items : [];
        const filtered = p
          ? items.filter((it) => {
            const personas = Array.isArray(it.personas) ? it.personas.map(normalize) : [];
            return !personas.length || personas.includes("all") || personas.includes(p);
          })
          : items;
        return { id: tab.id, label: tab.label, items: filtered };
      }).filter((tab) => tab.items.length);

      return {
        persona: p || "",
        tabs: selected,
      };
    },
  };
}
