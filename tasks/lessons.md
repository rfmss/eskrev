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
