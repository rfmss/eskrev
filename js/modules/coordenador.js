/**
 * coordenador.js — Coordenador Central (7 agentes linguísticos)
 *
 * Ativado por --c. Abre overlay full-screen sobre o editor, analisa o
 * texto com os 7 agentes e permite aplicar correções. Ao fechar, reinjeta
 * o texto corrigido como texto plano na página ativa.
 *
 * Animação de entrada: clip-path expande do centro para fora (efeito
 * Megazord — dois painéis que deslizam e se encaixam).
 *
 * Agente 7 — Léxico: spell-checker offline por distância de Levenshtein
 * contra o léxico pt_pos_lexicon.js (sem API, sem rede).
 */

import { ptPosLexicon } from "../../src/js/modules/pt_pos_lexicon.js";

// ── AGENTE 1 — ORTOGRAFIA ─────────────────────────────────────────────────
const R1 = [
  { e: /\bcesso\b/gi, c: "acesso", r: "'Acesso' não existe sem o 'a' inicial.", cat: "grafia", agt: 1 },
  { e: /\bexcessão\b/gi, c: "exceção", r: "'Exceção' não tem duplo 's'.", cat: "grafia", agt: 1 },
  { e: /\bbeneficiente\b/gi, c: "beneficente", r: "'Beneficente' não tem 'i' antes de 'ente'.", cat: "grafia", agt: 1 },
  { e: /\bimpecilho\b/gi, c: "empecilho", r: "'Empecilho' começa com 'em', não 'im'.", cat: "grafia", agt: 1 },
  { e: /\bconcenso\b/gi, c: "consenso", r: "'Consenso' não tem 'c' antes de 'n'.", cat: "grafia", agt: 1 },
  { e: /\bpreviligio\b/gi, c: "privilégio", r: "A grafia correta é 'privilégio'.", cat: "grafia", agt: 1 },
  { e: /\bintersecção\b/gi, c: "interseção", r: "'Interseção' perdeu o duplo 'cc' após 2009.", cat: "grafia", agt: 1 },
  { e: /\bvôo\b/gi, c: "voo", r: "Após 2009, 'vôo' perdeu o acento circunflexo.", cat: "acento", agt: 1 },
  { e: /\bzôo\b/gi, c: "zoo", r: "Após 2009, 'zôo' perdeu o acento circunflexo.", cat: "acento", agt: 1 },
  { e: /\bpára\b/gi, c: "para", r: "Após a reforma de 2009, 'pára' (verbo) perdeu o acento.", cat: "acento", agt: 1 },
  { e: /\bpólo\b/gi, c: "polo", r: "Após 2009, 'pólo' perdeu o acento diferencial.", cat: "acento", agt: 1 },
  { e: /\bfreqüente\b/gi, c: "frequente", r: "Após 2009, o trema foi eliminado do português.", cat: "acento", agt: 1 },
  { e: /\btranqüilo\b/gi, c: "tranquilo", r: "Após 2009, o trema foi eliminado.", cat: "acento", agt: 1 },
  { e: /\bporquê\s+(?![.\?!,])/gi, c: "porque", r: "'Porquê' com acento só aparece no final de frase ou como substantivo.", cat: "acento", agt: 1 },
  { e: /\bà\s+nível\b/gi, c: "em nível", r: "'A nível de' é galicismo. Use 'em nível de'.", cat: "norma", agt: 1 },
  { e: /\bmeia\s+noite\b/gi, c: "meia-noite", r: "'Meia-noite' é grafado com hífen.", cat: "hifen", agt: 1 },
  { e: /\bmeia\s+dia\b/gi, c: "meio-dia", r: "'Meio-dia' é grafado com hífen.", cat: "hifen", agt: 1 },
  { e: /\bguarda\s+chuva\b/gi, c: "guarda-chuva", r: "Compostos com 'guarda' levam hífen.", cat: "hifen", agt: 1 },
  // chegar: coberto pelo Agente 3 (R3) com regra completa
  { e: /\bprefiro\s+mais\b/gi, c: "prefiro", r: "'Prefiro' já indica comparação. 'Prefiro mais' é redundante.", cat: "pleonasmo", agt: 1 },
  // Contrações e registro informal
  { e: /\bpra\b/gi, c: "para", r: "'Pra' é contração informal de 'para'. Em escrita formal ou literária, prefira 'para'.", cat: "norma", agt: 1 },
  { e: /\bpro\b(?!\s*(?:rata|tempore|forma|xy|domo))/gi, c: "para o", r: "'Pro' é contração informal de 'para o'.", cat: "norma", agt: 1 },
  { e: /\bpros\b/gi, c: "para os", r: "'Pros' é contração informal de 'para os'.", cat: "norma", agt: 1 },
  { e: /\bpras\b/gi, c: "para as", r: "'Pras' é contração informal de 'para as'.", cat: "norma", agt: 1 },
  { e: /\bpq\b/gi, c: "porque / por quê", r: "'Pq' é abreviação informal. Use 'porque' (explicação) ou 'por quê' (pergunta).", cat: "norma", agt: 1 },
  // Mal vs mau
  { e: /\bmau\s+(?:humor|cheiro|hálito|gosto|jeito|exemplo|caminho|estado|sinal)\b/gi, c: "mau humor / mau cheiro…", r: "'Mau' (adjetivo = ruim) não se confunde com 'mal' (advérbio). Use 'mau' antes de substantivos.", cat: "grafia", agt: 1 },
  { e: /\bmal\s+(?:criado|educado|humorado|agradecido|tratado|comportado|entendido|estar|jeito)\b/gi, c: "mal-criado / mal-educado…", r: "Compostos com 'mal' + adjetivo/particípio levam hífen.", cat: "hifen", agt: 1 },
];

// ── AGENTE 2 — MORFOLOGIA ─────────────────────────────────────────────────
const R2 = [
  { e: /\bhouveram\b/gi, c: "houve", r: "'Haver' impessoal não se flexiona no plural. Use sempre 'houve'.", cat: "flexao_verbal", agt: 2 },
  { e: /\bfazem\s+(?:dois|três|quatro|cinco|seis|sete|oito|nove|dez|\d+)\s+anos?\b/gi, c: "faz … anos", r: "'Fazer' indicando tempo decorrido é impessoal: 'faz dois anos'.", cat: "flexao_verbal", agt: 2 },
  { e: /\beles\s+é\b/gi, c: "eles são", r: "Sujeito plural 'eles' exige verbo no plural.", cat: "concordancia", agt: 2 },
  { e: /\belas\s+é\b/gi, c: "elas são", r: "Sujeito plural 'elas' exige verbo no plural.", cat: "concordancia", agt: 2 },
  { e: /\bpessoal\s+(?:foram|estavam|disseram|fizeram)\b/gi, c: "pessoal foi / estava / disse / fez", r: "'Pessoal' é coletivo singular. O verbo fica no singular.", cat: "concordancia", agt: 2 },
  { e: /\ba\s+gente\s+(?:fomos|éramos|fizemos|viemos)\b/gi, c: "a gente foi / era / fez / veio", r: "'A gente' exige verbo na 3ª pessoa do singular.", cat: "concordancia", agt: 2 },
  { e: /\bmenas\b/gi, c: "menos", r: "'Menos' é invariável — não existe 'menas'.", cat: "flexao_nominal", agt: 2 },
  { e: /\bmais\s+melhor\b/gi, c: "melhor", r: "'Melhor' já é comparativo. 'Mais melhor' é pleonasmo.", cat: "grau", agt: 2 },
  { e: /\bmais\s+pior\b/gi, c: "pior", r: "'Pior' já é comparativo. 'Mais pior' é pleonasmo.", cat: "grau", agt: 2 },
  { e: /\bmais\s+maior\b/gi, c: "maior", r: "'Maior' já é comparativo. 'Mais maior' é redundante.", cat: "grau", agt: 2 },
  { e: /\bmuito\s+ótimo\b/gi, c: "ótimo", r: "'Ótimo' já é superlativo. 'Muito ótimo' é redundante.", cat: "grau", agt: 2 },
  { e: /\bmuito\s+péssimo\b/gi, c: "péssimo", r: "'Péssimo' já é superlativo. 'Muito péssimo' é redundante.", cat: "grau", agt: 2 },
  { e: /\bpor\s+isso\s+que\b/gi, c: "por isso", r: "'Por isso que' é redundante. Use 'por isso' ou 'é por isso que'.", cat: "classe_palavras", agt: 2 },
  { e: /\bonde\s+que\b/gi, c: "onde", r: "'Onde que' não é aceito na norma culta.", cat: "classe_palavras", agt: 2 },
  { e: /\bo\s+sentinela\b/gi, c: "a sentinela", r: "'Sentinela' é sempre feminino.", cat: "genero", agt: 2 },
  { e: /\bde\s+encontro\s+com\b/gi, c: "de encontro a / ao encontro de", r: "'De encontro a' = contra. 'Ao encontro de' = a favor.", cat: "semantica_morfologica", agt: 2 },
  // Formas verbais informais / coloquiais
  { e: /\btô\b|\btou\b/gi, c: "estou", r: "'Tô'/'Tou' são formas coloquiais de 'estou'. Em texto escrito, prefira a forma completa.", cat: "registro", agt: 2 },
  { e: /\btá\b/gi, c: "está", r: "'Tá' é forma coloquial de 'está'. Em texto escrito, prefira a forma completa.", cat: "registro", agt: 2 },
  { e: /\btô\s+(?:indo|vindo|fazendo|pensando|tentando|trabalhando|estudando|querendo|podendo)\b/gi, c: "estou indo / estou vindo…", r: "Use a forma completa 'estou' em vez de 'tô'.", cat: "registro", agt: 2 },
  // Abreviações informais
  { e: /\bvc\b/gi, c: "você", r: "'Vc' é abreviação informal de 'você'. Use a forma completa.", cat: "registro", agt: 2 },
  { e: /\btbm?\b/gi, c: "também", r: "'Tb'/'Tbm' são abreviações informais de 'também'.", cat: "registro", agt: 2 },
  { e: /\bmsm\b/gi, c: "mesmo", r: "'Msm' é abreviação informal de 'mesmo'.", cat: "registro", agt: 2 },
  { e: /\bqdo\b/gi, c: "quando", r: "'Qdo' é abreviação informal de 'quando'.", cat: "registro", agt: 2 },
  // Impessoal: "tem" existencial com plural → "há"
  { e: /\btem\s+(?:muitos?|muitas?|vários?|várias?|inúmeros?|inúmeras?|diversos?|diversas?|centenas?|milhares?|bilhões?)\b/gi, c: "há muitos / há vários…", r: "'Ter' como verbo existencial impessoal é coloquial. Na norma culta, use 'há': 'há muitos problemas'.", cat: "norma", agt: 2 },
  { e: /\btinham\s+(?:muitos?|muitas?|vários?|várias?)\b/gi, c: "havia muitos / havia vários…", r: "'Tinham' existencial impessoal deve ser 'havia': 'havia muitas pessoas'.", cat: "flexao_verbal", agt: 2 },
];

// ── AGENTE 3 — SINTAXE ────────────────────────────────────────────────────
// Filosofia: regras gramaticais, não banco de frases. Cada entrada codifica
// a REGRA (o que é correto) e captura qualquer desvio, independentemente das
// palavras específicas usadas — estilo lookahead negativo ou padrão aberto.
const R3 = [
  // ── Regência verbal — chegar ─────────────────────────────────────────────
  // REGRA: chegar rege "a" (ao/à/aos/às). Qualquer prep. locativa (em/no/na/nos/nas) é erro.
  { e: /\bcheg(?:ar|ou|ei|amos|aram|aste|armos|arão|ava|avas|ávamos|ando)\s+(?:em|no|na|nos|nas)\b/gi,
    c: "chegar a / ao / à…",
    r: "'Chegar' rege a preposição 'a' (ao/à/aos/às): 'chegar ao aeroporto', 'chegar à escola'. Nunca 'chegar no/na'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — ir ──────────────────────────────────────────────────
  // REGRA: ir rege "a" (ao/à). Qualquer forma + no/na/nos/nas é erro.
  { e: /\b(?:vou|fui|foi|irá|irei|iremos|irão|vamos|foram|iam|ia|ias|íamos)\s+(?:no|na|nos|nas)\s+\w+/gi,
    c: "vou ao / fui à…",
    r: "'Ir' rege a preposição 'a' (ao/à): 'vou ao médico', 'fui à farmácia'. Nunca 'vou no/na'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — assistir (presenciar) ───────────────────────────────
  // REGRA: "assistir" (ver/presenciar) é transitivo indireto — rege "a" (ao/à).
  // "Assistir o jogo" (OD direto) é erro; "assistir ao jogo" (OI) é correto.
  { e: /\bassistir\s+(?:o\b|os\b)\s+\w+/gi,
    c: "assistir ao / aos…",
    r: "'Assistir' no sentido de 'presenciar/ver' é transitivo indireto: 'assistir ao jogo', não 'assistir o jogo'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — visar (objetivar) ──────────────────────────────────
  // REGRA: "visar" (ter por objetivo) é transitivo indireto — rege "a".
  // Distingue de "visar" (assinar/carimbar), que é TD.
  { e: /\bvisar\s+(?:o\s+(?:lucro|resultado|objetivo|sucesso|crescimento|impacto|bem)|os\s+\w+)\b/gi,
    c: "visar ao lucro / aos objetivos…",
    r: "'Visar' (objetivar) é transitivo indireto: 'visar ao lucro', não 'visar o lucro'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — obedecer ───────────────────────────────────────────
  // REGRA: obedecer é transitivo indireto — rege "a" (à/às).
  // "Obedecer as/os X" (sem prep.) é erro; "obedecer às regras" é correto.
  { e: /\bobedece[rms]?\s+(?:as|os)\s+\w+/gi,
    c: "obedecer às / aos…",
    r: "'Obedecer' é transitivo indireto: 'obedecer às regras' (com crase), não 'obedecer as regras'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — implicar (acarretar) ───────────────────────────────
  { e: /\bimplicar\s+em\b/gi,
    c: "implicar (direto)",
    r: "'Implicar' no sentido de 'acarretar' é transitivo direto — sem preposição: 'isso implica responsabilidade'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — namorar ────────────────────────────────────────────
  { e: /\bnamorar\s+com\b/gi,
    c: "namorar (direto)",
    r: "'Namorar' é transitivo direto: 'ele namora Ana', não 'ele namora com Ana'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — esquecer / lembrar ─────────────────────────────────
  // REGRA: sem pronome reflexivo, estes verbos são TDs. "Esquecer de" sem pronome é coloquial.
  { e: /\b(?:esquecer|esqueci|esqueceu|esqueço|esquecemos|esqueceram)\s+de\b/gi,
    c: "esquecer / esquecer-se de",
    r: "Sem pronome: 'esqueci o nome'. Com pronome: 'esqueci-me do nome'. 'Esquecer de' sem pronome é coloquial.",
    cat: "regencia_verbal", agt: 3 },
  { e: /\b(?:lembrar|lembrei|lembrou|lembro|lembramos|lembraram)\s+de\b/gi,
    c: "lembrar / lembrar-se de",
    r: "Sem pronome: 'lembrei o nome'. Com pronome: 'lembrei-me do nome'. 'Lembrar de' sem pronome é coloquial.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência verbal — responder ──────────────────────────────────────────
  // REGRA: "responder" (dar resposta a algo) é transitivo indireto — rege "a".
  // "Responder o X" (OD) é erro; "responder ao X" é correto.
  { e: /\bresponder\s+(?:o\b|os\b)\s+\w+/gi,
    c: "responder ao / aos…",
    r: "'Responder' (dar resposta a algo) é transitivo indireto: 'responder ao email', não 'responder o email'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Regência nominal — capaz ──────────────────────────────────────────────
  // REGRA: "capaz" rege exclusivamente "de". Qualquer outra prep. é erro.
  { e: /\bcapaz\s+(?:em|para|a\b|por|com|sobre)\b/gi,
    c: "capaz de",
    r: "'Capaz' rege exclusivamente 'de': 'capaz de fazer'. 'Capaz em/para/por' são incorretos.",
    cat: "regencia_nominal", agt: 3 },

  // ── Regência nominal — ansioso ────────────────────────────────────────────
  { e: /\bansioso\s+para\b/gi,
    c: "ansioso por / ansioso com",
    r: "'Ansioso' rege 'por' ou 'com'. 'Ansioso para' é anglicismo (calco do inglês 'anxious to').",
    cat: "regencia_nominal", agt: 3 },

  // ── Regência nominal — imune ──────────────────────────────────────────────
  { e: /\bimune\s+de\b/gi,
    c: "imune a",
    r: "'Imune' rege exclusivamente 'a': 'imune a críticas', não 'imune de críticas'.",
    cat: "regencia_nominal", agt: 3 },

  // ── Para mim + infinitivo ─────────────────────────────────────────────────
  // REGRA: antes de infinitivo, o pronome é sujeito → "eu", nunca "mim" (oblíquo).
  // Padrão aberto: detecta qualquer infinitivo (-ar/-er/-ir/-or), sem lista de verbos.
  { e: /\bpara\s+mim\s+(?:\w+ar|\w+er|\w+ir|\w+or)\b/gi,
    c: "para eu fazer / para eu ir…",
    r: "Antes de verbo no infinitivo, o pronome deve ser sujeito ('eu'), não oblíquo ('mim'): 'para eu fazer'.",
    cat: "regencia_nominal", agt: 3 },

  // ── Colocação pronominal — se índice de indeterminação ───────────────────
  // REGRA: "se" indeterminador exige ênclise. Proclise ("se vende") é incorreta na escrita formal.
  { e: /\bse\s+(?:vende|aluga|precisa|faz|compra|procura|aceita|busca|contrata|oferece|entrega|atende)\b/gi,
    c: "vende-se / aluga-se / precisa-se…",
    r: "Com 'se' índice de indeterminação, a ênclise é obrigatória: 'vende-se', não 'se vende'.",
    cat: "colocacao_pronominal", agt: 3 },

  // ── Colocação pronominal — imperativo afirmativo ──────────────────────────
  { e: /\bMe\s+(?:diga|fala|conta|explica|mostra|ajuda|dê|faz|traz|manda|passa|diz)\b/g,
    c: "Diga-me / Fale-me / Conte-me…",
    r: "No imperativo afirmativo, o pronome vai depois do verbo: 'Diga-me', não 'Me diga'.",
    cat: "colocacao_pronominal", agt: 3 },

  // ── Registro — sendo que ──────────────────────────────────────────────────
  { e: /\bsendo\s+que\b/gi,
    c: "embora / uma vez que / pois / já que",
    r: "'Sendo que' é coloquial. Escolha a conjunção adequada: 'embora' (concessão), 'pois/já que' (causa).",
    cat: "registro", agt: 3 },

  // ── Aonde vs. onde ────────────────────────────────────────────────────────
  { e: /\baonde\s+(?!vou|vai|foram|ir|fica|você\s+vai|ele\s+vai)\b/gi,
    c: "onde",
    r: "'Aonde' indica movimento (destino). Para lugar sem movimento, use 'onde'.",
    cat: "regencia_verbal", agt: 3 },

  // ── Concordância verbal — nenhum dos ─────────────────────────────────────
  { e: /\bnenhum\s+dos\s+\w+\s+(?:foram|estavam|fizeram|disseram)\b/gi,
    c: "nenhum dos … (singular)",
    r: "Com 'nenhum dos', o verbo fica no singular: 'nenhum dos alunos foi'.",
    cat: "concordancia_verbal", agt: 3 },

  // ── Onde referencial — texto/situação ────────────────────────────────────
  { e: /\bonde\s+(?=\w+\s+(?:disse|afirmou|declarou|escreveu|relatou|menciona))/gi,
    c: "em que / no qual / na qual",
    r: "'Onde' indica lugar físico. Para contexto textual ou situação, use 'em que' ou 'no qual'.",
    cat: "ambiguidade", agt: 3 },
];

// ── AGENTE 4 — SEMÂNTICA ──────────────────────────────────────────────────
const R4 = [
  { e: /\bdescriminar\b/gi, c: "discriminar", r: "'Discriminar' = distinguir/segregar. 'Descriminar' = retirar caráter criminoso.", cat: "paronimia", agt: 4 },
  { e: /\bratificar\s+(?:uma\s+)?(?:erro|engano|equívoco)\b/gi, c: "retificar o erro", r: "'Retificar' = corrigir. 'Ratificar' = confirmar. Não se ratifica um erro.", cat: "paronimia", agt: 4 },
  { e: /\beminente\s+(?:perigo|risco|ameaça|colapso)\b/gi, c: "iminente perigo / risco iminente", r: "'Iminente' = prestes a acontecer. 'Eminente' = ilustre.", cat: "paronimia", agt: 4 },
  { e: /\bperigo\s+eminente\b/gi, c: "perigo iminente", r: "'Iminente' = prestes a ocorrer. 'Eminente' = notável.", cat: "paronimia", agt: 4 },
  { e: /\brisco\s+eminente\b/gi, c: "risco iminente", r: "'Iminente' = prestes a ocorrer. Use 'risco iminente'.", cat: "paronimia", agt: 4 },
  { e: /\binfligir\s+(?:uma\s+)?(?:regra|norma|lei|contrato)\b/gi, c: "infringir a regra / a norma", r: "'Infringir' = violar norma. 'Infligir' = impor castigo.", cat: "paronimia", agt: 4 },
  { e: /\bimergir\s+(?:do|da|de)\b/gi, c: "emergir de", r: "'Imergir' = mergulhar. Para 'sair de', use 'emergir'.", cat: "paronimia", agt: 4 },
  { e: /\bsubir\s+para\s+cima\b/gi, c: "subir", r: "'Subir' já implica movimento para cima. Pleonasmo vicioso.", cat: "pleonasmo", agt: 4 },
  { e: /\bdescer\s+(?:para\s+)?abaixo\b/gi, c: "descer", r: "'Descer' já implica movimento para baixo. Pleonasmo vicioso.", cat: "pleonasmo", agt: 4 },
  { e: /\belo\s+de\s+ligação\b/gi, c: "elo", r: "'Elo' já significa ligação. 'Elo de ligação' é pleonasmo.", cat: "pleonasmo", agt: 4 },
  { e: /\bconsenso\s+geral\b/gi, c: "consenso", r: "'Consenso' já pressupõe acordo geral. Redundante.", cat: "pleonasmo", agt: 4 },
  { e: /\bmonopólio\s+exclusivo\b/gi, c: "monopólio", r: "'Monopólio' já é domínio exclusivo. Pleonasmo.", cat: "pleonasmo", agt: 4 },
  { e: /\bprever\s+antecipadamente\b/gi, c: "prever", r: "'Prever' já é 'ver antes'. O advérbio é redundante.", cat: "pleonasmo", agt: 4 },
  { e: /\bencarar\s+de\s+frente\b/gi, c: "encarar", r: "'Encarar' já significa enfrentar de frente. Pleonasmo.", cat: "pleonasmo", agt: 4 },
  { e: /\brecapitular\s+novamente\b/gi, c: "recapitular", r: "'Recapitular' já implica retomar. 'Novamente' é redundante.", cat: "pleonasmo", agt: 4 },
  { e: /\bviés\s+tendencioso\b/gi, c: "viés", r: "'Viés' já denota inclinação tendenciosa.", cat: "pleonasmo", agt: 4 },
  { e: /\bfato\s+real\b/gi, c: "fato", r: "'Fato' já denota algo real. 'Fato real' é tautologia.", cat: "redundancia", agt: 4 },
  { e: /\bopinião\s+pessoal\b/gi, c: "opinião", r: "'Opinião' já é pessoal por natureza.", cat: "redundancia", agt: 4 },
  { e: /\bcolaborar\s+juntos\b/gi, c: "colaborar", r: "'Colaborar' já pressupõe ação conjunta.", cat: "redundancia", agt: 4 },
  { e: /\bdividir\s+em\s+duas\s+metades\b/gi, c: "dividir ao meio", r: "'Metade' já significa cada uma das duas partes. Redundante.", cat: "redundancia", agt: 4 },
  { e: /\bliteralmente\s+(?:morri|matei|explodi|destruí)\b/gi, c: "(remova 'literalmente' ou use 'quase')", r: "'Literalmente' = de forma exata, não figurada. Usá-lo com hipérboles é contradição semântica.", cat: "ambiguidade", agt: 4 },
  { e: /\bno\s+caso\s+de\s+que\b/gi, c: "no caso de / caso", r: "'No caso de que' é calco do espanhol/inglês. Use 'no caso de' + infinitivo ou 'caso' + subjuntivo.", cat: "inadequado", agt: 4 },
  // Parônimos e confusões semânticas frequentes
  { e: /\bcessão\s+de\s+(?:palavras?|voz|vez|lugar)\b/gi, c: "concessão de palavras / ceder a vez", r: "'Cessão' = transferência de direito. Para ceder vez/lugar, use 'ceder' ou 'concessão'.", cat: "paronimia", agt: 4 },
  { e: /\bseção\s+(?:eleitoral|de\s+votação)\b|\bsessão\s+(?:do\s+dente|odontológica)\b/gi, c: "seção eleitoral / sessão odontológica", r: "'Seção' = divisão/repartição. 'Sessão' = período/reunião. 'Cessão' = transferência.", cat: "paronimia", agt: 4 },
  { e: /\bao\s+invés\s+de\b/gi, c: "em vez de", r: "'Ao invés de' significa 'ao contrário de'. Para alternativa/substituição, use 'em vez de'.", cat: "paronimia", agt: 4 },
  { e: /\bporque\s+não\?/gi, c: "por que não?", r: "Em perguntas diretas ou indiretas, use 'por que' (separado e sem acento).", cat: "acento", agt: 4 },
  { e: /\bnão\s+obstante\s+(?:de\s+)?isso\b/gi, c: "não obstante isso / não obstante", r: "'Não obstante' não requer preposição 'de'. Diga 'não obstante isso' ou apenas 'não obstante'.", cat: "regencia_nominal", agt: 4 },
  { e: /\bapesar\s+que\b/gi, c: "apesar de (que)", r: "'Apesar de' rege preposição 'de'. 'Apesar que' não está consagrado; use 'apesar de que' ou 'embora'.", cat: "regencia_nominal", agt: 4 },
  { e: /\bem\s+função\s+que\b/gi, c: "em função de", r: "'Em função de' rege preposição 'de', não 'que'.", cat: "regencia_nominal", agt: 4 },
];

// ── AGENTE 5 — PONTUAÇÃO ──────────────────────────────────────────────────
const R5 = [
  { e: /\bO\s+diretor,\s+(?:é|foi|será|estava|decidiu|anunciou)\b/gi, c: "O diretor (sem vírgula)", r: "Não se usa vírgula entre sujeito simples e verbo.", cat: "virgula_proibida", agt: 5 },
  { e: /\bOs\s+alunos,\s+(?:foram|estão|devem|podem|precisam|realizam)\b/gi, c: "Os alunos (sem vírgula)", r: "Não se usa vírgula entre sujeito e verbo.", cat: "virgula_proibida", agt: 5 },
  { e: /\bA\s+empresa,\s+(?:anunciou|decidiu|investiu|contratou|demitiu|lançou)\b/gi, c: "A empresa (sem vírgula)", r: "Não se usa vírgula entre sujeito e verbo.", cat: "virgula_proibida", agt: 5 },
  { e: /\bNo\s+entanto\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "No entanto,", r: "'No entanto' é conjunção adversativa. Deve ser seguido de vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bPortanto\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Portanto,", r: "'Portanto' é conjunção conclusiva. Deve ser seguido de vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bEntretanto\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Entretanto,", r: "'Entretanto' é conjunção adversativa. Exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bAssim\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Assim,", r: "'Assim' como conectivo conclusivo deve ser seguido de vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bAlém\s+disso\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Além disso,", r: "'Além disso' é locução aditiva que exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bOu\s+seja\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Ou seja,", r: "'Ou seja' introduz explicação e exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bPor\s+exemplo\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Por exemplo,", r: "'Por exemplo' exige vírgula após a locução.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bDe\s+fato\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "De fato,", r: "'De fato' como conectivo deve ser seguido de vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bPor\s+(?:sua\s+vez|outro\s+lado|fim|último)\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Por sua vez, / Por outro lado, / Por fim,", r: "Locuções de transição exigem vírgula ao final.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bcomo\s*:\s*(?:por\s+exemplo|ex\.|e\.g\.)/gi, c: "como (sem dois-pontos)", r: "Após 'como', não se usam dois-pontos antes de 'por exemplo'.", cat: "dois_pontos", agt: 5 },
  { e: /\bsão\s*:\s*(?:o|a|os|as|um|uma)\b/gi, c: "são o / são a…", r: "Dois-pontos após verbo de ligação seguido de objeto simples é incorreto.", cat: "dois_pontos", agt: 5 },
  { e: /\bé\s*:\s*(?:o|a|os|as|um|uma)\b/gi, c: "é o / é a…", r: "Dois-pontos após 'é' antes de predicativo simples é uso incorreto.", cat: "dois_pontos", agt: 5 },
  { e: /\.{4,}/g, c: "…", r: "Reticências têm exatamente três pontos. Quatro ou mais é incorreto.", cat: "reticencias", agt: 5 },
  { e: /[.!?]\s*\.\.\./g, c: "… (sem ponto antes)", r: "Não se usa ponto antes de reticências. As reticências já encerram a frase.", cat: "reticencias", agt: 5 },
  // Vírgulas obrigatórias — conectivos frequentes
  { e: /\bContudo\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Contudo,", r: "'Contudo' é conjunção adversativa que exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bTodavia\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Todavia,", r: "'Todavia' é conjunção adversativa que exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bOutrossim\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Outrossim,", r: "'Outrossim' (além disso) como conectivo exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bDessa\s+forma\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Dessa forma,", r: "'Dessa forma' como locução conclusiva exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bDesse\s+modo\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Desse modo,", r: "'Desse modo' como locução conclusiva exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bPor\s+conseguinte\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Por conseguinte,", r: "'Por conseguinte' é locução conclusiva que exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  { e: /\bEm\s+suma\s+(?=[a-záéíóúàâêôãõçü])/gi, c: "Em suma,", r: "'Em suma' é locução conclusiva que exige vírgula.", cat: "virgula_obrigatoria", agt: 5 },
  // Hífen em palavras compostas comuns
  { e: /\bfim\s+de\s+semana\b/gi, c: "fim de semana", r: "Atenção: 'fim de semana' não leva hífen na norma do Acordo de 1990.", cat: "hifen", agt: 5 },
];

// ── AGENTE 6 — CRASE ──────────────────────────────────────────────────────
const R6 = [
  { e: /\ba\s+medida\s+que\b/gi, c: "à medida que", r: "'À medida que' é locução adverbial proporcional e exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\bna\s+medida\s+que\b/gi, c: "na medida em que / à medida que", r: "'Na medida em que' indica causa. 'À medida que' indica proporção. 'Na medida que' sem 'em' é incorreto.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+primeira\s+vista\b/gi, c: "à primeira vista", r: "'À primeira vista' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+toa\b/gi, c: "à toa", r: "'À toa' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+vontade\b/gi, c: "à vontade", r: "'À vontade' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+direita\b(?!\s+de)/gi, c: "à direita", r: "'À direita' como locução de lugar exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+esquerda\b(?!\s+de)/gi, c: "à esquerda", r: "'À esquerda' como locução de lugar exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+tarde\b(?!\s+de)/gi, c: "à tarde", r: "'À tarde' como locução de tempo exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+noite\b(?!\s+de)/gi, c: "à noite", r: "'À noite' como locução de tempo exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+base\s+de\b/gi, c: "à base de", r: "'À base de' é locução prepositiva que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+beira\s+de\b/gi, c: "à beira de", r: "'À beira de' é locução prepositiva que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+luz\s+de\b/gi, c: "à luz de", r: "'À luz de' (considerando) é locução que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+mercê\s+de\b/gi, c: "à mercê de", r: "'À mercê de' (sujeito ao poder de) exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+custa\s+de\b/gi, c: "à custa de", r: "'À custa de' é locução prepositiva que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+(?:uma|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s+horas?\b/gi, c: "às … horas", r: "Antes de horas determinadas, a crase é obrigatória: 'às três horas'.", cat: "crase_horas", agt: 6 },
  { e: /\bà\s+(?:seu|meu|nosso|vosso|este|esse|aquele|cada|qualquer|todo)\b/gi, c: "a seu / a meu / a nosso…", r: "Não há crase antes de pronomes possessivos ou demonstrativos masculinos.", cat: "crase_proibida", agt: 6 },
  { e: /\bà\s+(?:fazer|ser|estar|ter|ir|vir|dizer|saber|poder|dever|querer|precisar|realizar|trabalhar|estudar)\b/gi, c: "a fazer / a ser / a estar…", r: "Não há crase antes de verbos no infinitivo.", cat: "crase_proibida", agt: 6 },
  { e: /\bà\s+(?:ela|elas|ele|eles|você|vocês|mim|nós|vós)\b/gi, c: "a ela / a elas / a você…", r: "Não há crase antes de pronomes pessoais: 'disse a ela'.", cat: "crase_proibida", agt: 6 },
  { e: /\bpara\s+à\b/gi, c: "para a", r: "Não há crase após a preposição 'para'.", cat: "crase_proibida", agt: 6 },
  { e: /\bde\s+à\b/gi, c: "da", r: "Não há crase após a preposição 'de'. Use 'da'.", cat: "crase_proibida", agt: 6 },
  { e: /\bfoi\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Portugal|Grécia|Irlanda|Bélgica|Suécia)\b/gi, c: "foi à França / à Espanha…", r: "Países femininos com artigo exigem crase: 'foi à França'.", cat: "crase_paises", agt: 6 },
  { e: /\bvou\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Portugal|Grécia|Irlanda|Bélgica|Suécia)\b/gi, c: "vou à França / à Espanha…", r: "Países femininos com artigo exigem crase no destino: 'vou à França'.", cat: "crase_paises", agt: 6 },
  // Locuções adverbiais que exigem crase (sem o acento)
  { e: /\ba\s+última\s+hora\b/gi, c: "à última hora", r: "'À última hora' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+distância\b/gi, c: "à distância", r: "'À distância' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+força\b/gi, c: "à força", r: "'À força' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+mão\b/gi, c: "à mão", r: "'À mão' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+vista\b/gi, c: "à vista", r: "'À vista' (pagamento ou percepção) é locução que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+deriva\b/gi, c: "à deriva", r: "'À deriva' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+revelia\b/gi, c: "à revelia", r: "'À revelia' (sem consentimento) exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+flor\s+da\b/gi, c: "à flor da", r: "'À flor da pele' é locução que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+queima-roupa\b|\ba\s+queima\s+roupa\b/gi, c: "à queima-roupa", r: "'À queima-roupa' é locução adverbial que exige crase.", cat: "crase_obrigatoria", agt: 6 },
  { e: /\ba\s+(?:uma|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte)\s*(?:e\s*(?:meia|meia))?\s*h\b/gi, c: "às … h", r: "Antes de horas determinadas, a crase é obrigatória: 'às 15h'.", cat: "crase_horas", agt: 6 },
];

// ── TABELAS ────────────────────────────────────────────────────────────────
const PRIO_AGENTE = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
const PRIO_CAT = {
  grafia: 1, acento: 2, hifen: 3, crase_proibida: 4, crase_obrigatoria: 5,
  virgula_proibida: 6, regencia: 7, concordancia: 8, flexao_verbal: 9,
  virgula_obrigatoria: 10, colocacao_pronominal: 11, paronimia: 12,
  concordancia_verbal: 13, flexao_nominal: 14, grau: 15, genero: 16,
  dois_pontos: 17, norma: 18, pleonasmo: 19, registro: 20, classe_palavras: 21,
  redundancia: 22, ambiguidade: 23, reticencias: 24, aposto: 25,
  semantica_morfologica: 26, crase_horas: 5, crase_demonstrativo: 6,
  crase_paises: 7, inadequado: 27, regencia_verbal: 8, regencia_nominal: 9,
};
const AGENTES = {
  1: { nome: "Ortografia", cor: "#ff6b6b", sigla: "OR", regras: R1 },
  2: { nome: "Morfologia", cor: "#4dabf7", sigla: "MO", regras: R2 },
  3: { nome: "Sintaxe",    cor: "#69db7c", sigla: "SI", regras: R3 },
  4: { nome: "Semântica",  cor: "#ffd43b", sigla: "SE", regras: R4 },
  5: { nome: "Pontuação",  cor: "#f783ac", sigla: "PO", regras: R5 },
  6: { nome: "Crase",      cor: "#da77f2", sigla: "CR", regras: R6 },
  7: { nome: "Léxico",     cor: "#ff9f43", sigla: "LE", regras: []  },
};

const DEF_AGENTE = {
  1: "Ortografia — grafia correta das palavras, acentuação gráfica, uso do hífen e adequação à norma ortográfica vigente (Acordo de 2009).",
  2: "Morfologia — concordância nominal e verbal, flexão de número, gênero e grau, e classe gramatical das formas.",
  3: "Sintaxe — regras de regência (não banco de frases): detecta qualquer desvio de preposição, colocação pronominal e estrutura oracional por padrão aberto.",
  4: "Semântica — sentido das palavras: paronímia, ambiguidade, redundância e usos semanticamente inadequados.",
  5: "Pontuação — emprego correto de vírgula obrigatória e proibida, dois-pontos, reticências e delimitação de aposto.",
  6: "Crase — acento grave resultante da contração preposição + artigo feminino: uso obrigatório, proibido e contextual.",
  7: "Léxico — spell-checker offline por distância de Levenshtein: detecta prováveis erros de digitação e sugere a forma mais próxima no léxico.",
};
const COR_CAT = {
  grafia: "#ff6b6b", acento: "#cc5de8", hifen: "#4dabf7", regencia: "#20c997",
  concordancia: "#ff8787", flexao_verbal: "#4dabf7", flexao_nominal: "#66d9e8",
  grau: "#ffa94d", genero: "#da77f2", norma: "#ff922b", pleonasmo: "#a9e34b",
  classe_palavras: "#69db7c", semantica_morfologica: "#ff6b6b", paronimia: "#f03e3e",
  redundancia: "#d9480f", ambiguidade: "#5c7cfa", inadequado: "#862e9c",
  virgula_obrigatoria: "#f76707", virgula_proibida: "#e03131", dois_pontos: "#1971c2",
  reticencias: "#5c940d", aposto: "#ae3ec9", concordancia_verbal: "#f76707",
  colocacao_pronominal: "#e64980", registro: "#ae3ec9", regencia_verbal: "#20c997",
  regencia_nominal: "#0ca678", crase_obrigatoria: "#da77f2", crase_proibida: "#f03e3e",
  crase_horas: "#ffd43b", crase_demonstrativo: "#63e6be", crase_paises: "#ff922b",
  typo: "#ff9f43",
};
// ── AGENTE 7 — LÉXICO (Levenshtein offline) ───────────────────────────────

function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let cur = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const tmp = cur;
      cur = Math.min(prev[j] + 1, cur + 1, prev[j - 1] + cost);
      prev[j - 1] = tmp;
    }
    prev[b.length] = cur;
  }
  return prev[b.length];
}

function normWord(w) {
  try { return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  catch (_) { return w.toLowerCase(); }
}

function findSuggestions(norm, maxDist = 2, topN = 3) {
  const len = norm.length;
  const results = [];
  for (const [key, entry] of ptPosLexicon.entries) {
    // poda rápida por comprimento — Levenshtein ≥ |lenA - lenB|
    if (Math.abs(key.length - len) > maxDist) continue;
    const d = levenshtein(norm, key);
    if (d <= maxDist) results.push({ word: entry.word ?? key, key, dist: d });
  }
  return results
    .sort((a, b) => a.dist - b.dist || a.key.length - b.key.length)
    .slice(0, topN);
}

function executarLexico(texto) {
  if (!ptPosLexicon.coreLoaded) return [];
  const erros = [];
  const tokenRe = /[a-záàãâéêíóôõúüçñ'-]+/gi;
  let m;
  while ((m = tokenRe.exec(texto)) !== null) {
    const word = m[0];
    // ignora muito curtas, números, palavras iniciadas com maiúscula (nomes próprios)
    if (word.length <= 3) continue;
    if (/^\d/.test(word)) continue;
    if (/^[A-ZÁÀÃÂÉÊÍÓÔÕÚ]/.test(word)) continue;

    const norm = normWord(word);
    // já está no léxico → válida
    if (ptPosLexicon.entries.has(norm)) continue;
    // padrão explícito de guess() → forma provável válida
    const g = ptPosLexicon.guess(norm);
    if (g && !g.fallback) continue;

    // candidata a typo: busca os mais próximos
    const sugs = findSuggestions(norm, 2, 3);
    if (sugs.length === 0 || sugs[0].dist === 0) continue;

    const best = sugs[0].word;
    erros.push({
      inicio: m.index,
      fim:    m.index + word.length,
      texto:  word,
      certo:  best,
      sugs:   sugs.map(s => s.word),
      regra:  `Possíveis correções por distância de edição (Levenshtein).`,
      categoria: "typo",
      agente: 7,
      prioA:  7,
      prioC:  1,
    });
  }
  return erros;
}

const LABEL_CAT = {
  grafia: "Grafia", acento: "Acentuação", hifen: "Hífen", regencia: "Regência",
  concordancia: "Concordância", flexao_verbal: "Flexão Verbal", flexao_nominal: "Flexão Nominal",
  grau: "Grau", genero: "Gênero", norma: "Norma Culta", pleonasmo: "Pleonasmo",
  classe_palavras: "Classe", semantica_morfologica: "Semântica", paronimia: "Paronímia",
  redundancia: "Redundância", ambiguidade: "Ambiguidade", inadequado: "Uso Inadequado",
  virgula_obrigatoria: "Vírgula Obrig.", virgula_proibida: "Vírgula Proib.",
  dois_pontos: "Dois-Pontos", reticencias: "Reticências", aposto: "Aposto",
  concordancia_verbal: "Concordância V.", colocacao_pronominal: "Colocação Pron.",
  registro: "Registro", regencia_verbal: "Regência V.", regencia_nominal: "Regência N.",
  crase_obrigatoria: "Crase Obrig.", crase_proibida: "Crase Proib.",
  crase_horas: "Crase Horas", crase_demonstrativo: "Crase Demon.", crase_paises: "Crase Países",
  typo: "Typo",
};

// ── MOTOR ─────────────────────────────────────────────────────────────────
function executar(texto, ativos) {
  const candidatos = [];
  for (const id of ativos) {
    const agente = AGENTES[id];
    if (!agente) continue;
    for (const regra of agente.regras) {
      if (!regra.c || !regra.r) continue;
      const flags = regra.e.flags.includes("g") ? regra.e.flags : regra.e.flags + "g";
      const re = new RegExp(regra.e.source, flags);
      let m;
      while ((m = re.exec(texto)) !== null) {
        candidatos.push({
          inicio: m.index, fim: m.index + m[0].length,
          texto: m[0], certo: regra.c, regra: regra.r,
          categoria: regra.cat, agente: id,
          prioA: PRIO_AGENTE[id] ?? 99,
          prioC: PRIO_CAT[regra.cat] ?? 50,
        });
      }
    }
  }
  candidatos.sort((a, b) =>
    a.inicio !== b.inicio ? a.inicio - b.inicio
    : a.prioA !== b.prioA ? a.prioA - b.prioA
    : a.prioC - b.prioC
  );
  const out = [];
  let fim = -1;
  for (const c of candidatos) {
    if (c.inicio >= fim) { out.push(c); fim = c.fim; }
  }
  return out;
}

// ── HIGHLIGHT LAYER ───────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderHighlight(texto, erros) {
  let html = "";
  let cursor = 0;
  for (const erro of erros) {
    if (erro.inicio > cursor)
      html += escapeHtml(texto.slice(cursor, erro.inicio));
    const cor = COR_CAT[erro.categoria] || AGENTES[erro.agente]?.cor || "#fff";
    html += `<span class="coord-err" style="border-bottom-color:${cor}" data-idx="${erro.inicio}">` +
      escapeHtml(texto.slice(erro.inicio, erro.fim)) + `</span>`;
    cursor = erro.fim;
  }
  html += escapeHtml(texto.slice(cursor));
  // textarea adds a trailing newline that throws off sync — mirror it
  html += "\n";
  return html;
}

// ── DOM BUILDER ───────────────────────────────────────────────────────────
function buildOverlay() {
  const ov = document.createElement("div");
  ov.id = "coordOverlay";
  ov.className = "coord-overlay";
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-label", "Inspeção Linguística");

  ov.innerHTML = `
    <div class="coord-shell">

      <!-- ── TOPO: cabeçalho + agentes ── -->
      <div class="coord-top">
        <div class="coord-header">
          <div class="coord-title-text">
            <span class="coord-subtitle">Inspeção Linguística</span>
            <span class="coord-subtitle-tag">7 agentes</span>
          </div>
          <div class="coord-header-actions">
            <span class="coord-corrected" id="coordCorrected"></span>
            <button class="coord-apply-all" id="coordApplyAll" type="button">corrigir tudo</button>
            <button class="coord-close" id="coordClose" type="button" aria-label="Fechar">✕</button>
          </div>
        </div>
        <div class="coord-agents" id="coordAgents"></div>
        <div class="coord-defs" id="coordDefs"></div>
        <div class="coord-stat-bar" id="coordStatBar"></div>
      </div>

      <!-- ── MEIO: editor ── -->
      <div class="coord-editor-wrap">
        <div class="coord-highlight" id="coordHighlight" aria-hidden="true"></div>
        <textarea class="coord-textarea" id="coordTextarea"
          spellcheck="false"
          placeholder="Texto da página aparece aqui. Os 7 agentes inspecionam em paralelo…"></textarea>
      </div>

      <!-- ── BASE: filtros + fila ── -->
      <div class="coord-bot">
        <div class="coord-filters" id="coordFilters"></div>
        <div class="coord-queue" id="coordQueue"></div>
        <div class="coord-tech-panel" id="coordTechPanel"></div>
      </div>

    </div>

    <!-- Floater de detalhes ao hover -->
    <div class="coord-floater" id="coordFloater" aria-hidden="true"></div>
  `;

  document.body.appendChild(ov);
  return ov;
}

// ── ESTADO DO COORDENADOR ────────────────────────────────────────────────
let _state = null;

function resetState(texto) {
  return {
    texto,
    erros: [],
    ativos: new Set([1, 2, 3, 4, 5, 6, 7]),
    clickOrder: [1, 2, 3, 4, 5, 6, 7],   // ordem de ativação dos agentes
    filtro: null,
    totalCorrigidos: 0,
    debounceTimer: 0,
    sourceRange: null,   // preenchido no modo fragmento (seleção → inspecionar)
  };
}

function renderDefs() {
  const el = document.getElementById("coordDefs");
  if (!el) return;
  const lines = _state.clickOrder.filter(id => _state.ativos.has(id));
  if (lines.length === 0) { el.innerHTML = ""; return; }
  el.innerHTML = lines.map(id => {
    const agt = AGENTES[id];
    return `<div class="coord-def-line" style="--def-cor:${agt.cor}">${DEF_AGENTE[id]}</div>`;
  }).join("");
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function render() {
  const { texto, erros, ativos, filtro, totalCorrigidos } = _state;

  // Highlight layer
  const highlightEl = document.getElementById("coordHighlight");
  if (highlightEl) {
    highlightEl.innerHTML = renderHighlight(texto, erros);
  }

  // Stat: total corrigidos
  const correctedEl = document.getElementById("coordCorrected");
  if (correctedEl) {
    correctedEl.textContent = totalCorrigidos > 0 ? `✓ ${totalCorrigidos} corrigidos` : "";
  }

  // Apply-all button visibility
  const applyAllBtn = document.getElementById("coordApplyAll");
  if (applyAllBtn) {
    const filteredCount = filtro !== null
      ? erros.filter(e => e.agente === filtro).length
      : erros.length;
    applyAllBtn.style.display = filteredCount > 0 ? "" : "none";
    applyAllBtn.textContent = `corrigir tudo (${filteredCount})`;
  }

  // Agent chips
  const agentsEl = document.getElementById("coordAgents");
  if (agentsEl) {
    agentsEl.innerHTML = "";
    for (const [id, agt] of Object.entries(AGENTES)) {
      const numId = Number(id);
      const count = erros.filter(e => e.agente === numId).length;
      const ativo = ativos.has(numId);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "coord-agent-chip" + (ativo ? " is-active" : "");
      chip.dataset.agentId = id;
      chip.style.setProperty("--agt-cor", agt.cor);
      chip.title = `${agt.nome} — ${DEF_AGENTE[numId] || ""}`;
      chip.innerHTML = `
        <span class="coord-chip-sigla">${agt.sigla}</span>
        <span class="coord-chip-count">${ativo ? (count > 0 ? count : "·") : "off"}</span>
      `;
      agentsEl.appendChild(chip);
    }
  }

  // Def lines (abaixo dos chips, acima do editor)
  renderDefs();

  // Stat bar
  const statBar = document.getElementById("coordStatBar");
  if (statBar) {
    const active = Object.entries(AGENTES)
      .map(([id, a]) => ({ id: Number(id), ...a, count: erros.filter(e => e.agente === Number(id)).length }))
      .filter(s => s.count > 0 && ativos.has(s.id));
    if (active.length > 0) {
      statBar.innerHTML = `
        <span class="coord-stat-label">DISTRIBUIÇÃO:</span>
        ${active.map(s => `<span class="coord-stat-chip" style="color:${s.cor};border-color:${s.cor}40;background:${s.cor}12">${s.sigla} ${s.count}</span>`).join("")}
        <span class="coord-stat-total">total: ${erros.length}</span>
      `;
      statBar.style.display = "";
    } else {
      statBar.style.display = "none";
    }
  }

  // Filters
  const filtersEl = document.getElementById("coordFilters");
  if (filtersEl) {
    if (erros.length > 0) {
      const active = Object.entries(AGENTES)
        .map(([id, a]) => ({ id: Number(id), ...a, count: erros.filter(e => e.agente === Number(id)).length }))
        .filter(s => s.count > 0 && ativos.has(s.id));
      filtersEl.style.display = "";
      filtersEl.innerHTML = `
        <span class="coord-filter-label">FILTRAR:</span>
        <button type="button" class="coord-filter-btn ${filtro === null ? "is-active" : ""}" data-filtro="all">
          todos (${erros.length})
        </button>
        ${active.map(s => `
          <button type="button" class="coord-filter-btn ${filtro === s.id ? "is-active" : ""}"
            data-filtro="${s.id}" style="--agt-cor:${s.cor}">
            ${s.sigla} (${s.count})
          </button>`).join("")}
      `;
    } else {
      filtersEl.style.display = "none";
    }
  }

  // Correction queue
  const queueEl = document.getElementById("coordQueue");
  if (queueEl) {
    const lista = filtro !== null ? erros.filter(e => e.agente === filtro) : erros;
    if (lista.length === 0) {
      queueEl.innerHTML = erros.length === 0
        ? `<p class="coord-empty">Nenhuma ocorrência encontrada.</p>`
        : `<p class="coord-empty">Sem ocorrências para o agente selecionado.</p>`;
    } else {
      queueEl.innerHTML = lista.map((erro, i) => {
        const cor = COR_CAT[erro.categoria] || AGENTES[erro.agente]?.cor || "#4dabf7";
        const label = LABEL_CAT[erro.categoria] || erro.categoria;
        const agt = AGENTES[erro.agente];
        const fixBtns = erro.sugs?.length > 0
          ? erro.sugs.map(sug => `<button type="button" class="coord-queue-fix" data-erro-inicio="${erro.inicio}" data-certo="${escapeHtml(sug)}" style="border-color:${cor}40">${escapeHtml(sug)}</button>`).join("")
          : `<button type="button" class="coord-queue-fix" data-erro-inicio="${erro.inicio}" style="border-color:${cor}40">${escapeHtml(erro.certo)}</button>`;
        return `
          <div class="coord-queue-item" data-queue-idx="${i}" style="border-left-color:${cor}">
            <span class="coord-queue-sigla" style="color:${agt?.cor};background:${agt?.cor}14;border-color:${agt?.cor}30">${agt?.sigla}</span>
            <div class="coord-queue-body">
              <div class="coord-queue-pair">
                <span class="coord-queue-wrong">${escapeHtml(erro.texto)}</span>
                <span class="coord-queue-arrow">→</span>
                ${fixBtns}
                <span class="coord-queue-cat" style="color:${cor};background:${cor}14;border-color:${cor}30">${label}</span>
              </div>
              <div class="coord-queue-rule">${escapeHtml(erro.regra)}</div>
            </div>
            <button type="button" class="coord-queue-apply" data-erro-inicio="${erro.inicio}">corrigir</button>
          </div>
        `;
      }).join("");
    }
  }

  // Tech panel
  const techEl = document.getElementById("coordTechPanel");
  if (techEl) {
    const totalRegras = [R1,R2,R3,R4,R5,R6].flat().filter(r => r.c).length;
    const lexEntries = ptPosLexicon.entries.size;
    const ativosArr = [...ativos].sort().join(", ");
    techEl.innerHTML = `
      <span>agentes_ativos: [${ativosArr}]</span>
      <span>regras_totais: ${totalRegras} · léxico: ${lexEntries} entradas</span>
      <span>deduplicação: sobreposição + prioridade agente × categoria</span>
      <span>debounce: 600ms · corrigir_tudo: offset acumulado</span>
      <span>fila_ativa: ${erros.length} ocorrência${erros.length !== 1 ? "s" : ""}</span>
      <span>agentes: OR · MO · SI · SE · PO · CR · LE — todos integrados</span>
    `;
  }
}

// ── CORREÇÃO ───────────────────────────────────────────────────────────────
function aplicarErro(inicio, certoOverride) {
  const erro = _state.erros.find(e => e.inicio === inicio);
  if (!erro) return;
  const certo = certoOverride ?? erro.certo;
  _state.texto = _state.texto.slice(0, erro.inicio) + certo + _state.texto.slice(erro.fim);
  _state.totalCorrigidos++;
  analyzeAndRender();
  syncTextarea();
}

function aplicarTudo() {
  const lista = (_state.filtro !== null
    ? _state.erros.filter(e => e.agente === _state.filtro)
    : [..._state.erros]
  ).sort((a, b) => a.inicio - b.inicio);

  let t = _state.texto;
  let off = 0;
  for (const e of lista) {
    t = t.slice(0, e.inicio + off) + e.certo + t.slice(e.fim + off);
    off += e.certo.length - (e.fim - e.inicio);
  }
  _state.texto = t;
  _state.totalCorrigidos += lista.length;
  analyzeAndRender();
  syncTextarea();
}

function syncTextarea() {
  const ta = document.getElementById("coordTextarea");
  if (ta && ta.value !== _state.texto) ta.value = _state.texto;
}

function analyzeAndRender() {
  const base = executar(_state.texto, _state.ativos);
  const lexico = _state.ativos.has(7) ? executarLexico(_state.texto) : [];
  _state.erros = [...base, ...lexico].sort((a, b) => a.inicio - b.inicio);
  render();
}

// ── EVENT DELEGATION ───────────────────────────────────────────────────────
function attachEvents(ov, ctx, sourceEl) {
  const ta = ov.querySelector("#coordTextarea");
  const highlight = ov.querySelector("#coordHighlight");
  const floater = ov.querySelector("#coordFloater");

  // Textarea input → update state + re-analyze (debounced 600ms)
  ta.addEventListener("input", () => {
    _state.texto = ta.value;
    clearTimeout(_state.debounceTimer);
    _state.debounceTimer = setTimeout(analyzeAndRender, 600);
    // Sync highlight immediately for scroll continuity
    if (highlight) highlight.innerHTML = renderHighlight(_state.texto, _state.erros) ;
  });

  // Sync scroll between textarea and highlight layer
  ta.addEventListener("scroll", () => {
    if (highlight) {
      highlight.scrollTop = ta.scrollTop;
      highlight.scrollLeft = ta.scrollLeft;
    }
  });

  // Highlight layer: hover over error span → show floater
  highlight.addEventListener("mouseover", (ev) => {
    const span = ev.target.closest(".coord-err");
    if (!span || !floater) return;
    const idx = Number(span.dataset.idx);
    const erro = _state.erros.find(e => e.inicio === idx);
    if (!erro) return;
    const cor = COR_CAT[erro.categoria] || AGENTES[erro.agente]?.cor || "#4dabf7";
    const agt = AGENTES[erro.agente];
    floater.innerHTML = `
      <div class="coord-floater-header">
        <span class="coord-floater-agt" style="color:${agt?.cor};background:${agt?.cor}18;border-color:${agt?.cor}33">
          AGT ${erro.agente} · ${agt?.nome?.toUpperCase()}
        </span>
        <span class="coord-floater-cat" style="color:${cor};background:${cor}14;border-color:${cor}30">
          ${LABEL_CAT[erro.categoria] || erro.categoria}
        </span>
      </div>
      <p class="coord-floater-rule">${escapeHtml(erro.regra)}</p>
      <div class="coord-floater-pair">
        <span class="coord-floater-wrong">${escapeHtml(erro.texto)}</span>
        <span class="coord-floater-arrow">→</span>
        ${erro.sugs?.length > 0
          ? erro.sugs.map(sug => `<button type="button" class="coord-floater-fix" data-erro-inicio="${erro.inicio}" data-certo="${escapeHtml(sug)}" style="border-color:${cor}40">${escapeHtml(sug)}</button>`).join("")
          : `<button type="button" class="coord-floater-fix" data-erro-inicio="${erro.inicio}" style="border-color:${cor}40">${escapeHtml(erro.certo)}</button>`}
      </div>
      <span class="coord-floater-hint">clique na correção para aplicar</span>
    `;
    const rect = span.getBoundingClientRect();
    const ww = window.innerWidth;
    let left = rect.left;
    if (left + 320 > ww) left = ww - 328;
    let top = rect.bottom + 6;
    floater.style.left = left + "px";
    floater.style.top = top + "px";
    floater.classList.add("is-visible");
    floater.setAttribute("aria-hidden", "false");
  });

  highlight.addEventListener("mouseleave", () => {
    floater?.classList.remove("is-visible");
    floater?.setAttribute("aria-hidden", "true");
  });

  // Click on correction in floater
  floater.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".coord-floater-fix");
    if (!btn) return;
    aplicarErro(Number(btn.dataset.erroInicio), btn.dataset.certo || undefined);
    floater.classList.remove("is-visible");
  });

  // Delegate: agent chip toggle
  ov.addEventListener("click", (ev) => {
    const chip = ev.target.closest(".coord-agent-chip");
    if (chip) {
      const id = Number(chip.dataset.agentId);
      if (_state.ativos.has(id)) {
        _state.ativos.delete(id);
        _state.clickOrder = _state.clickOrder.filter(x => x !== id);
      } else {
        _state.ativos.add(id);
        _state.clickOrder = [..._state.clickOrder.filter(x => x !== id), id];
      }
      analyzeAndRender();
      return;
    }

    // Filter button
    const filterBtn = ev.target.closest(".coord-filter-btn");
    if (filterBtn) {
      const val = filterBtn.dataset.filtro;
      _state.filtro = val === "all" ? null : Number(val);
      render();
      return;
    }

    // Apply individual (queue item)
    const fixBtn = ev.target.closest(".coord-queue-fix, .coord-queue-apply");
    if (fixBtn) {
      aplicarErro(Number(fixBtn.dataset.erroInicio), fixBtn.dataset.certo || undefined);
      return;
    }

    // Apply all
    if (ev.target.closest("#coordApplyAll")) {
      aplicarTudo();
      return;
    }

    // Close
    if (ev.target.closest("#coordClose")) {
      closeOverlay(ctx, sourceEl);
      return;
    }
  });

  // Keyboard Escape → close
  ov.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      ev.preventDefault();
      closeOverlay(ctx, sourceEl);
    }
  });
}

// ── OPEN / CLOSE ───────────────────────────────────────────────────────────
export function openCoordenador(ctx, textoOverride, sourceRange) {
  // Determina a página ativa
  const sourceEl = ctx.state?.pages?.find(p => p === document.activeElement)
    || ctx.state?.pages?.[0]
    || document.querySelector(".pageContent");
  if (!sourceEl) return;

  let texto;
  if (textoOverride !== undefined) {
    texto = textoOverride;
  } else {
    const _cloneForText = sourceEl.cloneNode(true);
    _cloneForText.querySelectorAll(".slice").forEach(s => s.remove());
    texto = _cloneForText.innerText || "";
  }

  // Cria ou reutiliza overlay
  let ov = document.getElementById("coordOverlay");
  if (!ov) {
    ov = buildOverlay();
    attachEvents(ov, ctx, sourceEl);
  }

  // Guarda referência ao sourceEl para o close
  ov.dataset.sourceId = sourceEl.id || "";
  ov._sourceEl = sourceEl; // referência direta

  _state = resetState(texto);
  if (sourceRange) _state.sourceRange = sourceRange;
  analyzeAndRender();
  syncTextarea();

  // Carrega léxico em background → re-analisa quando pronto (Agent 7)
  if (!ptPosLexicon.coreLoaded) {
    ptPosLexicon.loadCore().then(() => {
      if (_state) analyzeAndRender();
    }).catch(() => {});
  }

  // Abre com animação
  ov.classList.add("is-open");
  document.body.style.overflow = "hidden";
  ctx.setStatus?.("coordenador central: aberto");

  // Foca na textarea após animação
  setTimeout(() => {
    const ta = ov.querySelector("#coordTextarea");
    ta?.focus();
  }, 480);
}

function closeOverlay(ctx, sourceEl) {
  const ov = document.getElementById("coordOverlay");
  if (!ov) return;

  // Reinjeta texto corrigido via execCommand para preservar a pilha de undo (Ctrl+Z)
  const target = ov._sourceEl || sourceEl;
  if (_state?.sourceRange) {
    // Modo fragmento: substitui apenas a seleção original
    try {
      target?.focus();
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(_state.sourceRange);
      document.execCommand("insertText", false, _state.texto);
      target?.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (_) {}
  } else if (target && _state) {
    // Modo página inteira: seleciona tudo e substitui via execCommand
    target.focus();
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("insertText", false, _state.texto);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  }

  ov.classList.remove("is-open");
  document.body.style.overflow = "";
  ctx.setStatus?.("coordenador central: fechado");

  // Foca de volta no editor
  setTimeout(() => {
    const target2 = ov._sourceEl || sourceEl;
    target2?.focus();
  }, 50);
}

// ── INIT ────────────────────────────────────────────────────────────────────
export function initCoordenador(ctx) {
  // Coordenador é aberto via --c (slices.js) — sem listeners globais necessários.
  // Esta função existe para consistência com os outros módulos.
  void ctx;
}
