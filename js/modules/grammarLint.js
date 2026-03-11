/**
 * grammarLint.js — Verificador de desvios da norma padrão escrita
 *
 * Cada regra tem dois níveis de conteúdo:
 *   explanation → floater (reconhecimento rápido, 1 frase)
 *   detail      → slice   (aprendizado completo: por quê, exemplos, casos especiais, dica)
 *
 * O floater nunca acessa detail. O slice nunca usa só explanation.
 */

import { corpus } from "../../src/js/modules/corpus.js";
import { makeSlice } from "./slices.js";
import { insertNodeAtCaret } from "./dom.js";

// ── Mapa de acentuação: carregado uma vez, lazily ──────────────────────────
let _accentMap    = null;
let _accentLoading = false;

async function loadAccentMap() {
  if (_accentMap || _accentLoading) return;
  _accentLoading = true;
  try {
    const res = await fetch("src/assets/lingua/pt_accent_map.json");
    if (res.ok) _accentMap = await res.json();
  } catch (_) {}
}

function normNoAccent(w) {
  try { return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  catch (_) { return w.toLowerCase(); }
}

// ── Categorias e paleta ───────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  concordancia: { cor: "#5c6bc0", label: "Concordância" },
  regencia:     { cor: "#00838f", label: "Regência" },
  pleonasmo:    { cor: "#558b2f", label: "Pleonasmo" },
  norma:        { cor: "#e65100", label: "Norma culta" },
  grafia:       { cor: "#ef5350", label: "Grafia" },
  acento:       { cor: "#7c4dff", label: "Acentuação" },
  hifen:        { cor: "#1565c0", label: "Hífen" },
  tipografia:   { cor: "#78909c", label: "Tipografia" },
};

// ── Regras ────────────────────────────────────────────────────────────────
const RULES = [

  // ── CONCORDÂNCIA ─────────────────────────────────────────────────────────
  {
    id: "haver_existencial",
    category: "concordancia",
    pattern: /\bhaviam\b|\bhouveram\b(?=\s+\w)/gi,
    label: "Atenção ao verbo haver (concordância verbal)",
    explanation: "Quando 'haver' significa 'existir', é impessoal — sem sujeito, sem concordância, sempre no singular.",
    wrong: "Haviam muitas pessoas na fila.",
    right: "Havia muitas pessoas na fila.",
    area: "syntax", topic: "concordancia",
    detail: `## Por que "haviam" está errado aqui?

"Haver" no sentido de *existir* ou *ocorrer* é um verbo **impessoal**: não tem sujeito gramatical. Sem sujeito, não há concordância — o verbo fica fixo no singular.

O erro acontece porque confundimos com "ter", que concorda normalmente:

✗  Haviam muitas pessoas na fila.
✓  Havia muitas pessoas na fila.
✓  Tinha muitas pessoas na fila. (informal, mas "ter" concorda)

**Todos os tempos verbais — sempre no singular:**

✗  Haverão problemas sérios.      ✓  Haverá problemas sérios.
✗  Houveram muitos acidentes.     ✓  Houve muitos acidentes.
✗  Hão muitas dúvidas.            ✓  Há muitas dúvidas.

⚠  Atenção: "haver de" (= dever, ter obrigação) **tem sujeito** — aí concorda:
✓  Eles hão de chegar.
✓  Ela há de vencer.

**Dica rápida:** substitua "haver" por "existir". Se "existe muita gente" fizer sentido, use "havia" — singular. Funciona em qualquer tempo verbal.`,
  },
  {
    id: "fazer_temporal",
    category: "concordancia",
    pattern: /\bfaziam\b(?=\s+\d|\s+anos|\s+meses|\s+dias|\s+horas)/gi,
    label: "Atenção ao verbo fazer (concordância verbal)",
    explanation: "Para indicar tempo decorrido, 'fazer' é impessoal — sempre no singular.",
    wrong: "Faziam dois anos que partiu.",
    right: "Fazia dois anos que partiu.",
    area: "syntax", topic: "concordancia",
    detail: `## Por que "faziam" está errado aqui?

Assim como "haver", o verbo **fazer** indica tempo decorrido de forma **impessoal** — sem sujeito. Fica sempre no singular, independentemente do número que vem depois.

✗  Faziam dois anos que partiu.
✓  Fazia dois anos que partiu.

✗  Fazem três meses que não nos falamos.  (errado — "fazem" concorda indevidamente)
✓  Faz três meses que não nos falamos.

**Todos os tempos:**
✗  Farão dez anos amanhã.       ✓  Fará dez anos amanhã.
✗  Fizeram muitos anos.         ✓  Fez muitos anos.

**Dica:** se você pode substituir por "decorreu" no singular ("decorreu um ano"), use "faz/fazia" no singular.`,
  },

  // ── PLEONASMO ────────────────────────────────────────────────────────────
  {
    id: "subir_cima",
    category: "pleonasmo",
    pattern: /\bsubir\s+pra\s+cima\b|\bsubiu\s+pra\s+cima\b|\bsubindo\s+para\s+cima\b/gi,
    label: "Palavra sobrando (pleonasmo vicioso)",
    explanation: "'Subir' já contém a direção ascendente — 'pra cima' é redundante.",
    wrong: "Subiu pra cima do morro.",
    right: "Subiu o morro.",
    area: "stylistics", topic: "figures",
    detail: `## O que é pleonasmo vicioso?

Pleonasmo vicioso é quando uma palavra repete o sentido de outra sem acrescentar nada — ao contrário do pleonasmo literário, que existe para ênfase expressiva.

"Subir" já contém a ideia de *movimento para cima*. Adicionar "pra cima" é escrever o mesmo duas vezes.

✗  Subiu pra cima do morro.
✓  Subiu o morro. / Subiu ao morro.

**Família do mesmo erro:**
✗  Desceu pra baixo   →  ✓  Desceu
✗  Entrou dentro      →  ✓  Entrou em
✗  Saiu fora          →  ✓  Saiu de
✗  Chorou lágrimas    →  ✓  Chorou (pleonasmo literário, aceitável em poesia)

**Atenção:** pleonasmo *literário* é diferente. "Sorriso na boca", "ouvir com os ouvidos" podem ser recursos expressivos — o problema é quando o pleonasmo enfraquece em vez de reforçar.`,
  },
  {
    id: "descer_baixo",
    category: "pleonasmo",
    pattern: /\bdescer\s+pra\s+baixo\b|\bdesceu\s+pra\s+baixo\b|\bdescendo\s+para\s+baixo\b/gi,
    label: "Palavra sobrando (pleonasmo vicioso)",
    explanation: "'Descer' já implica movimento para baixo — 'pra baixo' é redundante.",
    wrong: "Desceu pra baixo da ladeira.",
    right: "Desceu a ladeira.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo vicioso: descer + pra baixo

"Descer" já contém a direção descendente. "Pra baixo" não acrescenta nenhuma informação nova.

✗  Desceu pra baixo da ladeira.
✓  Desceu a ladeira.

**Erros da mesma família:**
✗  Subiu pra cima     →  ✓  Subiu
✗  Entrou dentro      →  ✓  Entrou em
✗  Saiu fora          →  ✓  Saiu de
✗  Voltou para trás   →  ✓  Voltou`,
  },
  {
    id: "entrar_dentro",
    category: "pleonasmo",
    pattern: /\bentrar\s+dentro\b|\bentrou\s+dentro\b|\bentrando\s+dentro\b/gi,
    label: "Palavra sobrando (pleonasmo vicioso)",
    explanation: "'Entrar' já significa ir para dentro — 'dentro' é redundante.",
    wrong: "Entrou dentro da casa.",
    right: "Entrou na casa.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo vicioso: entrar + dentro

"Entrar" já carrega a ideia de *ir para o interior de algo*. "Dentro" repete exatamente isso.

✗  Entrou dentro da casa.
✓  Entrou na casa.

✗  Entrando dentro do carro.
✓  Entrando no carro.

**Exceção aparente:** "entrar para dentro" pode aparecer em construções enfáticas coloquiais ("Vai entrar para dentro!"), mas é marcadamente oral. Na escrita, corte.

**Família do erro:**
✗  Saiu fora        →  ✓  Saiu de
✗  Subiu pra cima   →  ✓  Subiu`,
  },
  {
    id: "sair_fora",
    category: "pleonasmo",
    pattern: /\bsair\s+fora\b|\bsaiu\s+fora\b|\bsaindo\s+fora\b/gi,
    label: "Palavra sobrando (pleonasmo vicioso)",
    explanation: "'Sair' já é movimento para fora — 'fora' é redundante.",
    wrong: "Saiu fora do escritório.",
    right: "Saiu do escritório.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo vicioso: sair + fora

"Sair" já implica movimento para o exterior. "Fora" não acrescenta informação — apenas repete.

✗  Saiu fora do escritório.
✓  Saiu do escritório.

✗  Saindo fora da curva.  (metáfora, mas redundante)
✓  Saindo da curva.

**Atenção à metáfora:** "sair fora da curva" é coloquial e bastante comum. Em texto informal pode passar. Em texto formal, corte.`,
  },
  {
    id: "ha_anos_atras",
    category: "pleonasmo",
    pattern: /\bhá\s+\d+\s+anos?\s+atrás\b|\bhá\s+\d+\s+meses?\s+atrás\b|\bhá\s+\d+\s+dias?\s+atrás\b/gi,
    label: "Palavra sobrando (pleonasmo vicioso)",
    explanation: "'Há' já situa no passado — 'atrás' repete a mesma ideia.",
    wrong: "Conheci-a há 3 anos atrás.",
    right: "Conheci-a há 3 anos.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo vicioso: há + atrás

"Há" (do verbo haver) já indica que o evento ocorreu no passado. "Atrás" repete exatamente isso — os dois marcam passado ao mesmo tempo.

✗  Conheci-a há 3 anos atrás.
✓  Conheci-a há 3 anos.
✓  Conheci-a 3 anos atrás.   (sem "há", aí funciona)

**Regra:** use um ou outro, nunca os dois.

"Há 3 anos" = o verbo situa no passado.
"3 anos atrás" = o advérbio situa no passado.
"Há 3 anos atrás" = dupla marcação = redundância.`,
  },
  {
    id: "prefiro_mais_que",
    category: "pleonasmo",
    pattern: /\bprefiro\s+\w+\s+mais\s+(do\s+que|que)\b/gi,
    label: "Preferir já é comparativo (redundância)",
    explanation: "'Preferir' já carrega comparação — 'mais' é redundante, e a regência pede 'a', não 'do que'.",
    wrong: "Prefiro chá mais do que café.",
    right: "Prefiro chá a café.",
    area: "stylistics", topic: "figures",
    detail: `## Por que "prefiro mais do que" está errado?

Dois problemas ao mesmo tempo:

**1. Redundância:** "preferir" já contém a ideia de comparação ("considero melhor que"). Adicionar "mais" é repetir o grau comparativo.

**2. Regência errada:** o verbo "preferir" exige a preposição "a", não "do que".

✗  Prefiro café mais do que chá.
✓  Prefiro café a chá.

✗  Preferia silêncio mais que barulho.
✓  Preferia silêncio a barulho.

**Atenção:** na fala coloquial, "prefiro X do que Y" é amplamente aceito. Na escrita padrão, a norma é "prefiro X a Y".`,
  },
  {
    id: "mas_porem",
    category: "pleonasmo",
    pattern: /\bmas\s+porém\b|\bporém\s+mas\b/gi,
    label: "Dois conectivos, mesmo sentido (redundância)",
    explanation: "'Mas' e 'porém' são sinônimos adversativos — use só um.",
    wrong: "Tentei, mas porém não consegui.",
    right: "Tentei, mas não consegui.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Por que "mas porém" está errado?

"Mas" e "porém" são conjunções adversativas sinônimas: as duas expressam oposição ou ressalva. Usar as duas seguidas é redundância pura — como dizer "porém mas" ou "no entanto contudo".

✗  Tentei, mas porém não consegui.
✓  Tentei, mas não consegui.
✓  Tentei; porém não consegui.

**Conectivos adversativos que se equivalem:**
mas / porém / contudo / todavia / entretanto / no entanto

Todos têm o mesmo valor lógico. Escolha um para cada lugar.

**Dica de estilo:** "mas" é mais ágil e direto. "Porém", "contudo", "todavia" são mais formais e ficam bem no início de frase ou em texto dissertativo.`,
  },

  // ── NORMA CULTA ───────────────────────────────────────────────────────────
  {
    id: "gerundismo_vou_estar",
    category: "norma",
    pattern: /\bvou\s+estar\s+\w+ndo\b/gi,
    label: "Jeito de call center (gerundismo)",
    explanation: "'Vou estar + gerúndio' é gerundismo corporativo — use o futuro sintético.",
    wrong: "Vou estar enviando o arquivo.",
    right: "Enviarei o arquivo.",
    area: "variation", topic: "linguistic_variation",
    detail: `## O que é gerundismo e por que evitar?

Gerundismo é o uso de "estar + gerúndio" no lugar do futuro sintético. Ficou famoso nos scripts de call center dos anos 2000 e virou marca de linguagem corporativa artificial.

O problema não é gramatical — é de estilo. A construção existe na língua, mas soa mecânica e evasiva na escrita.

✗  Vou estar enviando o arquivo.
✓  Enviarei o arquivo.
✓  Vou enviar o arquivo.  (futuro perifrástico, mais natural)

✗  Estarei aguardando seu retorno.
✓  Aguardarei seu retorno.
✓  Fico no aguardo.

**Contextos em que o gerúndio é correto:**
✓  Estou enviando agora.   (ação em curso no presente — correto)
✓  Estava dormindo quando chegou.  (ação em curso no passado — correto)

O erro é usar a estrutura para expressar *futuro*, quando o português tem formas próprias para isso.`,
  },
  {
    id: "gerundismo_estarei",
    category: "norma",
    pattern: /\bestarei\s+\w+ndo\b/gi,
    label: "Jeito de call center (gerundismo)",
    explanation: "'Estarei + gerúndio' é gerundismo — use o futuro sintético do verbo principal.",
    wrong: "Estarei aguardando seu retorno.",
    right: "Aguardarei seu retorno.",
    area: "variation", topic: "linguistic_variation",
    detail: `## Gerundismo com "estarei"

Mesma lógica do "vou estar + gerúndio": a estrutura "estarei + gerúndio" usa um verbo auxiliar desnecessário quando o futuro sintético basta.

✗  Estarei aguardando seu retorno.
✓  Aguardarei seu retorno.

✗  Estarei verificando assim que possível.
✓  Verificarei assim que possível.

**Futuro sintético dos verbos mais usados:**
enviar → enviarei / aguardar → aguardarei / verificar → verificarei
analisar → analisarei / retornar → retornarei / confirmar → confirmarei

**Dica de estilo:** o futuro sintético é mais preciso, mais compacto e soa mais confiante. Gerundismo muitas vezes passa uma impressão de indecisão ou de falar para não dizer nada.`,
  },
  {
    id: "nivel_de",
    category: "norma",
    pattern: /\bà\s+nível\s+de\b|\bao\s+nível\s+de\b/gi,
    label: "Crase que não existe aqui (norma culta)",
    explanation: "'Nível' pede a preposição 'em', não 'a' — sem 'a', sem crase.",
    wrong: "À nível de Brasil.",
    right: "Em nível nacional.",
    area: "syntax", topic: "regencia",
    detail: `## Por que "à nível de" está errado?

Dois problemas combinados:

**1. Galicismo:** a expressão "à niveau de" vem do francês e foi incorporada ao português de forma errada. A preposição que "nível" pede em português é "em", não "a".

**2. Crase indevida:** crase = "a" (preposição) + "a" (artigo). Se a preposição é "em", não há "a" — portanto não há crase.

✗  À nível de Brasil.
✗  Ao nível de Brasil.
✓  Em nível nacional.
✓  No âmbito nacional.
✓  No plano nacional.

**Exceção real:** "ao nível do mar" — aqui sim está correto. "Nível do mar" é uma expressão de medida física, e "ao" funciona como "na altura de". Mas isso é diferente de "à nível de" como expressão vaga de escopo.`,
  },

  // ── REGÊNCIA ──────────────────────────────────────────────────────────────
  {
    id: "chegou_em",
    category: "regencia",
    pattern: /\bchegou\s+em\b/gi,
    label: "Regência do verbo chegar",
    explanation: "'Chegar' exige a preposição 'a' na escrita padrão — não 'em'.",
    wrong: "O ônibus chegou em São Paulo.",
    right: "O ônibus chegou a São Paulo.",
    area: "syntax", topic: "regencia",
    detail: `## Chegar a ou chegar em?

Na norma padrão escrita, "chegar" exige a preposição **"a"**. O uso de "em" é coloquial e oral — muito comum na fala, mas marcado negativamente na escrita formal.

✗  O ônibus chegou em São Paulo.
✓  O ônibus chegou a São Paulo.

✗  Ela chegou em casa tarde.
✓  Ela chegou em casa tarde.  ← exceção: "chegar em casa" é consagrado pelo uso

**A exceção de "casa":** "chegar em casa" (sem artigo) é aceito inclusive por gramáticos, pois "casa" aqui funciona como advérbio de lugar, não como substantivo. Já "chegar na casa" (com artigo) pede "a": "chegar à casa".

**Com artigo feminino:**
✓  Chegou à cidade.  (a + a = à)
✓  Chegou ao aeroporto.  (a + o = ao)

**Dica:** se depois vem artigo feminino, vai aparecer "à". Se parece estranho, considere reescrever: "aterrissar em", "desembarcar em" — verbos que aceitam "em" sem marcação.`,
  },
  {
    id: "razao_porque",
    category: "regencia",
    pattern: /\bpelo\s+motivo\s+(?:de\s+)?porque\b/gi,
    label: "Por que ou porque? (regência nominal)",
    explanation: "Depois de 'motivo' ou 'razão', use 'por que' separado — ele retoma o substantivo.",
    wrong: "O motivo porque partiu foi a saudade.",
    right: "O motivo por que partiu foi a saudade.",
    area: "syntax", topic: "regencia",
    detail: `## Os quatro "porquês" — guia definitivo

**1. Por que** (separado, sem acento) → pergunta / pronome relativo
✓  Por que você foi embora?  (pergunta)
✓  O motivo por que partiu foi a saudade.  (= pelo qual)

**2. Porque** (junto, sem acento) → conjunção causal/explicativa
✓  Fui embora porque estava cansada.  (explicação, resposta)
✓  Chore, porque a situação é grave.  (explicação)

**3. Por quê** (separado, com acento) → no final de frase ou antes de pausa
✓  Você foi embora, mas não disse por quê.
✓  Fui. Por quê? Não sei.

**4. Porquê** (junto, com acento) → substantivo (= o motivo, a razão)
✓  Não entendo o porquê dessa decisão.
✓  Explique-me o porquê.

**Dica rápida:** se dá para substituir por "pelo qual" ou "pela qual", é "por que" separado.`,
  },

  // ── GRAFIA ────────────────────────────────────────────────────────────────
  {
    id: "cesso_acesso",
    category: "grafia",
    pattern: /\bcesso\b/gi,
    label: "Grafia incorreta: 'cesso'",
    explanation: "'Cesso' não existe — a palavra é 'acesso', sempre com 'ac' inicial.",
    wrong: "Não tenho cesso ao sistema.",
    right: "Não tenho acesso ao sistema.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Por que "cesso" está errado?

"Cesso" não é uma palavra do português. O que existe é "acesso" — substantivo derivado do latim *accessus* (aproximação, entrada). O "ac" inicial é parte da palavra, não um prefixo separável.

✗  Não tenho cesso ao sistema.
✓  Não tenho acesso ao sistema.

✗  Cesso restrito.
✓  Acesso restrito.

**Família da palavra:**
acessar / acessível / inacessível / acesso / acessório

Todas começam com "ac". Se a dúvida surgir, pense na família: "acessar" ajuda a lembrar "acesso".`,
  },
  {
    id: "excessao_errada",
    category: "grafia",
    pattern: /\bexcessão\b/gi,
    label: "Grafia incorreta: 'excessão'",
    explanation: "'Exceção' tem um só 'c' — não confunda com 'excesso', que tem 'ss'.",
    wrong: "Abri uma excessão para ele.",
    right: "Abri uma exceção para ele.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Exceção ou excessão?

A confusão vem de "excesso" (com 'ss'), que fica gravado na memória e contamina "exceção".

✗  Excessão
✓  Exceção  (um só 'c', sem 's' dobrado)

**A diferença:**
- **Excesso** = quantidade além do limite. "Excesso de velocidade." (com ss)
- **Exceção** = o que foge à regra. "Toda regra tem exceção." (com ç, sem ss)

**Família de "exceção":**
exceção / excepcional / excecionar (conjugação rara)

**Família de "excesso":**
excesso / excessivo / excessivamente

São palavras diferentes, com grafias diferentes. Memorize o par: *exCESSo* (ss) vs *exCEção* (ç).`,
  },
  {
    id: "beneficiente_errado",
    category: "grafia",
    pattern: /\bbeneficiente\b/gi,
    label: "Grafia incorreta: 'beneficiente'",
    explanation: "'Beneficente' não tem 'i' antes de '-ente' — não confunda com 'eficiente'.",
    wrong: "Uma entidade beneficiente.",
    right: "Uma entidade beneficente.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Beneficente ou beneficiente?

O erro vem da interferência de "eficiente" e "suficiente" — palavras que terminam em "-iente". Mas "beneficente" vem do latim *beneficens* e não passa por esse padrão.

✗  Beneficiente / beneficiência
✓  Beneficente / beneficência

**Como lembrar:** pense em "benef-ic-ente" = que faz (faz = facere em latim, raiz "-fic-"). O sufixo é "-ente", sem o "i" a mais.

**Família da palavra:**
beneficente / beneficência / beneficiar / benefício / benfeitor

Todas giram em torno de "bene-" (bem) + "fac/fic" (fazer). Nenhuma tem "-iente".`,
  },
  {
    id: "impecilho_errado",
    category: "grafia",
    pattern: /\bimpecilho\b/gi,
    label: "Grafia incorreta: 'impecilho'",
    explanation: "A palavra é 'empecilho', com 'em' — o prefixo está trocado.",
    wrong: "Foi um impecilho enorme.",
    right: "Foi um empecilho enorme.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Empecilho ou impecilho?

O erro é trocar o prefixo. A palavra começa com "em-", não "im-".

✗  Impecilho
✓  Empecilho

**Etimologia:** vem do verbo "empecer" (= impedir, embaraçar) + sufixo "-ilho". "Empecer" vem do latim *impedire*. O "em" inicial é parte da palavra, não uma variação do "im".

**Como lembrar:** pense em "EMbaraço" — empecilho é algo que EMbaraça, que EMPATILHA o caminho. O "em" está certo.

✓  Esse burocracia é um empecilho.
✓  Não há empecilho legal para isso.`,
  },
  {
    id: "concenso_errado",
    category: "grafia",
    pattern: /\bconcenso\b/gi,
    label: "Grafia incorreta: 'concenso'",
    explanation: "'Consenso' não tem 'c' antes do 'n' — vem do latim 'consensus'.",
    wrong: "Chegamos a um concenso.",
    right: "Chegamos a um consenso.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Consenso ou concenso?

"Concenso" é um erro por hipercorreção — o escritor tenta inserir um 'c' que não existe.

✗  Concenso
✓  Consenso

**Etimologia:** latim *consensus*, de *consentire* (sentir junto, concordar). O prefixo é "con-" (junto) + "sensus" (sentido, percepção). Não há "c" intermediário.

**Família da palavra:**
consenso / consensual / consentir / dissenso / dissentir

**Como lembrar:** pense em "con-SENSO" = senso comum, sentir junto. O "senso" é a raiz — sem 'c' no meio.`,
  },
  {
    id: "previligio_errado",
    category: "grafia",
    pattern: /\bpreviligio\b|\bprevilégio\b/gi,
    label: "Grafia incorreta: 'previligio'",
    explanation: "A grafia correta é 'privilégio': pri-vi-lé-gio, com acento no 'é'.",
    wrong: "É um previligio ter acesso a isso.",
    right: "É um privilégio ter acesso a isso.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Privilégio — como grafar corretamente

Dois erros comuns ao mesmo tempo: prefixo errado ("pre" em vez de "pri") e acento esquecido.

✗  Previligio / previlégio
✓  Privilégio  (pri-vi-lé-gio)

**Etimologia:** latim *privilegium* = *privus* (privado, individual) + *lex/legis* (lei). Algo concedido individualmente por lei. O "pri" inicial é parte da raiz, não o prefixo "pre-" (que indica anterioridade).

**Como lembrar:** pense em "PRIvado + LEi + gio". PRIvilegio. O "i" na primeira sílaba faz parte da raiz latina.

**Família:**
privilégio / privilegiado / privilegiar / privilegiamento`,
  },
  {
    id: "interseccao_errada",
    category: "grafia",
    pattern: /\bintersecção\b/gi,
    label: "Grafia desatualizada (reforma ortográfica de 2009)",
    explanation: "Após a reforma de 2009, 'intersecção' perdeu um 'c'. Escreva 'interseção'.",
    wrong: "Na intersecção das ruas.",
    right: "Na interseção das ruas.",
    area: "orthography", topic: "spelling_rules",
    detail: `## Interseção — pós-reforma ortográfica de 2009

O Acordo Ortográfico de 2009 eliminou a consoante dupla em casos onde ela não é pronunciada. "Intersecção" tinha 'cc' mas falamos apenas um 'c' — ficou 'interseção'.

✗  Intersecção (grafia pré-2009)
✓  Interseção  (grafia atual)

**Outras palavras que sofreram mudança similar:**
✗  Acção  →  ✓  Ação
✗  Direcção  →  ✓  Direção
✗  Colecção  →  ✓  Coleção
✗  Fracção  →  ✓  Fração

**Atenção:** em Portugal, as grafias com consoante dupla continuam corretas. O acordo criou divergências que persistem. Se escrever para público lusitano, verifique a convenção adotada.`,
  },

  // ── ACENTUAÇÃO PÓS-2009 ───────────────────────────────────────────────────
  {
    id: "voo_circunflexo",
    category: "acento",
    pattern: /\bvôo\b/gi,
    label: "Acento retirado pela reforma de 2009",
    explanation: "Após 2009, 'vôo' perdeu o circunflexo — escreva 'voo'.",
    wrong: "O vôo durou três horas.",
    right: "O voo durou três horas.",
    area: "orthography", topic: "accentuation",
    detail: `## Voo — pós-reforma ortográfica de 2009

O Acordo Ortográfico de 2009 eliminou o acento circunflexo em palavras com vogais duplas "oo" e "ee", pois esses acentos não tinham função diferenciadora no português brasileiro.

✗  Vôo, zôo, enjôo  (pré-2009)
✓  Voo, zoo, enjoo  (atual)

**Outras palavras afetadas:**
✗  Enjôo  →  ✓  Enjoo
✗  Vôo    →  ✓  Voo
✗  Zôo    →  ✓  Zoo
✗  Dôo    →  ✓  Doo (forma verbal rara de "doer")

**Por que o acento foi removido?** No PB, a pronúncia já era clara sem ele. O acento diferenciador (que distinguia formas) deixou de ser necessário nesses casos.

**Nota sobre Portugal:** em Portugal, "voo" nunca teve acento. O acordo aproximou as grafias.`,
  },
  {
    id: "zoo_circunflexo",
    category: "acento",
    pattern: /\bzôo\b/gi,
    label: "Acento retirado pela reforma de 2009",
    explanation: "Após 2009, 'zôo' perdeu o circunflexo — escreva 'zoo'.",
    wrong: "Fomos ao zôo no domingo.",
    right: "Fomos ao zoo no domingo.",
    area: "orthography", topic: "accentuation",
    detail: `## Zoo — pós-reforma ortográfica de 2009

Assim como "voo", "zoo" perdeu o circunflexo com o Acordo de 2009. A vogal dupla "oo" não precisa mais de acento para indicar pronúncia aberta.

✗  Zôo  (pré-2009)
✓  Zoo  (atual)

**Família: palavras com "oo" sem acento:**
voo / zoo / enjoo

Todas seguem a mesma regra: vogal dupla, sem acento.`,
  },
  {
    id: "frequente_trema",
    category: "acento",
    pattern: /\bfreqüente\b|\bfreqüência\b|\bfreqüentemente\b/gi,
    label: "Trema eliminado pela reforma de 2009",
    explanation: "O trema foi abolido do português brasileiro em 2009 — escreva 'frequente', 'frequência'.",
    wrong: "Isso ocorre com freqüência.",
    right: "Isso ocorre com frequência.",
    area: "orthography", topic: "accentuation",
    detail: `## Trema — eliminado pela reforma de 2009

O Acordo Ortográfico de 2009 eliminou o trema (¨) do português brasileiro. Ele existia para indicar que o 'u' era pronunciado em certas sequências ("qu" e "gu"). Com a reforma, passou a ser subentendido pelo contexto.

✗  Freqüente, freqüência, freqüentemente
✓  Frequente, frequência, frequentemente

✗  Tranqüilo, tranqüilidade
✓  Tranquilo, tranquilidade

✗  Lingüiça, lingüística
✓  Linguiça, linguística

**Exceção:** o trema ainda é usado em **nomes próprios estrangeiros** e seus derivados:
✓  Müller, Münchhausen, Bündchen

E em palavras derivadas de nomes próprios estrangeiros com trema:
✓  mülleriano (de Müller)

**Atenção:** em Portugal, o trema foi mantido em alguns casos. Verifique a convenção do seu público.`,
  },
  {
    id: "tranquilo_trema",
    category: "acento",
    pattern: /\btranqüilo\b|\btranqüilidade\b|\btranqüilizar\b/gi,
    label: "Trema eliminado pela reforma de 2009",
    explanation: "Sem trema: 'tranquilo', 'tranquilidade'. O trema foi abolido em 2009.",
    wrong: "Fique tranqüilo.",
    right: "Fique tranquilo.",
    area: "orthography", topic: "accentuation",
    detail: `## Tranquilo — sem trema após 2009

O trema em "tranqüilo" marcava que o 'u' era pronunciado. Com a reforma de 2009, o trema foi eliminado e a pronúncia continua a mesma — o contexto já é suficiente.

✗  Tranqüilo, tranqüilidade, tranqüilizar
✓  Tranquilo, tranquilidade, tranquilizar

**Mesma regra, outras palavras:**
✗  Freqüente  →  ✓  Frequente
✗  Lingüística  →  ✓  Linguística
✗  Lingüiça  →  ✓  Linguiça

O 'u' continua sendo pronunciado — só o sinal gráfico foi removido.`,
  },

  // ── HÍFEN ─────────────────────────────────────────────────────────────────
  {
    id: "guarda_chuva_hifen",
    category: "hifen",
    pattern: /\bguarda\s+chuva\b/gi,
    label: "Composto sem hífen obrigatório",
    explanation: "Compostos com 'guarda' + substantivo sempre levam hífen.",
    wrong: "Esqueci o guarda chuva em casa.",
    right: "Esqueci o guarda-chuva em casa.",
    area: "orthography", topic: "hyphen",
    detail: `## Compostos com "guarda" — sempre com hífen

Palavras formadas com "guarda" seguido de substantivo são compostos que levam hífen obrigatório pelo Acordo de 2009.

✗  Guarda chuva / guarda roupa / guarda costas
✓  Guarda-chuva / guarda-roupa / guarda-costas

**Lista dos principais:**
guarda-chuva / guarda-roupa / guarda-costas / guarda-civil / guarda-florestal / guarda-sol / guarda-volumes / guarda-mor

**Por que com hífen?** São compostos cujos elementos mantêm certa autonomia semântica — diferente de aglutinações totais como "girassol" (donde o hífen seria desnecessário).

**Atenção ao verbo:** "guardar" conjugado não leva hífen.
✓  Vou guardar roupa no armário.  (verbo + complemento — sem hífen)`,
  },
  {
    id: "para_choque_hifen",
    category: "hifen",
    pattern: /\bpara\s+choque\b/gi,
    label: "Composto sem hífen obrigatório",
    explanation: "Compostos com 'para' no sentido de proteção levam hífen.",
    wrong: "O para choque amassou.",
    right: "O para-choque amassou.",
    area: "orthography", topic: "hyphen",
    detail: `## Compostos com "para" — quando usar hífen

Quando "para" funciona como elemento de proteção ou bloqueio num composto, o hífen é obrigatório.

✓  Para-choque (protege do choque)
✓  Para-brisa (protege do vento/brisa)
✓  Para-raios (protege dos raios)
✓  Para-quedas (para a queda)

**Como distinguir do "para" preposição:**
✗  Para choque  (errado — sem hífen)
✓  Para-choque  (correto — elemento de composto)

"Para o choque" com artigo = construção preposicional normal, sem hífen.
"Para-choque" = substantivo composto, com hífen.`,
  },
  {
    id: "meia_noite_hifen",
    category: "hifen",
    pattern: /\bmeia\s+noite\b/gi,
    label: "Composto sem hífen obrigatório",
    explanation: "'Meia-noite' é composto cristalizado — sempre com hífen.",
    wrong: "Chegou em meia noite.",
    right: "Chegou à meia-noite.",
    area: "orthography", topic: "hyphen",
    detail: `## Meia-noite e meio-dia — sempre com hífen

São compostos cristalizados que designam horários específicos. O hífen é obrigatório em ambos.

✗  Meia noite / meio dia
✓  Meia-noite / meio-dia

**Uso:**
✓  Chegou à meia-noite em ponto.
✓  Almoçamos ao meio-dia.
✓  O programa vai ao ar ao meio-dia e meia.  (= às 12h30 — "meia" aqui = meia hora)

**Atenção:** "meia" como numeral ou substantivo, sem compor com "noite", não leva hífen:
✓  Comeu meia torta.   (metade)
✓  Uma meia xícara.   (metade)`,
  },
  {
    id: "meio_dia_hifen",
    category: "hifen",
    pattern: /\bmeio\s+dia\b/gi,
    label: "Composto sem hífen obrigatório",
    explanation: "'Meio-dia' é composto cristalizado — sempre com hífen.",
    wrong: "Almoçamos ao meio dia.",
    right: "Almoçamos ao meio-dia.",
    area: "orthography", topic: "hyphen",
    detail: `## Meio-dia — sempre com hífen

Composto cristalizado que designa o horário das 12h. Hífen obrigatório.

✗  Meio dia
✓  Meio-dia

✓  Saímos ao meio-dia.
✓  O sol do meio-dia é forte.
✓  Às doze horas, ou seja, ao meio-dia.

**Veja também:** meia-noite (mesmo padrão).`,
  },
  {
    id: "anti_social_hifen",
    category: "hifen",
    pattern: /\banti\s+social\b/gi,
    label: "Prefixo 'anti' aglutinado",
    explanation: "'Anti' + consoante (exceto h) = sem espaço e sem hífen: 'antissocial'.",
    wrong: "Comportamento anti social.",
    right: "Comportamento antissocial.",
    area: "orthography", topic: "hyphen",
    detail: `## Prefixo "anti" — quando usar hífen

O Acordo de 2009 estabeleceu regras claras para prefixos:

**"Anti" + consoante diferente de h e r → aglutina sem hífen:**
✓  Antissocial (s → ss por ser intervocálico e sonoro)
✓  Antivírus
✓  Anticoncepcional
✓  Anticorpos

**"Anti" + h → com hífen:**
✓  Anti-herói
✓  Anti-histamínico

**"Anti" + vogal → com hífen:**
✓  Anti-inflamatório
✓  Anti-americano

**"Anti" + r → rr (por ser intervocálico):**
✓  Antirruído (e não "anti-ruído" — pelo acordo atual)

**Atenção:** a palavra "antissocial" dobra o 's' porque a regra do 's' intervocálico se aplica: anti + social → antissocial (para preservar o som /s/).`,
  },

  // ── TIPOGRAFIA ────────────────────────────────────────────────────────────
  {
    id: "minuscula_apos_ponto",
    category: "tipografia",
    pattern: /[.!?] [a-záàâãéêíóôõúüç]/g,
    label: "Minúscula após ponto final",
    explanation: "Após ponto, exclamação ou interrogação, a próxima frase começa com maiúscula.",
    wrong: "Cheguei tarde. fui dormir cedo.",
    right: "Cheguei tarde. Fui dormir cedo.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Maiúscula após ponto — regra básica de pontuação

Após ponto final (.), ponto de exclamação (!) ou ponto de interrogação (?), a próxima frase começa obrigatoriamente com letra maiúscula.

✗  Cheguei tarde. fui dormir cedo.
✓  Cheguei tarde. Fui dormir cedo.

✗  Que dia difícil! amanhã será melhor.
✓  Que dia difícil! Amanhã será melhor.

**Exceção:** reticências (...) podem ou não reiniciar com maiúscula, dependendo do sentido:
✓  Não sei... talvez amanhã.  (continuação — minúscula)
✓  Não sei... Talvez amanhã.  (pausa longa, nova frase — maiúscula)

**Nomes próprios:** sempre com maiúscula em qualquer posição.`,
  },
  {
    id: "espaco_duplo",
    category: "tipografia",
    pattern: / {2,}/g,
    label: "Espaço duplo (tipografia)",
    explanation: "Em texto digital, um espaço simples entre palavras é suficiente.",
    wrong: "O gato  pulou  alto.",
    right: "O gato pulou alto.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Por que espaço duplo é um problema?

O hábito de usar dois espaços após ponto vem da era das máquinas de escrever, onde a fonte monoespaçada exigia o espaço duplo para deixar clara a separação entre frases. Em texto digital — com fontes proporcionais — um espaço é suficiente e mais limpo.

✗  O gato  pulou  alto.
✓  O gato pulou alto.

**Problemas que o espaço duplo causa:**
- Alinhamento irregular em texto justificado
- Espaços visíveis que quebram o ritmo de leitura
- Inconsistência com padrões tipográficos profissionais

**Dica:** editores como Word e Google Docs às vezes ignoram o espaço duplo na renderização, mas o caractere está lá no texto exportado.`,
  },
  {
    id: "espaco_antes_pontuacao",
    category: "tipografia",
    pattern: / [,;:!?]/g,
    label: "Espaço antes de pontuação",
    explanation: "Vírgula, ponto e vírgula, dois-pontos e sinais de pontuação colam na palavra anterior.",
    wrong: "Bom dia , tudo bem ?",
    right: "Bom dia, tudo bem?",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Espaço antes de pontuação — erro tipográfico

Em português (e na maioria dos idiomas ocidentais), os sinais de pontuação ficam colados à palavra que os precede, sem espaço antes.

✗  Bom dia , tudo bem ?
✓  Bom dia, tudo bem?

✗  Trouxe pão ; leite ; e café .
✓  Trouxe pão; leite; e café.

**Regra completa:**
- Sem espaço ANTES de: , ; : ! ? . …
- Com espaço DEPOIS de: , ; : ! ? . …

**Exceção francesa:** o francês usa espaço antes de : ! ? ; — mas em português não.

**Travessão (—):** pode ter espaço de ambos os lados ou nenhum, dependendo do estilo adotado. O importante é ser consistente.`,
  },
  {
    id: "virgula_sem_espaco",
    category: "tipografia",
    pattern: /,[^\s\d"'»\n—–\)]/g,
    label: "Falta espaço após vírgula",
    explanation: "Após vírgula sempre vem um espaço antes da próxima palavra.",
    wrong: "Comprei pão,leite e café.",
    right: "Comprei pão, leite e café.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Espaço após vírgula — regra básica

A vírgula termina colada à palavra anterior e vai seguida de um espaço antes da próxima palavra ou número.

✗  Comprei pão,leite e café.
✓  Comprei pão, leite e café.

✗  Rio de Janeiro,São Paulo e Belo Horizonte.
✓  Rio de Janeiro, São Paulo e Belo Horizonte.

**Exceções que o inspetor não marca (corretamente):**
- 1,5 (número decimal — vírgula sem espaço)
- "10,00" (valor monetário — vírgula sem espaço)
- Vírgula antes de aspas ou parênteses de fechamento

**Dica:** após cada vírgula, o leitor espera uma pequena respiração. O espaço é a representação gráfica dessa pausa.`,
  },
  {
    id: "inicio_minuscula",
    category: "tipografia",
    pattern: null,
    label: "Texto começa com minúscula",
    explanation: "O primeiro caractere do texto deve ser maiúsculo.",
    wrong: "era uma vez um gato.",
    right: "Era uma vez um gato.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Texto começa com maiúscula — regra universal

Todo texto começa com letra maiúscula. Isso vale para qualquer gênero: narração, ensaio, carta, artigo, lista, e-mail.

✗  era uma vez um gato preto.
✓  Era uma vez um gato preto.

**Exceções intencionais na literatura:**
Alguns autores usam minúscula no início por escolha estilística deliberada (poesia concreta, experimentalismo gráfico). Mas é uma decisão artística consciente — não um descuido.

Se for intencional, ignore o aviso. Se não for, corrija.`,
  },
  {
    id: "acento_faltando",
    category: "acento",
    pattern: null,
    label: "Acento ausente",
    explanation: "Esta palavra precisa de acento gráfico conforme a norma ortográfica vigente.",
    wrong: "facil",
    right: "fácil",
    area: "orthography", topic: "accentuation",
    detail: `## Acento gráfico ausente

Esta palavra foi identificada como uma forma sem acento que deveria tê-lo conforme a norma ortográfica do português brasileiro (pós-reforma 2009).

O inspetor usa um léxico de referência com mais de 100 mil palavras acentuadas para identificar esses casos.

**Regras gerais de acentuação (resumo):**

**Oxítonas** (última sílaba tônica): acentuam-se as terminadas em a(s), e(s), o(s), em, ens:
✓  sofá, café, avô, também, parabéns

**Paroxítonas** (penúltima sílaba tônica): acentuam-se as que NÃO terminam em a(s), e(s), o(s), em, ens:
✓  fácil, vírus, tórax, álbum, caráter

**Proparoxítonas** (antepenúltima): todas se acentuam:
✓  lâmpada, médico, óculos, pérola

Se houver dúvida específica sobre esta palavra, abra o dicionário integrado com --d.`,
  },
];

const RULE_MAP = new Map(RULES.map(r => [r.id, r]));

// ── Badge de contagem ─────────────────────────────────────────────────────
let _badge    = null;
let _badgeCtx = null;

function getOrCreateBadge() {
  if (_badge) return _badge;
  _badge = document.createElement("button");
  _badge.id   = "lintBadge";
  _badge.type = "button";
  _badge.title = "Ver ocorrências do inspetor";
  _badge.setAttribute("aria-label", "Inspetor gramatical — ver ocorrências");
  _badge.setAttribute("aria-hidden", "true");
  _badge.innerHTML = `<span class="lb-icon">◉</span><span class="lb-count">0</span>`;
  document.body.appendChild(_badge);

  _badge.addEventListener("click", () => {
    if (!_badgeCtx) return;
    const editorEl = document.querySelector(".pageContent:focus")
      || document.querySelector(".pageContent");
    if (editorEl) openLintReportSlice(_badgeCtx, editorEl);
  });

  return _badge;
}

function updateBadge(editorEl) {
  if (!_badge) return;
  const marks = editorEl ? editorEl.querySelectorAll(".gram-mark") : [];
  const count = marks.length;

  _badge.querySelector(".lb-count").textContent = count;

  if (count === 0) {
    _badge.setAttribute("aria-hidden", "true");
    _badge.classList.remove("is-visible");
  } else {
    _badge.setAttribute("aria-hidden", "false");
    _badge.classList.add("is-visible");
    const catCount = {};
    for (const m of marks) {
      const cat = m.dataset.cat || "grafia";
      catCount[cat] = (catCount[cat] || 0) + 1;
    }
    const dominant = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "grafia";
    _badge.style.setProperty("--lb-color", CATEGORY_COLORS[dominant]?.cor || "#ef5350");
  }
}

// ── Slice de relatório completo ───────────────────────────────────────────

function openLintReportSlice(ctx, editorEl) {
  const marks = Array.from(editorEl.querySelectorAll(".gram-mark"));

  if (!marks.length) {
    const slice = makeSlice(ctx, {
      badge: "AG", title: "INSPETOR", kindKey: "help",
      meta: "nenhuma ocorrência",
      body: "Nenhuma ocorrência detectada. O texto está limpo.",
    });
    insertNodeAtCaret(slice);
    return slice;
  }

  const byCategory = {};
  for (const mark of marks) {
    const rule = RULE_MAP.get(mark.dataset.ruleId);
    if (!rule) continue;
    const cat = rule.category || "grafia";
    (byCategory[cat] ??= []).push({ mark, rule });
  }

  let html = `<div class="lint-report">`;
  for (const [cat, items] of Object.entries(byCategory)) {
    const ci = CATEGORY_COLORS[cat] || { cor: "#888", label: cat };
    html += `<div class="lint-cat-block">`;
    html += `<div class="lint-cat-head" style="--lc:${ci.cor}">${ci.label}<span class="lint-cat-count">${items.length}</span></div>`;
    for (const { mark, rule } of items) {
      const wrong = mark.dataset.wrong || mark.textContent || rule.wrong || "";
      const right = (mark.dataset.right || rule.right || "").replace(/\(.*?\)/g, "").trim();
      html += `<div class="lint-item">`;
      html += `<div class="lint-pair">`;
      html += `<span class="lint-wrong">${escHtml(wrong)}</span>`;
      if (right) html += `<span class="lint-arrow">→</span><span class="lint-right">${escHtml(right)}</span>`;
      html += `</div>`;
      html += `<div class="lint-item-label">${escHtml(rule.label)}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }
  html += `<div class="lint-report-footer">${marks.length} ocorrência${marks.length !== 1 ? "s" : ""} · hover no sublinhado para a regra</div>`;
  html += `</div>`;

  const slice = makeSlice(ctx, {
    badge: "AG", title: "INSPETOR", kindKey: "help",
    meta: `${marks.length} ocorrência${marks.length !== 1 ? "s" : ""}`,
    body: "",
  });
  const bodyEl = slice.querySelector(".panelBody");
  if (bodyEl) bodyEl.innerHTML = html;
  insertNodeAtCaret(slice);
  return slice;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Floater global ────────────────────────────────────────────────────────
let _floater    = null;
let _hideTimer  = 0;
let _lastEditor = null;

function getFloater() {
  if (_floater) return _floater;
  _floater = document.createElement("div");
  _floater.id = "gramFloater";
  _floater.setAttribute("aria-hidden", "true");
  _floater.innerHTML = `
    <span class="gf-label"></span>
    <span class="gf-expl"></span>
    <span class="gf-pair">
      <span class="gf-wrong"></span>
      <span class="gf-arrow">→</span>
      <span class="gf-right"></span>
    </span>
    <button class="gf-btn" type="button">entender melhor</button>
  `;
  document.body.appendChild(_floater);
  _floater.addEventListener("mouseenter", () => clearTimeout(_hideTimer));
  _floater.addEventListener("mouseleave", scheduleHide);
  return _floater;
}

function scheduleHide() {
  clearTimeout(_hideTimer);
  _hideTimer = setTimeout(() => {
    if (!_floater) return;
    _floater.classList.remove("isVisible");
    _floater.setAttribute("aria-hidden", "true");
  }, 220);
}

function hideFloater() {
  clearTimeout(_hideTimer);
  if (!_floater) return;
  _floater.classList.remove("isVisible");
  _floater.setAttribute("aria-hidden", "true");
}

function showFloater(markEl, rule, openSliceFn, editorEl) {
  clearTimeout(_hideTimer);
  _lastEditor = editorEl;

  const wrongText = markEl.dataset.wrong || rule.wrong || "";
  const rightText = markEl.dataset.right || rule.right || "";

  const f = getFloater();
  const catColor = CATEGORY_COLORS[rule.category]?.cor || "#c4542a";

  f.querySelector(".gf-label").textContent = rule.id === "acento_faltando"
    ? `"${wrongText}" sem acento (acentuação)`
    : rule.label;
  f.querySelector(".gf-label").style.color = catColor;

  f.querySelector(".gf-expl").textContent = rule.id === "acento_faltando"
    ? `Esta palavra precisa de acento. Escreva "${rightText}".`
    : rule.explanation;

  f.querySelector(".gf-wrong").textContent = wrongText;
  f.querySelector(".gf-right").textContent = rightText;

  const hasPair = wrongText && rightText;
  f.querySelector(".gf-pair").style.display = hasPair ? "flex" : "none";

  const oldBtn = f.querySelector(".gf-btn");
  const newBtn = oldBtn.cloneNode(true);
  newBtn.textContent = "entender melhor";
  oldBtn.replaceWith(newBtn);
  newBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    hideFloater();
    const editor = _lastEditor;
    if (editor) {
      editor.focus();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
    openSliceFn(rule);
  });

  const rect = markEl.getBoundingClientRect();
  const fw   = 300;
  const fh   = f.offsetHeight || 120;
  let left   = rect.left + rect.width / 2 - fw / 2;
  left       = Math.max(8, Math.min(left, window.innerWidth - fw - 8));
  let top    = rect.top - fh - 12;
  if (top < 8) top = rect.bottom + 8;

  f.style.left = `${Math.round(left)}px`;
  f.style.top  = `${Math.round(top)}px`;
  f.classList.add("isVisible");
  f.setAttribute("aria-hidden", "false");
}

// ── Scanner ───────────────────────────────────────────────────────────────

function scanAndMark(editorEl, onDone) {
  clearMarks(editorEl);

  const walker = document.createTreeWalker(
    editorEl,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node.parentElement?.closest?.(".slice")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const toWrap = [];
  let firstTextNode = null;
  let textNode;
  while ((textNode = walker.nextNode())) {
    if (!firstTextNode) firstTextNode = textNode;
    const text = textNode.textContent;
    for (const rule of RULES) {
      if (!rule.pattern) continue;
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(text)) !== null) {
        toWrap.push({ node: textNode, start: m.index, end: m.index + m[0].length, ruleId: rule.id });
      }
    }
  }

  if (firstTextNode) {
    const firstChar = firstTextNode.textContent[0];
    if (firstChar && /[a-záàâãéêíóôõúüç]/.test(firstChar)) {
      toWrap.push({ node: firstTextNode, start: 0, end: 1, ruleId: "inicio_minuscula" });
    }
  }

  if (_accentMap) {
    const walker2 = document.createTreeWalker(
      editorEl, NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (node.parentElement?.closest?.(".slice,.gram-mark")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );
    const wordRe = /\b([A-Za-záàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]{3,})\b/g;
    let tNode;
    while ((tNode = walker2.nextNode())) {
      const text = tNode.textContent;
      wordRe.lastIndex = 0;
      let wm;
      while ((wm = wordRe.exec(text)) !== null) {
        const word = wm[1];
        const normed = normNoAccent(word);
        if (normed === word.toLowerCase()) {
          const correct = _accentMap[normed];
          if (correct && correct !== word.toLowerCase()) {
            toWrap.push({
              node: tNode,
              start: wm.index,
              end: wm.index + word.length,
              ruleId: "acento_faltando",
              wrong: word,
              right: correct,
            });
          }
        }
      }
    }
  }

  toWrap.sort((a, b) => a.node === b.node ? b.start - a.start : 0);

  for (const { node, start, end, ruleId, wrong, right } of toWrap) {
    try {
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      const span = document.createElement("span");
      const rule = RULE_MAP.get(ruleId);
      span.className      = "gram-mark";
      span.dataset.ruleId = ruleId;
      span.dataset.cat    = rule?.category || "grafia";
      if (wrong) span.dataset.wrong = wrong;
      if (right) span.dataset.right = right;
      range.surroundContents(span);
    } catch (_) {}
  }

  onDone?.(editorEl);
}

function clearMarks(editorEl) {
  const marks = editorEl.querySelectorAll(".gram-mark");
  for (const m of marks) {
    const parent = m.parentNode;
    if (!parent) continue;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  }
}

// ── Slice de explicação aprofundada ───────────────────────────────────────

function openRuleSlice(ctx, rule) {
  // Usa detail (aprendizado completo) quando disponível — nunca apenas explanation
  const content = rule.detail || buildFallbackDetail(rule);

  const slice = makeSlice(ctx, {
    badge: "GR",
    title: "GRAMÁTICA",
    kindKey: "help",
    meta: rule.label.toLowerCase(),
    body: content,
  });

  insertNodeAtCaret(slice);

  // Enriquece com corpus se tiver entrada correspondente
  if (!rule.detail) {
    corpus.load(rule.area, rule.topic).then((data) => {
      const flat = Array.isArray(data?.sections)
        ? data.sections.flatMap(s => [...(s.rules ?? []), ...(s.entries ?? []), ...(s.items ?? [])])
        : (data?.entries ?? []);
      const entry = flat.find(e => e.id === rule.id || (e.id && rule.id.startsWith(e.id)));
      if (!entry) return;

      const extra = [];
      if (entry.rule)          extra.push(`**Regra formal:** ${entry.rule}`);
      if (entry.tip)           extra.push(entry.tip);
      if (entry.correct)       extra.push(`✓ ${entry.correct}`);
      if (entry.incorrect)     extra.push(`✗ ${entry.incorrect}`);
      if (entry.examples?.[0]) extra.push(`Exemplo do corpus: ${entry.examples[0]}`);

      if (extra.length) {
        const bodyEl = slice.querySelector(".panelBody");
        if (!bodyEl) return;
        const combined = content + "\n\n---\n" + extra.join("\n");
        bodyEl.innerHTML = combined
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/^## (.+)$/m, "<strong>$1</strong>")
          .replace(/\n/g, "<br>");
      }
    }).catch(() => {});
  }

  return slice;
}

function buildFallbackDetail(rule) {
  const lines = [`## ${rule.label}`, "", rule.explanation];
  if (rule.wrong && rule.right) {
    lines.push("", `✗  ${rule.wrong}`, `✓  ${rule.right}`);
  }
  return lines.join("\n");
}

// ── Init ──────────────────────────────────────────────────────────────────

export function initGrammarLint(ctx) {
  const DEBOUNCE_MS = 2000;
  let timer = 0;
  let active = true;

  loadAccentMap();

  _badgeCtx = ctx;
  getOrCreateBadge();

  const openSliceFn = (rule) => openRuleSlice(ctx, rule);

  document.addEventListener("mouseover", (ev) => {
    const mark = ev.target?.closest?.(".gram-mark");
    if (!mark) return;
    const rule = RULE_MAP.get(mark.dataset.ruleId);
    if (!rule) return;
    const editorEl = mark.closest(".pageContent");
    showFloater(mark, rule, openSliceFn, editorEl);
  });

  document.addEventListener("mouseout", (ev) => {
    const mark = ev.target?.closest?.(".gram-mark");
    if (!mark) return;
    const toEl = ev.relatedTarget;
    if (_floater && (toEl === _floater || _floater.contains(toEl))) return;
    scheduleHide();
  });

  document.addEventListener("input", (ev) => {
    if (!active) return;
    const editorEl = ev.target?.closest?.(".pageContent");
    if (!editorEl) return;
    clearTimeout(timer);
    timer = setTimeout(() => scanAndMark(editorEl, updateBadge), DEBOUNCE_MS);
  });

  document.addEventListener("focusin", (ev) => {
    const editorEl = ev.target?.closest?.(".pageContent");
    if (!editorEl) return;
    clearTimeout(timer);
    clearMarks(editorEl);
    updateBadge(editorEl);
    hideFloater();
  });

  ctx.grammarLint = {
    scan(editorEl)       { if (editorEl) scanAndMark(editorEl, updateBadge); },
    clear(editorEl)      { if (editorEl) { clearMarks(editorEl); updateBadge(editorEl); } },
    toggle()             { active = !active; return active; },
    isActive()           { return active; },
    openRuleSlice:       (rule) => openRuleSlice(ctx, rule),
    openReportSlice:     (editorEl) => openLintReportSlice(ctx, editorEl),
  };
}
