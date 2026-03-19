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

---

### [2026-03-18] Decisão arquitetural — Progressive Enhancement para dispositivos modestos

**Intenção registrada:** o eskrev deve, quando chegar o momento, suportar dispositivos antigos (iPad 2ª geração, Android 2015–2017) sem degradar a interface — apenas o motor de análise se adapta ao tier do hardware.

**Motivação:** escritores de periferia, escolas públicas modestas, regiões com acesso restrito a hardware novo. Mesma dignidade de uso independentemente do dispositivo.

**Arquitetura de tiers (a implementar):**
- `high` — Workers completos, áudio, animações, debounce 300ms
- `mid` — Workers em fila (3 simultâneos), sem áudio, debounce 500ms
- `low` — análise síncrona na thread principal, debounce 800ms, animações desativadas

**Detecção por capacidade real** (nunca por User-Agent):
```javascript
function detectTier() {
  const cores = navigator.hardwareConcurrency || 1;
  const memory = navigator.deviceMemory || 0.5;
  const workers = typeof Worker !== "undefined";
  if (cores >= 4 && memory >= 2) return "high";
  if (cores >= 2 && workers)     return "mid";
  return "low";
}
```

**O que NÃO mudar:** interface visual, corpus, funcionalidades disponíveis, look and feel.

**Pré-condição para implementar:** manter o projeto em vanilla JS puro, sem bundler com tree-shaking agressivo, sem framework. A porta permanece aberta enquanto essa condição for mantida.

**Referência:** análise de compatibilidade realizada em 2026-03-18. iOS 9.3.6 (iPad 2) suporta Web Workers, IndexedDB, CSS Custom Properties e ES6 básico — o que exclui apenas `async/await`, `fetch` e ES Modules.

---

### [2026-03-19] Bug: listener Escape em overlay sem foco

**Causa raiz:** `ov.addEventListener("keydown", ...)` só dispara via bubbling — se o foco sair do overlay (clique fora do textarea, janela perder foco), Escape não fecha o coordenador. `div` sem `tabindex` não recebe keydown diretamente.

**Solução:** mover o listener para `document.addEventListener("keydown", ..., { capture: true, signal: _escAbort.signal })`. O `AbortController` é criado em `openCoordenador()` e abortado em `closeOverlay()` — limpeza automática sem acúmulo de listeners.

**Prevenção:** qualquer modal/overlay que precisa responder a Escape deve registrar no `document` com capture, não no próprio elemento. Usar sempre `AbortController` para garantir limpeza quando o overlay fecha.

---

### [2026-03-19] Playwright: is_visible() não detecta opacity:0

**Observação:** Playwright `is_visible()` retorna `True` mesmo com `opacity: 0`. Ele checa `display: none`, `visibility: hidden` ou bounding box zero — não `opacity`. Para testar overlays que fecham via CSS transition de opacity, usar `evaluate()` para checar a classe CSS (`classList.contains("is-open")`) ou o valor computado de opacity diretamente.
