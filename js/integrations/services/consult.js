import { vocab } from "../../data/vocab.js";
import {
  findTermInText,
  lookupPtDoubt,
  lookupPtRegencia,
  scanPtDoubts,
  scanPtRegencias,
} from "../../legacy/ptDictionaryAdapter.js";

function fold(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function createConsultPackage(_ctx, registry) {
  return {
    findInVocab(term) {
      const needle = fold(term).trim();
      if (!needle) return [];
      return Object.entries(vocab).filter(([k, v]) => fold(k).includes(needle) || fold(v).includes(needle));
    },

    findInText(term, text, limit = 6) {
      return findTermInText(term, text, limit);
    },

    async lookupDictionary(term) {
      if (!registry?.dictionary?.lookup) return { ok: false, reason: "disabled" };
      return registry.dictionary.lookup(term);
    },

    async lookupDoubt(term) {
      return lookupPtDoubt(term);
    },

    async lookupRegencia(term) {
      return lookupPtRegencia(term);
    },

    async scanDoubts(text) {
      return scanPtDoubts(text);
    },

    async scanRegencias(text) {
      return scanPtRegencias(text);
    },
  };
}
