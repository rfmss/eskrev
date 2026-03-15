import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// COORDENADOR CENTRAL v1.0
// Integra os 6 agentes: Ortografia, Morfologia, Sintaxe,
// Semântica, Pontuação e Crase.
// Lógica: prioridade dupla (agente × categoria),
// deduplicação por sobreposição, fila unificada,
// filtros por agente, relatório e correção em lote.
// ============================================================

// ── AGENTE 1 — ORTOGRAFIA ────────────────────────────────────
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
  { e: /\bchegou\s+em\b/gi, c: "chegou a", r: "'Chegar' rege preposição 'a', não 'em'.", cat: "regencia", agt: 1 },
  { e: /\bprefiro\s+mais\b/gi, c: "prefiro", r: "'Prefiro' já indica comparação. 'Prefiro mais' é redundante.", cat: "pleonasmo", agt: 1 },
];

// ── AGENTE 2 — MORFOLOGIA ─────────────────────────────────────
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
];

// ── AGENTE 3 — SINTAXE ────────────────────────────────────────
const R3 = [
  { e: /\bassistir\s+(?:o\s+jogo|o\s+filme|o\s+programa|o\s+show|o\s+espetáculo|os\s+jogos)\b/gi, c: "assistir ao jogo / ao filme", r: "'Assistir' no sentido de ver é transitivo indireto: 'assistir ao jogo'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bvisar\s+(?:o\s+lucro|o\s+resultado|o\s+objetivo|os\s+resultados)\b/gi, c: "visar ao lucro / ao objetivo", r: "'Visar' (objetivar) é transitivo indireto: 'visar a'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bobedece[rm]?\s+(?:as|a)\s+(?:regra|lei|norma|ordem|regras|leis|normas|ordens)\b/gi, c: "obedecer às regras / à lei", r: "'Obedecer' é transitivo indireto: 'obedecer à lei'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bimplicar\s+em\b/gi, c: "implicar (direto)", r: "'Implicar' no sentido de acarretar é transitivo direto — sem 'em'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bnamorar\s+com\b/gi, c: "namorar (direto)", r: "'Namorar' é transitivo direto: 'ele namora Ana'.", cat: "regencia_verbal", agt: 3 },
  { e: /\besquecer\s+de\b/gi, c: "esquecer / esquecer-se de", r: "'Esquecer de' sem pronome é coloquial. Use 'esqueci o nome' ou 'esqueci-me do nome'.", cat: "regencia_verbal", agt: 3 },
  { e: /\blembrar\s+de\b/gi, c: "lembrar / lembrar-se de", r: "'Lembrar de' sem pronome é coloquial. Use 'lembrei o nome' ou 'lembrei-me do nome'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bresponder\s+(?:o\s+email|o\s+ofício|o\s+questionário|a\s+pergunta)\b/gi, c: "responder ao email / à pergunta", r: "'Responder' algo é transitivo indireto: 'responder ao email'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bcapaz\s+em\b/gi, c: "capaz de", r: "'Capaz' rege 'de': 'capaz de fazer'.", cat: "regencia_nominal", agt: 3 },
  { e: /\bansioso\s+para\b/gi, c: "ansioso por / ansioso com", r: "'Ansioso' rege 'por' ou 'com'. 'Ansioso para' é anglicismo.", cat: "regencia_nominal", agt: 3 },
  { e: /\bimune\s+de\b/gi, c: "imune a", r: "'Imune' rege 'a': 'imune a críticas'.", cat: "regencia_nominal", agt: 3 },
  { e: /\bse\s+vende\b|\bse\s+aluga\b|\bse\s+precisa\b|\bse\s+faz\b/gi, c: "vende-se / aluga-se / precisa-se / faz-se", r: "Com 'se' índice de indeterminação, a ênclise é obrigatória: 'vende-se'.", cat: "colocacao_pronominal", agt: 3 },
  { e: /\bMe\s+(?:diga|fala|conta|explica|mostra|ajuda)\b/g, c: "Diga-me / Fale-me / Conte-me", r: "No imperativo afirmativo, o pronome vai depois do verbo: 'Diga-me'.", cat: "colocacao_pronominal", agt: 3 },
  { e: /\bsendo\s+que\b/gi, c: "embora / uma vez que / pois / já que", r: "'Sendo que' é coloquial. Use a conjunção adequada ao sentido.", cat: "registro", agt: 3 },
  { e: /\baonde\s+(?!vou|vai|foram|ir|fica|você\s+vai|ele\s+vai)\b/gi, c: "onde", r: "'Aonde' indica movimento (destino). Para lugar sem movimento, use 'onde'.", cat: "regencia_verbal", agt: 3 },
  { e: /\bnenhum\s+dos\s+\w+\s+(?:foram|estavam|fizeram|disseram)\b/gi, c: "nenhum dos … (singular)", r: "Com 'nenhum dos', o verbo vai para o singular: 'nenhum dos alunos foi'.", cat: "concordancia_verbal", agt: 3 },
  { e: /\bonde\s+(?=\w+\s+(?:disse|afirmou|declarou|escreveu|relatou|menciona))/gi, c: "em que / no qual / na qual", r: "'Onde' indica lugar físico. Para texto ou situação, use 'em que' ou 'no qual'.", cat: "ambiguidade", agt: 3 },
];

// ── AGENTE 4 — SEMÂNTICA ──────────────────────────────────────
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
  { e: /\bpretender\s+(?=que)\b/gi, c: "fingir / aparentar", r: "'Pretender' em português = ter intenção. Para 'fingir', é falso cognato do inglês.", cat: "inadequado", agt: 4 },
  { e: /\bno\s+caso\s+de\s+que\b/gi, c: "no caso de / caso", r: "'No caso de que' é calco do espanhol/inglês. Use 'no caso de' + infinitivo ou 'caso' + subjuntivo.", cat: "inadequado", agt: 4 },
];

// ── AGENTE 5 — PONTUAÇÃO ──────────────────────────────────────
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
];

// ── AGENTE 6 — CRASE ──────────────────────────────────────────
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
  { e: /\bb(?:referiu-se|aludiu|chegou|voltou|equivale|recorreu)\s+a\s+(?:aquela|aquele|aquilo|aquelas|aqueles)\b/gi, c: "… àquela / àquele / àquilo", r: "Preposição 'a' + pronome 'aquele/a/o' sempre formam crase: 'àquele caso'.", cat: "crase_demonstrativo", agt: 6 },
  { e: /\bà\s+(?:seu|meu|nosso|vosso|este|esse|aquele|cada|qualquer|todo)\b/gi, c: "a seu / a meu / a nosso…", r: "Não há crase antes de pronomes possessivos ou demonstrativos masculinos.", cat: "crase_proibida", agt: 6 },
  { e: /\bà\s+(?:fazer|ser|estar|ter|ir|vir|dizer|saber|poder|dever|querer|precisar|realizar|trabalhar|estudar)\b/gi, c: "a fazer / a ser / a estar…", r: "Não há crase antes de verbos no infinitivo.", cat: "crase_proibida", agt: 6 },
  { e: /\bà\s+(?:ela|elas|ele|eles|você|vocês|mim|nós|vós)\b/gi, c: "a ela / a elas / a você…", r: "Não há crase antes de pronomes pessoais: 'disse a ela'.", cat: "crase_proibida", agt: 6 },
  { e: /\bpara\s+à\b/gi, c: "para a", r: "Não há crase após a preposição 'para'.", cat: "crase_proibida", agt: 6 },
  { e: /\bde\s+à\b/gi, c: "da", r: "Não há crase após a preposição 'de'. Use 'da'.", cat: "crase_proibida", agt: 6 },
  { e: /\bfoi\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Portugal|Grécia|Irlanda|Bélgica|Suécia)\b/gi, c: "foi à França / à Espanha…", r: "Países femininos com artigo exigem crase: 'foi à França'.", cat: "crase_paises", agt: 6 },
  { e: /\bvou\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Portugal|Grécia|Irlanda|Bélgica|Suécia)\b/gi, c: "vou à França / à Espanha…", r: "Países femininos com artigo exigem crase no destino: 'vou à França'.", cat: "crase_paises", agt: 6 },
];

// ── TABELAS DE PRIORIDADE ─────────────────────────────────────
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

// ── META DOS AGENTES ──────────────────────────────────────────
const AGENTES = {
  1: { nome: "Ortografia", cor: "#ff6b6b", sigla: "OR", regras: R1 },
  2: { nome: "Morfologia", cor: "#4dabf7", sigla: "MO", regras: R2 },
  3: { nome: "Sintaxe",    cor: "#69db7c", sigla: "SI", regras: R3 },
  4: { nome: "Semântica",  cor: "#ffd43b", sigla: "SE", regras: R4 },
  5: { nome: "Pontuação",  cor: "#f783ac", sigla: "PO", regras: R5 },
  6: { nome: "Crase",      cor: "#da77f2", sigla: "CR", regras: R6 },
};

// ── PALETA DE CATEGORIAS ──────────────────────────────────────
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
};

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
};

// ── MOTOR PRINCIPAL ───────────────────────────────────────────
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
  // Ordenar: posição → prioridade agente → prioridade categoria
  candidatos.sort((a, b) =>
    a.inicio !== b.inicio ? a.inicio - b.inicio
    : a.prioA !== b.prioA ? a.prioA - b.prioA
    : a.prioC - b.prioC
  );
  // Deduplicação por sobreposição
  const out = [];
  let fim = -1;
  for (const c of candidatos) {
    if (c.inicio >= fim) { out.push(c); fim = c.fim; }
  }
  return out;
}

const TEXTO_INICIAL = `No entanto o projeto avançou e houveram muitos atrasos. A empresa, anunciou que chegou em São Paulo a tarde. Fazem dois anos que tentamos resolver esse impecilho a base de esforço. O pessoal foram embora e a situação ficou mais pior. Vou a França na próxima semana. Subir para cima desse desafio é o consensus geral da equipe.`;

export default function CoordernadorCentral() {
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [erros, setErros] = useState([]);
  const [erroAtivo, setErroAtivo] = useState(null);
  const [posFloat, setPosFloat] = useState({ x: 0, y: 0 });
  const [ativos, setAtivos] = useState(new Set([1, 2, 3, 4, 5, 6]));
  const [filtro, setFiltro] = useState(null);
  const [totalCorrigidos, setTotalCorrigidos] = useState(0);
  const [painelAberto, setPainelAberto] = useState(true);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setErros(executar(texto, ativos)), 600);
    return () => clearTimeout(timerRef.current);
  }, [texto, ativos]);

  const toggleAgente = (id) => {
    setAtivos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const aplicar = useCallback((erro) => {
    setTexto(t => t.slice(0, erro.inicio) + erro.certo + t.slice(erro.fim));
    setErroAtivo(null);
    setTotalCorrigidos(c => c + 1);
  }, []);

  const aplicarTudo = () => {
    const lista = [...errosFiltrados].sort((a, b) => a.inicio - b.inicio);
    let t = texto;
    let off = 0;
    for (const e of lista) {
      t = t.slice(0, e.inicio + off) + e.certo + t.slice(e.fim + off);
      off += e.certo.length - (e.fim - e.inicio);
    }
    setTexto(t);
    setTotalCorrigidos(c => c + lista.length);
    setErros([]);
  };

  const errosFiltrados = filtro !== null ? erros.filter(e => e.agente === filtro) : erros;

  const renderOverlay = () => {
    const partes = [];
    let cursor = 0;
    for (const erro of erros) {
      if (erro.inicio > cursor)
        partes.push(<span key={`t${cursor}`} style={{ color: "transparent" }}>{texto.slice(cursor, erro.inicio)}</span>);
      const cor = COR_CAT[erro.categoria] || AGENTES[erro.agente]?.cor || "#fff";
      const isAtivo = erroAtivo?.inicio === erro.inicio;
      partes.push(
        <span key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px wavy ${cor}`,
            cursor: "pointer",
            background: isAtivo ? cor + "22" : "transparent",
            transition: "background 0.1s", borderRadius: 2,
          }}
          onMouseEnter={ev => {
            const rect = ev.target.getBoundingClientRect();
            const cRect = containerRef.current?.getBoundingClientRect();
            setPosFloat({
              x: Math.min(rect.left - (cRect?.left || 0), (cRect?.width || 700) - 335),
              y: rect.bottom - (cRect?.top || 0) + 8,
            });
            setErroAtivo(erro);
          }}
          onMouseLeave={() => setErroAtivo(null)}
          onClick={() => aplicar(erro)}
        >
          {texto.slice(erro.inicio, erro.fim)}
        </span>
      );
      cursor = erro.fim;
    }
    if (cursor < texto.length)
      partes.push(<span key="tf" style={{ color: "transparent" }}>{texto.slice(cursor)}</span>);
    return <>{partes}</>;
  };

  // Stats por agente
  const statsAgentes = Object.entries(AGENTES).map(([id, a]) => ({
    id: Number(id), ...a,
    count: erros.filter(e => e.agente === Number(id)).length,
    ativo: ativos.has(Number(id)),
  }));

  const totalAtivos = erros.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#06080d",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "36px 20px 64px",
    }}>

      {/* ── HEADER ── */}
      <div style={{ width: "100%", maxWidth: 860, marginBottom: 24 }}>

        {/* Título */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52,
            background: "#080c14",
            border: "1px solid #1a2240",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 24px #4dabf720",
          }}>
            {/* Ícone hub */}
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="3.5" fill="#4dabf7"/>
              {[[15,3],[15,27],[3,15],[27,15],[5.5,5.5],[24.5,24.5],[24.5,5.5],[5.5,24.5]].map(([x,y],i) => (
                <line key={i} x1="15" y1="15" x2={x} y2={y}
                  stroke={["#ff6b6b","#4dabf7","#69db7c","#ffd43b","#f783ac","#da77f2","#20c997","#ff922b"][i]}
                  strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
              ))}
              {[[15,3],[15,27],[3,15],[27,15],[5.5,5.5],[24.5,24.5],[24.5,5.5],[5.5,24.5]].map(([x,y],i) => (
                <circle key={`c${i}`} cx={x} cy={y} r="2"
                  fill={["#ff6b6b","#4dabf7","#69db7c","#ffd43b","#f783ac","#da77f2","#20c997","#ff922b"][i]}
                  opacity="0.9"/>
              ))}
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 9, letterSpacing: "0.25em",
                color: "#4dabf7", textTransform: "uppercase",
                background: "#0a1428", border: "1px solid #1a2a50",
                padding: "2px 8px", borderRadius: 2,
              }}>COORDENADOR CENTRAL · v1.0</span>
            </div>
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: "#d0daf0",
              margin: 0, fontFamily: "'Georgia', serif", letterSpacing: "-0.02em",
            }}>
              Sistema de Inspeção Linguística
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {totalCorrigidos > 0 && (
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#69db7c" }}>✓ {totalCorrigidos} corrigidos</span>
            )}
            {errosFiltrados.length > 0 && (
              <button onClick={aplicarTudo} style={{
                background: "#0a1e0a", border: "1px solid #2e5d2f",
                color: "#69db7c", fontFamily: "monospace", fontSize: 11,
                padding: "6px 14px", borderRadius: 6, cursor: "pointer",
                letterSpacing: "0.04em",
              }}>
                ✓ corrigir tudo ({errosFiltrados.length})
              </button>
            )}
          </div>
        </div>

        {/* Grade dos 6 agentes */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8,
          marginBottom: 8,
        }}>
          {statsAgentes.map(({ id, nome, cor, sigla, count, ativo }) => (
            <div key={id}
              onClick={() => toggleAgente(id)}
              style={{
                padding: "10px 8px",
                borderRadius: 8,
                border: ativo ? `1px solid ${cor}44` : "1px solid #0f1520",
                background: ativo ? cor + "0e" : "#080c14",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              }}
            >
              <div style={{
                fontFamily: "monospace", fontSize: 15, fontWeight: 800,
                color: ativo ? cor : "#1e2840",
                transition: "color 0.15s",
              }}>{sigla}</div>
              <div style={{
                fontSize: 9, color: ativo ? "#6a7a9a" : "#1a2235",
                fontFamily: "sans-serif", textAlign: "center", lineHeight: 1.2,
              }}>{nome}</div>
              <div style={{
                fontSize: 11, fontFamily: "monospace",
                color: count > 0 && ativo ? cor : "#1a2840",
                background: count > 0 && ativo ? cor + "18" : "transparent",
                borderRadius: 10, padding: "0 6px", minWidth: 18, textAlign: "center",
                transition: "all 0.15s",
              }}>
                {ativo ? (count > 0 ? count : "·") : "off"}
              </div>
            </div>
          ))}
        </div>

        {/* Barra de resumo */}
        {totalAtivos > 0 && (
          <div style={{
            background: "#080c14", border: "1px solid #0f1520",
            borderRadius: 6, padding: "8px 14px",
            display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#2a3a5a", letterSpacing: "0.12em", textTransform: "uppercase", marginRight: 4 }}>
              DISTRIBUIÇÃO:
            </span>
            {statsAgentes.filter(s => s.count > 0 && s.ativo).map(s => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "2px 8px",
                background: s.cor + "14",
                border: `1px solid ${s.cor}30`,
                borderRadius: 4,
              }}>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: s.cor, fontWeight: 700 }}>{s.sigla}</span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: s.cor }}>{s.count}</span>
              </div>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "#2a3a5a" }}>
              total: {totalAtivos}
            </span>
          </div>
        )}
      </div>

      {/* ── EDITOR ── */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 860, position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          padding: "22px 26px", fontSize: 17, lineHeight: 1.85,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          pointerEvents: "none", zIndex: 2, color: "transparent", userSelect: "none",
          fontFamily: "'Georgia', serif",
        }}>
          {renderOverlay()}
        </div>

        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          style={{
            width: "100%", minHeight: 220,
            padding: "22px 26px", fontSize: 17, lineHeight: 1.85,
            background: "#0a0e16", color: "#c8d4e8",
            border: "1px solid #111828", borderRadius: 8,
            resize: "vertical", outline: "none",
            fontFamily: "'Georgia', serif", caretColor: "#4dabf7",
            boxSizing: "border-box", position: "relative", zIndex: 1,
          }}
          spellCheck={false}
          placeholder="Digite seu texto. Os 6 agentes inspecionam em paralelo..."
        />

        {/* ── FLOAT UNIFICADO ── */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute", left: posFloat.x, top: posFloat.y,
              zIndex: 100, width: 330,
              background: "#080c14",
              border: `1px solid ${COR_CAT[erroAtivo.categoria] || AGENTES[erroAtivo.agente]?.cor || "#4dabf7"}44`,
              borderRadius: 10, padding: "14px 16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.85)",
              fontFamily: "sans-serif", pointerEvents: "all",
            }}
            onMouseLeave={() => setErroAtivo(null)}
          >
            {/* Header do float */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
              <span style={{
                fontSize: 8, fontWeight: 800, fontFamily: "monospace",
                letterSpacing: "0.14em",
                color: AGENTES[erroAtivo.agente]?.cor,
                background: AGENTES[erroAtivo.agente]?.cor + "18",
                border: `1px solid ${AGENTES[erroAtivo.agente]?.cor}33`,
                padding: "2px 7px", borderRadius: 3,
              }}>
                AGT {erroAtivo.agente} · {AGENTES[erroAtivo.agente]?.nome?.toUpperCase()}
              </span>
              <span style={{
                fontSize: 8, fontFamily: "monospace", letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: COR_CAT[erroAtivo.categoria] || "#aaa",
                background: (COR_CAT[erroAtivo.categoria] || "#aaa") + "14",
                border: `1px solid ${COR_CAT[erroAtivo.categoria] || "#aaa"}30`,
                padding: "2px 7px", borderRadius: 3,
              }}>
                {LABEL_CAT[erroAtivo.categoria] || erroAtivo.categoria}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 8, fontFamily: "monospace", color: "#1e2840" }}>
                P{PRIO_AGENTE[erroAtivo.agente]}·{PRIO_CAT[erroAtivo.categoria] ?? "?"}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "#7a8aaa", margin: "0 0 12px", lineHeight: 1.58 }}>
              {erroAtivo.regra}
            </p>

            <div style={{ borderTop: "1px solid #111828", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#ff6b6b" }}>✗</span>
                <span style={{ fontSize: 13, color: "#ff8a8a", fontFamily: "monospace", background: "#2a0e0e", padding: "2px 8px", borderRadius: 3 }}>
                  {erroAtivo.texto}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#69db7c", marginTop: 2 }}>✓</span>
                <span style={{
                  fontSize: 13, color: "#8ce99a", fontFamily: "monospace",
                  background: "#0e2a0e", padding: "2px 8px", borderRadius: 3,
                  cursor: "pointer", border: "1px solid #2e5d2f", lineHeight: 1.5,
                }} onClick={() => aplicar(erroAtivo)}>
                  {erroAtivo.certo}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 9, color: "#1e2840", fontFamily: "monospace" }}>
              clique na correção para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* ── FILTROS ── */}
      {erros.length > 0 && (
        <div style={{ width: "100%", maxWidth: 860, marginTop: 18, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#1e2840", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            FILTRAR:
          </span>
          <button onClick={() => setFiltro(null)} style={{
            fontFamily: "monospace", fontSize: 10,
            padding: "3px 10px", borderRadius: 4,
            background: filtro === null ? "#0a1428" : "transparent",
            border: `1px solid ${filtro === null ? "#4dabf7" : "#111828"}`,
            color: filtro === null ? "#4dabf7" : "#2a3a5a", cursor: "pointer",
          }}>
            todos ({erros.length})
          </button>
          {statsAgentes.filter(s => s.count > 0 && s.ativo).map(s => (
            <button key={s.id} onClick={() => setFiltro(s.id)} style={{
              fontFamily: "monospace", fontSize: 10,
              padding: "3px 10px", borderRadius: 4,
              background: filtro === s.id ? s.cor + "14" : "transparent",
              border: `1px solid ${filtro === s.id ? s.cor + "55" : "#111828"}`,
              color: filtro === s.id ? s.cor : "#2a3a5a", cursor: "pointer",
            }}>
              {s.sigla} ({s.count})
            </button>
          ))}
        </div>
      )}

      {/* ── RELATÓRIO UNIFICADO ── */}
      {errosFiltrados.length > 0 && (
        <div style={{ width: "100%", maxWidth: 860, marginTop: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
            cursor: "pointer",
          }} onClick={() => setPainelAberto(p => !p)}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#2a3a5a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              FILA UNIFICADA · {errosFiltrados.length} ocorrência{errosFiltrados.length > 1 ? "s" : ""}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#2a3a5a" }}>
              {painelAberto ? "▲ recolher" : "▼ expandir"}
            </span>
          </div>

          {painelAberto && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {errosFiltrados.map((erro, i) => {
                const cor = COR_CAT[erro.categoria] || AGENTES[erro.agente]?.cor || "#4dabf7";
                const label = LABEL_CAT[erro.categoria] || erro.categoria;
                const agt = AGENTES[erro.agente];
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "10px 14px",
                    background: "#080c14",
                    borderRadius: 6, border: "1px solid #0f1520",
                    borderLeft: `3px solid ${cor}`,
                  }}>
                    {/* Badge agente */}
                    <span style={{
                      fontSize: 8, fontWeight: 800, fontFamily: "monospace",
                      color: agt?.cor,
                      background: agt?.cor + "14",
                      border: `1px solid ${agt?.cor}30`,
                      padding: "2px 5px", borderRadius: 3,
                      whiteSpace: "nowrap", marginTop: 2, letterSpacing: "0.08em",
                    }}>
                      {agt?.sigla}
                    </span>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontFamily: "monospace", color: "#ff8a8a", background: "#2a0e0e", padding: "1px 6px", borderRadius: 3 }}>
                          {erro.texto}
                        </span>
                        <span style={{ color: "#1e2840" }}>→</span>
                        <span style={{
                          fontSize: 12, fontFamily: "monospace", color: "#8ce99a",
                          background: "#0e2a0e", padding: "1px 6px", borderRadius: 3,
                          cursor: "pointer", border: "1px solid #2e5d2f", lineHeight: 1.5,
                        }} onClick={() => aplicar(erro)}>
                          {erro.certo}
                        </span>
                        <span style={{
                          fontSize: 8, color: cor,
                          background: cor + "14", border: `1px solid ${cor}30`,
                          padding: "1px 6px", borderRadius: 3,
                          fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>
                          {label}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#3a4a6a", lineHeight: 1.45 }}>
                        {erro.regra}
                      </div>
                    </div>

                    <button onClick={() => aplicar(erro)} style={{
                      background: "none", border: "1px solid #111828",
                      color: "#2a3a5a", fontSize: 10, padding: "4px 9px",
                      borderRadius: 4, cursor: "pointer", fontFamily: "monospace", whiteSpace: "nowrap",
                    }}>corrigir</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PAINEL TÉCNICO ── */}
      <div style={{
        width: "100%", maxWidth: 860, marginTop: 28,
        padding: "14px 18px",
        background: "#050709", border: "1px solid #0a0e18", borderRadius: 8,
        fontFamily: "monospace", fontSize: 10, color: "#1a2535",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 28px", lineHeight: 1.7,
      }}>
        <span>agentes_ativos: [{[...ativos].sort().join(", ")}]</span>
        <span>regras_totais: {[R1,R2,R3,R4,R5,R6].flat().filter(r=>r.c).length}</span>
        <span>deduplicação: sobreposição + prioridade agente × categoria</span>
        <span>debounce: 600ms · corrigir_tudo: offset acumulado</span>
        <span>fila_ativa: {erros.length} ocorrência{erros.length !== 1 ? "s" : ""}</span>
        <span>agentes: OR · MO · SI · SE · PO · CR — todos integrados</span>
      </div>
    </div>
  );
}
