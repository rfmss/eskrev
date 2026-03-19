/**
 * grammarLintExtended.js — Regras do corpus PT-BR
 *
 * Extensão do grammarLint.js com regras derivadas dos corpora
 * construídos nas skills do Editor PT-BR.
 *
 * USO:
 *   import { RULES_EXTENDED } from "./grammarLintExtended.js";
 *   // No grammarLint.js, concatenar ao array RULES:
 *   const RULES = [...RULES_BASE, ...RULES_EXTENDED];
 *
 * Cada regra segue o padrão exato do grammarLint.js:
 *   id, category, pattern, label, explanation, wrong, right, area, topic, detail
 */

export const RULES_EXTENDED = [

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 4 — PARÔNIMOS E HOMÔNIMOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "comprimento_cumprimento",
    category: "paronimia",
    pattern: /\bcomprimento\b(?=\s+(?:ao|da|de|do|às|um|uma|os|as|seu|sua|meu|minha|cordial|formal|atencioso))/gi,
    label: "Parônimo: comprimento × cumprimento",
    explanation: "'Comprimento' = extensão/medida. 'Cumprimento' = saudação ou ato de cumprir.",
    wrong: "Envio meus comprimentos.",
    right: "Envio meus cumprimentos.",
    area: "semantics", topic: "paronyms",
    detail: `## Comprimento × Cumprimento

Dois dos parônimos mais confundidos na escrita brasileira.

**Comprimento** = extensão, medida linear:
✓  O comprimento da mesa é de dois metros.
✓  Mede o comprimento da corda.

**Cumprimento** = saudação / ato de cumprir:
✓  Envio meus cumprimentos ao diretor.
✓  O cumprimento do contrato foi rigoroso.

**Como lembrar:** comPRIMento tem a mesma raiz de "primar" (medir o primeiro). CumPRImento vem de "cumprir".

✗  Envio meus comprimentos.  (errado — não é medida)
✓  Envio meus cumprimentos.`,
  },
  {
    id: "eminente_iminente",
    category: "paronimia",
    pattern: /\beminente\b(?=\s+(?:perigo|risco|colapso|crise|desastre|queda|decisão|chegada|partida))/gi,
    label: "Parônimo: eminente × iminente",
    explanation: "'Eminente' = notável, excelente. 'Iminente' = prestes a acontecer.",
    wrong: "Há um perigo eminente.",
    right: "Há um perigo iminente.",
    area: "semantics", topic: "paronyms",
    detail: `## Eminente × Iminente

**Eminente** = excelente, notável, de grande prestígio:
✓  Um jurista eminente.
✓  Figura eminente na política.

**Iminente** = que está prestes a acontecer, imediato:
✓  Risco iminente de colapso.
✓  A chuva é iminente.

**Como lembrar:** iMinente = iMediato. O "i" inicial ajuda a lembrar da iminência (do latim *imminere*, estar sobre, ameaçar).

✗  Perigo eminente.  (não é notável — é imediato)
✓  Perigo iminente.`,
  },
  {
    id: "ratificar_retificar",
    category: "paronimia",
    pattern: /\bratificar\b|\bretificar\b/gi,
    label: "Parônimo: ratificar × retificar",
    explanation: "'Ratificar' = confirmar, validar. 'Retificar' = corrigir, endireitar.",
    wrong: "Preciso ratificar o erro no documento.",
    right: "Preciso retificar o erro no documento.",
    area: "semantics", topic: "paronyms",
    detail: `## Ratificar × Retificar

**Ratificar** = confirmar, aprovar, validar o que já existe:
✓  O Senado ratificou o tratado.
✓  Venho ratificar minha posição anterior.

**Retificar** = corrigir, endireitar, retomar corretamente:
✓  Precisamos retificar o erro no relatório.
✓  Retifiquei minha declaração ao juiz.

**Raízes latinas:**
*ratificare* = tornar válido (de *ratus*, confirmado)
*rectificare* = tornar reto/correto (de *rectus*, reto)

✗  Ratifique o erro. (você confirmaria — não corrigiria)
✓  Retifique o erro.`,
  },
  {
    id: "trafego_trafico",
    category: "paronimia",
    pattern: /\btráfico\s+(?:intenso|lento|pesado|urbano|viário|de\s+veículos)\b|\btráfego\s+(?:de\s+drogas|humano|ilegal|de\s+armas)\b/gi,
    label: "Parônimo: tráfego × tráfico",
    explanation: "'Tráfego' = circulação de veículos. 'Tráfico' = comércio ilegal.",
    wrong: "O tráfico urbano estava intenso.",
    right: "O tráfego urbano estava intenso.",
    area: "semantics", topic: "paronyms",
    detail: `## Tráfego × Tráfico

**Tráfego** = circulação de veículos, movimento em vias:
✓  O tráfego estava lento no horário de pico.
✓  Tráfego intenso na rodovia.

**Tráfico** = comércio ilegal, especialmente de drogas ou pessoas:
✓  O tráfico de drogas é crime.
✓  Tráfico de pessoas é violação dos direitos humanos.

✗  O tráfico urbano estava intenso.  (carros não são ilegais)
✓  O tráfego urbano estava intenso.

✗  Investigaram o tráfego de drogas.  (drogas não são veículos)
✓  Investigaram o tráfico de drogas.`,
  },
  {
    id: "mandato_mandado",
    category: "paronimia",
    pattern: /\bmandato\s+(?:de\s+prisão|judicial|de\s+busca|de\s+segurança)\b|\bmandado\s+(?:presidencial|parlamentar|eleitoral|de\s+quatro\s+anos)\b/gi,
    label: "Parônimo: mandato × mandado",
    explanation: "'Mandato' = período de exercício de cargo. 'Mandado' = ordem judicial.",
    wrong: "Cumpriu o mandado de quatro anos.",
    right: "Cumpriu o mandato de quatro anos.",
    area: "semantics", topic: "paronyms",
    detail: `## Mandato × Mandado

**Mandato** = período de exercício de cargo eletivo ou de representação:
✓  O mandato do presidente dura quatro anos.
✓  Mandato parlamentar.
✓  Mandatário = quem exerce o mandato.

**Mandado** = ordem judicial; ato de mandar:
✓  Mandado de prisão.
✓  Mandado de busca e apreensão.
✓  Mandado de segurança (instrumento jurídico).

✗  O mandado presidencial termina em 2026. (não é ordem judicial)
✓  O mandato presidencial termina em 2026.

✗  A polícia cumpriu o mandato de prisão. (mandato é político)
✓  A polícia cumpriu o mandado de prisão.`,
  },
  {
    id: "flagrante_fragrante",
    category: "paronimia",
    pattern: /\bflagrante\s+(?:perfume|aroma|cheiro|odor)\b|\bfragrante\s+(?:crime|delito|erro|mentira|injustiça)\b/gi,
    label: "Parônimo: flagrante × fragrante",
    explanation: "'Flagrante' = evidente, pego em ato. 'Fragrante' = que tem fragrância, perfumado.",
    wrong: "Um fragrante erro.",
    right: "Um flagrante erro.",
    area: "semantics", topic: "paronyms",
    detail: `## Flagrante × Fragrante

**Flagrante** = evidente, que salta aos olhos; situação de pegar em ato:
✓  Um flagrante erro de cálculo.
✓  Preso em flagrante delito.
✓  Uma mentira flagrante.

**Fragrante** = que exala fragrância, perfumado (literário):
✓  O jardim fragrante de rosas.
✓  Uma fragrante brisa de jasmim.

✗  Um fragrante erro.  (erros não têm perfume)
✓  Um flagrante erro.

✗  Preso em flagrante delito.  (correto — não precisa corrigir)
✓  Um jardim fragrante. (correto — tem aroma)`,
  },
  {
    id: "sortir_surtir",
    category: "paronimia",
    pattern: /\bsortir\s+efeito\b|\bsortiu\s+efeito\b|\bsurtiu\s+(?:o\s+)?estoque\b/gi,
    label: "Parônimo: sortir × surtir",
    explanation: "'Sortir' = abastecer com sortimento. 'Surtir' = produzir efeito, resultar.",
    wrong: "A medida não sortiu efeito.",
    right: "A medida não surtiu efeito.",
    area: "semantics", topic: "paronyms",
    detail: `## Sortir × Surtir

**Sortir** = abastecer de sortimento, variar (pouco usado):
✓  Sortir o estoque com variedade de produtos.

**Surtir** = produzir efeito, resultar:
✓  A medida surtiu o efeito esperado.
✓  O remédio não surtiu efeito.
✓  Suas palavras surtiram resultado.

✗  A medida não sortiu efeito. (sortir = abastecer — sem relação)
✓  A medida não surtiu efeito.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 5 — PONTUAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "mas_sem_virgula",
    category: "pontuacao",
    pattern: /(?<![,;—–])\s+mas\s+(?!que\b)/gi,
    label: "Vírgula antes de 'mas' (conjunção adversativa)",
    explanation: "Conjunções adversativas como 'mas', 'porém', 'contudo' pedem vírgula antes.",
    wrong: "Estudei muito mas não passei.",
    right: "Estudei muito, mas não passei.",
    area: "punctuation", topic: "comma",
    detail: `## Vírgula antes de conjunções adversativas

Conjunções adversativas — **mas, porém, contudo, todavia, entretanto, no entanto** — sempre pedem vírgula antes quando ligam duas orações.

✗  Estudei muito mas não passei.
✓  Estudei muito, mas não passei.

✗  Tentou porém não conseguiu.
✓  Tentou, porém não conseguiu.

**Por quê?** A vírgula marca a fronteira entre as duas orações e sinaliza a oposição que vem. Sem ela, o leitor chega ao "mas" sem preparação — o ritmo tromba.

**Atenção:** se "mas" está dentro de uma oração (como parte de expressão), não pede vírgula:
✓  Não só veio mas trouxe presentes. (correlação — sem vírgula)
✓  Veio, mas não ficou. (liga orações — com vírgula)`,
  },
  {
    id: "vocativo_sem_virgula",
    category: "pontuacao",
    pattern: /^([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)\s+(?:venha|venha|saia|entre|olhe|veja|escute|ouça|traga|vá|venha|fale|diga|faça|tome|pegue|deixe|pode|preciso|quero|você)/gm,
    label: "Vocativo sem vírgula",
    explanation: "Quando se chama alguém pelo nome diretamente, usa-se vírgula para isolar o vocativo.",
    wrong: "Maria venha aqui.",
    right: "Maria, venha aqui.",
    area: "punctuation", topic: "comma",
    detail: `## Vírgula no vocativo — regra obrigatória

O vocativo — quando se chama alguém diretamente — é sempre isolado por vírgula(s). Sem a vírgula, a frase muda de sentido ou fica ambígua.

**Vocativo no início:**
✗  Maria venha aqui.
✓  Maria, venha aqui.

**Vocativo no meio:**
✗  Venha Maria aqui.
✓  Venha, Maria, aqui.

**Vocativo no fim:**
✗  Venha aqui Maria.
✓  Venha aqui, Maria.

**Por que é obrigatório?** Sem vírgula, "Maria venha" poderia ser lido como "Maria que vem" — sujeito + verbo, não vocativo + imperativo. A vírgula faz a diferença estrutural.

**Nomes próprios, títulos, apelidos:** todos seguem a mesma regra.
✓  Doutor, assine aqui.
✓  Meu filho, tome cuidado.`,
  },
  {
    id: "aposto_sem_virgula",
    category: "pontuacao",
    pattern: /([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)\s+o\s+(?:escritor|médico|advogado|professor|diretor|presidente|autor|poeta|jornalista|cientista|engenheiro)\b(?!\s*,)/gi,
    label: "Aposto explicativo sem vírgula",
    explanation: "O aposto explicativo — que esclarece o substantivo anterior — deve ser isolado por vírgulas.",
    wrong: "Pedro o escritor chegou.",
    right: "Pedro, o escritor, chegou.",
    area: "punctuation", topic: "comma",
    detail: `## Vírgulas no aposto explicativo

O **aposto explicativo** é um termo que explica ou esclarece outro. Deve ser isolado por vírgulas — ou travessões, ou parênteses.

✗  Pedro o escritor chegou.
✓  Pedro, o escritor, chegou.

✗  A cidade São Paulo tem 12 milhões de habitantes.  (aposto especificativo — sem vírgula — correto)
✓  São Paulo, a maior cidade do Brasil, recebe milhões de turistas.  (explicativo — com vírgula)

**Aposto especificativo** (sem vírgula) — especifica qual entre vários:
✓  O poeta Carlos Drummond de Andrade nasceu em Itabira.  (qual poeta? especifica)

**Aposto explicativo** (com vírgula) — acrescenta informação sobre um ser único:
✓  Carlos Drummond de Andrade, o maior poeta brasileiro do século XX, nasceu em Itabira.`,
  },
  {
    id: "virgula_sujeito_verbo",
    category: "pontuacao",
    pattern: /([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç\s]{2,20}),\s+(?:foi|é|era|está|estava|fez|faz|disse|diz|chegou|chega|partiu|parte|saiu|sai)\b/gi,
    label: "Vírgula separando sujeito do verbo",
    explanation: "Nunca se coloca vírgula entre o sujeito e o verbo — é erro grave de pontuação.",
    wrong: "A escritora que chegou cedo, foi a primeira a falar.",
    right: "A escritora que chegou cedo foi a primeira a falar.",
    area: "punctuation", topic: "comma",
    detail: `## Nunca vírgula entre sujeito e verbo

Uma das regras mais absolutas da pontuação: **jamais se coloca vírgula entre o sujeito e o predicado**.

✗  A escritora que chegou cedo, foi a primeira a falar.
✓  A escritora que chegou cedo foi a primeira a falar.

✗  O resultado do exame, surpreendeu a todos.
✓  O resultado do exame surpreendeu a todos.

**Por que o erro acontece?** O sujeito longo cria uma "pausa respiratória" que o escritor registra como vírgula. Mas vírgula não é pausa — é sinal sintático. A pausa pode existir na leitura em voz alta sem aparecer no texto escrito.

**Exceção aparente:** quando há aposto ou adjunto intercalado, as vírgulas isolam o intercalado — não separam sujeito do verbo:
✓  A escritora, exausta, foi a primeira a falar.
     (exausta = aposto predicativo — as vírgulas isolam "exausta", não separam sujeito de verbo)`,
  },
  {
    id: "adjunto_longo_anteposto",
    category: "pontuacao",
    pattern: /^(?:No dia seguinte|Na semana passada|No ano anterior|Em seguida|Naquele momento|Naquela tarde|Naquele instante|Logo após|Pouco antes|Horas depois|Dias depois|Anos depois|Semanas depois|Meses depois)\s+[a-záàâãéêíóôõúüç]/gim,
    label: "Adjunto adverbial longo anteposto sem vírgula",
    explanation: "Adjuntos adverbiais longos antepostos ao sujeito pedem vírgula para separar da oração principal.",
    wrong: "No dia seguinte ela foi embora.",
    right: "No dia seguinte, ela foi embora.",
    area: "punctuation", topic: "comma",
    detail: `## Vírgula após adjunto adverbial anteposto

Quando um adjunto adverbial longo vem **antes do sujeito**, pede vírgula para separar da oração principal.

✗  No dia seguinte ela foi embora.
✓  No dia seguinte, ela foi embora.

✗  Na semana passada aconteceu algo estranho.
✓  Na semana passada, aconteceu algo estranho.

**Curtos (até 3 palavras):** vírgula facultativa.
✓  Ontem ela chegou. (sem vírgula — correto)
✓  Ontem, ela chegou. (com vírgula — também correto)

**Longos (mais de 3 palavras):** vírgula recomendada/obrigatória.
✓  No dia seguinte ao acidente, ela foi ao hospital.

**Regra prática:** se o adjunto tem mais de 3 palavras e vem antes do sujeito — vírgula.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 6 — CRASE
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "crase_escola",
    category: "crase",
    pattern: /\bfui\s+a\s+escola\b|\bfoi\s+a\s+escola\b|\bvou\s+a\s+escola\b|\bvão\s+a\s+escola\b|\bvai\s+a\s+escola\b/gi,
    label: "Crase obrigatória (verbo de movimento + feminino)",
    explanation: "Verbos de movimento + artigo feminino definido = crase. 'Fui à escola' (a + a = à).",
    wrong: "Fui a escola ontem.",
    right: "Fui à escola ontem.",
    area: "syntax", topic: "crase",
    detail: `## Crase após verbo de movimento + substantivo feminino

A crase ocorre quando se fundem a **preposição "a"** + o **artigo feminino "a"**. Resultado: **à**.

Com verbos de movimento (ir, voltar, chegar, vir, correr, dirigir-se...) antes de substantivo feminino com artigo, a crase é obrigatória.

✗  Fui a escola.  (preposição "a" + artigo "a" = deveria ser "à")
✓  Fui à escola.

✗  Voltou a cidade natal.
✓  Voltou à cidade natal.

**Teste da crase:** substitua o substantivo feminino por um masculino. Se aparecer "ao", havia crase:
✓  Fui **ao** colégio. → Fui **à** escola. ✓ (crase confirmada)

**Sem crase:**
✓  Fui a Recife. (topônimo sem artigo — sem crase)
✓  Fui a pé. (expressão adverbial — sem crase)
✓  Fui a uma escola nova. (artigo indefinido — sem crase)`,
  },
  {
    id: "crase_medida",
    category: "crase",
    pattern: /\bà\s+medida\s+(?:que|em)\b/gi,
    label: "Crase em 'à medida que' (obrigatória)",
    explanation: "'À medida que' leva crase. 'Na medida em que' não leva. São expressões diferentes.",
    wrong: "A medida que crescia, aprendia mais.",
    right: "À medida que crescia, aprendia mais.",
    area: "syntax", topic: "crase",
    detail: `## À medida que × Na medida em que

Duas expressões parecidas com usos distintos — e apenas uma leva crase.

**"À medida que"** (com crase) = à proporção que, proporcionalmente:
✓  À medida que estudava, aprendia mais.
✓  Os preços sobem à medida que a demanda aumenta.

**"Na medida em que"** (sem crase) = porque, uma vez que (causa):
✓  Apoio a proposta na medida em que ela resolve o problema.
✓  É importante, na medida em que afeta todos.

**O erro mais comum:**
✗  A medida que crescia... (sem crase — errado)
✓  À medida que crescia... (com crase — correto)

**Dica:** "à medida que" sempre fala de proporção simultânea. Se você pode substituir por "à proporção que", use crase.`,
  },
  {
    id: "crase_masculino",
    category: "crase",
    pattern: /\bà\s+(?:livro|texto|problema|tema|sistema|programa|tempo|lugar|ponto|momento|trabalho|estudo|projeto|resultado|homem|menino|rapaz|pai|irmão|filho|avô)\b/gi,
    label: "Crase indevida antes de masculino",
    explanation: "Crase só ocorre antes de palavras femininas. Antes de masculinos, use 'a' simples.",
    wrong: "Chegou à tempo.",
    right: "Chegou a tempo.",
    area: "syntax", topic: "crase",
    detail: `## Crase antes de masculino — nunca

A crase é a fusão de "a" (preposição) + "a" (artigo **feminino**). Antes de substantivos masculinos, o artigo é "o" — não há fusão possível.

✗  À tempo. (tempo = masculino)
✓  A tempo.

✗  Chegou à ponto de desistir. (ponto = masculino)
✓  Chegou a ponto de desistir.

✗  Refere-se à problema. (problema = masculino — mesmo que termine em -a)
✓  Refere-se ao problema.

**Palavras masculinas terminadas em -a que enganam:**
problema, tema, sistema, programa, clima, mapa — **todos masculinos** — todos sem crase.
✓  Referente ao problema. / ao tema. / ao sistema.`,
  },
  {
    id: "crase_antes_verbo",
    category: "crase",
    pattern: /\bà\s+(?:fazer|ver|dizer|ir|ter|estar|ser|poder|querer|saber|trazer|vir|dar|pôr)\b/gi,
    label: "Crase antes de verbo no infinitivo — proibida",
    explanation: "Não existe crase antes de verbo. O acento grave antes de infinitivo é erro.",
    wrong: "Começou à falar sobre o assunto.",
    right: "Começou a falar sobre o assunto.",
    area: "syntax", topic: "crase",
    detail: `## Crase antes de infinitivo — proibido

Verbos não têm artigo — portanto não há fusão possível, não há crase.

✗  Começou à falar.
✓  Começou a falar.

✗  Voltou à trabalhar.
✓  Voltou a trabalhar.

✗  Está à espera. → NÃO — "espera" aqui é substantivo. Verifique se há artigo implícito.
→ "À espera" (de/de uma) — pode ou não ter crase dependendo do contexto.

**Regra absoluta:** antes de verbo no infinitivo — NUNCA crase.

**Teste:** coloque o verbo no masculino equivalente. Se não existe masculino → é infinitivo → sem crase.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 7 — VÍCIOS E ESTILO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "cacofonia_via_ela",
    category: "semantica",
    pattern: /\bvia\s+ela\b|\bvia\s+ele\b/gi,
    label: "Cacofonia: 'via ela' → 'viela'",
    explanation: "A junção de 'via' + 'ela' produz o som 'viela' (beco). Reescreva.",
    wrong: "Via ela todos os dias.",
    right: "Ela via todos os dias. / Costumava vê-la todos os dias.",
    area: "stylistics", topic: "cacophony",
    detail: `## Cacofonia: via ela

Cacofonia é o som desagradável ou indesejado produzido pela junção de palavras.

"Via ela" → soa como "viela" (beco, travessa estreita).

✗  Via ela todos os dias.
✓  Costumava vê-la todos os dias.
✓  Ela aparecia todos os dias.
✓  Eu a via todos os dias.

**O que é cacofonia?** A junção do final de uma palavra com o início da próxima produz uma terceira palavra indesejada. Não é erro gramatical — é vício sonoro que distrai o leitor.

**Outros exemplos clássicos:**
✗  "Vi ela" → viela
✗  "já que tinha" → jaquetinha  
✗  "me dê uma mão" → mão → (contexto específico)

A solução é sempre reescrever a construção, usando pronome oblíquo ou reestruturando a frase.`,
  },
  {
    id: "eventualmente_anglicismo",
    category: "semantica",
    pattern: /\beventualmente\b/gi,
    label: "'Eventualmente' não significa 'finalmente' (anglicismo)",
    explanation: "Em PT-BR, 'eventualmente' = às vezes, ocasionalmente. Não significa 'eventually' (inglês) = finalmente.",
    wrong: "Eventualmente o projeto foi concluído.",
    right: "Por fim, o projeto foi concluído. / O projeto foi concluído por fim.",
    area: "semantics", topic: "false_cognates",
    detail: `## "Eventualmente" — falso cognato com o inglês

Este é um dos anglicismos mais frequentes na escrita brasileira contemporânea.

**Em português:** "eventualmente" = *às vezes, de vez em quando, ocasionalmente*:
✓  Eventualmente ele falta ao trabalho. (= às vezes)
✓  Isso acontece eventualmente. (= de forma eventual, não sempre)

**Em inglês:** "eventually" = *finalmente, com o tempo, por fim, no final das contas*

**O erro:** usar "eventualmente" com o sentido inglês de "eventually":
✗  Eventualmente o projeto foi concluído. (querendo dizer "finalmente")
✓  Por fim, o projeto foi concluído.
✓  Com o tempo, o projeto foi concluído.
✓  No final, o projeto foi concluído.

**Dica:** se você pode substituir por "às vezes" — está correto. Se só funciona com "finalmente" — está errado.`,
  },
  {
    id: "pleonasmo_consenso_geral",
    category: "pleonasmo",
    pattern: /\bconsenso\s+geral\b/gi,
    label: "Pleonasmo vicioso: 'consenso geral'",
    explanation: "'Consenso' já pressupõe acordo geral — 'geral' é redundante.",
    wrong: "Chegamos a um consenso geral.",
    right: "Chegamos a um consenso.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo: consenso geral

"Consenso" vem do latim *consensus* = sentir junto, concordar **em conjunto**. A ideia de "geral" já está contida na palavra.

✗  Consenso geral.
✓  Consenso.

**Outros pleonasmos da mesma família:**
✗  Unanimidade geral → ✓  Unanimidade
✗  Acordo mútuo entre as partes → ✓  Acordo entre as partes (mútuo = entre si = já implica reciprocidade)
✗  Elo de ligação → ✓  Elo (elo já é ligação)

**Regra:** antes de adicionar um adjetivo, pergunte se ele acrescenta informação nova ou apenas repete o que a palavra já diz.`,
  },
  {
    id: "pleonasmo_hemorragia",
    category: "pleonasmo",
    pattern: /\bhemorragia\s+de\s+sangue\b/gi,
    label: "Pleonasmo vicioso: 'hemorragia de sangue'",
    explanation: "'Hemorragia' já significa derramamento de sangue — 'de sangue' é redundante.",
    wrong: "O ferimento causou hemorragia de sangue.",
    right: "O ferimento causou hemorragia.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo: hemorragia de sangue

"Hemorragia" vem do grego *haima* (sangue) + *rhein* (fluir) = fluxo de sangue. "De sangue" repete exatamente a definição da palavra.

✗  Hemorragia de sangue.
✓  Hemorragia.

**Outros pleonasmos médicos semelhantes:**
✗  Decapitou a cabeça → ✓  Decapitou (*deca* = cabeça em grego)
✗  Monopólio exclusivo → ✓  Monopólio (*mono* = um só, exclusivo)
✗  Anomalia anormal → ✓  Anomalia (*a-nomos* = fora da norma)`,
  },
  {
    id: "pleonasmo_surpresa_inesperada",
    category: "pleonasmo",
    pattern: /\bsurpresa\s+inesperada\b|\bsurpresa\s+repentina\b/gi,
    label: "Pleonasmo vicioso: 'surpresa inesperada'",
    explanation: "'Surpresa' já é, por definição, algo inesperado — o adjetivo é redundante.",
    wrong: "Foi uma surpresa inesperada.",
    right: "Foi uma surpresa.",
    area: "stylistics", topic: "figures",
    detail: `## Pleonasmo: surpresa inesperada

"Surpresa" = aquilo que vem sem aviso prévio, o inesperado. Um adjetivo que diga "inesperada" ou "repentina" apenas repete o significado da palavra.

✗  Uma surpresa inesperada.
✗  Uma surpresa repentina.
✓  Uma surpresa.
✓  Um acontecimento inesperado.

**Pleonasmos de qualificação desnecessária — mesma família:**
✗  Novidade nova → ✓  Novidade
✗  Fato real → ✓  Fato
✗  Sorriso na boca → pode ser expressivo em literatura; em prosa simples, corte "na boca"`,
  },
  {
    id: "gerundismo_pode_estar",
    category: "norma",
    pattern: /\bpode\s+estar\s+\w+ndo\b|\bpoderia\s+estar\s+\w+ndo\b/gi,
    label: "Gerundismo (pode estar + gerúndio)",
    explanation: "'Pode estar fazendo' é gerundismo. Use 'pode fazer'.",
    wrong: "Pode estar ligando mais tarde.",
    right: "Pode ligar mais tarde.",
    area: "variation", topic: "linguistic_variation",
    detail: `## Gerundismo: pode estar + gerúndio

Mesma família do "vou estar + gerúndio". A estrutura "pode estar + gerúndio" usa um verbo auxiliar desnecessário.

✗  Pode estar ligando mais tarde.
✓  Pode ligar mais tarde.

✗  Poderia estar ajudando mais.
✓  Poderia ajudar mais.

**Gerúndio correto — ação em andamento:**
✓  Pode estar dormindo agora. (ação em curso no presente — correto)
✓  Ela deve estar trabalhando. (probabilidade de estado atual — correto)

**A diferença:** o erro é usar o gerúndio para expressar ação futura ou possível. Quando descreve uma ação que pode estar acontecendo agora — é correto.`,
  },
  {
    id: "nao_obstante_porem",
    category: "pleonasmo",
    pattern: /\bnão\s+obstante\s+(?:isso|,)\s+(?:porém|mas|contudo|todavia|entretanto)\b/gi,
    label: "Conectivos adversativos duplos (redundância)",
    explanation: "'Não obstante' já é adversativo — seguido de 'porém', 'mas' ou 'contudo' é redundante.",
    wrong: "Tentou muito; não obstante, porém, não conseguiu.",
    right: "Tentou muito; não obstante, não conseguiu.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Redundância de conectivos adversativos

"Não obstante", "porém", "contudo", "todavia", "entretanto", "mas" — todos expressam oposição/ressalva. Usar dois seguidos é redundância.

✗  Não obstante, porém, não conseguiu.
✗  Mas, contudo, a situação piorou.
✓  Não obstante, não conseguiu.
✓  Mas a situação piorou.

**Conectivos adversativos que se equivalem — escolha um:**
mas / porém / contudo / todavia / entretanto / no entanto / não obstante / ainda assim

Cada um tem nuance de formalidade, mas o valor lógico é o mesmo. Um por vez.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTE 8 — COESÃO TEXTUAL
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "conector_errado_portanto",
    category: "semantica",
    pattern: /\bportanto\s+(?:mesmo|ainda|apesar|embora)\b|\blogo\s+(?:mesmo|ainda|apesar|embora)\b/gi,
    label: "Conectivo de conclusão em contexto de concessão",
    explanation: "'Portanto' e 'logo' indicam conclusão lógica. Em contexto de concessão, use 'mesmo assim', 'ainda assim'.",
    wrong: "Estava cansada. Portanto ainda foi trabalhar.",
    right: "Estava cansada. Mesmo assim, foi trabalhar.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## Conectivo errado: portanto em lugar de mesmo assim

"Portanto" e "logo" indicam que a oração seguinte é **consequência lógica e esperada** da anterior.

✗  Estava cansada. Portanto ainda foi trabalhar. (ir trabalhar não decorre logicamente do cansaço)
✓  Estava cansada. Mesmo assim, foi trabalhar.
✓  Estava cansada. Ainda assim, trabalhou.

**Quando usar "portanto":**
✓  Estudou muito, portanto passou. (conclusão esperada)
✓  Chovia forte, portanto ficou em casa. (consequência natural)

**Quando usar "mesmo assim / ainda assim":**
✓  Estava cansada, mesmo assim foi trabalhar. (apesar da causa, a consequência é inesperada)
✓  Choveu muito, ainda assim saímos. (concessão — a ação contraria a expectativa)

**Regra:** se a segunda oração é surpreendente, use concessivo. Se é esperada, use conclusivo.`,
  },
  {
    id: "onde_lugar",
    category: "semantica",
    pattern: /\bonde\s+(?:o\s+crime|a\s+reunião|o\s+acidente|o\s+problema|a\s+situação|o\s+momento|a\s+hora)\b/gi,
    label: "Uso inadequado de 'onde' para situação/tempo",
    explanation: "'Onde' é pronome relativo de lugar. Para tempo ou situação, use 'em que' ou 'no qual'.",
    wrong: "O momento onde tudo mudou.",
    right: "O momento em que tudo mudou.",
    area: "syntax", topic: "relative_pronouns",
    detail: `## "Onde" somente para lugar

"Onde" é pronome relativo que retoma **lugar**. Para outros referentes, use "em que", "no qual", "na qual".

✗  O momento onde tudo mudou. (momento não é lugar)
✓  O momento em que tudo mudou.

✗  A situação onde todos se calaram. (situação não é lugar)
✓  A situação em que todos se calaram.

✗  O crime onde mais pessoas morrem. (crime não é lugar)
✓  O crime em que mais pessoas morrem.

**"Onde" correto — com antecedente de lugar:**
✓  A cidade onde nasci.
✓  O lugar onde tudo começou.
✓  A escola onde estudei.

**Dica:** substitua "onde" por "no qual / na qual". Se funcionar → "onde" está correto. Se não funcionar → use "em que".`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SINTAXE ESTENDIDA
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "apesar_que",
    category: "regencia",
    pattern: /\bapesar\s+que\b/gi,
    label: "'Apesar que' — locução incorreta",
    explanation: "'Apesar que' não existe na norma culta. Use 'apesar de' + infinitivo ou 'embora' + subjuntivo.",
    wrong: "Apesar que chovesse, saímos.",
    right: "Apesar de chover, saímos. / Embora chovesse, saímos.",
    area: "syntax", topic: "subordination",
    detail: `## "Apesar que" — forma inexistente

A locução concessiva correta é **"apesar de"** — não "apesar que".

✗  Apesar que chovesse, saímos.
✓  Apesar de chover, saímos.
✓  Embora chovesse, saímos.

**"Apesar de" + substantivo / infinitivo:**
✓  Apesar do cansaço, continuou.
✓  Apesar de saber a verdade, calou-se.

**"Embora" + subjuntivo:**
✓  Embora soubesse, não disse nada.
✓  Embora seja difícil, vale a pena.

**Por que o erro ocorre?** Por contaminação de "ainda que" e "posto que" — que levam "que". Mas "apesar" rege preposição "de", não conjunção "que".`,
  },
  {
    id: "cujo_com_artigo",
    category: "concordancia",
    pattern: /\bcujo\s+o\b|\bcuja\s+a\b|\bcujos\s+os\b|\bcujas\s+as\b/gi,
    label: "Artigo após 'cujo' — erro de dupla determinação",
    explanation: "'Cujo' já funciona como determinante — não se usa artigo depois dele. 'Cujo o' é errado.",
    wrong: "O autor cujo o livro vendeu mil cópias.",
    right: "O autor cujo livro vendeu mil cópias.",
    area: "syntax", topic: "relative_pronouns",
    detail: `## "Cujo" não admite artigo depois

"Cujo" é pronome relativo possessivo. Por si só, determina o substantivo seguinte — como um adjetivo possessivo. Acrescentar o artigo "o/a/os/as" é redundante e agramatical.

✗  O autor cujo o livro vendeu mil cópias.
✓  O autor cujo livro vendeu mil cópias.

✗  A empresa cuja a sede fica em SP.
✓  A empresa cuja sede fica em SP.

✗  Os alunos cujos os pais compareceram.
✓  Os alunos cujos pais compareceram.

**Teste:** substitua "cujo" por "de quem" / "do qual" e veja se o artigo volta:
→ "o livro do qual" — o artigo está em "do", não após "cujo".

**Lembrete de concordância:** cujo/cuja/cujos/cujas concorda com o possuído (o que vem depois), não com o possuidor.
✓  O escritor cujas obras são clássicas. (obras = feminino plural → cujas)`,
  },
  {
    id: "ha_vs_a_atras",
    category: "grafia",
    pattern: /\ba\s+(?:um|dois|três|quatro|cinco|seis|sete|oito|nove|dez|\d+|pouco|muito|algum)\s+(?:tempo|anos?|meses?|dias?|horas?|semanas?)\s+(?:atrás|passados?)\b/gi,
    label: "'A X anos atrás' — confusão entre 'a' e 'há'",
    explanation: "Para tempo decorrido, use 'há' (verbo haver = existir). 'A' indica direção/destino, não tempo passado.",
    wrong: "Isso aconteceu a dois anos atrás.",
    right: "Isso aconteceu há dois anos.",
    area: "syntax", topic: "verbal_regency",
    detail: `## "Há" vs "a" para indicar tempo

Quando se quer indicar **tempo decorrido** (no passado), usa-se **"há"** — forma do verbo "haver" impessoal.

✗  Isso aconteceu a dois anos atrás.
✓  Isso aconteceu há dois anos.

✗  A muito tempo não nos falávamos.
✓  Há muito tempo não nos falávamos.

**"Há" = verbo haver (tempo decorrido, passado):**
✓  Há três dias que não como.
✓  Estudamos juntos há dez anos.

**"A" = preposição (tempo futuro, distância):**
✓  Daqui a dois anos termino o curso. (futuro)
✓  A escola fica a dois quarteirões. (distância)

**Teste:** substitua por "faz". Se funcionar → use "há":
→  "Faz dois anos" ✓ = "Há dois anos" ✓

**Atenção:** "a X anos atrás" tem dupla marcação de passado ("a" + "atrás") — além de errado, é redundante.`,
  },
  {
    id: "implicar_em_transitivo",
    category: "regencia",
    pattern: /\bimplica(?:va|ndo|ou|ria|rá|ram|rão)?\s+em\b/gi,
    label: "Regência: 'implicar em' — transitivo direto",
    explanation: "'Implicar' no sentido de 'acarretar, pressupor' é transitivo direto — não pede preposição 'em'.",
    wrong: "A decisão implica em mudanças profundas.",
    right: "A decisão implica mudanças profundas.",
    area: "syntax", topic: "verbal_regency",
    detail: `## Regência de "implicar"

"Implicar" tem dois sentidos e duas regências diferentes:

**1. Acarretar, pressupor → transitivo direto (sem preposição):**
✗  Isso implica em risco.
✓  Isso implica risco.
✓  A mudança implica esforço.
✓  O contrato implica responsabilidades.

**2. Envolver, comprometer (alguém em algo) → transitivo indireto:**
✓  Implicaram-no no crime. (transitivo direto + predicativo)
✓  Ele está implicado no esquema.

**Por que o erro ocorre?** Por analogia com "resultar em", "consistir em", "redundar em" — verbos que pedem "em". Mas "implicar" (= acarretar) vai direto ao objeto, sem preposição.

**Regra prática:** se você pode substituir por "acarreta", "pressupõe", "envolve" — não use "em":
✓  A decisão acarreta mudanças. → A decisão implica mudanças.`,
  },
  {
    id: "regencia_assistir_direto",
    category: "regencia",
    pattern: /\bassist(?:iu|ir|indo|iram)\s+o\s+(?:filme|jogo|show|espetáculo|evento|programa|debate|concerto|campeonato|torneio)\b/gi,
    label: "Regência: 'assistir o filme' — transitivo indireto",
    explanation: "'Assistir' no sentido de 'ver, presenciar' é transitivo indireto — pede preposição 'a'.",
    wrong: "Assistimos o filme ontem.",
    right: "Assistimos ao filme ontem.",
    area: "syntax", topic: "verbal_regency",
    detail: `## Regência de "assistir" (ver, presenciar)

"Assistir" tem sentidos diferentes com regências diferentes:

**1. Ver, presenciar → transitivo indireto (pede "a"):**
✗  Assistimos o jogo.
✓  Assistimos ao jogo.
✓  Assisti ao filme duas vezes.
✓  Assistiu ao debate com atenção.

**2. Ajudar, socorrer → transitivo direto (sem preposição):**
✓  O médico assistiu o paciente. (cuidou de)
✓  A ONG assiste famílias carentes. (apoia)

**3. Caber, pertencer (direito) → transitivo indireto:**
✓  Assiste-lhe o direito de recorrer. (= cabe-lhe)

**Como distinguir:** "ver/presenciar" sempre pede "a". Teste com pronome:
→  Assisti **a ele** (ao show) ✓ — não: Assisti **ele** ✗

**Atenção:** no Brasil coloquial, "assistir o jogo" está largamente difundido — mas na escrita formal e literária, a regência culta é "assistir ao".`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PARÔNIMOS ESTENDIDOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "acender_ascender_luz",
    category: "paronimia",
    pattern: /\bascendeu?\s+(?:a\s+luz|as\s+luzes|o\s+fogo|uma\s+vela|a\s+lareira|o\s+fogão|o\s+isqueiro|um\s+cigarro|o\s+archote)\b/gi,
    label: "Parônimo: acender × ascender (luz/fogo)",
    explanation: "'Acender' = ligar, pôr fogo. 'Ascender' = subir, elevar-se. Para luz e fogo, use 'acender'.",
    wrong: "Ascendeu a luz da sala.",
    right: "Acendeu a luz da sala.",
    area: "semantics", topic: "paronyms",
    detail: `## Acender × Ascender

**Acender** = iluminar, pôr fogo, ligar (aparelhos de luz ou fogo):
✓  Acendeu as velas.
✓  Acenda a luz, por favor.
✓  O isqueiro não acende.

**Ascender** = subir, elevar-se (físico ou hierárquico):
✓  O balão ascendeu lentamente.
✓  Ascendeu ao cargo de diretor.
✓  A fumaça ascende pela chaminé.

**O erro típico:**
✗  Ascendeu a luz da sala. (luz não sobe — é ativada)
✓  Acendeu a luz da sala.

✗  Acendeu ao poder pela força. (poder não se acende — se conquista)
✓  Ascendeu ao poder pela força.

**Dica mnemônica:** aCENder → acESCENt → centelha (faísca). aSCENder → aSCENsão → subida.`,
  },
  {
    id: "acender_ascender_poder",
    category: "paronimia",
    pattern: /\bacendeu?\s+(?:ao\s+poder|ao\s+trono|ao\s+cargo|à\s+chefia|à\s+presidência|ao\s+topo|socialmente)\b/gi,
    label: "Parônimo: acender × ascender (poder/cargo)",
    explanation: "'Ascender' = elevar-se hierarquicamente. 'Acender' é ligar/iluminar — não se usa para posição social.",
    wrong: "Acendeu ao poder após a crise.",
    right: "Ascendeu ao poder após a crise.",
    area: "semantics", topic: "paronyms",
    detail: `## Acender × Ascender (posição social)

Para movimento hierárquico, posição social ou política, o verbo correto é sempre **ascender**.

✗  Acendeu ao poder.
✓  Ascendeu ao poder.

✗  Acendeu ao trono pela linhagem.
✓  Ascendeu ao trono pela linhagem.

✗  Acendeu socialmente graças ao estudo.
✓  Ascendeu socialmente graças ao estudo.

**Família de ascender:** ascensão, ascendente, ascendência, ascensor.
**Família de acender:** aceso, acendedor, incêndio (lat. *incendere*).

**Regra:** se pode ser substituído por "subir" ou "elevar-se" → ascender. Se pode ser substituído por "ligar" ou "iluminar" → acender.`,
  },
  {
    id: "infligir_infringir_lei",
    category: "paronimia",
    pattern: /\binflig(?:iu|ir|indo|iram)\s+(?:a\s+)?(?:lei|norma|regra|código|regulamento|contrato|acordo|ordem)\b/gi,
    label: "Parônimo: infligir × infringir (lei/norma)",
    explanation: "'Infringir' = violar lei ou norma. 'Infligir' = causar (pena, sofrimento). Para leis, use 'infringir'.",
    wrong: "O réu infligiu as normas do contrato.",
    right: "O réu infringiu as normas do contrato.",
    area: "semantics", topic: "paronyms",
    detail: `## Infligir × Infringir

**Infligir** = causar, aplicar (pena, sofrimento, dano — sobre alguém):
✓  O juiz infligiu uma pena severa ao réu.
✓  A guerra infligiu sofrimento à população.
✓  Infligiu um dano irreparável à empresa.

**Infringir** = violar, transgredir (lei, norma, contrato):
✓  Infringiu o código de trânsito.
✓  A empresa infringiu a lei trabalhista.
✓  Infringiu as regras do regulamento.

**O erro:**
✗  Infligiu a lei. (lei não sofre — é violada)
✓  Infringiu a lei.

✗  Infringiu uma punição ao acusado. (punição não é violada — é aplicada)
✓  Infligiu uma punição ao acusado.

**Dica:** inFRINgir → tRINca → quebrar, violar. inFLIgir → FLIp → golpe, impacto sobre alguém.`,
  },
  {
    id: "infligir_infringir_pena",
    category: "paronimia",
    pattern: /\binfringi(?:u|r|ndo|ram)\s+(?:uma?\s+)?(?:pena|castigo|punição|sofrimento|dano|golpe|derrota)\b/gi,
    label: "Parônimo: infrigir × infligir (pena/castigo)",
    explanation: "'Infligir' = aplicar pena ou causar sofrimento. 'Infringir' é violar — não se aplica a castigos.",
    wrong: "O juiz infringiu uma pena severa.",
    right: "O juiz infligiu uma pena severa.",
    area: "semantics", topic: "paronyms",
    detail: `## Infligir × Infringir (pena/castigo)

"Infringir" = transgredir, violar. Não faz sentido "infringir uma pena" — pena não é uma norma a ser violada.

✗  Infringiu-lhe uma punição.
✓  Infligiu-lhe uma punição.

✗  Infringiram ao exército uma derrota humilhante.
✓  Infligiram ao exército uma derrota humilhante.

✗  O examinador infringiu uma nota baixa. (nota não se transgride)
✓  O examinador infligiu uma nota baixa.

**Resumo rápido:**
• infligir **a** alguém → dano, pena, sofrimento
• infringir **uma** norma → lei, regra, contrato`,
  },
  {
    id: "deferir_diferir",
    category: "paronimia",
    pattern: /\bdiferi(?:u|ram|r|ndo)\s+(?:o\s+)?(?:pedido|requerimento|recurso|solicitação|habeas\s+corpus|mandado)\b|\bdeferiu?\s+(?:de|do|da)\s+/gi,
    label: "Parônimo: deferir × diferir",
    explanation: "'Deferir' = conceder, aprovar (pedido jurídico). 'Diferir' = ser diferente, divergir.",
    wrong: "O juiz diferiu o habeas corpus.",
    right: "O juiz deferiu o habeas corpus.",
    area: "semantics", topic: "paronyms",
    detail: `## Deferir × Diferir

**Deferir** = conceder, aprovar, dar deferimento a (pedido, requerimento):
✓  O juiz deferiu o pedido de liberdade.
✓  O requerimento foi deferido.
✓  Deferimento: ato de deferir. Indeferimento: recusa.

**Diferir** = ser diferente, divergir, adiar:
✓  Minha opinião difere da sua.
✓  Os resultados diferem entre si.
✓  Diferiu o pagamento para o mês seguinte. (= adiou)

**O erro típico (jurídico):**
✗  O juiz diferiu o habeas corpus. (habeas corpus não difere — é deferido ou indeferido)
✓  O juiz deferiu o habeas corpus.

✗  A sentença deferiu do esperado. (sentença não concede "de" algo — difere)
✓  A sentença diferiu do esperado.

**Família:** deferir → deferimento → indeferir. Diferir → diferença → diferente.`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JARGÃO E CLICHÊ BUROCRÁTICO
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "realizar_anglicismo",
    category: "semantica",
    pattern: /\breali(?:zou|za|zei|zamos|zaram|zar)\s+que\b/gi,
    label: "'Realizar que' — anglicismo semântico",
    explanation: "Em PT-BR, 'realizar' = concretizar, executar. O sentido de 'perceber' é anglicismo de 'to realize'.",
    wrong: "Realizou que havia cometido um erro.",
    right: "Percebeu que havia cometido um erro.",
    area: "semantics", topic: "false_cognates",
    detail: `## "Realizar que" — falso cognato com o inglês

Este anglicismo semântico contaminou a escrita brasileira via textos traduzidos do inglês.

**Em inglês:** "to realize" = perceber, notar, tomar consciência de
**Em português:** "realizar" = concretizar, executar, levar a efeito

**O erro:**
✗  Realizei que estava errado. (querendo dizer "percebi")
✗  Ela realizou que o amava.
✗  Realizamos que o projeto falharia.

**As formas corretas em PT-BR:**
✓  Percebeu que havia cometido um erro.
✓  Notou que algo estava errado.
✓  Tomou consciência do problema.
✓  Deu-se conta de que o amava.
✓  Compreendeu que o projeto falharia.

**"Realizar" correto em PT-BR:**
✓  Realizou o sonho de infância. (= concretizou)
✓  A empresa realizou lucro recorde. (= obteve)
✓  O evento foi realizado no sábado. (= executado)`,
  },
  {
    id: "diante_do_exposto",
    category: "redundancia",
    pattern: /\bdiante\s+do\s+(?:acima\s+)?exposto\b/gi,
    label: "Clichê burocrático: 'diante do exposto'",
    explanation: "Fórmula de encerramento burocrático. Em prosa literária ou jornalística, conclua diretamente.",
    wrong: "Diante do exposto, conclui-se que a proposta é viável.",
    right: "A proposta, portanto, é viável.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## "Diante do exposto" — clichê burocrático

Esta fórmula pertence ao registro **jurídico-burocrático**. Em textos literários, jornalísticos ou acadêmicos de qualidade, ela soa artificial e evasiva.

✗  Diante do exposto, conclui-se que...
✓  A análise indica, portanto, que...
✓  Isso demonstra que...
✓  Conclui-se, assim, que...

**Por que evitar?** A expressão posterga a conclusão com uma oração preambular desnecessária. O leitor já sabe o que foi exposto — não precisa que você o anuncie.

**Outros clichês do mesmo registro:**
✗  Tendo em vista o acima exposto...
✗  Em vista do que foi dito...
✗  Pelo exposto anteriormente...

**Regra:** se a frase pode começar diretamente pela conclusão, comece por ela.`,
  },
  {
    id: "no_que_tange",
    category: "redundancia",
    pattern: /\bno\s+que\s+(?:tange|diz\s+respeito|concerne)\s+(?:a|ao|à|aos|às)\b/gi,
    label: "Jargão burocrático: 'no que tange a'",
    explanation: "Expressão burocrática pesada. Prefira 'quanto a', 'sobre', 'em relação a', 'no que se refere a'.",
    wrong: "No que tange ao orçamento, há problemas.",
    right: "Quanto ao orçamento, há problemas.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## "No que tange a" — jargão pesado

Esta construção é válida gramaticalmente, mas pertence ao jargão burocrático formal — soa rígida e distante na maioria dos textos.

✗  No que tange ao orçamento...
✗  No que diz respeito às medidas...
✗  No que concerne ao projeto...

**Alternativas diretas:**
✓  Quanto ao orçamento...
✓  Sobre as medidas...
✓  Em relação ao projeto...
✓  No que se refere ao prazo... (se quiser manter certa formalidade)

**Contextos em que é aceitável:**
O jargão é adequado em textos jurídicos, normativos ou regulatórios onde a precisão burocrática é esperada. Em outros contextos, substitua.

**Princípio:** quanto mais simples e direta a construção, mais clara a escrita.`,
  },
  {
    id: "sendo_que",
    category: "classe_palavras",
    pattern: /\bsendo\s+que\b/gi,
    label: "'Sendo que' — conector inadequado",
    explanation: "'Sendo que' não é conjunção aceita na norma culta. Substitua por 'e', 'pois', 'uma vez que' ou reescreva.",
    wrong: "Chegou tarde, sendo que avisou ninguém.",
    right: "Chegou tarde e não avisou ninguém.",
    area: "text_production", topic: "cohesion_coherence",
    detail: `## "Sendo que" — não é conjunção

"Sendo que" é uma construção coloquial amplamente difundida, mas **não é aceita na norma culta** como conjunção coordenativa ou subordinativa.

✗  Comprou o carro, sendo que não tinha dinheiro.
✓  Comprou o carro mesmo sem dinheiro.
✓  Comprou o carro, embora não tivesse dinheiro.

✗  Estudou muito, sendo que passou em primeiro.
✓  Estudou muito e passou em primeiro.
✓  Estudou muito, razão pela qual passou em primeiro.

**Qual conjunção usar?**
— Se a ideia é adição: **"e"**
— Se é causa: **"pois", "porque", "uma vez que"**
— Se é concessão: **"embora", "ainda que", "apesar de"**
— Se é consequência: **"de modo que", "tanto que", "razão pela qual"**

**Por que o erro ocorre?** "Sendo que" é uma tentativa de criar uma "mini-oração" de apoio. Em vez disso, integre a ideia com a conjunção adequada ou reescreva em duas frases.`,
  },
  {
    id: "fazer_verbo_nominalizado",
    category: "redundancia",
    pattern: /\bfazer\s+uma\s+(?:reflexão|análise|avaliação|discussão|consideração|abordagem|exposição|menção|referência|alusão|distinção)\b/gi,
    label: "Verbo nominalizado: 'fazer uma reflexão'",
    explanation: "Construção evasiva que dilui o verbo em substantivo. Use o verbo direto: 'refletir', 'analisar', 'avaliar'.",
    wrong: "Vamos fazer uma análise do problema.",
    right: "Vamos analisar o problema.",
    area: "stylistics", topic: "style",
    detail: `## Nominalização evasiva — "fazer uma X"

Esta construção dilui a ação em duas palavras onde uma basta. É marca de escrita burocrática e faz a prosa perder força.

✗  Fazer uma reflexão sobre o tema.
✓  Refletir sobre o tema.

✗  Fazer uma análise dos dados.
✓  Analisar os dados.

✗  Fazer uma avaliação do projeto.
✓  Avaliar o projeto.

✗  Fazer uma distinção entre os casos.
✓  Distinguir os casos.

✗  Fazer referência ao autor.
✓  Citar o autor. / Referir-se ao autor.

**Por que a nominalização enfraquece o texto?**
O verbo é o núcleo da ação. Transformá-lo em substantivo e usar "fazer" como verbo-suporte transfere o peso semântico para um substantivo genérico — a frase perde precisão e ritmo.

**Regra de ouro:** se existe um verbo direto para a ação, use-o.`,
  },

];
