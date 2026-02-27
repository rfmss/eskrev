import { lookupPtDetailed } from "../../legacy/ptDictionaryAdapter.js";

export function createDictionaryPackage() {
  return {
    async lookup(term) {
      return lookupPtDetailed(term);
    },
  };
}
