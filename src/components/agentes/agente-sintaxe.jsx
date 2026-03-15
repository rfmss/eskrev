import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENTE 3 — SINTAXE
// Domínio: regência verbal e nominal, colocação pronominal,
// dupla negação, ordem dos termos, pleonasmo sintático
// ============================================================

const REGRAS_SINTAXE = [
  // ── REGÊNCIA VERBAL ──────────────────────────────────────
  {
    errado: /\bchegou\s+em\b/gi,
    certo: "chegou a",
    regra: "'Chegar' rege preposição 'a', não 'em'. Ex: 'chegou a São Paulo', 'chegou ao escritório'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bchegar\s+em\b/gi,
    certo: "chegar a",
    regra: "'Chegar' exige a preposição 'a': 'vou chegar a tempo', 'ao chegar a casa'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bassistiu\s+o\b/gi,
    certo: "assistiu ao",
    regra: "'Assistir' (ver/presenciar) é transitivo indireto: rege 'a'. Ex: 'assistiu ao jogo', 'assistiu à peça'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bassistir\s+o\b/gi,
    certo: "assistir ao",
    regra: "'Assistir' (ver) é transitivo indireto. Use 'assistir ao filme', não 'assistir o filme'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bimplicar\s+em\b/gi,
    certo: "implicar",
    regra: "'Implicar' (acarretar/ter como consequência) é transitivo direto: 'implica riscos', sem preposição 'em'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bnamorar\s+com\b/gi,
    certo: "namorar",
    regra: "'Namorar' é transitivo direto: 'namorar alguém', sem 'com'. 'Namorar com' é construção coloquial.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bobedecer\s+(?!a\b|ao\b|à\b|às\b)/gi,
    certo: "obedecer a",
    regra: "'Obedecer' é transitivo indireto: 'obedecer às regras', 'obedecer ao chefe'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bpagar\s+(?!a\b|ao\b|à\b|às\b|por\b)(\w+)/gi,
    certo: null, regra: null, categoria: null, // contexto ambíguo, evitar falsos positivos
  },
  {
    errado: /\bvisa[r]?\s+(?!a\b|ao\b|à\b)(\s+\w)/gi,
    certo: "visar a",
    regra: "'Visar' (pretender/almejar) é transitivo indireto: 'visa ao lucro', 'visava à melhoria'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\binformar\s+(?!a\b|ao\b|à\b|que\b|sobre\b)(\w)/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bprecisar\s+de\s+que\b/gi,
    certo: "precisar que",
    regra: "'Precisar' seguido de oração completiva dispensa 'de': 'preciso que você venha', não 'preciso de que'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\besquecer\s+de\b/gi,
    certo: "esquecer",
    regra: "'Esquecer' é transitivo direto: 'esqueci o documento', não 'esqueci de'. Com pronome: 'esqueceu-se de'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\blembrar\s+de\b/gi,
    certo: "lembrar / lembrar-se de",
    regra: "Sem pronome: 'lembro o fato'. Com pronome reflexivo: 'lembro-me de você'. As duas formas coexistem.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bgostar\s+(?!de\b)/gi,
    certo: null, regra: null, categoria: null,
  },

  // ── REGÊNCIA NOMINAL ─────────────────────────────────────
  {
    errado: /\bansioso\s+para\b/gi,
    certo: "ansioso por / ansioso com",
    regra: "'Ansioso' rege a preposição 'por' ou 'com': 'ansioso por notícias', 'ansioso com o resultado'.",
    categoria: "regencia_nominal",
  },
  {
    errado: /\bcapaz\s+em\b/gi,
    certo: "capaz de",
    regra: "'Capaz' rege a preposição 'de': 'capaz de resolver', não 'capaz em'.",
    categoria: "regencia_nominal",
  },
  {
    errado: /\bfavorável\s+para\b/gi,
    certo: "favorável a",
    regra: "'Favorável' rege a preposição 'a': 'favorável à proposta', não 'para'.",
    categoria: "regencia_nominal",
  },
  {
    errado: /\bnecessidade\s+em\b/gi,
    certo: "necessidade de",
    regra: "'Necessidade' rege a preposição 'de': 'necessidade de mudança', não 'em'.",
    categoria: "regencia_nominal",
  },
  {
    errado: /\bdificuldade\s+em\b(?!\s+(?:fazer|realizar|executar|encontrar))/gi,
    certo: "dificuldade de / dificuldade para",
    regra: "'Dificuldade' rege 'de' ou 'para': 'dificuldade de comunicação', 'dificuldade para falar'.",
    categoria: "regencia_nominal",
  },

  // ── COLOCAÇÃO PRONOMINAL ─────────────────────────────────
  {
    errado: /^Me\s+\w+/gm,
    certo: "[verbo]-me",
    regra: "Em início de frase, pronome oblíquo não pode aparecer antes do verbo. Ex: 'Diga-me', não 'Me diga' (norma culta escrita).",
    categoria: "colocacao_pronominal",
  },
  {
    errado: /^Te\s+\w+/gm,
    certo: "[verbo]-te",
    regra: "Em início de frase, pronome oblíquo não pode vir antes do verbo na norma culta escrita.",
    categoria: "colocacao_pronominal",
  },
  {
    errado: /\bse\s+(?:não|nunca|jamais|já|ainda)\s+\w+/gi,
    certo: null, regra: null, categoria: null, // válido em muitos contextos
  },
  {
    errado: /\bnão\s+(\w+)\s+se\b/gi,
    certo: null, regra: null, categoria: null,
  },

  // ── DUPLA NEGAÇÃO ────────────────────────────────────────
  {
    errado: /\bnunca\s+não\b/gi,
    certo: "nunca / não",
    regra: "Dupla negação: 'nunca' já é negativo. Use apenas 'nunca' ou apenas 'não'.",
    categoria: "dupla_negacao",
  },
  {
    errado: /\bnem\s+não\b/gi,
    certo: "nem",
    regra: "'Nem' já carrega a negação. 'Nem não' é redundante na norma culta.",
    categoria: "dupla_negacao",
  },
  {
    errado: /\bjamais\s+não\b/gi,
    certo: "jamais",
    regra: "'Jamais' já é negativo. 'Jamais não' é dupla negação.",
    categoria: "dupla_negacao",
  },
  {
    errado: /\bnão\s+\w+\s+jamais\b/gi,
    certo: "… jamais / não …",
    regra: "'Não … jamais' é dupla negação. Escolha apenas um: 'jamais farei' ou 'não farei jamais' (neste caso, 'jamais' posposto é admitido por alguns gramáticos como reforço).",
    categoria: "dupla_negacao",
  },

  // ── PLEONASMO SINTÁTICO ──────────────────────────────────
  {
    errado: /\bapenas\s+somente\b/gi,
    certo: "apenas / somente",
    regra: "'Apenas' e 'somente' são sinônimos. Usar os dois juntos é pleonasmo.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bsó\s+apenas\b/gi,
    certo: "só / apenas",
    regra: "'Só' e 'apenas' são sinônimos. Usar os dois é redundante.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bsubir\s+para\s+cima\b/gi,
    certo: "subir",
    regra: "'Subir para cima' é pleonasmo. 'Subir' já indica movimento ascendente.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bdescer\s+para\s+baixo\b/gi,
    certo: "descer",
    regra: "'Descer para baixo' é pleonasmo. 'Descer' já indica movimento descendente.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bencontrar\s+com\b/gi,
    certo: "encontrar",
    regra: "'Encontrar' é transitivo direto: 'encontrei o diretor', não 'encontrei com o diretor'.",
    categoria: "regencia_verbal",
  },
  {
    errado: /\bvisitar\s+a\b(?!\s+(?:cidade|empresa|escola|família|casa|região))/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bhemorragia\s+de\s+sangue\b/gi,
    certo: "hemorragia",
    regra: "'Hemorragia' já significa sangramento. 'Hemorragia de sangue' é pleonasmo.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bcartão\s+postal\b/gi,
    certo: null, regra: null, categoria: null, // válido
  },
  {
    errado: /\belo\s+de\s+ligação\b/gi,
    certo: "elo",
    regra: "'Elo' já significa ligação. 'Elo de ligação' é pleonasmo.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bcolaborar\s+juntos\b/gi,
    certo: "colaborar",
    regra: "'Colaborar' já pressupõe ação conjunta. 'Colaborar juntos' é pleonasmo.",
    categoria: "pleonasmo",
  },

  // ── ORDEM DOS TERMOS / AMBIGUIDADE ──────────────────────
  {
    errado: /\bsomente\s+(\w+)\s+que\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bé\s+que\s+eu\s+quero\b/gi,
    certo: null, regra: null, categoria: null, // válido (construção de realce)
  },
  {
    errado: /\bpode\s+(?:sim|não)\s+fazer\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bquanto\s+mais\s+.{1,30}\s+mas\b/gi,
    certo: "quanto mais … mais",
    regra: "A correlação correta é 'quanto mais … mais', não 'quanto mais … mas'.",
    categoria: "correlacao",
  },
  {
    errado: /\btanto\s+.{1,20}\s+como\s+também\b/gi,
    certo: "tanto … quanto / não só … como também",
    regra: "'Tanto … como também' mistura duas estruturas. Use 'tanto … quanto' ou 'não só … como também'.",
    categoria: "correlacao",
  },
];

const REGRAS_ATIVAS = REGRAS_SINTAXE.filter(r => r.certo !== null && r.regra !== null);

const CORES_CATEGORIA = {
  regencia_verbal:    { cor: "#29b6f6", label: "Regência Verbal",    bg: "#e1f5fe" },
  regencia_nominal:   { cor: "#4fc3f7", label: "Regência Nominal",   bg: "#e1f5fe" },
  colocacao_pronominal:{ cor: "#7986cb", label: "Colocação Pron.",   bg: "#e8eaf6" },
  dupla_negacao:      { cor: "#ef5350", label: "Dupla Negação",      bg: "#ffebee" },
  pleonasmo:          { cor: "#ffa726", label: "Pleonasmo",          bg: "#fff3e0" },
  correlacao:         { cor: "#66bb6a", label: "Correlação",         bg: "#e8f5e9" },
};

function detectarErros(texto) {
  const erros = [];
  for (const regra of REGRAS_ATIVAS) {
    const re = new RegExp(regra.errado.source, regra.errado.flags.includes("g") ? regra.errado.flags : regra.errado.flags + "g");
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
    if (e.inicio >= ultimoFim) { filtrados.push(e); ultimoFim = e.fim; }
  }
  return filtrados;
}

const TEXTO_INICIAL = `O gerente chegou em Brasília na segunda-feira. Ela assistiu o documentário inteiro sem parar. A nova política implica em mudanças profundas nos processos. Nunca não conseguimos entregar antes do prazo. O projeto visou melhorar a comunicação. Apenas somente três pessoas compareceram à reunião. Eles decidiram subir para cima do palco antes da apresentação. Colaborar juntos foi o que permitiu o avanço do trabalho. Quanto mais treinamos, mas ficamos preparados.`;

export default function AgenteSintaxe() {
  const [texto, setTexto]           = useState(TEXTO_INICIAL);
  const [erros, setErros]           = useState([]);
  const [erroAtivo, setErroAtivo]   = useState(null);
  const [posFloat, setPosFloat]     = useState({ x: 0, y: 0 });
  const [corrigidos, setCorrigidos] = useState(0);
  const [filtro, setFiltro]         = useState(null); // filtra por categoria
  const containerRef = useRef(null);
  const timerRef     = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setErros(detectarErros(texto));
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [texto]);

  const aplicarCorrecao = useCallback((erro) => {
    const novo = texto.slice(0, erro.inicio) + erro.certo + texto.slice(erro.fim);
    setTexto(novo);
    setErroAtivo(null);
    setCorrigidos(c => c + 1);
  }, [texto]);

  const errosFiltrados = filtro ? erros.filter(e => e.categoria === filtro) : erros;

  const renderOverlay = () => {
    if (!errosFiltrados.length)
      return <span style={{ color: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{texto}</span>;

    const partes = [];
    let cursor = 0;
    for (const erro of errosFiltrados) {
      if (erro.inicio > cursor)
        partes.push(<span key={`t${cursor}`} style={{ color: "transparent" }}>{texto.slice(cursor, erro.inicio)}</span>);
      const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.regencia_verbal;
      partes.push(
        <span
          key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px wavy ${cat.cor}`,
            cursor: "pointer",
            background: erroAtivo?.inicio === erro.inicio ? cat.bg + "55" : "transparent",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => {
            const r  = e.target.getBoundingClientRect();
            const cr = containerRef.current.getBoundingClientRect();
            setPosFloat({ x: Math.min(r.left - cr.left, cr.width - 330), y: r.bottom - cr.top + 8 });
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
    if (cursor < texto.length)
      partes.push(<span key="tf" style={{ color: "transparent" }}>{texto.slice(cursor)}</span>);
    return <>{partes}</>;
  };

  // Contagem por categoria
  const contPorCat = {};
  for (const e of erros) contPorCat[e.categoria] = (contPorCat[e.categoria] || 0) + 1;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4f8",
      fontFamily: "'IBM Plex Serif', Georgia, serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "44px 24px",
    }}>

      {/* ── HEADER ── */}
      <div style={{ width: "100%", maxWidth: 780, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44,
            background: "#0d2137",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>⌥</div>
          <div>
            <div style={{ fontSize: 10, color: "#29b6f6", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "monospace" }}>AGENTE 3</div>
            <h1 style={{ fontSize: 26, color: "#0d2137", margin: 0, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Inspetor de Sintaxe
            </h1>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            {corrigidos > 0 && (
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#2e7d32" }}>✓ {corrigidos}</span>
            )}
            <span style={{
              fontFamily: "monospace", fontSize: 13,
              color: erros.length === 0 ? "#2e7d32" : "#c62828",
              background: erros.length === 0 ? "#e8f5e9" : "#ffebee",
              padding: "5px 14px", borderRadius: 4,
              border: `1px solid ${erros.length === 0 ? "#a5d6a7" : "#ef9a9a"}`,
            }}>
              {erros.length === 0 ? "✓ sem ocorrências" : `${erros.length} ocorrência${erros.length > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {/* Filtro por categoria */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 4 }}>
          <button
            onClick={() => setFiltro(null)}
            style={{
              padding: "4px 12px", fontSize: 11, fontFamily: "monospace",
              background: filtro === null ? "#0d2137" : "transparent",
              border: `1px solid ${filtro === null ? "#0d2137" : "#ccc"}`,
              color: filtro === null ? "#fff" : "#888",
              borderRadius: 4, cursor: "pointer",
            }}
          >todos</button>
          {Object.entries(CORES_CATEGORIA).map(([key, val]) => {
            const n = contPorCat[key] || 0;
            return (
              <button
                key={key}
                onClick={() => setFiltro(filtro === key ? null : key)}
                style={{
                  padding: "4px 12px", fontSize: 11, fontFamily: "monospace",
                  background: filtro === key ? val.cor : "transparent",
                  border: `1px solid ${filtro === key ? val.cor : n > 0 ? val.cor + "88" : "#ddd"}`,
                  color: filtro === key ? "#fff" : n > 0 ? val.cor : "#bbb",
                  borderRadius: 4, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                {val.label}
                {n > 0 && <span style={{
                  background: filtro === key ? "rgba(255,255,255,0.3)" : val.cor,
                  color: filtro === key ? "#fff" : "#fff",
                  fontSize: 9, padding: "1px 5px", borderRadius: 8, fontWeight: 700,
                }}>{n}</span>}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: "#999", margin: "10px 0 0", fontFamily: "sans-serif" }}>
          Regência verbal e nominal · Colocação pronominal · Dupla negação · Pleonasmo · Correlação
        </p>
      </div>

      {/* ── EDITOR ── */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 780, position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          padding: "20px 24px", fontSize: 17, lineHeight: 1.85,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          pointerEvents: "none", zIndex: 2,
          color: "transparent", userSelect: "none",
        }}>
          {renderOverlay()}
        </div>

        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          style={{
            width: "100%", minHeight: 280,
            padding: "20px 24px",
            fontSize: 17, lineHeight: 1.85,
            background: "#fff",
            color: "#0d2137",
            border: "1px solid #c8d8e8",
            borderRadius: 8,
            resize: "vertical", outline: "none",
            fontFamily: "'IBM Plex Serif', Georgia, serif",
            caretColor: "#29b6f6",
            boxSizing: "border-box",
            position: "relative", zIndex: 1,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            boxShadow: "0 2px 12px rgba(13,33,55,0.08)",
          }}
          spellCheck={false}
          placeholder="Digite ou cole seu texto aqui..."
        />

        {/* Float */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute",
              left: posFloat.x, top: posFloat.y,
              zIndex: 100, width: 320,
              background: "#0d2137",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor || "#29b6f6"}`,
              borderRadius: 10,
              padding: "14px 16px",
              boxShadow: "0 16px 48px rgba(13,33,55,0.3)",
              fontFamily: "sans-serif",
              pointerEvents: "all",
            }}
            onMouseLeave={() => setErroAtivo(null)}
          >
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 9, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
              background: CORES_CATEGORIA[erroAtivo.categoria]?.cor + "22",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor}55`,
              padding: "3px 9px", borderRadius: 3,
              marginBottom: 10, fontFamily: "monospace",
            }}>
              ⌥ {CORES_CATEGORIA[erroAtivo.categoria]?.label || erroAtivo.categoria}
            </div>

            <p style={{ fontSize: 13, color: "#8eaac8", margin: "0 0 12px", lineHeight: 1.6 }}>
              {erroAtivo.regra}
            </p>

            <div style={{ borderTop: "1px solid #1a3050", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#ef5350" }}>✗</span>
                <span style={{ fontSize: 13, color: "#ef9a9a", fontFamily: "monospace", background: "#200d0d", padding: "2px 8px", borderRadius: 3 }}>
                  {erroAtivo.texto}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#66bb6a" }}>✓</span>
                <span
                  style={{ fontSize: 13, color: "#a5d6a7", fontFamily: "monospace", background: "#0d2010", padding: "2px 8px", borderRadius: 3, cursor: "pointer", border: "1px solid #1e4d22" }}
                  onClick={() => aplicarCorrecao(erroAtivo)}
                >
                  {erroAtivo.certo}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 10, color: "#2a4060", fontFamily: "monospace" }}>
              clique na correção para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* ── RELATÓRIO ── */}
      {errosFiltrados.length > 0 && (
        <div style={{ width: "100%", maxWidth: 780, marginTop: 30, borderTop: "2px solid #0d2137", paddingTop: 24 }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#aaa", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
            Relatório do Agente 3 · {errosFiltrados.length} ocorrência{errosFiltrados.length > 1 ? "s" : ""}{filtro ? ` · filtro: ${CORES_CATEGORIA[filtro]?.label}` : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {errosFiltrados.map((erro, i) => {
              const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.regencia_verbal;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  background: "#fff",
                  border: "1px solid #e0eaf4",
                  borderLeft: `3px solid ${cat.cor}`,
                  borderRadius: 6,
                  boxShadow: "0 1px 4px rgba(13,33,55,0.05)",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#bbb", minWidth: 24, paddingTop: 3 }}>#{i+1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: "#c62828", background: "#ffebee", padding: "1px 6px", borderRadius: 3 }}>
                        {erro.texto}
                      </span>
                      <span style={{ color: "#ccc" }}>→</span>
                      <span
                        style={{ fontFamily: "monospace", fontSize: 13, color: "#2e7d32", background: "#e8f5e9", padding: "1px 6px", borderRadius: 3, cursor: "pointer", border: "1px solid #a5d6a7" }}
                        onClick={() => aplicarCorrecao(erro)}
                      >
                        {erro.certo}
                      </span>
                      <span style={{ fontSize: 9, color: cat.cor, background: cat.bg, border: `1px solid ${cat.cor}44`, padding: "1px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>
                        {cat.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#667", fontFamily: "sans-serif", lineHeight: 1.5 }}>
                      {erro.regra}
                    </div>
                  </div>
                  <button
                    onClick={() => aplicarCorrecao(erro)}
                    style={{ background: "#0d2137", border: "none", color: "#8eaac8", fontSize: 10, padding: "5px 12px", borderRadius: 4, cursor: "pointer", fontFamily: "monospace", whiteSpace: "nowrap" }}
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
      <div style={{ width: "100%", maxWidth: 780, marginTop: 40, paddingTop: 16, borderTop: "1px solid #dde8f0", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 10, color: "#bbb" }}>
        <span>agente-3 / sintaxe · {REGRAS_ATIVAS.length} padrões ativos</span>
        <span>600ms debounce · filtro por categoria disponível · coordenador: integrado</span>
      </div>
    </div>
  );
}
