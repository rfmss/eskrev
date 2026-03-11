# Lessons Learned — eskrev

## Template
### [DATA] Título do problema
- **Causa raiz:** ...
- **Solução:** ...
- **Prevenção:** ...

---

### [2026-03-11] Padrão de camadas do inspetor gramatical (grammarLint)

**Regra arquitetural:** Float e Slice são camadas distintas. Nunca duplicar conteúdo entre elas.

- **Float** (`rule.explanation`) → reconhecimento rápido. 1 frase explicando o erro + par errado→certo. O escritor está no meio de uma frase — não pode parar.
- **Slice** (`rule.detail`) → aprendizado completo. Inclui: *por que o erro acontece*, múltiplos exemplos em contextos diferentes, casos especiais/armadilhas, dica mnemônica.

**Implementação:** campo `detail` (string markdown) em cada regra de `grammarLint.js`. `openRuleSlice` usa `detail` quando disponível; cai em `explanation + pairs` como fallback. O floater nunca acessa `detail`.

**Referência:** "haviam muitas pessoas" foi o caso-modelo que definiu o padrão.

---

### [2026-03-11] Integração dos 6 agentes JSX ao grammarLint vanilla

**Contexto:** 6 agentes React (agente-ortografia, morfologia, sintaxe, semantica, pontuacao, crase) foram portados para `js/modules/grammarLint.js` em vanilla JS puro.

**Decisão arquitetural:** não bundlar React. As regras (arrays de objetos) portam diretamente. O engine já existia (TreeWalker + DOM marks via `.gram-mark`). Apenas as regras foram adicionadas.

**Novas categorias adicionadas:** morfologia, paronimia, pontuacao, crase, semantica — cada uma com cor distinta no CSS.

**Regras portadas:** ~50 novas (total ~85 ativas), cobrindo todos os 6 agentes.
- Morfologia: concordância de coletivos, grau redundante, gênero variável
- Sintaxe: regência de assistir/implicar/namorar/encontrar, colocação pronominal, dupla negação, correlações
- Semântica: paronímia (discriminar/descriminar, infligir/infringir, ratificar/retificar, iminente/eminente), pleonasmos novos, contradições semânticas
- Pontuação: vírgula após conectivos (No entanto, Portanto, Além disso, Ou seja, Por exemplo), vírgula proibida entre sujeito-verbo, reticências, dois-pontos indevido
- Crase: obrigatória (à medida que, à vontade, à noite, à base de, países femininos), proibida (antes de verbos, pronomes pessoais, após preposição)

**Scores dos agentes (limitação de regex):**
Agente 5 (Pontuação) tem teto ~40 — detecção de vírgula requer parse sintático real, não regex.
