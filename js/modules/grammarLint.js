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

// Palavras que existem sem acento como forma CORRETA na maioria dos contextos.
// O mapa Hunspell inclui variantes acentuadas (quê, sé, pará, sô...) que são
// corretas em contextos específicos mas não podem ser marcadas genericamente.
const ACCENT_IGNORELIST = new Set([
  // Conjunções / pronomes ambíguos
  "que", "se", "pois", "porque",
  // Preposições / contrações (pará é cidade; para é preposição)
  "para", "pela", "pelo", "pelas", "pelos",
  // Verbos comuns que coincidem com topônimos/variantes
  "pode", "podes", "tem", "tens", "vem", "vens",
  // Pronomes/artigos
  "nos", "lhe", "lhes", "ele", "ela",
  // Demonstrativos (àquele/àquilo são contrações preposicionais — diferente de aquele/aquilo)
  "aquele", "aquela", "aqueles", "aquelas", "aquilo",
  // Palavras muito curtas com variantes de sentido contextual
  "so", "co",
  // Verbos regulares corretamente grafados sem acento (mapa Hunspell tem variantes arcaicas)
  "disse", "corre", "corra", "bebe", "parte", "come", "vive",
  "fez", "vez", "vezes", "pez",
  // Palavras comuns cujas "formas acentuadas" do mapa não existem no PT-BR moderno
  "boa", "dia", "dias", "agora", "lugar", "lugares", "coisa", "coisas",
  "casa", "vida", "base", "arte", "tipo", "modo",
]);

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
  // ── Novos agentes ─────────────────────────────────────────────────────────
  morfologia:   { cor: "#546e7a", label: "Morfologia" },
  paronimia:    { cor: "#c62828", label: "Paronímia" },
  pontuacao:    { cor: "#ef6c00", label: "Pontuação" },
  crase:        { cor: "#7b1fa2", label: "Crase" },
  semantica:    { cor: "#2e7d32", label: "Semântica" },
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

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 2 — MORFOLOGIA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "gente_plural_verb",
    category: "morfologia",
    pattern: /\ba\s+gente\s+(?:fomos|éramos|fizemos|viemos|estávamos|íamos|fossemos)\b/gi,
    label: "A gente + verbo no plural (morfologia)",
    explanation: "'A gente' equivale a 'nós', mas o verbo vai para a 3ª pessoa do singular.",
    wrong: "A gente fomos à praia.",
    right: "A gente foi à praia.",
    detail: `## Por que "a gente fomos" está errado?

"A gente" é uma expressão que substituiu "nós" na fala e na escrita informal, mas com uma diferença crucial: o verbo fica na **3ª pessoa do singular**, não na 1ª do plural.

✗  A gente fomos à praia.
✓  A gente foi à praia.

✗  A gente éramos jovens.
✓  A gente era jovem.

✗  A gente fizemos a lição.
✓  A gente fez a lição.

**Por quê?** "A gente" é, gramaticalmente, um substantivo com artigo — "a gente" = as pessoas, o grupo. O verbo concorda com "gente" (singular feminino), não com o referente implícito (nós).

**Dica de consistência:** se usar "a gente", use o verbo no singular. Se quiser o plural, use "nós fizemos", "nós fomos".`,
  },
  {
    id: "pessoal_plural_verb",
    category: "morfologia",
    pattern: /\bpessoal\s+(?:foram|estavam|disseram|fizeram|vieram|chegaram|queriam)\b/gi,
    label: "Coletivo 'pessoal' com verbo no plural",
    explanation: "'Pessoal' é substantivo coletivo singular — o verbo deve ficar no singular.",
    wrong: "O pessoal foram embora.",
    right: "O pessoal foi embora.",
    detail: `## O coletivo "pessoal" — concordância verbal

"Pessoal" é um substantivo coletivo no singular. O verbo deve concordar com o singular, mesmo que o coletivo se refira a muitas pessoas.

✗  O pessoal foram embora.
✓  O pessoal foi embora.

✗  O pessoal estavam animados.
✓  O pessoal estava animado.

**Regra geral dos coletivos:** substantivos coletivos (pessoal, multidão, turma, equipe, grupo) pedem verbo no singular quando vêm acompanhados de artigo singular.

✓  A turma foi ao teatro.
✓  A equipe ganhou o campeonato.
✓  A multidão correu.

**Exceção da concordância ideológica:** em estilo informal, o plural pode ser aceito quando o coletivo está afastado do verbo: "O pessoal que estava lá disseram que foi ótimo" — tolerado coloquialmente, mas evite na escrita formal.`,
  },
  {
    id: "eles_e_singular",
    category: "morfologia",
    pattern: /\beles\s+é\b|\belas\s+é\b/gi,
    label: "Sujeito plural com verbo no singular",
    explanation: "Sujeito 'eles/elas' exige verbo no plural: 'eles são', 'elas são'.",
    wrong: "Eles é os responsáveis.",
    right: "Eles são os responsáveis.",
    detail: `## Concordância com "eles/elas"

"Eles" e "elas" são pronomes pessoais da 3ª pessoa do **plural**. O verbo ser concorda: "são", nunca "é".

✗  Eles é os responsáveis.
✓  Eles são os responsáveis.

✗  Elas é inteligentes.
✓  Elas são inteligentes.

Esta é uma das concordâncias mais básicas da língua. O erro ocorre geralmente em fala muito informal e não deve aparecer na escrita padrão.`,
  },
  {
    id: "menas_invariavel",
    category: "morfologia",
    pattern: /\bmenas\b/gi,
    label: "'Menas' não existe em português",
    explanation: "'Menos' é invariável — não existe 'menas'. Use sempre 'menos'.",
    wrong: "Precisamos de menas erros.",
    right: "Precisamos de menos erros.",
    detail: `## "Menas" — palavra inexistente

"Menos" é um advérbio **invariável** em português — não varia em gênero nem número. A forma "menas" não existe na língua portuguesa, em nenhum registro.

✗  Menas pessoas vieram.
✓  Menos pessoas vieram.

✗  Preciso de menas ajuda.
✓  Preciso de menos ajuda.

**Cuidado:** o erro "menas" é hipercorreção por analogia com "poucas" (que varia). "Menos" não é adjetivo — é advérbio. Advérbios não variam.

**Palavras invariáveis semelhantes:** mais, menos, muito (como advérbio), pouco (como advérbio). Quando funcionam como advérbios, nenhum varia.`,
  },
  {
    id: "mais_melhor",
    category: "morfologia",
    pattern: /\bmais\s+melhor\b|\bmais\s+pior\b|\bmais\s+maior\b|\bmais\s+menor\b/gi,
    label: "Comparativo duplo (grau redundante)",
    explanation: "'Melhor/pior/maior/menor' já são comparativos — 'mais' é redundante.",
    wrong: "Esse resultado é mais melhor.",
    right: "Esse resultado é melhor.",
    detail: `## Comparativos sintéticos — não precisam de "mais"

Em português, alguns adjetivos têm formas comparativas próprias (chamadas comparativas sintéticas). Adicionar "mais" a essas formas é pleonasmo.

| Adjetivo | Comparativo analítico | Comparativo sintético |
|---|---|---|
| bom | mais bom (aceitável) | **melhor** |
| mau/ruim | mais ruim (aceitável) | **pior** |
| grande | mais grande (raro) | **maior** |
| pequeno | mais pequeno (raro) | **menor** |

✗  Mais melhor / mais pior / mais maior / mais menor
✓  Melhor / pior / maior / menor

**Dupla correção:**
✗  Esse plano é muito mais melhor.
✓  Esse plano é muito melhor. (apenas "muito" como intensificador)

**Dica:** "muito melhor", "muito pior" são corretos — "muito" intensifica o comparativo. O erro é usar "mais" antes do comparativo sintético, não "muito".`,
  },
  {
    id: "muito_otimo",
    category: "morfologia",
    pattern: /\bmuito\s+ótimo\b|\bmuito\s+péssimo\b/gi,
    label: "Superlativo duplo (grau redundante)",
    explanation: "'Ótimo' e 'péssimo' já são superlativos absolutos — 'muito' é redundante.",
    wrong: "O filme foi muito ótimo.",
    right: "O filme foi ótimo.",
    detail: `## Superlativos sintéticos — já são absolutos

"Ótimo" e "péssimo" são superlativos absolutos — já carregam o máximo da qualidade. Adicionar "muito" é redundante.

| Adjetivo | Superlativo |
|---|---|
| bom | **ótimo** (não "muito ótimo") |
| mau/ruim | **péssimo** (não "muito péssimo") |

✗  Muito ótimo / muito péssimo
✓  Ótimo / péssimo

**Intensificadores aceitos** (raramente, com efeito expressivo):
"Absolutamente ótimo", "simplesmente péssimo" — funcionam como ênfase retórica, não como gradação real.

**Por que o erro acontece?** Por analogia com "muito bom" (que é correto). A diferença: "bom" é o grau positivo — precisa de "muito" para chegar ao superlativo. "Ótimo" já É o superlativo.`,
  },
  {
    id: "por_isso_que",
    category: "morfologia",
    pattern: /\bpor\s+isso\s+que\b/gi,
    label: "Locução redundante 'por isso que'",
    explanation: "Use 'por isso' ou 'é por isso que' — nunca 'por isso que' sem o 'é'.",
    wrong: "Estudei muito, por isso que passei.",
    right: "Estudei muito, por isso passei. / É por isso que passei.",
    detail: `## "Por isso que" — locução incorreta

"Por isso que" mistura duas construções diferentes e resulta numa forma híbrida incorreta.

✗  Por isso que estou aqui.
✓  Por isso estou aqui.       (conjunção conclusiva)
✓  É por isso que estou aqui. (estrutura de clivagem — correta)

**As duas construções corretas:**
1. **"Por isso" sozinho:** "Choveu, por isso ficamos em casa."
2. **"É por isso que":** "É por isso que não concordo."

**Por que "por isso que" sem "é" está errado?** A conjunção "que" aqui precisa de um verbo de ligação antes ("é") para ancorar a oração. Sem o "é", a estrutura fica suspensa.`,
  },
  {
    id: "onde_que",
    category: "morfologia",
    pattern: /\bonde\s+que\b/gi,
    label: "Forma popular não aceita na norma culta",
    explanation: "'Onde que' é construção regional. Na escrita, use apenas 'onde'.",
    wrong: "O lugar onde que moro é bonito.",
    right: "O lugar onde moro é bonito.",
    detail: `## "Onde que" — não existe na norma culta

"Onde que" é uma construção popular presente em algumas regiões do Brasil, mas não é aceita na norma padrão escrita.

✗  Onde que você vai?
✓  Onde você vai?

✗  O lugar onde que nasci.
✓  O lugar onde nasci.

O "que" aqui é parasitário — não tem função sintática real. "Onde" já introduz a oração subordinada adverbial ou a oração relativa sem precisar de reforço.`,
  },
  {
    id: "de_encontro_com",
    category: "morfologia",
    pattern: /\bde\s+encontro\s+com\b/gi,
    label: "Preposição errada em 'de encontro'",
    explanation: "'De encontro a' = contra. 'Ao encontro de' = a favor. A preposição muda o sentido.",
    wrong: "Sua ideia vai de encontro com a minha.",
    right: "Sua ideia vai de encontro à minha. (= contraria) / vai ao encontro da minha. (= concorda)",
    detail: `## De encontro a × Ao encontro de — sentidos opostos

Estas duas expressões são paronímias sintagmáticas — parecem similares mas têm sentidos contrários.

**"De encontro a"** = contra, em oposição a, em choque com:
✓  Sua proposta vai de encontro ao que foi decidido. (= contraria)
✓  O carro foi de encontro ao muro. (= bateu no muro)

**"Ao encontro de"** = a favor de, em direção a, consonante com:
✓  Sua ideia vai ao encontro do que propus. (= está alinhada)
✓  Correu ao encontro do amigo. (= em direção a)

**O erro mais comum:** usar "com" no lugar de "a":
✗  De encontro com a proposta.
✓  De encontro à proposta. (= contraria a proposta)`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 3 — SINTAXE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "assistiu_o",
    category: "regencia",
    pattern: /\bassistiu\s+o\b|\bassistir\s+o\b/gi,
    label: "Regência do verbo assistir (ver/presenciar)",
    explanation: "'Assistir' no sentido de ver é transitivo indireto — rege 'a', não objeto direto.",
    wrong: "Assistimos o jogo ontem.",
    right: "Assistimos ao jogo ontem.",
    detail: `## Assistir — transitivo direto ou indireto?

Depende do sentido. Este é um dos verbos que muda de regência conforme o significado.

**"Assistir" = ver/presenciar → transitivo INDIRETO (rege "a"):**
✗  Assistimos o jogo.
✓  Assistimos ao jogo.
✓  Ela assistiu à peça.
✓  Assisti à conferência.

**"Assistir" = ajudar, estar presente → transitivo INDIRETO (rege "a"):**
✓  O médico assistiu ao paciente.

**"Assistir" = caber, pertencer → transitivo INDIRETO (rege "a"):**
✓  Assiste-lhe o direito de recorrer.

**Dica:** no sentido de "ver", substitua por "ver" — se "ver o jogo" funciona (direto), lembre que "assistir" exige o "ao". É uma exigência da norma culta escrita, ainda que "assistir o jogo" seja comum na fala.`,
  },
  {
    id: "implicar_em",
    category: "regencia",
    pattern: /\bimplicar\s+em\b/gi,
    label: "Regência do verbo implicar",
    explanation: "'Implicar' (= acarretar) é transitivo direto — sem preposição 'em'.",
    wrong: "Isso implica em riscos.",
    right: "Isso implica riscos.",
    detail: `## Implicar em ou implicar sem preposição?

"Implicar" tem dois sentidos principais com regências diferentes:

**"Implicar" = acarretar, ter como consequência → TRANSITIVO DIRETO (sem preposição):**
✗  Isso implica em riscos.
✓  Isso implica riscos.
✗  A decisão implica em mudanças.
✓  A decisão implica mudanças.

**"Implicar" = complicar, envolver alguém → TRANSITIVO DIRETO:**
✓  Implicaram-no no esquema.

**"Implicar com" = ter implicância com (= provocar) → TRANSITIVO INDIRETO:**
✓  Ele vive implicando com o colega.

**Por que o erro acontece?** Por analogia com "resultar em", "redundar em" — verbos de consequência que de fato exigem "em". "Implicar" foge a esse padrão.`,
  },
  {
    id: "namorar_com",
    category: "regencia",
    pattern: /\bnamorar\s+com\b/gi,
    label: "Regência do verbo namorar",
    explanation: "'Namorar' é transitivo direto — sem 'com'.",
    wrong: "Ela namora com o Pedro.",
    right: "Ela namora o Pedro.",
    detail: `## Namorar com ou namorar sem preposição?

Na norma culta, "namorar" é transitivo direto — o complemento vem sem preposição.

✗  Ela namora com o Pedro.
✓  Ela namora o Pedro.

✗  Eles namoraram com por dois anos.
✓  Eles namoraram por dois anos.

**Por que o erro é tão comum?** "Namorar com" é amplamente usado na fala brasileira e já está consagrado pelo uso informal. Mas na escrita padrão, mantém-se o transitivo direto.

**Comparação com verbos similares:**
✓  Encontrou o amigo. (não "com o amigo")
✓  Conheceu a professora. (não "com a professora")

Verbos de relação tendem ao transitivo direto em português.`,
  },
  {
    id: "esquecer_de",
    category: "regencia",
    pattern: /\besquecer\s+de\b(?!\s+(?:mim|ti|si|nós|vós))/gi,
    label: "Regência do verbo esquecer",
    explanation: "Sem pronome reflexivo: 'esquecer' é direto. Com reflexivo: 'esquecer-se de'.",
    wrong: "Esqueci de levar o documento.",
    right: "Esqueci o documento. / Esqueci-me de levar o documento.",
    detail: `## Esquecer × Esquecer-se de

São duas construções válidas com regências diferentes:

**"Esquecer" sem pronome → TRANSITIVO DIRETO:**
✓  Esqueci o documento.
✓  Esqueci o nome dela.
✗  Esqueci de levar o documento. (norma culta: retire o "de")

**"Esquecer-se de" com pronome reflexivo → TRANSITIVO INDIRETO:**
✓  Esqueci-me de levar o documento.
✓  Ele se esqueceu do compromisso.

**Na prática:** "esquecer de" (sem pronome) é amplamente usado e já aceito por muitos gramáticos como variante. Mas na escrita formal, prefira uma das duas formas canônicas.

**Dica rápida:** se não tem pronome reflexivo, não tem "de". Se tem "se/me/te", tem "de".`,
  },
  {
    id: "ansioso_para",
    category: "regencia",
    pattern: /\bansioso\s+para\b|\bansiosa\s+para\b/gi,
    label: "Regência do adjetivo ansioso",
    explanation: "'Ansioso' rege a preposição 'por' ou 'com' — não 'para'.",
    wrong: "Estou ansioso para os resultados.",
    right: "Estou ansioso pelos resultados.",
    detail: `## Ansioso por, com ou para?

"Ansioso" é um adjetivo com regência nominal definida:

**"Ansioso por" → sentido de anseio/expectativa:**
✓  Ansioso pelos resultados.
✓  Ansiosa por notícias.

**"Ansioso com" → sentido de preocupação:**
✓  Ansioso com a situação.
✓  Ansiosa com o atraso.

**"Ansioso para" → não é a regência padrão:**
✗  Ansioso para ver os resultados. (coloquial, mas tecnicamente impreciso)
A forma mais aceita seria "ansioso por ver" ou "ansioso para ver" — esta última é tolerada quando "para" é preposição de finalidade antes de infinitivo.

**Resumo prático:** antes de substantivo, use "por". Antes de infinitivo, "para" é tolerado, mas "por" é mais rigoroso.`,
  },
  {
    id: "capaz_em",
    category: "regencia",
    pattern: /\bcapaz\s+em\b/gi,
    label: "Regência do adjetivo capaz",
    explanation: "'Capaz' rege a preposição 'de' — não 'em'.",
    wrong: "Ela é capaz em resolver qualquer problema.",
    right: "Ela é capaz de resolver qualquer problema.",
    detail: `## Capaz de ou capaz em?

"Capaz" exige a preposição "de":

✗  Capaz em resolver.
✓  Capaz de resolver.

✗  Incapaz em compreender.
✓  Incapaz de compreender.

**Família do erro:**
Vários adjetivos de capacidade/habilidade regem "de":
✓  Hábil de / Apto a (ou para) / Competente para / Capaz de

**Atenção ao "apto":** "apto a" e "apto para" são os dois aceitos. "Apto em" não existe.`,
  },
  {
    id: "favoravel_para",
    category: "regencia",
    pattern: /\bfavorável\s+para\b|\bfavoráveis\s+para\b/gi,
    label: "Regência do adjetivo favorável",
    explanation: "'Favorável' rege a preposição 'a' — não 'para'.",
    wrong: "A decisão foi favorável para nós.",
    right: "A decisão foi favorável a nós. / foi-nos favorável.",
    detail: `## Favorável a — regência nominal

"Favorável" exige "a" como preposição regente, não "para".

✗  Favorável para a proposta.
✓  Favorável à proposta.

✗  Condições favoráveis para o crescimento.
✓  Condições favoráveis ao crescimento.

**Mesmo padrão — adjetivos que regem "a":**
✓  Contrário a / Favorável a / Oposto a / Fiel a / Leal a / Hostil a`,
  },
  {
    id: "nunca_nao",
    category: "norma",
    pattern: /\bnunca\s+não\b|\bjamais\s+não\b|\bnem\s+não\b/gi,
    label: "Dupla negação — redundância sintática",
    explanation: "'Nunca', 'jamais' e 'nem' já são negativos — adicionar 'não' é redundante.",
    wrong: "Nunca não fiz isso.",
    right: "Nunca fiz isso. / Não fiz isso nunca.",
    detail: `## Dupla negação em português

O português não aceita dupla negação como reforço (ao contrário do inglês arcaico ou de certas línguas). Palavras como "nunca", "jamais", "nem", "ninguém", "nada" já carregam negação.

✗  Nunca não fiz isso.
✓  Nunca fiz isso. / Não fiz isso nunca.

✗  Jamais não voltarei.
✓  Jamais voltarei. / Não voltarei jamais.

✗  Nem não tentei.
✓  Nem tentei.

**Exceção legítima:** "Não … não" pode funcionar como ênfase em certas construções orais, mas é sempre marcado como informal e deve ser evitado na escrita padrão.

**Posição de "nunca" e "jamais":** podem vir antes ou depois do verbo:
✓  Nunca fiz isso.
✓  Não fiz isso nunca.
Ambas corretas — a versão com "não" antes do verbo é a mais neutra; a com "nunca/jamais" após é mais enfática.`,
  },
  {
    id: "apenas_somente",
    category: "pleonasmo",
    pattern: /\bapenas\s+somente\b|\bsó\s+apenas\b|\bsomente\s+apenas\b/gi,
    label: "Dois advérbios de exclusão (pleonasmo)",
    explanation: "'Apenas', 'somente' e 'só' são sinônimos. Usar dois ao mesmo tempo é redundante.",
    wrong: "Apenas somente uma pessoa entrou.",
    right: "Apenas uma pessoa entrou. / Somente uma pessoa entrou.",
    detail: `## Pleonasmo vicioso: advérbios de exclusão

"Apenas", "somente" e "só" têm o mesmo valor semântico de exclusão. Combiná-los é redundância pura.

✗  Apenas somente eu sabia.
✓  Apenas eu sabia. / Somente eu sabia. / Só eu sabia.

**Mesma família de erro:**
✗  Só apenas ele foi convidado.
✗  Somente apenas uma vez.

**Dica de estilo:**
- "Só" → mais informal, mais curto
- "Apenas" → neutro, versátil
- "Somente" → mais formal, bom no início de frase

Escolha um e mantenha consistência no texto.`,
  },
  {
    id: "encontrar_com",
    category: "regencia",
    pattern: /\bencontrar\s+com\b|\bencontrei\s+com\b/gi,
    label: "Regência do verbo encontrar",
    explanation: "'Encontrar' é transitivo direto — sem 'com'.",
    wrong: "Encontrei com o diretor ontem.",
    right: "Encontrei o diretor ontem.",
    detail: `## Encontrar com ou encontrar sem preposição?

Na norma culta, "encontrar" é transitivo direto — o complemento vem sem preposição.

✗  Encontrei com o diretor.
✓  Encontrei o diretor.

**"Encontrar-se com" (com reflexivo) é diferente:**
✓  Encontrei-me com o diretor. (= nos reunimos)
✓  Vamos nos encontrar com a equipe. (= reunião)

A forma com "se" indica encontro mútuo, deliberado. A forma sem "se" indica apenas ter visto, localizado.

**Na fala:** "encontrei com" é generalizado e dificilmente gera ambiguidade. Na escrita formal, prefira a forma direta.`,
  },
  {
    id: "quanto_mais_mas",
    category: "norma",
    pattern: /\bquanto\s+mais\s+.{1,40}?\s+mas\b/gi,
    label: "Correlação incorreta 'quanto mais...mas'",
    explanation: "A correlação correta é 'quanto mais...mais', não 'quanto mais...mas'.",
    wrong: "Quanto mais estudo, mas aprendo.",
    right: "Quanto mais estudo, mais aprendo.",
    detail: `## Correlação "quanto mais...mais" — não "mas"

"Mais" e "mas" são palavras diferentes com funções totalmente distintas. Na correlação proporcional, a palavra certa é "mais" — não "mas".

✗  Quanto mais trabalho, mas ganho.
✓  Quanto mais trabalho, mais ganho.

✗  Quanto mais ele fala, mas erra.
✓  Quanto mais ele fala, mais erra.

**As correlações proporcionais corretas:**
✓  Quanto mais... mais
✓  Quanto menos... menos
✓  Quanto mais... menos
✓  Quanto menos... mais

**"Mas" é adversativo:** "Trabalhei muito, mas não recebi." Não entra em correlações proporcionais.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 4 — SEMÂNTICA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "descriminar_discriminar",
    category: "paronimia",
    pattern: /\bdescrimin[aeiou]\w*\b/gi,
    label: "Paronímia: descriminar × discriminar",
    explanation: "'Discriminar' = segregar/distinguir. 'Descriminar' = retirar o caráter criminoso de algo.",
    wrong: "É errado descriminar pessoas por cor.",
    right: "É errado discriminar pessoas por cor.",
    detail: `## Discriminar × Descriminar — sentidos opostos

São parônimos — palavras parecidas com sentidos radicalmente diferentes.

**"Discriminar"** (dis + criminar) = distinguir, separar, tratar de forma diferente (geralmente injusta):
✓  Discriminar pessoas por raça é crime.
✓  O sistema discrimina quem não tem acesso digital.

**"Descriminar"** (des + criminar) = retirar o caráter criminoso, descriminalizar:
✓  O movimento luta para descriminar o aborto.
✓  A lei descriminou certas condutas.

**Mnemônica:** "DIS-criminar" vem de "distinguir" (separar). "DES-criminar" vem de "des-" (retirar) + "crime".

✗  Não descrimine pessoas pela aparência.
✓  Não discrimine pessoas pela aparência.`,
  },
  {
    id: "infligir_regra",
    category: "paronimia",
    pattern: /\binflig(?:ir|iu|e|em|indo|ido|iu|iram|isse|a|am|amos)\s+(?:a\s+)?(?:regra|norma|lei|contrato|acordo|regras|normas|leis)\b/gi,
    label: "Paronímia: infligir × infringir",
    explanation: "'Infringir' = violar uma norma. 'Infligir' = impor um castigo/sofrimento.",
    wrong: "Ele infligiu a lei.",
    right: "Ele infringiu a lei.",
    detail: `## Infligir × Infringir — dois verbos, dois sentidos

**"Infringir"** = violar, transgredir uma norma, lei ou regra:
✓  Infringiu o código de trânsito.
✓  A empresa infringiu o contrato.
✓  Infringir as regras tem consequências.

**"Infligir"** = causar, impor um sofrimento, punição ou dano:
✓  O juiz infligiu uma pena severa.
✓  A guerra infligiu sofrimento imensurável.

**Regra mnemônica:**
- infr**i**ngir = viol**ar** (contem "fring", lembre de "infração")
- infligir = impor (contem "flig", de "flagelo")

✗  Infligiu a lei trabalhista. (= violou a lei → infringiu)
✓  Infringiu a lei trabalhista.

✗  Infringiu uma punição severa. (= impôs → infligiu)
✓  Infligiu uma punição severa.`,
  },
  {
    id: "retificar_ratificar",
    category: "paronimia",
    pattern: /\bratific(?:ar|ou|a|am|ando|ado|amos|aram|asse|ará)\s+(?:o\s+)?(?:erro|engano|equívoco|informação\s+errada|dado\s+incorreto)\b/gi,
    label: "Paronímia: ratificar × retificar",
    explanation: "'Retificar' = corrigir um erro. 'Ratificar' = confirmar, aprovar.",
    wrong: "O governo ratificou o erro nos dados.",
    right: "O governo retificou o erro nos dados.",
    detail: `## Ratificar × Retificar — sentidos opostos

**"Ratificar"** = confirmar, aprovar, validar o que já foi dito ou feito:
✓  O Senado ratificou o tratado.
✓  Ratificou a decisão do júri.
✓  Venho ratificar o que disse antes.

**"Retificar"** = corrigir, emendar, desfazer um erro:
✓  Preciso retificar uma informação.
✓  O comunicado foi retificado.
✓  Retificou o caminho errado.

**Mnemônica:**
- r**a**tificar → r**a**tificação = v**a**lidar (vogal "a" de aprovação)
- r**e**tificar → r**e**to = corrigir, **e**ndireitar

✗  Ratificou o equívoco na nota oficial. (= confirmou o erro — quase certeza não é o que se quer dizer)
✓  Retificou o equívoco na nota oficial.`,
  },
  {
    id: "iminente_eminente",
    category: "paronimia",
    pattern: /\beminente\s+(?:perigo|risco|ameaça|colapso|queda|crise|catástrofe)\b|\bperigo\s+eminente\b|\brisco\s+eminente\b/gi,
    label: "Paronímia: iminente × eminente",
    explanation: "'Iminente' = prestes a acontecer. 'Eminente' = ilustre, elevado.",
    wrong: "Havia perigo eminente de acidente.",
    right: "Havia perigo iminente de acidente.",
    detail: `## Iminente × Eminente — os parônimos do risco

**"Iminente"** = que está prestes a ocorrer, imediato, impendente:
✓  Perigo iminente.
✓  Colapso iminente.
✓  A chuva era iminente.

**"Eminente"** = ilustre, notável, elevado (pessoa ou cargo):
✓  Um eminente jurista.
✓  Posição eminente na hierarquia.

**Como lembrar:**
- **im**inente → **im**ediato, **im**pendente (está vindo agora)
- **em**inente → **em**inência, **e**xcelência (elevado, digno)

✗  Risco eminente de epidemia.   (= risco notável? não faz sentido)
✓  Risco iminente de epidemia.   (= está prestes a acontecer)

✗  Um iminente doutor em medicina.  (= prestes a ser doutor? talvez, mas incomum)
✓  Um eminente doutor em medicina.  (= ilustre, respeitado)`,
  },
  {
    id: "principal_protagonista",
    category: "pleonasmo",
    pattern: /\bprincipal\s+protagonista\b|\bprotagonista\s+principal\b/gi,
    label: "Pleonasmo vicioso: protagonista",
    explanation: "'Protagonista' já significa 'personagem principal' — 'principal' é redundante.",
    wrong: "Ela é a principal protagonista da história.",
    right: "Ela é a protagonista da história.",
    detail: `## Pleonasmo vicioso: protagonista

"Protagonista" vem do grego *protos* (primeiro, principal) + *agonistes* (ator, lutador). A ideia de "principal" já está embutida na palavra.

✗  Principal protagonista.
✓  Protagonista.

✗  O protagonista principal do filme.
✓  O protagonista do filme.

**Uso correto de "protagonista":**
✓  Ela é a protagonista da série.
✓  O protagonista enfrenta conflitos internos.
✓  Cada personagem tem um papel — um é o protagonista.

**Atenção:** "protagonista" também pode ser usado metaforicamente:
✓  Os jovens são os protagonistas da mudança.
Mesmo assim, "principal protagonistas" seria redundante.`,
  },
  {
    id: "consenso_geral",
    category: "pleonasmo",
    pattern: /\bconsenso\s+geral\b|\bconsenso\s+unânime\b/gi,
    label: "Pleonasmo: consenso já é geral",
    explanation: "'Consenso' pressupõe acordo de todos — 'geral' é redundante.",
    wrong: "Chegamos a um consenso geral.",
    right: "Chegamos a um consenso.",
    detail: `## Pleonasmo: consenso geral

"Consenso" (do latim *consensus*) significa acordo de opiniões, consentimento coletivo. Já implica generalidade — é o que faz dele consenso.

✗  Consenso geral / consenso unânime
✓  Consenso

✗  Houve um consenso geral entre os participantes.
✓  Houve consenso entre os participantes.

**Família do erro — outros pleonasmos com substantivos que já implicam totalidade:**
✗  Monopólio exclusivo  →  ✓  Monopólio
✗  Hegemonia absoluta  →  ✓  Hegemonia
✗  Unanimidade total  →  ✓  Unanimidade`,
  },
  {
    id: "prever_antecipadamente",
    category: "pleonasmo",
    pattern: /\bprever\s+antecipadamente\b|\bprevisto\s+antecipadamente\b|\bpreveja\s+antecipadamente\b/gi,
    label: "Pleonasmo: prever + antecipadamente",
    explanation: "'Prever' já significa 'ver com antecedência' — 'antecipadamente' é redundante.",
    wrong: "É preciso prever antecipadamente os riscos.",
    right: "É preciso prever os riscos.",
    detail: `## Pleonasmo vicioso: prever + antecipadamente

"Prever" vem de *pré-* (antes) + *ver*. Significa literalmente "ver com antecedência". Adicionar "antecipadamente" é dizer o mesmo duas vezes.

✗  Prever antecipadamente.
✓  Prever.

✗  O relatório previu antecipadamente a crise.
✓  O relatório previu a crise.

**Família do erro — verbos com prefixo temporal redundado:**
✗  Antecipar previamente  →  ✓  Antecipar
✗  Recapitular novamente  →  ✓  Recapitular (já é "recapitular" = rever o que foi dito)
✗  Predizer de antemão    →  ✓  Predizer`,
  },
  {
    id: "fato_real",
    category: "pleonasmo",
    pattern: /\bfato\s+real\b|\bfatos\s+reais\b(?!\s+e\s+ficcionais|\s+e\s+imagin)/gi,
    label: "Pleonasmo: fato já é real",
    explanation: "'Fato' designa algo que aconteceu — é real por definição. 'Real' é redundante.",
    wrong: "Vou relatar um fato real.",
    right: "Vou relatar um fato.",
    detail: `## Pleonasmo vicioso: fato real

"Fato" (do latim *factum*) é algo que aconteceu, que existe na realidade. Por definição, todo fato é real — caso contrário, não é um fato, é uma ficção, hipótese ou mentira.

✗  Um fato real que aconteceu.
✓  Um fato que aconteceu.

**Exceção legítima:** quando "fato real" contrasta explicitamente com "fato ficcional":
✓  "Baseado em fatos reais" — contexto cinematográfico onde "fatos" pode se referir a eventos de uma narrativa.
✓  "Distinguir fatos reais de histórias inventadas" — o contraste justifica o adjetivo.

Fora do contraste explícito, "fato real" é redundante.`,
  },
  {
    id: "opiniao_pessoal",
    category: "pleonasmo",
    pattern: /\bopinião\s+pessoal\b|\bopiniões\s+pessoais\b/gi,
    label: "Pleonasmo: opinião já é pessoal",
    explanation: "'Opinião' é um julgamento subjetivo — é pessoal por natureza. 'Pessoal' é redundante.",
    wrong: "Na minha opinião pessoal, acho que está certo.",
    right: "Na minha opinião, está certo.",
    detail: `## Pleonasmo: opinião pessoal

"Opinião" é um julgamento, ponto de vista subjetivo — é intrinsecamente pessoal. Adicionar "pessoal" não acrescenta nada.

✗  Na minha opinião pessoal.
✓  Na minha opinião.

**Agravado:** "Na minha opinião pessoal, eu acho que" — três marcadores de subjetividade ao mesmo tempo. Escolha um.
✓  Na minha opinião, está certo.
✓  Acho que está certo.
✓  Do meu ponto de vista, está certo.

**Opinião coletiva:** "opinião pública" é correto — aqui "pública" distingue da opinião individual, tem função diferenciadora.`,
  },
  {
    id: "literalmente_hiperbole",
    category: "semantica",
    pattern: /\bliteralmente\s+(?:morri|matei|explodi|morreu|destruí|destruiu|enlouqueci|enlouqueceu|me\s+apaguei|apaguei)\b/gi,
    label: "Contradição semântica: literalmente + hipérbole",
    explanation: "'Literalmente' = de forma exata. Usá-lo com hipérboles cria contradição de sentido.",
    wrong: "Literalmente morri de vergonha.",
    right: "Quase morri de vergonha. / Praticamente morri de vergonha.",
    detail: `## "Literalmente" + hipérbole = contradição semântica

"Literalmente" significa "de forma literal, exata, não figurada". Hipérbole é exatamente o oposto — uma figura de linguagem que exagera para criar efeito.

Combiná-los é uma contradição:

✗  "Literalmente morri de vergonha."
→ Se fosse literal, você estaria morto. Como está escrevendo, foi figurado.

✗  "Literalmente explodi de raiva."
→ Explosões reais não permitem escrever depois.

**O que usar:**
✓  Quase morri de vergonha.
✓  Praticamente explodi de raiva.
✓  Fui abaixo de vergonha.
✓  Morri de vergonha. (sem o "literalmente" — a hipérbole funciona sozinha)

**Quando "literalmente" é correto:**
✓  "Ele literalmente correu 10 km." (fez isso de verdade)
✓  "A empresa literalmente dobrou de tamanho." (crescimento real)`,
  },
  {
    id: "no_caso_de_que",
    category: "norma",
    pattern: /\bno\s+caso\s+de\s+que\b/gi,
    label: "Galicismo/anglicismo 'no caso de que'",
    explanation: "Em português: 'no caso de' + infinitivo ou 'caso' + subjuntivo. Nunca 'no caso de que'.",
    wrong: "No caso de que chova, fique em casa.",
    right: "Caso chova, fique em casa. / No caso de chover, fique em casa.",
    detail: `## "No caso de que" — estrutura estrangeira

"No caso de que" é calco do espanhol (*en caso de que*) e do inglês (*in case that*). Não existe em português padrão.

**As formas corretas em português:**

**"Caso" + subjuntivo:**
✓  Caso chova, fique em casa.
✓  Caso haja problemas, informe imediatamente.

**"No caso de" + infinitivo:**
✓  No caso de chover, fique em casa.
✓  No caso de haver problemas, informe.

**"Se" + indicativo ou subjuntivo:**
✓  Se chover, fique em casa.
✓  Se houver problemas, informe.

✗  No caso de que você venha.
✓  Caso você venha. / Se você vier.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 5 — PONTUAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "no_entanto_sem_virgula",
    category: "pontuacao",
    pattern: /\bNo\s+entanto\s+(?=[a-záéíóúàâêôãõçü])/g,
    label: "Vírgula após 'No entanto'",
    explanation: "'No entanto' como conectivo exige vírgula imediatamente depois.",
    wrong: "No entanto o projeto avançou.",
    right: "No entanto, o projeto avançou.",
    detail: `## Vírgula obrigatória após conectivos adversativos

Conectivos como "no entanto", "porém", "todavia", "contudo", "entretanto" — quando usados no início ou meio de frase para expressar oposição — exigem vírgula após eles.

**Início de frase:**
✗  No entanto o resultado foi positivo.
✓  No entanto, o resultado foi positivo.

**Meio de frase (intercalado):**
✓  O projeto, no entanto, avançou bem.  (vírgula antes e depois)

**Por que a vírgula é obrigatória aqui?** O conectivo funciona como adjunto conjuncional — um elemento que conecta orações mas não é sujeito nem predicado da nova oração. Ele fica isolado por vírgula do restante.

**Mesma regra para:**
✓  Porém, o resultado...
✓  Todavia, não foi possível...
✓  Contudo, a situação melhorou...
✓  Entretanto, o prazo passou...`,
  },
  {
    id: "portanto_sem_virgula",
    category: "pontuacao",
    pattern: /\bPortanto\s+(?=[a-záéíóúàâêôãõçü])/g,
    label: "Vírgula após 'Portanto'",
    explanation: "'Portanto' é conectivo conclusivo — exige vírgula após ele.",
    wrong: "Portanto o trabalho foi aprovado.",
    right: "Portanto, o trabalho foi aprovado.",
    detail: `## Vírgula obrigatória após "Portanto"

"Portanto" é uma conjunção conclusiva — indica que o que vem depois é consequência do que foi dito antes. Como adjunto conjuncional, exige vírgula após si.

✗  Portanto o projeto foi aprovado.
✓  Portanto, o projeto foi aprovado.

**Alternativas sinônimas (mesma regra):**
✓  Logo, o projeto foi aprovado.
✓  Assim, o projeto foi aprovado.
✓  Consequentemente, o projeto foi aprovado.

**Quando "portanto" aparece no meio da frase:**
✓  O projeto, portanto, foi aprovado. (vírgulas de ambos os lados)`,
  },
  {
    id: "alem_disso_sem_virgula",
    category: "pontuacao",
    pattern: /\bAlém\s+disso\s+(?=[a-záéíóúàâêôãõçü])/g,
    label: "Vírgula após 'Além disso'",
    explanation: "'Além disso' é locução aditiva que exige vírgula após ela.",
    wrong: "Além disso o projeto foi entregue.",
    right: "Além disso, o projeto foi entregue.",
    detail: `## Vírgula obrigatória após locuções de transição

"Além disso" é uma locução adverbial aditiva de transição. Quando inicia uma oração, exige vírgula após a locução.

✗  Além disso o projeto foi entregue no prazo.
✓  Além disso, o projeto foi entregue no prazo.

**Família das locuções de transição — todas pedem vírgula:**
✓  Além disso, ...
✓  Por outro lado, ...
✓  Por sua vez, ...
✓  Em contrapartida, ...
✓  De fato, ...
✓  Por fim, ...
✓  Em suma, ...
✓  Ou seja, ...

**Dica dissertativa:** em textos argumentativos, essas locuções são ferramentas de coesão. Usá-las sem vírgula é o erro mais comum em redações.`,
  },
  {
    id: "ou_seja_sem_virgula",
    category: "pontuacao",
    pattern: /\bou\s+seja\s+(?=[a-záéíóúàâêôãõçü])/gi,
    label: "Vírgula após 'ou seja'",
    explanation: "'Ou seja' introduz explicação — exige vírgula antes e depois.",
    wrong: "A lei foi aprovada ou seja entrará em vigor amanhã.",
    right: "A lei foi aprovada, ou seja, entrará em vigor amanhã.",
    detail: `## "Ou seja" — locução explicativa com vírgulas

"Ou seja" introduz uma explicação, reformulação ou esclarecimento do que foi dito. Deve ser isolado por vírgulas dos dois lados.

**Estrutura correta:**
✓  ..., ou seja, ...

✗  A nota saiu ou seja foi aprovado.
✓  A nota saiu, ou seja, foi aprovado.

**Mesma regra para locuções explicativas:**
✓  ..., isto é, ...
✓  ..., quer dizer, ...
✓  ..., a saber, ...

**Dica:** se puder substituir "ou seja" por "em outras palavras" e ainda fizer sentido, a vírgula é obrigatória.`,
  },
  {
    id: "por_exemplo_sem_virgula",
    category: "pontuacao",
    pattern: /\bPor\s+exemplo\s+(?=[a-záéíóúàâêôãõçü])/g,
    label: "Vírgula após 'Por exemplo'",
    explanation: "'Por exemplo' como locução exemplificativa exige vírgula após ela.",
    wrong: "Por exemplo o caso do João foi resolvido.",
    right: "Por exemplo, o caso do João foi resolvido.",
    detail: `## Vírgula obrigatória após "Por exemplo"

"Por exemplo" é uma locução adverbial exemplificativa. Quando inicia ou interrompe a frase, exige vírgula.

**No início:**
✗  Por exemplo o caso foi diferente.
✓  Por exemplo, o caso foi diferente.

**No meio (intercalado):**
✓  O caso, por exemplo, foi diferente.  (vírgulas dos dois lados)

**Após dois-pontos:**
✓  Há várias soluções, como: por exemplo, pode-se...
Mas o mais comum e limpo é:
✓  Há várias soluções. Por exemplo, pode-se...

**Não use "como, por exemplo" sem vírgula:**
✗  Como por exemplo o João.
✓  Como, por exemplo, o João. / Como o João, por exemplo.`,
  },
  {
    id: "sujeito_virgula_verbo",
    category: "pontuacao",
    pattern: /\bO\s+diretor,\s+(?:é|foi|será|estava|decidiu|anunciou|precisa|deve|pode)\b|\bA\s+empresa,\s+(?:anunciou|decidiu|investiu|contratou|demitiu|lançou|precisa)\b|\bOs\s+alunos,\s+(?:foram|estão|devem|podem|precisam|realizaram)\b/g,
    label: "Vírgula entre sujeito e verbo (proibida)",
    explanation: "Nunca se separa sujeito e verbo com vírgula — isso parte ilegalmente a estrutura da oração.",
    wrong: "O diretor, anunciou a decisão.",
    right: "O diretor anunciou a decisão.",
    detail: `## Vírgula entre sujeito e verbo — regra proibida

Esta é uma das regras mais rígidas da pontuação: **nunca** se coloca vírgula entre o sujeito e o verbo. A vírgula parte a oração em ponto errado.

✗  O diretor, anunciou a decisão.
✓  O diretor anunciou a decisão.

✗  A empresa, vai mudar de sede.
✓  A empresa vai mudar de sede.

**Exceção legítima:** aposto explicativo ENTRE sujeito e verbo — aí o sujeito e o verbo ficam separados por duas vírgulas (uma abrindo e outra fechando o aposto):
✓  O diretor, João Silva, anunciou a decisão.
(O sujeito real é "O diretor" — as vírgulas isolam o aposto "João Silva")

**Como identificar:** se tirar o que está entre as vírgulas e a frase ainda fizer sentido, é aposto válido. Se não, a vírgula está errada.`,
  },
  {
    id: "reticencias_quatro",
    category: "pontuacao",
    pattern: /\.{4,}/g,
    label: "Reticências com mais de três pontos",
    explanation: "Reticências têm exatamente três pontos. Quatro ou mais é uso incorreto.",
    wrong: "Não sei.... pode ser.",
    right: "Não sei... pode ser.",
    detail: `## Reticências — exatamente três pontos

A norma estabelece que reticências (...) são sempre representadas por **exatamente três pontos**. Quatro ou mais pontos é uso incorreto.

✗  Não sei....
✗  Talvez.....
✓  Não sei...
✓  Talvez...

**O que as reticências indicam:**
- Pausa sugestiva, hesitação ou suspense
- Omissão em citação: "O autor afirma que '...a língua evolui...'"
- Interrupção de raciocínio
- Tom de continuidade implícita

**Não use ponto antes das reticências:**
✗  Terminou.…
✓  Terminou… (as reticências já encerram)

**No final de frase:** as reticências substituem o ponto final — não se colocam os dois juntos:
✗  Fui embora...
✓  Fui embora…  (sem ponto adicional após as reticências)`,
  },
  {
    id: "dois_pontos_verbo_ligacao",
    category: "pontuacao",
    pattern: /\b(?:são|é|eram|foram|estão)\s*:\s*(?:o\s+|a\s+|os\s+|as\s+|um\s+|uma\s+)\b/gi,
    label: "Dois-pontos após verbo de ligação",
    explanation: "Dois-pontos após 'é/são' antes de predicativo simples é uso incorreto.",
    wrong: "O resultado é: positivo.",
    right: "O resultado é positivo.",
    detail: `## Dois-pontos — quando usar e quando não usar

**Uso correto dos dois-pontos:**
1. Para introduzir enumeração: "Trouxe tudo: caneta, papel e borracha."
2. Para introduzir citação: 'Ele disse: "Virá amanhã."'
3. Para introduzir explicação/conclusão após oração: "A solução era simples: bastava perguntar."

**Uso incorreto — dois-pontos após verbo de ligação antes de predicativo simples:**
✗  O resultado é: positivo.
✓  O resultado é positivo.

✗  Os objetivos são: claros.
✓  Os objetivos são claros.

**Quando a enumeração torna o dois-pontos correto:**
✓  Os objetivos são: clareza, precisão e concisão.  (enumeração)
✓  O projeto é: ousado, inovador e sustentável.  (lista de adjetivos)

**A diferença:** com predicativo único, sem enumeração, o dois-pontos é desnecessário.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 6 — CRASE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "crase_a_medida_que",
    category: "crase",
    pattern: /\ba\s+medida\s+que\b/gi,
    label: "Crase obrigatória: à medida que",
    explanation: "'À medida que' é locução proporcional e exige crase. Não confundir com 'na medida em que'.",
    wrong: "A situação piora a medida que o tempo passa.",
    right: "A situação piora à medida que o tempo passa.",
    detail: `## À medida que × Na medida em que — distinção obrigatória

São duas expressões diferentes, com sentidos diferentes, e só uma delas leva crase.

**"À medida que"** = proporcionalmente, conforme (relação de proporção):
✓  À medida que estudamos, aprendemos mais.
✓  À medida que o tempo passa, tudo muda.
*A crase é obrigatória — preposição "a" + artigo "a" da locução.*

**"Na medida em que"** = porque, dado que (relação de causalidade):
✓  Na medida em que todos colaboraram, o projeto avançou.
*Sem crase — a preposição aqui é "em", não "a".*

**O erro duplo:** "na medida que" (sem "em") é forma incorreta de ambas:
✗  Na medida que o tempo passa...
✓  À medida que o tempo passa... (proporção)
✓  Na medida em que colaboraram... (causa)

**Mnemônica:** "À medida que" = à medida (proporção, ritmo). "Na medida em que" = na medida (dentro da razão de).`,
  },
  {
    id: "crase_a_primeira_vista",
    category: "crase",
    pattern: /\ba\s+primeira\s+vista\b/gi,
    label: "Crase obrigatória: à primeira vista",
    explanation: "'À primeira vista' é locução adverbial feminina — a crase é obrigatória.",
    wrong: "A primeira vista parecia fácil.",
    right: "À primeira vista parecia fácil.",
    detail: `## Crase obrigatória em locuções adverbiais femininas

"À primeira vista" é uma locução adverbial. O "a" aqui é a fusão da preposição "a" com o artigo definido feminino "a" — logo, crase obrigatória.

✗  A primeira vista, parecia simples.
✓  À primeira vista, parecia simples.

**Como verificar:** substitua por uma locução masculina equivalente. Se pede "ao", o feminino pede "à":
"Ao primeiro olhar" → "À primeira vista" ✓

**Locuções adverbiais femininas com crase obrigatória:**
✓  À primeira vista
✓  À mão (feito à mão)
✓  À vontade
✓  À toa
✓  À tarde, à noite
✓  À esquerda, à direita
✓  À beira de, à base de`,
  },
  {
    id: "crase_a_vontade",
    category: "crase",
    pattern: /\ba\s+vontade\b(?!\s+de\s+(?:ele|ela|você|nós|eles|elas))/gi,
    label: "Crase obrigatória: à vontade",
    explanation: "'À vontade' como locução adverbial sempre leva crase.",
    wrong: "Fique a vontade.",
    right: "Fique à vontade.",
    detail: `## Crase em "à vontade"

"À vontade" é uma locução adverbial no feminino. A preposição "a" funde com o artigo "a" = crase obrigatória.

✗  Fique a vontade.
✓  Fique à vontade.

✗  Pode comer a vontade.
✓  Pode comer à vontade.

**Dica de verificação:** substitua "vontade" por um substantivo masculino ("prazer"):
"Fique ao prazer" → confirma que pede artigo → o feminino pede crase.

**Atenção:** "a vontade de alguém" (= o desejo de alguém) não é locução adverbial — é substantivo com modificador:
✓  Respeitou a vontade dela.  (sem crase — "a" é artigo, não preposição)
✓  Fique à vontade.  (com crase — "à vontade" = livremente)`,
  },
  {
    id: "crase_a_noite_tarde",
    category: "crase",
    pattern: /\ba\s+noite\b(?!\s+de\s+(?:hoje|ontem|amanhã|\d))|\ba\s+tarde\b(?!\s+de\s+(?:hoje|ontem|amanhã|\d))/gi,
    label: "Crase obrigatória: à noite, à tarde",
    explanation: "'À noite' e 'à tarde' como locuções adverbiais de tempo levam crase.",
    wrong: "Saímos a noite para jantar.",
    right: "Saímos à noite para jantar.",
    detail: `## Crase em expressões de tempo femininas

"À noite", "à tarde", "à madrugada" são locuções adverbiais de tempo no feminino — exigem crase.

✗  Saímos a noite.
✓  Saímos à noite.

✗  Chegamos a tarde.
✓  Chegamos à tarde.

**Verificação:** substitua por expressão masculina — "ao anoitecer", "ao entardecer" — se cabe "ao", o feminino pede "à".

**Exceção:** "de noite" e "de tarde" — aqui a preposição é "de", sem artigo, portanto sem crase:
✓  Saímos de noite.  (= durante a noite — sem artigo)
✓  À noite saímos.  (= à hora da noite — com artigo)

**Mês/dia da semana:**
✓  Às segundas-feiras. ✓  Às 18h.  ✓  Na segunda.`,
  },
  {
    id: "crase_a_base_de",
    category: "crase",
    pattern: /\ba\s+base\s+de\b/gi,
    label: "Crase obrigatória: à base de",
    explanation: "'À base de' é locução prepositiva feminina — crase obrigatória.",
    wrong: "Vivia a base de café.",
    right: "Vivia à base de café.",
    detail: `## Crase em locuções prepositivas femininas

"À base de" é uma locução prepositiva — funciona como preposição composta. Como o núcleo é feminino ("base"), a crase é obrigatória.

✗  Vivia a base de café.
✓  Vivia à base de café.

✗  Construído a base de concreto.
✓  Construído à base de concreto.

**Outras locuções prepositivas femininas com crase obrigatória:**
✓  À beira de (à beira da estrada)
✓  À custa de (à custa de muito esforço)
✓  À mercê de (à mercê do vento)
✓  À luz de (à luz dos fatos)
✓  À moda de (à moda da casa)
✓  À sombra de (à sombra de uma árvore)`,
  },
  {
    id: "crase_proibida_verbo",
    category: "crase",
    pattern: /\bà\s+(?:fazer|ser|estar|ter|ir\b|vir\b|dizer|saber|poder|dever|querer|precisar|realizar|trabalhar|estudar|escrever|ler|correr|falar|pensar)\b/gi,
    label: "Crase proibida antes de verbo",
    explanation: "Crase nunca ocorre antes de verbos no infinitivo. Use 'a' simples.",
    wrong: "Começou à trabalhar cedo.",
    right: "Começou a trabalhar cedo.",
    detail: `## Crase proibida antes de verbos

Crase = preposição "a" + artigo "a". Verbos no infinitivo não aceitam artigo antes deles — portanto, não há crase antes de verbo.

✗  Começou à trabalhar.
✓  Começou a trabalhar.

✗  Foi à descansar.
✓  Foi descansar. / Foi para descansar.

✗  Resistiu à mudar de ideia.
✓  Resistiu a mudar de ideia.

**Regra prática:** se a próxima palavra é um verbo no infinitivo, nunca use "à" — sempre "a" simples.

**Como verificar:** tente substituir por "ao + infinitivo masculino". Se não cabe, é porque verbo não aceita artigo:
"ao trabalhar" — não se diz "vou ao trabalhar" (agramatical)
→ confirma que não há artigo → sem crase.`,
  },
  {
    id: "crase_proibida_pronome_pessoal",
    category: "crase",
    pattern: /\bà\s+(?:ela|elas|ele|eles|você|vocês|mim|nós|vós|mim\b)\b/gi,
    label: "Crase proibida antes de pronomes pessoais",
    explanation: "Nunca há crase antes de pronomes pessoais. Use 'a' simples.",
    wrong: "Entreguei à ela.",
    right: "Entreguei a ela. / Entreguei-lhe.",
    detail: `## Crase proibida antes de pronomes pessoais

Pronomes pessoais não admitem artigo antes deles — portanto, não há crase.

✗  Disse à ela.
✓  Disse a ela. / Disse-lhe.

✗  Entreguei à você.
✓  Entreguei a você.

✗  Referia-se à elas.
✓  Referia-se a elas.

**Todos os pronomes pessoais — sem crase:**
a ele / a ela / a eles / a elas / a você / a vocês / a mim / a nós / a vós

**Por que não há crase?** Crase é "a" (preposição) + "a" (artigo feminino). Pronomes pessoais não têm artigo — são palavras autossuficientes. Logo, não há fusão.

**Dica:** coloque um pronome masculino no lugar. Se ficaria "a ele" (sem crase), o feminino fica "a ela" (sem crase). Nunca "à ela".`,
  },
  {
    id: "crase_para_a",
    category: "crase",
    pattern: /\bpara\s+à\b/gi,
    label: "Crase impossível: para à",
    explanation: "Não há crase após outra preposição. Depois de 'para', use 'a' ou 'a + artigo', nunca 'à'.",
    wrong: "Vou para à escola.",
    right: "Vou para a escola.",
    detail: `## Crase impossível após preposição

Crase = preposição "a" + artigo "a". Se já há outra preposição antes ("para", "de", "em", "por", "com"), não pode haver outra preposição "a" — e portanto não pode haver crase.

✗  Vou para à escola.
✓  Vou para a escola.

✗  Saiu de à cidade.
✓  Saiu da cidade.  (de + a = da — contração, não crase)

✗  Chegou por à tarde.
✓  Chegou pela tarde.  (por + a = pela)

**Regra geral:** após qualquer preposição (para, de, em, com, por, sob, sobre, entre, desde, até, contra), nunca há crase.

**Exceção aparente:** "até à" — alguns gramáticos aceitam "até à praia" quando "até" é preposição e "à" é preposição + artigo. Mas "até a praia" (sem crase) também é correto e evita a discussão.`,
  },
  {
    id: "crase_paises_femininos",
    category: "crase",
    pattern: /\b(?:vou|foi|ir|fui|viajei|viajou|retornou|voltou|cheguei|chegou)\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Bélgica|Suécia|Noruega|Dinamarca|Grécia|Portugal|Irlanda|Áustria|Suíça|Argentina|Índia|China|Coreia|Finlândia|Hungria|Polônia|Romênia|Bulgária|Croácia|Eslovênia|Ucrânia|Rússia|Turquia)\b/gi,
    label: "Crase com países femininos que admitem artigo",
    explanation: "Países femininos com artigo definido ('a França', 'a Itália') exigem crase no destino.",
    wrong: "Viajei a França no verão.",
    right: "Viajei à França no verão.",
    detail: `## Crase com nomes de países — depende do artigo

A crase com países depende de um fator crucial: o país admite artigo definido?

**Com artigo → crase obrigatória no destino:**
✓  Fui à França. (a + a França = à França)
✓  Viajou à Itália.
✓  Voltou à Alemanha.
✓  Retornou à Argentina.

**Sem artigo → sem crase:**
✓  Fui a Cuba. (Cuba não admite artigo → sem crase)
✓  Viajou a Portugal. (Portugal é especial — geralmente sem artigo no BR)
✓  Retornou a Israel.

**Como saber se o país admite artigo:** diga "Gosto da ___" ou "Gosto do ___". Se funciona ("Gosto da França"), o país admite artigo feminino → usa crase quando precedido de "a" preposição.

**Retorno — usa contração "da":**
✓  Voltei da França. (de + a = da)
✓  Chegou da Itália.`,
  },
  {
    id: "na_medida_que_errado",
    category: "crase",
    pattern: /\bna\s+medida\s+que\b(?!\s+em)/gi,
    label: "Locução incorreta 'na medida que'",
    explanation: "A forma correta é 'na medida em que' (causa) ou 'à medida que' (proporção).",
    wrong: "Na medida que o tempo passa, aprendemos.",
    right: "À medida que o tempo passa, aprendemos. (proporção)",
    detail: `## "Na medida que" — forma incorreta

"Na medida que" (sem "em") mistura as duas locuções corretas e resulta em forma incorreta.

**As duas formas corretas:**

**"À medida que"** = proporcionalmente, conforme:
✓  À medida que estudamos, aprendemos.
✓  O ritmo aumenta à medida que praticamos.

**"Na medida em que"** = porque, dado que, na proporção em que (causal):
✓  Na medida em que todos colaboram, o resultado melhora.
✓  O projeto avança na medida em que há recursos.

**O que nunca existe:**
✗  Na medida que o tempo passa.
✓  À medida que o tempo passa.  (proporção → à medida que)

**Mnemônica:** se pode substituir por "conforme" → "à medida que". Se pode substituir por "porque/dado que" → "na medida em que".`,
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
        // Ignora palavras da lista negra (existem sem acento na maioria dos contextos)
        // e nomes próprios (inicial maiúscula em posição não-inicial de frase)
        const isPropNoun = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(word) && wm.index > 0;
        if (normed === word.toLowerCase() && !ACCENT_IGNORELIST.has(normed) && !isPropNoun) {
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
