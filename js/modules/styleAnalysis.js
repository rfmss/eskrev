/**
 * styleAnalysis.js — Analisador de densidade e estilo por parágrafo
 * Detecta: advérbios em -mente, voz passiva, comprimento de sentença
 * Produz alertas por parágrafo conforme perfil (literário/jornalístico)
 */

const PERFIL_LITERARIO = {
  mentePorParagrafo: { info: 2, vicio: 3 },
  passivaPorParagrafo: { estilo: 3 },
  palavrasPorSentenca: { info: 41, estilo: 61 },
  repeticaoJanela: 30,
};

const PERFIL_JORNALISTICO = {
  mentePorParagrafo: { vicio: 2 },
  passivaPorParagrafo: { estilo: 2 },
  palavrasPorSentenca: { estilo: 36, vicio: 51 },
  repeticaoJanela: 50,
};

// Padrão para detectar advérbios em -mente
const RE_MENTE = /\b\w{4,}mente\b/gi;

// Padrão para voz passiva analítica (ser/estar/ter/haver + particípio)
const RE_PASSIVA = /\b(?:foi|foram|é|são|era|eram|será|serão|tem\s+sido|têm\s+sido|está\s+sendo|estão\s+sendo|havia\s+sido|tinham\s+sido)\s+\w+(?:ado|ida|ados|idas|ido|idos)\b/gi;

// Separadores de sentença
const RE_SENTENCA = /[.!?…]+/g;

/**
 * Analisa um parágrafo e retorna métricas
 * @param {string} paragrafo
 * @param {number} idx — índice do parágrafo no texto
 * @returns {object}
 */
function analisarParagrafo(paragrafo, idx) {
  const palavras = paragrafo.trim().split(/\s+/).filter(w => w.length > 0);
  const numPalavras = palavras.length;
  if (numPalavras < 5) return null; // parágrafo muito curto — ignorar

  // Advérbios em -mente
  const mente = [...paragrafo.matchAll(RE_MENTE)].map(m => m[0]);
  const numMente = mente.length;

  // Voz passiva
  const passivas = [...paragrafo.matchAll(RE_PASSIVA)];
  const numPassiva = passivas.length;

  // Sentenças e comprimento médio
  const sentencas = paragrafo.split(RE_SENTENCA).filter(s => s.trim().length > 3);
  const numSentencas = sentencas.length || 1;
  const mediaWords = Math.round(numPalavras / numSentencas);

  return {
    idx,
    numPalavras,
    numMente,
    formasMente: [...new Set(mente)],
    numPassiva,
    numSentencas,
    mediaWords,
  };
}

/**
 * Gera alertas para um parágrafo conforme o perfil ativo
 * @param {object} metricas
 * @param {"literario"|"jornalistico"} perfil
 * @returns {Array<{nivel, mensagem, detalhe}>}
 */
function gerarAlertas(metricas, perfil) {
  if (!metricas) return [];
  const cfg = perfil === "jornalistico" ? PERFIL_JORNALISTICO : PERFIL_LITERARIO;
  const alertas = [];

  // Densidade de -mente
  if (cfg.mentePorParagrafo.vicio && metricas.numMente >= cfg.mentePorParagrafo.vicio) {
    alertas.push({
      nivel: "VICIO",
      mensagem: `${metricas.numMente} advérbios em -mente neste parágrafo`,
      detalhe: `Formas: ${metricas.formasMente.join(", ")}. Prefira substantivos com preposição ou verbos mais precisos.`,
      paragrafo: metricas.idx,
    });
  } else if (cfg.mentePorParagrafo.info && metricas.numMente >= cfg.mentePorParagrafo.info) {
    alertas.push({
      nivel: "INFO",
      mensagem: `${metricas.numMente} advérbios em -mente neste parágrafo`,
      detalhe: `Formas: ${metricas.formasMente.join(", ")}.`,
      paragrafo: metricas.idx,
    });
  }

  // Voz passiva
  if (cfg.passivaPorParagrafo.estilo && metricas.numPassiva >= cfg.passivaPorParagrafo.estilo) {
    alertas.push({
      nivel: "ESTILO",
      mensagem: `${metricas.numPassiva} vozes passivas neste parágrafo`,
      detalhe: "Excesso de voz passiva reduz a clareza. Prefira a voz ativa quando o agente é conhecido.",
      paragrafo: metricas.idx,
    });
  }

  // Comprimento de sentença
  if (cfg.palavrasPorSentenca.vicio && metricas.mediaWords >= cfg.palavrasPorSentenca.vicio) {
    alertas.push({
      nivel: "VICIO",
      mensagem: `Sentenças muito longas — média de ${metricas.mediaWords} palavras`,
      detalhe: "Sentenças longas sobrecarregam o leitor. Divida em períodos mais curtos.",
      paragrafo: metricas.idx,
    });
  } else if (cfg.palavrasPorSentenca.estilo && metricas.mediaWords >= cfg.palavrasPorSentenca.estilo) {
    alertas.push({
      nivel: "ESTILO",
      mensagem: `Sentenças longas — média de ${metricas.mediaWords} palavras`,
      detalhe: "Considere dividir algumas sentenças para melhorar a leiturabilidade.",
      paragrafo: metricas.idx,
    });
  } else if (cfg.palavrasPorSentenca.info && metricas.mediaWords >= cfg.palavrasPorSentenca.info) {
    alertas.push({
      nivel: "INFO",
      mensagem: `Sentenças longas — média de ${metricas.mediaWords} palavras`,
      detalhe: "Sentenças acima de 40 palavras podem ser divididas.",
      paragrafo: metricas.idx,
    });
  }

  return alertas;
}

/**
 * Analisa um texto completo e retorna métricas globais + alertas por parágrafo
 * @param {string} texto — texto plano (sem HTML)
 * @param {"literario"|"jornalistico"} perfil
 * @returns {object}
 */
export function analyzeStyle(texto, perfil = "literario") {
  if (!texto || texto.trim().length < 20) {
    return { metricas: [], alertas: [], resumo: null };
  }

  // Dividir em parágrafos
  const paragrafos = texto.split(/\n{1,}/).filter(p => p.trim().length > 0);

  const metricas = paragrafos.map((p, i) => analisarParagrafo(p, i)).filter(Boolean);
  const alertas = metricas.flatMap(m => gerarAlertas(m, perfil));

  // Resumo global
  const totalPalavras = metricas.reduce((s, m) => s + m.numPalavras, 0);
  const totalMente = metricas.reduce((s, m) => s + m.numMente, 0);
  const totalPassiva = metricas.reduce((s, m) => s + m.numPassiva, 0);
  const mediaGlobal = metricas.length > 0
    ? Math.round(metricas.reduce((s, m) => s + m.mediaWords, 0) / metricas.length)
    : 0;

  const resumo = {
    totalPalavras,
    totalParagrafos: metricas.length,
    densidadeMente: totalPalavras > 0 ? +(totalMente / totalPalavras * 100).toFixed(1) : 0,
    totalPassiva,
    mediaWordsPorSentenca: mediaGlobal,
    totalAlertas: alertas.length,
    erros: alertas.filter(a => a.nivel === "VICIO").length,
    estilo: alertas.filter(a => a.nivel === "ESTILO").length,
    info: alertas.filter(a => a.nivel === "INFO").length,
    perfil,
  };

  return { metricas, alertas, resumo };
}
