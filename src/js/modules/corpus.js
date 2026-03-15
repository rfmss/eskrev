/**
 * corpus.js — Facade unificada para o corpus linguístico do Eskrev
 *
 * Uso:
 *   import { corpus } from "./corpus.js";
 *   const data = await corpus.load("morphology", "classes");
 *   const results = await corpus.search("morphology", "prefixes", "anti");
 *
 * Todos os arquivos vivem em /src/assets/corpus/{area}/{topic}.json
 * O Service Worker já cacheia /src/assets/corpus/** — zero dependência de rede após cache.
 */

const BASE_PATH = "/src/assets/corpus";

class CorpusManager {
  constructor() {
    /** @type {Map<string, object>} chave = "area/topic", valor = parsed JSON */
    this._cache   = new Map();
    /** @type {Map<string, Promise<object>>} evita requisições duplicadas em voo */
    this._loading = new Map();
  }

  // ── Carregamento ─────────────────────────────────────────────────────────

  /**
   * Carrega um tópico. Retorna do cache se já carregado.
   * @param {string} area   ex: "morphology"
   * @param {string} topic  ex: "classes"
   * @returns {Promise<object>}
   */
  async load(area, topic) {
    const key = `${area}/${topic}`;
    if (this._cache.has(key))   return this._cache.get(key);
    if (this._loading.has(key)) return this._loading.get(key);

    const promise = fetch(`${BASE_PATH}/${area}/${topic}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`corpus: não encontrado — ${key} (${r.status})`);
        return r.json();
      })
      .then(data => {
        this._cache.set(key, data);
        this._loading.delete(key);
        return data;
      })
      .catch(err => {
        this._loading.delete(key);
        throw err;
      });

    this._loading.set(key, promise);
    return promise;
  }

  /**
   * Retorna do cache síncrono. Null se ainda não carregado.
   * @param {string} area
   * @param {string} topic
   * @returns {object|null}
   */
  get(area, topic) {
    return this._cache.get(`${area}/${topic}`) ?? null;
  }

  /**
   * Pré-carrega múltiplos tópicos em paralelo.
   * @param {Array<[string, string]>} pairs  ex: [["morphology","classes"], ["morphology","prefixes"]]
   * @returns {Promise<void>}
   */
  async preload(pairs) {
    await Promise.all(pairs.map(([a, t]) => this.load(a, t)));
  }

  /** Verifica se um tópico já está em cache */
  isLoaded(area, topic) {
    return this._cache.has(`${area}/${topic}`);
  }

  // ── Consulta ─────────────────────────────────────────────────────────────

  // ── Utilitário interno ────────────────────────────────────────────────────

  /** Normaliza string para comparação insensível a acento e maiúsculas */
  _norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Extrai todos os items de um tópico — suporta "entries" (array direto)
   * e "sections" (array de seções com entries/rules/items internos).
   * @param {object} data
   * @returns {object[]}
   */
  _flatten(data) {
    if (Array.isArray(data.entries)) return data.entries;
    if (Array.isArray(data.sections)) {
      return data.sections.flatMap(s =>
        [...(s.entries ?? []), ...(s.rules ?? []), ...(s.items ?? [])]
      );
    }
    return [];
  }

  // ── Consulta ─────────────────────────────────────────────────────────────

  /**
   * Busca livre: qualquer campo do item contém a query (case-insensitive, sem acento).
   * Funciona com estruturas "entries" e "sections".
   * @param {string} area
   * @param {string} topic
   * @param {string} query
   * @returns {Promise<object[]>}
   */
  async search(area, topic, query) {
    const data = await this.load(area, topic);
    const q = this._norm(query);
    return this._flatten(data).filter(e =>
      this._norm(JSON.stringify(e)).includes(q)
    );
  }

  /**
   * Busca em profundidade: percorre TODO o JSON recursivamente.
   * Útil para arquivos com estruturas aninhadas irregulares.
   * @param {string} area
   * @param {string} topic
   * @param {string} query
   * @returns {Promise<Array<{path:string, value:string}>>}
   */
  async deepSearch(area, topic, query) {
    const data = await this.load(area, topic);
    const q = this._norm(query);
    const hits = [];
    const walk = (node, path) => {
      if (typeof node === "string" && this._norm(node).includes(q)) {
        hits.push({ path, value: node });
      } else if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, `${path}[${i}]`));
      } else if (node && typeof node === "object") {
        Object.entries(node).forEach(([k, v]) => walk(v, `${path}.${k}`));
      }
    };
    walk(data, "root");
    return hits;
  }

  /**
   * Busca exata por campo específico.
   * @param {string} area
   * @param {string} topic
   * @param {string} field   campo do item, ex: "id", "form", "origin"
   * @param {string} value
   * @returns {Promise<object[]>}
   */
  async lookup(area, topic, field, value) {
    const data = await this.load(area, topic);
    const v = this._norm(value);
    return this._flatten(data).filter(e =>
      this._norm(e[field] ?? "") === v
    );
  }

  /**
   * Busca por id único — retorna um item ou null.
   * @param {string} area
   * @param {string} topic
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async getById(area, topic, id) {
    const results = await this.lookup(area, topic, "id", id);
    return results[0] ?? null;
  }

  /**
   * Retorna todos os items de um tópico (achatados de entries/sections).
   * @param {string} area
   * @param {string} topic
   * @returns {Promise<object[]>}
   */
  async all(area, topic) {
    const data = await this.load(area, topic);
    return this._flatten(data);
  }

  /**
   * Retorna metadados do tópico (version, sources, description) sem conteúdo.
   * @param {string} area
   * @param {string} topic
   * @returns {Promise<object>}
   */
  async meta(area, topic) {
    const data = await this.load(area, topic);
    const { entries: _e, sections: _s, ...rest } = data;
    return rest;
  }

  // ── Sintaxe: helpers especializados ─────────────────────────────────────

  /**
   * Busca regência verbal de um verbo específico.
   * @param {string} verb   infinitivo, ex: "assistir", "preferir"
   * @returns {Promise<object|null>}
   */
  async verbRegency(verb) {
    const data = await this.load("syntax", "regencia");
    const v = this._norm(verb);
    const entries = (data.sections ?? []).flatMap(s => s.entries ?? []);
    return entries.find(e => this._norm(e.verb ?? "").split("/").some(p => p.trim() === v)) ?? null;
  }

  /**
   * Busca regência nominal de um nome/adjetivo.
   * @param {string} name
   * @returns {Promise<object|null>}
   */
  async nominalRegency(name) {
    const data = await this.load("syntax", "regencia");
    const n = this._norm(name);
    const section = (data.sections ?? []).find(s => s.id === "regencia_nominal");
    return (section?.entries ?? []).find(e => this._norm(e.name ?? "").split("/").some(p => p.trim() === n)) ?? null;
  }

  /**
   * Busca regra de concordância por id.
   * @param {string} ruleId  ex: "cv_haver_existencial", "cn_meio"
   * @returns {Promise<object|null>}
   */
  async concordanciaRule(ruleId) {
    const data = await this.load("syntax", "concordancia");
    const all = (data.sections ?? []).flatMap(s => s.rules ?? []);
    return all.find(r => r.id === ruleId) ?? null;
  }

  // ── Semântica: helpers especializados ────────────────────────────────────

  /**
   * Busca parônimos de uma palavra.
   * @param {string} word
   * @returns {Promise<object[]>}  pares onde a palavra aparece
   */
  async findParonyms(word) {
    const data = await this.load("semantics", "semantics");
    const w = this._norm(word);
    const entry = (data.entries ?? []).find(e => e.id === "paronimia");
    return (entry?.entries ?? []).filter(e =>
      (e.pair ?? []).some(p => this._norm(p).includes(w))
    );
  }

  /**
   * Busca figura de linguagem (semântica ou de construção) por nome.
   * @param {string} name  ex: "metáfora", "elipse", "anáfora"
   * @returns {Promise<object|null>}
   */
  async figure(name) {
    const data = await this.load("stylistics", "figures");
    const n = this._norm(name);
    const all = (data.sections ?? []).flatMap(s => s.entries ?? []);
    return all.find(e => this._norm(e.label ?? "").includes(n) || this._norm(e.id ?? "") === n) ?? null;
  }

  // ── Morfologia: helpers especializados ──────────────────────────────────

  /**
   * Retorna a classe gramatical pelo id POS (ex: "VERB", "SUBST").
   * @param {string} posId
   * @returns {Promise<object|null>}
   */
  async wordClass(posId) {
    return this.getById("morphology", "classes", posId.toUpperCase());
  }

  /**
   * Busca prefixos que começam com a string dada.
   * @param {string} prefix
   * @returns {Promise<object[]>}
   */
  async findPrefix(prefix) {
    const data = await this.load("morphology", "prefixes");
    const p = String(prefix).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (data.entries ?? []).filter(e => {
      const form = String(e.form ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return form.startsWith(p) || form.replace(/-/g, "").startsWith(p);
    });
  }

  /**
   * Busca sufixos que terminam com a string dada.
   * @param {string} suffix
   * @returns {Promise<object[]>}
   */
  async findSuffix(suffix) {
    const data = await this.load("morphology", "suffixes");
    const s = String(suffix).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (data.entries ?? []).filter(e => {
      const form = String(e.form ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "");
      return form === s || form.endsWith(s);
    });
  }

  /**
   * Busca radicais pelo valor semântico ou forma.
   * @param {string} query
   * @returns {Promise<object[]>}
   */
  async findRoot(query) {
    return this.search("morphology", "roots", query);
  }

  /**
   * Retorna as regras de conjugação de uma classe verbal (-ar, -er, -ir).
   * @param {string} classId  "ar" | "er" | "ir"
   * @returns {Promise<object|null>}
   */
  async verbClass(classId) {
    return this.getById("morphology", "flexion_verbal", classId.toLowerCase());
  }

  /**
   * Retorna conjugação de um verbo irregular pelo infinitivo.
   * @param {string} infinitive
   * @returns {Promise<object|null>}
   */
  async irregularVerb(infinitive) {
    const data = await this.load("morphology", "flexion_verbal");
    const inf = infinitive.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (data.irregulars ?? []).find(v => {
      const id = String(v.id ?? v.infinitive ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return id === inf;
    }) ?? null;
  }
}

export const corpus = new CorpusManager();
