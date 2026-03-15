import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENTE 2 — MORFOLOGIA
// Domínio: flexão nominal e verbal, classe de palavras,
// concordância de gênero e número, formas irregulares
// ============================================================

const REGRAS_MORFOLOGIA = [
  // ── FLEXÃO VERBAL ────────────────────────────────────────
  {
    errado: /\bele\s+faz\s+anos\b/gi,
    certo: "ele faz anos",
    regra: "Correto. 'Fazer' em sentido de 'completar idade' é impessoal apenas na 3ª pessoa.",
    categoria: "flexao_verbal",
    valido: true,
  },
  {
    errado: /\beles\s+fazem\s+anos\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bhouveram\s+(?:muitos|muitas|diversos|várias|vários)\b/gi,
    certo: "houve",
    regra: "'Haver' no sentido de 'existir' é impessoal — sempre no singular. 'Houveram' está errado.",
    categoria: "flexao_verbal",
  },
  {
    errado: /\bhouveram\b/gi,
    certo: "houve",
    regra: "'Haver' impessoal (existir/ocorrer) não se flexiona no plural. Use sempre 'houve'.",
    categoria: "flexao_verbal",
  },
  {
    errado: /\bexistem\s+(?:uma|um)\b/gi,
    certo: "existe uma / existe um",
    regra: "'Existir' concorda com o sujeito. Com sujeito singular, use 'existe'.",
    categoria: "concordancia",
  },
  {
    errado: /\bfazem\s+(?:\d+\s+)?anos?\s+que\b/gi,
    certo: "faz … anos que",
    regra: "'Fazer' indicando tempo decorrido é impessoal — sempre no singular: 'faz dois anos que'.",
    categoria: "flexao_verbal",
  },
  {
    errado: /\bfazem\s+(?:dois|três|quatro|cinco|seis|sete|oito|nove|dez|\d+)\s+anos?\b/gi,
    certo: "faz … anos",
    regra: "'Fazer' no sentido de tempo decorrido é impessoal. Correto: 'faz dois anos'.",
    categoria: "flexao_verbal",
  },
  {
    errado: /\bdeveriam\s+se\b/gi,
    certo: "deveriam-se",
    regra: "Com pronome oblíquo, use hífen: 'deveriam-se considerar'.",
    categoria: "flexao_verbal",
  },
  {
    errado: /\bvou\s+de\s+encontro\s+com\b/gi,
    certo: "vou ao encontro de",
    regra: "'Ir de encontro a' significa contrariar. 'Ir ao encontro de' significa concordar/aproximar-se. Verifique a intenção.",
    categoria: "semantica_morfologica",
  },
  {
    errado: /\bde\s+encontro\s+com\b/gi,
    certo: "de encontro a / ao encontro de",
    regra: "'De encontro a' = contra/contrário. 'Ao encontro de' = a favor/concordante. A preposição muda o sentido.",
    categoria: "semantica_morfologica",
  },

  // ── FLEXÃO NOMINAL — GÊNERO ──────────────────────────────
  {
    errado: /\ba\s+draft\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bo\s+personagem\s+(?:é\s+)?(?:uma|bonita|inteligente|alta|baixa)\b/gi,
    certo: "o personagem é …",
    regra: "'Personagem' é palavra de gênero comum — admite 'o personagem' e 'a personagem'. O adjetivo deve concordar com o artigo escolhido.",
    categoria: "genero",
  },
  {
    errado: /\ba\s+personagem\s+(?:é\s+)?(?:um|bonito|inteligente|alto|baixo)\b/gi,
    certo: "a personagem é …",
    regra: "'Personagem' com artigo feminino exige adjetivos no feminino.",
    categoria: "genero",
  },
  {
    errado: /\bo\s+appendice\b|\bo\s+apêndice\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\ba\s+dó\b/gi,
    certo: "o dó",
    regra: "'Dó' (nota musical e sentimento de piedade) é substantivo masculino: 'o dó'.",
    categoria: "genero",
  },
  {
    errado: /\bo\s+cólera\b/gi,
    certo: "a cólera / o cólera",
    regra: "'Cólera' muda de sentido com o gênero: 'a cólera' = raiva; 'o cólera' = doença.",
    categoria: "genero",
  },
  {
    errado: /\ba\s+cólera\s+(?:asiática|doença)\b/gi,
    certo: "o cólera",
    regra: "Quando designa a doença, 'cólera' é masculino: 'o cólera asiático'.",
    categoria: "genero",
  },
  {
    errado: /\bo\s+sentinela\b/gi,
    certo: "a sentinela",
    regra: "'Sentinela' é sempre feminino, mesmo quando se refere a homem: 'a sentinela estava de guarda'.",
    categoria: "genero",
  },
  {
    errado: /\bo\s+ag[êe]ncia\b|\ba\s+ag[êe]ncia\b/gi,
    certo: null, regra: null, categoria: null,
  },

  // ── FLEXÃO NOMINAL — NÚMERO ──────────────────────────────
  {
    errado: /\bos\s+cônsules\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bos\s+consul\b/gi,
    certo: "os cônsules",
    regra: "O plural de 'cônsul' é 'cônsules', não 'consuls' nem 'consul'.",
    categoria: "flexao_nominal",
  },
  {
    errado: /\bos\s+mal\s+entendidos\b/gi,
    certo: "os mal-entendidos",
    regra: "'Mal-entendido' no plural é 'mal-entendidos', mantendo o hífen.",
    categoria: "flexao_nominal",
  },
  {
    errado: /\bos\s+auto(?:s)?\s+de\s+infração\b/gi,
    certo: "os autos de infração",
    regra: "O plural de 'auto de infração' é 'autos de infração'.",
    categoria: "flexao_nominal",
  },
  {
    errado: /\bguardas?\s+costas?\b/gi,
    certo: "guarda-costas",
    regra: "'Guarda-costas' não varia no plural: 'os guarda-costas'.",
    categoria: "flexao_nominal",
  },

  // ── CONCORDÂNCIA NOMINAL ─────────────────────────────────
  {
    errado: /\beles\s+é\b/gi,
    certo: "eles são",
    regra: "Sujeito plural 'eles' exige verbo no plural: 'eles são'.",
    categoria: "concordancia",
  },
  {
    errado: /\belas\s+é\b/gi,
    certo: "elas são",
    regra: "Sujeito plural 'elas' exige verbo no plural: 'elas são'.",
    categoria: "concordancia",
  },
  {
    errado: /\bpessoal\s+(?:foram|estavam|disseram|fizeram)\b/gi,
    certo: "pessoal foi / pessoal estava / pessoal disse / pessoal fez",
    regra: "'Pessoal' é substantivo coletivo singular. O verbo deve ficar no singular: 'o pessoal foi'.",
    categoria: "concordancia",
  },
  {
    errado: /\bgente\s+(?:fomos|éramos|fizemos|viemos)\b/gi,
    certo: "a gente foi / era / fez / veio",
    regra: "'A gente' equivale a 'nós', mas o verbo vai para a 3ª pessoa do singular: 'a gente foi'.",
    categoria: "concordancia",
  },
  {
    errado: /\ba\s+gente\s+(?:fomos|éramos|fizemos|viemos)\b/gi,
    certo: "a gente foi / era / fez / veio",
    regra: "'A gente' exige verbo na 3ª pessoa do singular: 'a gente foi', não 'fomos'.",
    categoria: "concordancia",
  },
  {
    errado: /\bmenos\s+(?:pessoas|alunos|funcionários|itens)\b/gi,
    certo: "menos pessoas / menos alunos…",
    regra: "'Menos' é invariável — nunca 'menas'. Esta forma está correta se você escreveu 'menos'.",
    categoria: "flexao_nominal",
    valido: true,
  },
  {
    errado: /\bmenas\b/gi,
    certo: "menos",
    regra: "'Menos' é palavra invariável — não existe 'menas' em português.",
    categoria: "flexao_nominal",
  },

  // ── CLASSE DE PALAVRAS ───────────────────────────────────
  {
    errado: /\bestou\s+(?:bem|mal)\s+de\s+saúde\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bfiquei\s+muito\s+felizes\b/gi,
    certo: "fiquei muito feliz",
    regra: "O predicativo do sujeito deve concordar com o sujeito. Se o sujeito é singular, o adjetivo fica no singular.",
    categoria: "concordancia",
  },
  {
    errado: /\bé\s+proibidos?\s+(?:a\s+entrada|o\s+acesso)\b/gi,
    certo: "é proibida a entrada / é proibido o acesso",
    regra: "O predicativo concorda com o sujeito real da oração. 'Entrada' é feminino: 'é proibida a entrada'.",
    categoria: "concordancia",
  },
  {
    errado: /\bele\s+se\s+tornou\s+um\s+(?:\w+)s\b/gi,
    certo: "ele se tornou um …",
    regra: "Predicativo no singular quando o sujeito é singular: 'ele se tornou um líder', não 'líderes'.",
    categoria: "concordancia",
  },
  {
    errado: /\bpor\s+isso\s+que\b/gi,
    certo: "por isso",
    regra: "'Por isso que' é locução redundante. Use apenas 'por isso' ou 'é por isso que' (com 'é').",
    categoria: "classe_palavras",
  },
  {
    errado: /\bonde\s+que\b/gi,
    certo: "onde",
    regra: "'Onde que' é forma popular não aceita na norma culta. Use apenas 'onde'.",
    categoria: "classe_palavras",
  },
  {
    errado: /\bcomo\s+que\b(?!\s+é|\s+foi|\s+ficou|\s+fica)/gi,
    certo: "como",
    regra: "'Como que' como conectivo é forma coloquial. Na escrita formal, use apenas 'como'.",
    categoria: "classe_palavras",
  },

  // ── GRAU E COMPARAÇÃO ────────────────────────────────────
  {
    errado: /\bmais\s+melhor\b/gi,
    certo: "melhor",
    regra: "'Melhor' já é o comparativo de superioridade de 'bom'. 'Mais melhor' é pleonasmo.",
    categoria: "grau",
  },
  {
    errado: /\bmais\s+pior\b/gi,
    certo: "pior",
    regra: "'Pior' já é o comparativo de superioridade de 'mau/ruim'. 'Mais pior' é pleonasmo.",
    categoria: "grau",
  },
  {
    errado: /\bmais\s+maior\b/gi,
    certo: "maior",
    regra: "'Maior' já é comparativo. 'Mais maior' é redundante.",
    categoria: "grau",
  },
  {
    errado: /\bmais\s+menor\b/gi,
    certo: "menor",
    regra: "'Menor' já é comparativo. 'Mais menor' é redundante.",
    categoria: "grau",
  },
  {
    errado: /\bmuito\s+ótimo\b/gi,
    certo: "ótimo",
    regra: "'Ótimo' já é superlativo de 'bom'. 'Muito ótimo' é redundante.",
    categoria: "grau",
  },
  {
    errado: /\bmuito\s+péssimo\b/gi,
    certo: "péssimo",
    regra: "'Péssimo' já é superlativo de 'mau/ruim'. 'Muito péssimo' é redundante.",
    categoria: "grau",
  },
];

const REGRAS_ATIVAS = REGRAS_MORFOLOGIA.filter(
  (r) => r.certo !== null && r.regra !== null && !r.valido
);

const CORES_CATEGORIA = {
  flexao_verbal: { cor: "#42a5f5", label: "Flexão Verbal", bg: "#e3f2fd" },
  flexao_nominal: { cor: "#26c6da", label: "Flexão Nominal", bg: "#e0f7fa" },
  concordancia: { cor: "#ef5350", label: "Concordância", bg: "#ffebee" },
  genero: { cor: "#ab47bc", label: "Gênero", bg: "#f3e5f5" },
  grau: { cor: "#ffa726", label: "Grau", bg: "#fff3e0" },
  classe_palavras: { cor: "#66bb6a", label: "Classe de Palavras", bg: "#e8f5e9" },
  semantica_morfologica: { cor: "#ff7043", label: "Semântica Morfológica", bg: "#fbe9e7" },
};

function detectarErros(texto) {
  const erros = [];
  for (const regra of REGRAS_ATIVAS) {
    const re = new RegExp(regra.errado.source, "gi");
    let match;
    while ((match = re.exec(texto)) !== null) {
      erros.push({
        inicio: match.index,
        fim: match.index + match[0].length,
        texto: match[0],
        certo: regra.certo,
        regra: regra.regra,
        categoria: regra.categoria,
      });
    }
  }
  erros.sort((a, b) => a.inicio - b.inicio || b.fim - a.fim);
  const filtrados = [];
  let ultimoFim = -1;
  for (const e of erros) {
    if (e.inicio >= ultimoFim) {
      filtrados.push(e);
      ultimoFim = e.fim;
    }
  }
  return filtrados;
}

const TEXTO_INICIAL = `Houveram muitos problemas na reunião de ontem. Fazem dois anos que a empresa não bate suas metas. O pessoal foram embora cedo por causa da chuva. A gente fomos ao evento e achamos tudo mais pior do que esperávamos. Ele se tornou um dos líderes mais melhor da organização. A sentinela aguardava na porta do quartel. Por isso que decidimos adiar o projeto.`;

export default function AgenteMorfologia() {
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [erros, setErros] = useState([]);
  const [erroAtivo, setErroAtivo] = useState(null);
  const [posFloat, setPosFloat] = useState({ x: 0, y: 0 });
  const [totalCorrigidos, setTotalCorrigidos] = useState(0);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setErros(detectarErros(texto));
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [texto]);

  const aplicarCorrecao = useCallback(
    (erro) => {
      const novoTexto = texto.slice(0, erro.inicio) + erro.certo + texto.slice(erro.fim);
      setTexto(novoTexto);
      setErroAtivo(null);
      setTotalCorrigidos((c) => c + 1);
    },
    [texto]
  );

  const renderOverlay = () => {
    if (!erros.length)
      return (
        <span style={{ color: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {texto}
        </span>
      );

    const partes = [];
    let cursor = 0;

    for (const erro of erros) {
      if (erro.inicio > cursor) {
        partes.push(
          <span key={`t${cursor}`} style={{ color: "transparent" }}>
            {texto.slice(cursor, erro.inicio)}
          </span>
        );
      }
      const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.concordancia;
      partes.push(
        <span
          key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px wavy ${cat.cor}`,
            cursor: "pointer",
            background: erroAtivo?.inicio === erro.inicio ? cat.bg + "33" : "transparent",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            const rect = e.target.getBoundingClientRect();
            const cRect = containerRef.current.getBoundingClientRect();
            setPosFloat({
              x: Math.min(rect.left - cRect.left, cRect.width - 320),
              y: rect.bottom - cRect.top + 8,
            });
            setErroAtivo(erro);
          }}
          onMouseLeave={() => setErroAtivo(null)}
          onClick={() => aplicarCorrecao(erro)}
        >
          {texto.slice(erro.inicio, erro.fim)}
        </span>
      );
      cursor = erro.fim;
    }

    if (cursor < texto.length) {
      partes.push(
        <span key="tf" style={{ color: "transparent" }}>
          {texto.slice(cursor)}
        </span>
      );
    }

    return <>{partes}</>;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f4ef",
        fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px",
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 760, marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 8,
            borderBottom: "2px solid #1a1a2e",
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 10,
              color: "#42a5f5",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              background: "#1a1a2e",
              padding: "3px 9px",
              borderRadius: 2,
            }}
          >
            AGENTE 2
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1a1a2e",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Inspetor de Morfologia
          </h1>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            {totalCorrigidos > 0 && (
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#2e7d32" }}>
                ✓ {totalCorrigidos} {totalCorrigidos === 1 ? "correção" : "correções"}
              </span>
            )}
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: erros.length === 0 ? "#2e7d32" : "#c62828",
                background: erros.length === 0 ? "#e8f5e9" : "#ffebee",
                padding: "4px 12px",
                borderRadius: 3,
                border: `1px solid ${erros.length === 0 ? "#a5d6a7" : "#ef9a9a"}`,
              }}
            >
              {erros.length === 0
                ? "✓ sem ocorrências"
                : `${erros.length} ocorrência${erros.length > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#888",
            margin: "10px 0 0",
            fontFamily: "sans-serif",
            lineHeight: 1.5,
          }}
        >
          Flexão verbal e nominal · Concordância · Grau · Classe de palavras
          <br />
          Hover para ver a regra · Clique para corrigir inline
        </p>
      </div>

      {/* Editor */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 760, position: "relative" }}>
        {/* Overlay sublinhados */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "20px 24px",
            fontSize: 17,
            lineHeight: 1.9,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            pointerEvents: "none",
            zIndex: 2,
            color: "transparent",
            userSelect: "none",
          }}
        >
          {renderOverlay()}
        </div>

        {/* Textarea */}
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={{
            width: "100%",
            minHeight: 300,
            padding: "20px 24px",
            fontSize: 17,
            lineHeight: 1.9,
            background: "#fffef9",
            color: "#1a1a2e",
            border: "1px solid #d0ccc0",
            borderRadius: 6,
            resize: "vertical",
            outline: "none",
            fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
            caretColor: "#42a5f5",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.06)",
          }}
          spellCheck={false}
          placeholder="Digite ou cole seu texto aqui..."
        />

        {/* Float */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute",
              left: posFloat.x,
              top: posFloat.y,
              zIndex: 100,
              width: 310,
              background: "#1a1a2e",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor || "#42a5f5"}`,
              borderRadius: 8,
              padding: "14px 16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              fontFamily: "sans-serif",
              pointerEvents: "all",
            }}
            onMouseLeave={() => setErroAtivo(null)}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
                background: CORES_CATEGORIA[erroAtivo.categoria]?.cor + "22",
                border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor}55`,
                padding: "3px 8px",
                borderRadius: 3,
                marginBottom: 10,
              }}
            >
              ◈ {CORES_CATEGORIA[erroAtivo.categoria]?.label || erroAtivo.categoria}
            </div>

            <p style={{ fontSize: 13, color: "#cdd3de", margin: "0 0 12px", lineHeight: 1.55 }}>
              {erroAtivo.regra}
            </p>

            <div
              style={{
                borderTop: "1px solid #2e3352",
                paddingTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#ef5350" }}>✗</span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#ef9a9a",
                    fontFamily: "monospace",
                    background: "#3a1a1a",
                    padding: "2px 8px",
                    borderRadius: 3,
                    maxWidth: 240,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {erroAtivo.texto}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#66bb6a" }}>✓</span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#a5d6a7",
                    fontFamily: "monospace",
                    background: "#1a3a1a",
                    padding: "2px 8px",
                    borderRadius: 3,
                    cursor: "pointer",
                    border: "1px solid #2e5d2f",
                    maxWidth: 240,
                  }}
                  onClick={() => aplicarCorrecao(erroAtivo)}
                >
                  {erroAtivo.certo}
                </span>
              </div>
            </div>

            <div
              style={{ marginTop: 10, fontSize: 10, color: "#444e6e", fontFamily: "monospace" }}
            >
              clique na correção para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {Object.entries(CORES_CATEGORIA).map(([key, val]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "sans-serif",
              fontSize: 12,
              color: "#888",
            }}
          >
            <div
              style={{ width: 18, height: 3, background: val.cor, borderRadius: 2 }}
            />
            <span>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Relatório */}
      {erros.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: 760,
            marginTop: 32,
            borderTop: "2px solid #1a1a2e",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#888",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Relatório do Agente 2
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {erros.map((erro, i) => {
              const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.concordancia;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "12px 16px",
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid #e8e4dc",
                    borderLeft: `3px solid ${cat.cor}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#bbb",
                      minWidth: 28,
                      paddingTop: 2,
                    }}
                  >
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 5,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: "#c62828",
                          background: "#ffebee",
                          padding: "1px 6px",
                          borderRadius: 3,
                        }}
                      >
                        {erro.texto}
                      </span>
                      <span style={{ color: "#ccc" }}>→</span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          color: "#2e7d32",
                          background: "#e8f5e9",
                          padding: "1px 6px",
                          borderRadius: 3,
                          cursor: "pointer",
                          border: "1px solid #a5d6a7",
                        }}
                        onClick={() => aplicarCorrecao(erro)}
                      >
                        {erro.certo}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: cat.cor,
                          background: cat.bg,
                          border: `1px solid ${cat.cor}44`,
                          padding: "1px 7px",
                          borderRadius: 3,
                          fontFamily: "sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {cat.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        fontFamily: "sans-serif",
                        lineHeight: 1.5,
                      }}
                    >
                      {erro.regra}
                    </div>
                  </div>
                  <button
                    onClick={() => aplicarCorrecao(erro)}
                    style={{
                      background: "#1a1a2e",
                      border: "none",
                      color: "#aab",
                      fontSize: 11,
                      padding: "5px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    corrigir
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "monospace",
          fontSize: 11,
          color: "#bbb",
        }}
      >
        <span>agente-2 / morfologia · {REGRAS_ATIVAS.length} padrões ativos</span>
        <span>detecção: 600ms debounce · coordenador: pendente</span>
      </div>
    </div>
  );
}
