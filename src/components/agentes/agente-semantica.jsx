import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENTE 4 — SEMÂNTICA
// Domínio: paronímia, polissemia mal usada, pleonasmo vicioso,
// redundância, falsos cognatos, ambiguidade lexical,
// eufemismo excessivo, sentido denotativo x conotativo
// ============================================================

const REGRAS_SEMANTICA = [

  // ── PARONÍMIA ────────────────────────────────────────────
  {
    errado: /\bdescriminar\b/gi,
    certo: "discriminar",
    regra: "'Discriminar' = distinguir/segregar. 'Descriminar' = retirar o caráter criminoso de algo. São palavras diferentes.",
    categoria: "paronimia",
  },
  {
    errado: /\bdescrição\s+(?:racial|social|étnica|de\s+gênero)\b/gi,
    certo: "discriminação racial/social/étnica",
    regra: "'Discriminação' = tratamento diferenciado/injusto. 'Descrição' = representação detalhada. Verifique o sentido.",
    categoria: "paronimia",
  },
  {
    errado: /\binfligir\s+(?:uma\s+)?(?:regra|norma|lei|contrato)\b/gi,
    certo: "infringir a regra / a norma / a lei",
    regra: "'Infringir' = violar uma norma. 'Infligir' = impor um castigo. 'Infligir uma regra' mistura os dois.",
    categoria: "paronimia",
  },
  {
    errado: /\binfringir\s+(?:uma\s+)?(?:pena|castigo|punição|sofrimento)\b/gi,
    certo: "infligir uma pena / castigo / punição",
    regra: "'Infligir' = impor um sofrimento/punição. 'Infringir' = violar uma norma. Sentidos opostos.",
    categoria: "paronimia",
  },
  {
    errado: /\bemer(?:g|j)ir\b/gi,
    certo: "emergir (vir à tona) / imergir (mergulhar)",
    regra: "'Emergir' = vir à superfície. 'Imergir' = mergulhar, afundar. Verifique o sentido desejado.",
    categoria: "paronimia",
  },
  {
    errado: /\bimergir\s+(?:do|da|de)\b/gi,
    certo: "emergir de",
    regra: "'Imergir' = entrar/afundar em algo. Para 'sair de', use 'emergir': 'emergiu da crise'.",
    categoria: "paronimia",
  },
  {
    errado: /\bcompreender\s+(?:\w+\s+)?(?:erros|falhas|a\s+situação)\s+(?:de\s+)?(?:outrem|outros|alguém)\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bratificar\s+(?:uma\s+)?(?:erro|engano|equívoco)\b/gi,
    certo: "retificar o erro",
    regra: "'Retificar' = corrigir um erro. 'Ratificar' = confirmar, aprovar. Sentidos opostos.",
    categoria: "paronimia",
  },
  {
    errado: /\bratificar\s+(?:uma\s+)?(?:informação\s+errada|dado\s+incorreto|equívoco)\b/gi,
    certo: "retificar a informação errada",
    regra: "'Retificar' = corrigir. 'Ratificar' = confirmar. Não se ratifica um erro — retifica-se.",
    categoria: "paronimia",
  },
  {
    errado: /\beminente\s+(?:perigo|risco|ameaça|colapso|chegada)\b/gi,
    certo: "iminente perigo / risco iminente",
    regra: "'Iminente' = que está prestes a acontecer. 'Eminente' = ilustre, elevado. 'Perigo iminente', não 'eminente'.",
    categoria: "paronimia",
  },
  {
    errado: /\bperigo\s+eminente\b/gi,
    certo: "perigo iminente",
    regra: "'Iminente' = prestes a ocorrer. 'Eminente' = notável/elevado. 'Perigo iminente' é o correto.",
    categoria: "paronimia",
  },
  {
    errado: /\brisco\s+eminente\b/gi,
    certo: "risco iminente",
    regra: "'Iminente' = prestes a ocorrer. Use 'risco iminente'.",
    categoria: "paronimia",
  },
  {
    errado: /\bprincipal\s+(?=\w+)\s+protagonista\b/gi,
    certo: "protagonista",
    regra: "'Protagonista' já significa o personagem/papel principal. 'Principal protagonista' é pleonasmo.",
    categoria: "pleonasmo",
  },
  {
    errado: /\btrajetória\s+de\s+vida\b/gi,
    certo: "trajetória",
    regra: "'Trajetória' já implica um percurso de vida. 'Trajetória de vida' pode ser redundante em contextos formais.",
    categoria: "redundancia",
  },
  {
    errado: /\bmonopólio\s+exclusivo\b/gi,
    certo: "monopólio",
    regra: "'Monopólio' já significa domínio exclusivo. 'Monopólio exclusivo' é pleonasmo.",
    categoria: "pleonasmo",
  },
  {
    errado: /\belo\s+de\s+ligação\b/gi,
    certo: "elo",
    regra: "'Elo' já significa ligação/conexão. 'Elo de ligação' é pleonasmo vicioso.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bhegemonias?\s+absoluta\b/gi,
    certo: "hegemonia",
    regra: "'Hegemonia' já implica domínio absoluto/supremacia. O adjetivo 'absoluta' é redundante.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bconsenso\s+geral\b/gi,
    certo: "consenso",
    regra: "'Consenso' já pressupõe acordo geral. 'Consenso geral' é pleonasmo.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bsubir\s+para\s+cima\b/gi,
    certo: "subir",
    regra: "'Subir' já implica movimento para cima. 'Subir para cima' é pleonasmo vicioso.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bdescer\s+(?:para\s+)?abaixo\b/gi,
    certo: "descer",
    regra: "'Descer' já implica movimento para baixo. 'Descer abaixo' é pleonasmo vicioso.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bencarar\s+de\s+frente\b/gi,
    certo: "encarar",
    regra: "'Encarar' já significa enfrentar de frente. A expressão 'encarar de frente' é pleonástica.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bprever\s+antecipadamente\b/gi,
    certo: "prever",
    regra: "'Prever' já é 'ver antes/antecipadamente'. O advérbio é redundante.",
    categoria: "pleonasmo",
  },
  {
    errado: /\brecapitular\s+novamente\b/gi,
    certo: "recapitular",
    regra: "'Recapitular' já implica retomar/repetir. 'Novamente' é redundante.",
    categoria: "pleonasmo",
  },
  {
    errado: /\bviés\s+tendencioso\b/gi,
    certo: "viés",
    regra: "'Viés' já denota inclinação tendenciosa. 'Viés tendencioso' é redundante.",
    categoria: "pleonasmo",
  },

  // ── REDUNDÂNCIA / TAUTOLOGIA ─────────────────────────────
  {
    errado: /\bfato\s+real\b/gi,
    certo: "fato",
    regra: "'Fato' já denota algo real/acontecido. 'Fato real' é tautologia.",
    categoria: "redundancia",
  },
  {
    errado: /\bdetalhes\s+minuciosos\b/gi,
    certo: "detalhes / minúcias",
    regra: "'Detalhe' já é algo minucioso. 'Detalhes minuciosos' é redundante.",
    categoria: "redundancia",
  },
  {
    errado: /\bdividir\s+em\s+duas\s+metades\b/gi,
    certo: "dividir ao meio / dividir em duas partes",
    regra: "'Metade' já significa cada uma das duas partes iguais. 'Duas metades' é redundante.",
    categoria: "redundancia",
  },
  {
    errado: /\bjá\s+(?:antes\s+)?havia\s+(?:já\s+)?(?:sido|sido)\b/gi,
    certo: "já havia sido / havia sido",
    regra: "Duplo 'já' com 'havia sido' é redundante. Use apenas um dos dois.",
    categoria: "redundancia",
  },
  {
    errado: /\bopinião\s+pessoal\b/gi,
    certo: "opinião",
    regra: "'Opinião' já é pessoal por natureza. 'Opinião pessoal' é pleonasmo em contextos formais.",
    categoria: "redundancia",
  },
  {
    errado: /\bcolaborar\s+juntos\b/gi,
    certo: "colaborar",
    regra: "'Colaborar' já pressupõe ação conjunta. 'Colaborar juntos' é redundante.",
    categoria: "redundancia",
  },

  // ── AMBIGUIDADE LEXICAL ───────────────────────────────────
  {
    errado: /\bele\s+viu\s+o\s+homem\s+com\s+(?:o\s+)?binóculos?\b/gi,
    certo: "ele, com binóculo, viu o homem / ele viu o homem que carregava binóculo",
    regra: "Ambiguidade: 'viu o homem com binóculo' — foi ele ou o homem que tinha o binóculo? Reescreva para deixar claro.",
    categoria: "ambiguidade",
  },
  {
    errado: /\bliteralmente\s+(?:morri|matei|explodi|destruí)\b/gi,
    certo: "(remova 'literalmente' ou use 'quase' / 'praticamente')",
    regra: "'Literalmente' significa 'de forma exata, não figurada'. Usá-lo com hipérboles ('literalmente morri') é contradição semântica.",
    categoria: "ambiguidade",
  },

  // ── FALSOS COGNATOS / USO INADEQUADO ─────────────────────
  {
    errado: /\batualmente\s+(?=em\s+\d{4}|no\s+ano\s+de\s+\d{4})/gi,
    certo: "na época / naquele ano / à época",
    regra: "'Atualmente' = no presente. Se você está falando de um período passado, use 'na época', 'naquele ano'.",
    categoria: "inadequado",
  },
  {
    errado: /\bno\s+caso\s+de\s+que\b/gi,
    certo: "no caso de / caso",
    regra: "'No caso de que' é calco do espanhol/inglês. Em português: 'no caso de' + infinitivo ou 'caso' + subjuntivo.",
    categoria: "inadequado",
  },
  {
    errado: /\bmake\s+sentido\b|\bfaz\s+sentido\s+(?:para\s+mim)\b/gi,
    certo: "faz sentido",
    regra: null, categoria: null,
  },
  {
    errado: /\bno\s+sentido\s+de\s+que\b/gi,
    certo: "no sentido de que",
    regra: null, categoria: null,
  },
  {
    errado: /\bpretender\s+(?=que)\b/gi,
    certo: "fingir / aparentar",
    regra: "'Pretender' em português = ter a intenção de. Para 'fingir', não use 'pretender' (falso cognato do inglês 'to pretend').",
    categoria: "inadequado",
  },
];

const REGRAS_ATIVAS = REGRAS_SEMANTICA.filter(r => r.certo !== null && r.regra !== null);

const CORES_CATEGORIA = {
  paronimia:   { cor: "#f03e3e", label: "Paronímia",   bg: "#fff5f5" },
  pleonasmo:   { cor: "#e67700", label: "Pleonasmo",   bg: "#fff9db" },
  redundancia: { cor: "#d9480f", label: "Redundância", bg: "#fff4e6" },
  ambiguidade: { cor: "#5c7cfa", label: "Ambiguidade", bg: "#edf2ff" },
  inadequado:  { cor: "#862e9c", label: "Uso Inadequado", bg: "#f8f0ff" },
};

function detectarErros(texto) {
  const candidatos = [];
  for (const regra of REGRAS_ATIVAS) {
    const flags = regra.errado.flags.includes("g") ? regra.errado.flags : regra.errado.flags + "g";
    const re = new RegExp(regra.errado.source, flags);
    let match;
    while ((match = re.exec(texto)) !== null) {
      candidatos.push({
        inicio: match.index,
        fim: match.index + match[0].length,
        texto: match[0],
        certo: regra.certo,
        regra: regra.regra,
        categoria: regra.categoria,
      });
    }
  }
  candidatos.sort((a, b) => a.inicio - b.inicio || b.fim - a.fim);
  const resultado = [];
  let ultimoFim = -1;
  for (const c of candidatos) {
    if (c.inicio >= ultimoFim) { resultado.push(c); ultimoFim = c.fim; }
  }
  return resultado;
}

const TEXTO_INICIAL = `O principal protagonista da história subiu para cima do palco e encarou de frente seus adversários. O elo de ligação entre as partes foi o consenso geral estabelecido. Há um risco eminente de colapso no sistema. A empresa pretende que tudo está bem, mas os fatos reais mostram o contrário. Precisamos prever antecipadamente os cenários possíveis para descriminar as prioridades.`;

export default function AgenteSemantica() {
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [erros, setErros] = useState([]);
  const [erroAtivo, setErroAtivo] = useState(null);
  const [posFloat, setPosFloat] = useState({ x: 0, y: 0 });
  const [totalCorrigidos, setTotalCorrigidos] = useState(0);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setErros(detectarErros(texto)), 600);
    return () => clearTimeout(timerRef.current);
  }, [texto]);

  const aplicarCorrecao = useCallback((erro) => {
    setTexto(t => t.slice(0, erro.inicio) + erro.certo + t.slice(erro.fim));
    setErroAtivo(null);
    setTotalCorrigidos(c => c + 1);
  }, []);

  const renderOverlay = () => {
    const partes = [];
    let cursor = 0;
    for (const erro of erros) {
      if (erro.inicio > cursor)
        partes.push(<span key={`t${cursor}`} style={{ color: "transparent" }}>{texto.slice(cursor, erro.inicio)}</span>);
      const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.paronimia;
      const isAtivo = erroAtivo?.inicio === erro.inicio;
      partes.push(
        <span key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px wavy ${cat.cor}`,
            cursor: "pointer",
            background: isAtivo ? cat.cor + "15" : "transparent",
            transition: "background 0.12s", borderRadius: 2,
          }}
          onMouseEnter={ev => {
            const rect = ev.target.getBoundingClientRect();
            const cRect = containerRef.current?.getBoundingClientRect();
            setPosFloat({
              x: Math.min(rect.left - (cRect?.left || 0), (cRect?.width || 600) - 330),
              y: rect.bottom - (cRect?.top || 0) + 8,
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
    if (cursor < texto.length)
      partes.push(<span key="tf" style={{ color: "transparent" }}>{texto.slice(cursor)}</span>);
    return <>{partes}</>;
  };

  // Contagem por categoria para o painel lateral
  const countPorCat = Object.keys(CORES_CATEGORIA).map(cat => ({
    cat,
    count: erros.filter(e => e.categoria === cat).length,
    ...CORES_CATEGORIA[cat],
  })).filter(c => c.count > 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1c1410",
      fontFamily: "sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 24px",
    }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 800, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 10, letterSpacing: "0.22em",
                color: "#f03e3e",
                background: "#3a1010",
                border: "1px solid #f03e3e33",
                padding: "3px 10px", borderRadius: 2,
                textTransform: "uppercase",
              }}>AGENTE 4</span>
              <h1 style={{
                fontSize: 26, fontWeight: 300, color: "#f0e8d8",
                margin: 0, fontFamily: "'Georgia', serif",
                letterSpacing: "0.04em",
              }}>
                Inspetor de <em style={{ fontWeight: 700, fontStyle: "normal", color: "#ffd43b" }}>Semântica</em>
              </h1>
            </div>
            <p style={{ fontSize: 12, color: "#6a5a4a", margin: 0, lineHeight: 1.6 }}>
              Paronímia · Pleonasmo vicioso · Redundância · Ambiguidade lexical · Uso inadequado
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {totalCorrigidos > 0 && (
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#69db7c" }}>✓ {totalCorrigidos} corrigidos</span>
            )}
            <span style={{
              fontSize: 12, fontFamily: "monospace",
              color: erros.length === 0 ? "#69db7c" : "#ffd43b",
              background: erros.length === 0 ? "#1a3a1a" : "#3a3010",
              border: `1px solid ${erros.length === 0 ? "#2e5d2f" : "#ffd43b44"}`,
              padding: "5px 14px", borderRadius: 3,
            }}>
              {erros.length === 0 ? "✓ sem ocorrências" : `${erros.length} ocorrência${erros.length > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {/* Mini painel de categorias com contagem */}
        {countPorCat.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {countPorCat.map(c => (
              <div key={c.cat} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px",
                background: c.cor + "14",
                border: `1px solid ${c.cor}33`,
                borderRadius: 4,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.cor }} />
                <span style={{ fontSize: 11, color: c.cor, fontFamily: "monospace" }}>{c.label}</span>
                <span style={{ fontSize: 11, color: c.cor, fontFamily: "monospace", fontWeight: 700 }}>{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 800, position: "relative" }}>
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
            width: "100%", minHeight: 260,
            padding: "22px 26px", fontSize: 17, lineHeight: 1.85,
            background: "#140e0a", color: "#e8dcc8",
            border: "1px solid #2a1e14",
            borderRadius: 8,
            resize: "vertical", outline: "none",
            fontFamily: "'Georgia', serif", caretColor: "#ffd43b",
            boxSizing: "border-box", position: "relative", zIndex: 1,
          }}
          spellCheck={false}
          placeholder="Digite para inspecionar semântica: paronímia, pleonasmos, redundâncias..."
        />

        {/* Float */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute", left: posFloat.x, top: posFloat.y,
              zIndex: 100, width: 320,
              background: "#0a0806",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor || "#f03e3e"}44`,
              borderRadius: 10, padding: "16px 18px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              fontFamily: "sans-serif", pointerEvents: "all",
            }}
            onMouseLeave={() => setErroAtivo(null)}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: "monospace",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
              }}>
                {CORES_CATEGORIA[erroAtivo.categoria]?.label}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "#9a8878", margin: "0 0 14px", lineHeight: 1.6 }}>
              {erroAtivo.regra}
            </p>

            <div style={{ borderTop: "1px solid #1e1510", paddingTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#f03e3e", marginTop: 1 }}>✗</span>
                <span style={{
                  fontSize: 13, color: "#ffa8a8", fontFamily: "monospace",
                  background: "#2a0808", padding: "2px 8px", borderRadius: 3, lineHeight: 1.5,
                }}>
                  {erroAtivo.texto}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#ffd43b", marginTop: 1 }}>✓</span>
                <span style={{
                  fontSize: 13, color: "#ffe066", fontFamily: "monospace",
                  background: "#2a2008", padding: "2px 8px", borderRadius: 3,
                  cursor: "pointer", border: "1px solid #ffd43b44", lineHeight: 1.5,
                }} onClick={() => aplicarCorrecao(erroAtivo)}>
                  {erroAtivo.certo}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#3a2a1a", fontFamily: "monospace" }}>
              clique para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div style={{ width: "100%", maxWidth: 800, marginTop: 16, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {Object.entries(CORES_CATEGORIA).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5a4a3a" }}>
            <div style={{ width: 18, height: 3, background: val.cor, borderRadius: 2 }} />
            <span>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Relatório */}
      {erros.length > 0 && (
        <div style={{ width: "100%", maxWidth: 800, marginTop: 28, borderTop: "1px solid #2a1e14", paddingTop: 22 }}>
          <div style={{ fontSize: 10, color: "#5a4a3a", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace" }}>
            Relatório do Agente 4
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {erros.map((erro, i) => {
              const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.paronimia;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  background: "#120e0a",
                  borderRadius: 6,
                  border: "1px solid #1e1510",
                  borderLeft: `3px solid ${cat.cor}`,
                }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#3a2a1a", marginTop: 3, minWidth: 24 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#ffa8a8", background: "#2a0808", padding: "1px 6px", borderRadius: 3 }}>
                        {erro.texto}
                      </span>
                      <span style={{ color: "#3a2a1a" }}>→</span>
                      <span style={{
                        fontSize: 12, fontFamily: "monospace", color: "#ffe066",
                        background: "#2a2008", padding: "1px 6px", borderRadius: 3,
                        cursor: "pointer", border: "1px solid #ffd43b44", lineHeight: 1.5,
                      }} onClick={() => aplicarCorrecao(erro)}>
                        {erro.certo}
                      </span>
                      <span style={{
                        fontSize: 9, color: cat.cor, background: cat.cor + "18",
                        border: `1px solid ${cat.cor}33`, padding: "1px 6px", borderRadius: 3,
                        fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        {cat.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6a5a4a", lineHeight: 1.5 }}>{erro.regra}</div>
                  </div>
                  <button onClick={() => aplicarCorrecao(erro)} style={{
                    background: "none", border: "1px solid #2a1e14",
                    color: "#5a4a3a", fontSize: 11, padding: "4px 10px",
                    borderRadius: 4, cursor: "pointer", fontFamily: "monospace", whiteSpace: "nowrap",
                  }}>corrigir</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        width: "100%", maxWidth: 800, marginTop: 32,
        paddingTop: 14, borderTop: "1px solid #1e1510",
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#3a2a1a", fontFamily: "monospace",
      }}>
        <span>agente-4 / semântica · {REGRAS_ATIVAS.length} padrões ativos</span>
        <span>detecção: 600ms debounce · coordenador: pendente</span>
      </div>
    </div>
  );
}
