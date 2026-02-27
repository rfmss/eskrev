import { createDictionaryPackage } from "./services/dictionary.js";
import { createConsultPackage } from "./services/consult.js";
import { createPersistencePackage } from "./services/persistence.js";
import { createModalTransplantPackage } from "./services/modalTransplant.js";
import { createPersonaTransplantPackage } from "./services/personaTransplant.js";
import { createFiguresTransplantPackage } from "./services/figuresTransplant.js";

export function createIntegrationRegistry(ctx) {
  const flags = {
    dictionary: true,
    consult: true,
    persistence: true,
    modalTransplant: true,
    personaTransplant: true,
    figuresTransplant: true,
  };

  const registry = {};
  if (flags.dictionary) registry.dictionary = createDictionaryPackage(ctx);
  if (flags.consult) registry.consult = createConsultPackage(ctx, registry);
  if (flags.persistence) registry.persistence = createPersistencePackage(ctx);
  if (flags.modalTransplant) registry.modalTransplant = createModalTransplantPackage(ctx);
  if (flags.personaTransplant) registry.personaTransplant = createPersonaTransplantPackage(ctx);
  if (flags.figuresTransplant) registry.figuresTransplant = createFiguresTransplantPackage(ctx);
  return registry;
}
