import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENTE 5 — PONTUAÇÃO
// Domínio: vírgula obrigatória e proibida, ponto e vírgula,
// dois-pontos, travessão, reticências, ponto final,
// vírgula antes de "que", orações intercaladas
// ============================================================

const REGRAS_PONTUACAO = [

  // ── VÍRGULA PROIBIDA (sujeito + verbo) ───────────────────
  {
    errado: /\b(O\s+\w+(?:\s+\w+){0,3}),\s+((?:é|foi|será|estava|tinha|pode|deve|faz|tem)\b)/g,
    certo: null, regra: null, categoria: null, // válido contextualmente — não sinalizar
  },
  {
    errado: /\bO\s+diretor,\s+(?:é|foi|será|estava|decidiu|anunciou)\b/gi,
    certo: "O diretor (sem vírgula) é/foi…",
    regra: "Não se usa vírgula entre sujeito simples e verbo. A vírgula aqui separa ilegalmente sujeito de predicado.",
    categoria: "virgula_proibida",
  },
  {
    errado: /\bOs\s+alunos,\s+(?:foram|estão|devem|podem|precisam|realizam)\b/gi,
    certo: "Os alunos (sem vírgula) foram/estão…",
    regra: "Não se usa vírgula entre sujeito e verbo. Retire a vírgula após 'alunos'.",
    categoria: "virgula_proibida",
  },
  {
    errado: /\bA\s+empresa,\s+(?:anunciou|decidiu|investiu|contratou|demitiu|lançou)\b/gi,
    certo: "A empresa (sem vírgula) anunciou…",
    regra: "Não se usa vírgula entre sujeito e verbo. A vírgula aqui é incorreta.",
    categoria: "virgula_proibida",
  },

  // ── VÍRGULA OBRIGATÓRIA — ADJUNTO ADVERBIAL ANTECIPADO ──
  {
    errado: /^((?:Em|No|Na|Nos|Nas|Durante|Após|Antes\s+de|Desde|Por|Com|Sem|Para|Diante\s+de|A\s+partir\s+de)\s+[^,\n]{10,50})\s+(o|a|os|as|ele|ela|eles|elas|isso|este|esta|esse|essa)\b/gm,
    certo: "(adjunto adverbial), (sujeito/verbo)…",
    regra: "Adjunto adverbial longo deslocado para o início da frase exige vírgula antes do sujeito ou verbo.",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bNo\s+entanto\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "No entanto,",
    regra: "'No entanto' é conjunção/conectivo adversativo. Deve ser seguido de vírgula: 'No entanto, o resultado...'",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bPortanto\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Portanto,",
    regra: "'Portanto' é conjunção conclusiva. Deve ser seguido de vírgula: 'Portanto, concluímos que...'",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bEntretanto\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Entretanto,",
    regra: "'Entretanto' é conjunção adversativa. Deve ser seguido de vírgula.",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bAssim\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Assim,",
    regra: "'Assim' como conectivo conclusivo/sequencial deve ser seguido de vírgula.",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bAlém\s+disso\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Além disso,",
    regra: "'Além disso' é locução aditiva que exige vírgula: 'Além disso, o projeto...'",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bOu\s+seja\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Ou seja,",
    regra: "'Ou seja' introduz explicação e exige vírgula antes e depois: '..., ou seja, ...'",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bIsso\s+é\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Isso é,",
    regra: "'Isso é' como expressão explicativa deve ser isolado por vírgulas.",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bPor\s+exemplo\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Por exemplo,",
    regra: "'Por exemplo' exige vírgula após a locução: 'Por exemplo, o caso da...'",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bNo\s+entanto,?\s+(?=[a-záéíóúàâêôãõçü]).*\bno\s+entanto\s+(?=[a-záéíóúàâêôãõçü])/gis,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bDe\s+fato\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "De fato,",
    regra: "'De fato' como adjunto ou conectivo deve ser seguido de vírgula.",
    categoria: "virgula_obrigatoria",
  },
  {
    errado: /\bPor\s+(?:sua\s+vez|outro\s+lado|fim|último)\s+(?=[a-záéíóúàâêôãõçü])/gi,
    certo: "Por sua vez, / Por outro lado, / Por fim,",
    regra: "Locuções de transição ('por sua vez', 'por outro lado', 'por fim') exigem vírgula ao final.",
    categoria: "virgula_obrigatoria",
  },

  // ── VÍRGULA ANTES DE "QUE" ───────────────────────────────
  {
    errado: /\b(\w+)\s+que\s+(\w+(?:\s+\w+){0,5})\s+que\s+que\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\b(disse|afirmou|declarou|relatou|informou|anunciou|garantiu|alertou|explicou|argumentou)\s+que\s+que\b/gi,
    certo: "(verbo) que (sem repetição)",
    regra: "Duplo 'que' consecutivo é erro. Revise a estrutura da oração completiva.",
    categoria: "virgula_errada",
  },

  // ── VÍRGULA EM APOSTO ────────────────────────────────────
  {
    errado: /\bJoão\s+(?:o\s+diretor|o\s+gerente|o\s+presidente|o\s+fundador)\s+(?:disse|afirmou|decidiu|anunciou)\b/gi,
    certo: "João, o diretor, disse…",
    regra: "Aposto explicativo deve ser isolado por vírgulas: 'João, o diretor, disse que...'",
    categoria: "aposto",
  },
  {
    errado: /\bSão\s+Paulo\s+(?:a\s+maior\s+cidade|capital\s+econômica)\s+do\s+Brasil\s+(?:tem|é|possui|recebe)\b/gi,
    certo: "São Paulo, a maior cidade do Brasil, tem…",
    regra: "Aposto explicativo exige isolamento por vírgulas.",
    categoria: "aposto",
  },

  // ── DOIS-PONTOS ─────────────────────────────────────────
  {
    errado: /\bcomo\s*:\s*(?:por\s+exemplo|ex\.|e\.g\.)/gi,
    certo: "como (sem dois-pontos antes de 'por exemplo')",
    regra: "Após 'como', não se usam dois-pontos antes de 'por exemplo'. Use: 'como, por exemplo,' ou apenas 'como'.",
    categoria: "dois_pontos",
  },
  {
    errado: /\bsão\s*:\s*(?:o|a|os|as|um|uma)\b/gi,
    certo: "são o / são a…",
    regra: "Dois-pontos após verbo de ligação ('são') seguido de objeto direto simples é desnecessário e incorreto.",
    categoria: "dois_pontos",
  },
  {
    errado: /\bé\s*:\s*(?:o|a|os|as|um|uma)\b/gi,
    certo: "é o / é a…",
    regra: "Dois-pontos após verbo de ligação ('é') antes de predicativo simples é uso incorreto.",
    categoria: "dois_pontos",
  },

  // ── PONTO E VÍRGULA ─────────────────────────────────────
  {
    errado: /([a-záéíóúàâêôãõçü]{3,})\s*;\s*[Ee]\s+(?:também|ainda|além)/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\be\s*;\s*(?:o|a|os|as)\b/gi,
    certo: "e (sem ponto e vírgula antes)",
    regra: "Ponto e vírgula antes de 'e' é incomum e geralmente incorreto. Use vírgula ou inicie novo período.",
    categoria: "ponto_virgula",
  },

  // ── RETICÊNCIAS ──────────────────────────────────────────
  {
    errado: /\.{4,}/g,
    certo: "…",
    regra: "Reticências têm exatamente três pontos (…). Quatro ou mais pontos é uso incorreto.",
    categoria: "reticencias",
  },
  {
    errado: /\.\.\.\./g,
    certo: "...",
    regra: "Reticências têm exatamente três pontos. Use '...' ou o caractere '…'.",
    categoria: "reticencias",
  },
  {
    errado: /[.!?]\s*\.\.\./g,
    certo: "… (sem ponto antes das reticências)",
    regra: "Não se usa ponto final antes de reticências. As reticências já encerram a frase.",
    categoria: "reticencias",
  },

  // ── VÍRGULA ANTES DE "E" COORDENATIVO ───────────────────
  {
    errado: /,\s+e\s+(?:também\s+)?(?:o|a|os|as|ele|ela|isso|este|essa|esse)\s+(?:é|foi|tem|pode|deve)\b/gi,
    certo: null, regra: null, categoria: null,
  },

  // ── ORAÇÃO ADJETIVA EXPLICATIVA x RESTRITIVA ────────────
  {
    errado: /\bOs\s+alunos\s+que\s+estudaram\s+passaram\b/gi,
    certo: null, regra: null, categoria: null,
  },
  {
    errado: /\bOs\s+(?:funcionários|alunos|clientes|membros|participantes)\s+que\s+(?:\w+\s+){1,4}(?:foram|serão|podem|devem)\s+(?:todos\s+)?(?:aprovados|premiados|dispensados|convocados)\b/gi,
    certo: "Os funcionários, que…, foram… (adjetiva explicativa com vírgulas)",
    regra: "Oração adjetiva explicativa (refere-se a todos do conjunto) deve ser isolada por vírgulas. Sem vírgulas, torna-se restritiva (parte do conjunto).",
    categoria: "oração_adjetiva",
  },

  // ── TRAVESSÃO / PARÊNTESES ───────────────────────────────
  {
    errado: /\s+-\s+(?=[A-ZÁÉÍÓÚ])/g,
    certo: " — (travessão) ou vírgula",
    regra: "Para isolar orações intercaladas, use travessão (—) ou vírgulas, não hífen simples (-). O hífen tem funções morfológicas, não sintáticas.",
    categoria: "travessao",
  },
];

const REGRAS_ATIVAS = REGRAS_PONTUACAO.filter(r => r.certo !== null && r.regra !== null);

const CORES_CATEGORIA = {
  virgula_obrigatoria: { cor: "#f76707", label: "Vírgula Obrigatória", bg: "#fff4e6" },
  virgula_proibida:    { cor: "#e03131", label: "Vírgula Proibida",    bg: "#fff5f5" },
  virgula_errada:      { cor: "#c92a2a", label: "Vírgula Errada",      bg: "#ffe3e3" },
  aposto:              { cor: "#ae3ec9", label: "Aposto",              bg: "#f8f0ff" },
  dois_pontos:         { cor: "#1971c2", label: "Dois-Pontos",         bg: "#e8f4fd" },
  ponto_virgula:       { cor: "#0c8599", label: "Ponto e Vírgula",     bg: "#e3fafc" },
  reticencias:         { cor: "#5c940d", label: "Reticências",         bg: "#f4fce3" },
  oração_adjetiva:     { cor: "#862e9c", label: "Oração Adjetiva",     bg: "#f3f0ff" },
  travessao:           { cor: "#495057", label: "Travessão",           bg: "#f8f9fa" },
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

const TEXTO_INICIAL = `No entanto o projeto avançou. Portanto decidimos seguir em frente. A empresa, anunciou os resultados ontem. Além disso os colaboradores foram premiados. Por exemplo as metas foram superadas. Os dois-pontos são: o problema aqui. O texto terminou....`;

export default function AgentePontuacao() {
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
      const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.virgula_obrigatoria;
      const isAtivo = erroAtivo?.inicio === erro.inicio;
      partes.push(
        <span key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px wavy ${cat.cor}`,
            cursor: "pointer",
            background: isAtivo ? cat.cor + "18" : "transparent",
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafaf8",
      fontFamily: "sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 24px",
    }}>

      {/* Header — estilo editorial tipográfico */}
      <div style={{ width: "100%", maxWidth: 760, marginBottom: 28 }}>
        <div style={{
          borderTop: "3px solid #1a1a1a",
          borderBottom: "1px solid #1a1a1a",
          padding: "16px 0",
          marginBottom: 20,
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{
              fontFamily: "monospace", fontSize: 10,
              letterSpacing: "0.24em", color: "#f76707",
              background: "#fff4e6", border: "1px solid #f7670733",
              padding: "3px 8px", borderRadius: 2,
              textTransform: "uppercase",
            }}>AGENTE 5</span>
            <h1 style={{
              fontSize: 28, fontWeight: 900, color: "#1a1a1a",
              margin: 0,
              fontFamily: "'Georgia', serif",
              letterSpacing: "-0.04em",
            }}>
              Pontuação
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {totalCorrigidos > 0 && (
              <span style={{ fontSize: 12, color: "#2f9e44", fontFamily: "monospace" }}>
                ✓ {totalCorrigidos}
              </span>
            )}
            <span style={{
              fontSize: 12, fontFamily: "monospace",
              color: erros.length === 0 ? "#2f9e44" : "#e03131",
              background: erros.length === 0 ? "#ebfbee" : "#fff5f5",
              border: `1px solid ${erros.length === 0 ? "#8ce99a" : "#ffa8a8"}`,
              padding: "4px 12px", borderRadius: 3,
            }}>
              {erros.length === 0 ? "✓ sem ocorrências" : `${erros.length} ocorrência${erros.length > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#888", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
          Vírgula obrigatória e proibida · Dois-pontos · Ponto e vírgula · Aposto · Reticências · Oração adjetiva · Travessão
        </p>
      </div>

      {/* Editor */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 760, position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          padding: "22px 28px", fontSize: 17, lineHeight: 1.9,
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
            padding: "22px 28px", fontSize: 17, lineHeight: 1.9,
            background: "#ffffff", color: "#1a1a1a",
            border: "1px solid #ddd",
            borderRadius: 4,
            resize: "vertical", outline: "none",
            fontFamily: "'Georgia', serif",
            caretColor: "#f76707",
            boxSizing: "border-box", position: "relative", zIndex: 1,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
          spellCheck={false}
          placeholder="Digite para inspecionar pontuação..."
        />

        {/* Float */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute", left: posFloat.x, top: posFloat.y,
              zIndex: 100, width: 320,
              background: "#1a1a1a",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor || "#f76707"}55`,
              borderRadius: 8, padding: "15px 17px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
              fontFamily: "sans-serif", pointerEvents: "all",
            }}
            onMouseLeave={() => setErroAtivo(null)}
          >
            <div style={{
              fontSize: 9, fontWeight: 700, fontFamily: "monospace",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
              background: CORES_CATEGORIA[erroAtivo.categoria]?.cor + "22",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor}44`,
              padding: "3px 8px", borderRadius: 3,
              display: "inline-block", marginBottom: 11,
            }}>
              {CORES_CATEGORIA[erroAtivo.categoria]?.label}
            </div>

            <p style={{ fontSize: 13, color: "#aaa", margin: "0 0 13px", lineHeight: 1.6 }}>
              {erroAtivo.regra}
            </p>

            <div style={{ borderTop: "1px solid #333", paddingTop: 11, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#ff6b6b", fontSize: 12, marginTop: 1 }}>✗</span>
                <span style={{
                  fontSize: 13, fontFamily: "monospace", color: "#ff8a8a",
                  background: "#2d1010", padding: "2px 8px", borderRadius: 3, lineHeight: 1.5,
                }}>{erroAtivo.texto}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#69db7c", fontSize: 12, marginTop: 1 }}>✓</span>
                <span
                  style={{
                    fontSize: 13, fontFamily: "monospace", color: "#8ce99a",
                    background: "#102010", padding: "2px 8px", borderRadius: 3,
                    cursor: "pointer", border: "1px solid #2e5d2f", lineHeight: 1.5,
                  }}
                  onClick={() => aplicarCorrecao(erroAtivo)}
                >{erroAtivo.certo}</span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#444", fontFamily: "monospace" }}>
              clique para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div style={{ width: "100%", maxWidth: 760, marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {Object.entries(CORES_CATEGORIA).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888" }}>
            <div style={{ width: 18, height: 3, background: val.cor, borderRadius: 2 }} />
            <span>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Relatório */}
      {erros.length > 0 && (
        <div style={{ width: "100%", maxWidth: 760, marginTop: 28, borderTop: "2px solid #1a1a1a", paddingTop: 20 }}>
          <div style={{
            fontSize: 10, color: "#aaa", letterSpacing: "0.2em",
            textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace",
          }}>
            Relatório do Agente 5
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {erros.map((erro, i) => {
              const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.virgula_obrigatoria;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px", background: "#f8f8f6",
                  borderRadius: 4, border: "1px solid #eee",
                  borderLeft: `3px solid ${cat.cor}`,
                }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#ccc", marginTop: 3, minWidth: 24 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{
                        fontSize: 13, fontFamily: "monospace",
                        color: "#c92a2a", background: "#ffe3e3",
                        padding: "1px 6px", borderRadius: 3,
                      }}>{erro.texto}</span>
                      <span style={{ color: "#ccc" }}>→</span>
                      <span style={{
                        fontSize: 12, fontFamily: "monospace",
                        color: "#2f9e44", background: "#ebfbee",
                        padding: "1px 6px", borderRadius: 3,
                        cursor: "pointer", border: "1px solid #8ce99a", lineHeight: 1.5,
                      }} onClick={() => aplicarCorrecao(erro)}>{erro.certo}</span>
                      <span style={{
                        fontSize: 9, color: cat.cor, background: cat.bg,
                        border: `1px solid ${cat.cor}44`,
                        padding: "1px 6px", borderRadius: 3,
                        fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>{cat.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{erro.regra}</div>
                  </div>
                  <button onClick={() => aplicarCorrecao(erro)} style={{
                    background: "#1a1a1a", border: "none", color: "#aaa",
                    fontSize: 11, padding: "4px 10px", borderRadius: 4,
                    cursor: "pointer", fontFamily: "monospace", whiteSpace: "nowrap",
                  }}>corrigir</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        width: "100%", maxWidth: 760, marginTop: 32,
        paddingTop: 14, borderTop: "1px solid #eee",
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#ccc", fontFamily: "monospace",
      }}>
        <span>agente-5 / pontuação · {REGRAS_ATIVAS.length} padrões ativos</span>
        <span>detecção: 600ms debounce · coordenador: pendente</span>
      </div>
    </div>
  );
}
