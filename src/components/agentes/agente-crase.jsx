import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENTE 6 — CRASE
// Domínio: crase obrigatória, proibida e facultativa.
// Regras cobertas: locuções adverbiais, pronomes demonstrativos,
// locuções prepositivas, nomes femininos, antes de "que" e "qual",
// crase antes de pronomes pessoais, horas, países, nomes próprios
// ============================================================

const REGRAS_CRASE = [

  // ── CRASE OBRIGATÓRIA — LOCUÇÕES ADVERBIAIS ──────────────
  {
    errado: /\ba\s+medida\s+que\b/gi,
    certo: "à medida que",
    regra: "'À medida que' é locução adverbial proporcional e exige crase. Não confundir com 'na medida em que' (= porque).",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+primeira\s+vista\b/gi,
    certo: "à primeira vista",
    regra: "'À primeira vista' é locução adverbial que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+toa\b/gi,
    certo: "à toa",
    regra: "'À toa' é locução adverbial que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+vontade\b/gi,
    certo: "à vontade",
    regra: "'À vontade' é locução adverbial que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+beça\b/gi,
    certo: "à beça",
    regra: "'À beça' (muito, em abundância) é locução adverbial que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+direita\b(?!\s+de)/gi,
    certo: "à direita",
    regra: "'À direita' como locução adverbial de lugar exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+esquerda\b(?!\s+de)/gi,
    certo: "à esquerda",
    regra: "'À esquerda' como locução adverbial de lugar exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+tarde\b(?!\s+de|\s+\w+a)/gi,
    certo: "à tarde",
    regra: "'À tarde' como locução adverbial de tempo exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+noite\b(?!\s+de|\s+\w+a)/gi,
    certo: "à noite",
    regra: "'À noite' como locução adverbial de tempo exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+moda\s+de\b/gi,
    certo: "à moda de",
    regra: "'À moda de' é locução prepositiva que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+base\s+de\b/gi,
    certo: "à base de",
    regra: "'À base de' é locução prepositiva que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+beira\s+de\b/gi,
    certo: "à beira de",
    regra: "'À beira de' é locução prepositiva que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+custa\s+de\b/gi,
    certo: "à custa de",
    regra: "'À custa de' é locução prepositiva que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+mercê\s+de\b/gi,
    certo: "à mercê de",
    regra: "'À mercê de' (sujeito ao poder de) é locução que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+luz\s+de\b/gi,
    certo: "à luz de",
    regra: "'À luz de' (em função de / considerando) é locução que exige crase.",
    categoria: "obrigatoria",
  },
  {
    errado: /\ba\s+flor\s+da\s+pele\b/gi,
    certo: "à flor da pele",
    regra: "'À flor da pele' é locução adverbial que exige crase.",
    categoria: "obrigatoria",
  },

  // ── CRASE OBRIGATÓRIA — HORAS ────────────────────────────
  {
    errado: /\ba\s+(?:uma|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s+horas?\b/gi,
    certo: "às … horas",
    regra: "Antes de horas determinadas, a crase é obrigatória: 'às três horas', 'à uma hora'.",
    categoria: "horas",
  },
  {
    errado: /\ba\s+1[0-9]h\b|\ba\s+[2-9]h\b/gi,
    certo: "às … h",
    regra: "Antes de horas, a crase é obrigatória: 'às 9h', 'às 14h'. Use 'à' apenas para a 1ª hora.",
    categoria: "horas",
  },

  // ── CRASE OBRIGATÓRIA — PRONOME DEMONSTRATIVO ────────────
  {
    errado: /\b(?:referiu-se|aludiu|chegou|voltou|retornou|equivale|corresponde|recorreu)\s+a\s+(?:aquela|aquele|aquilo|aquelas|aqueles)\b/gi,
    certo: "… à aquela / àquele / àquilo / àquelas / àqueles",
    regra: "Antes de pronomes demonstrativos 'aquele/a/o', a preposição 'a' + artigo 'a' formam 'à': 'chegou àquela cidade', 'recorreu àquilo'.",
    categoria: "demonstrativo",
  },
  {
    errado: /\bsemelhante\s+a\s+(?:aquela|aquele|aquilo|aquelas|aqueles)\b/gi,
    certo: "semelhante àquela / àquele / àquilo",
    regra: "Preposição 'a' antes de 'aquele/a/o' sempre forma crase: 'semelhante àquele caso'.",
    categoria: "demonstrativo",
  },

  // ── CRASE PROIBIDA — ANTES DE MASCULINO ──────────────────
  {
    errado: /\bà\s+(?:tempo|ponto|custo|risco|cargo|lado|modo|nível|respeito|exemplo)\b/gi,
    certo: "a tempo / a ponto / a custo / a risco / a cargo / a lado / a modo / a nível / a respeito / a exemplo",
    regra: "Não há crase antes de substantivos masculinos. Use 'a' simples.",
    categoria: "proibida",
  },
  {
    errado: /\bà\s+(?:seu|meu|nosso|vosso|este|esse|aquele|cada|qualquer|todo)\b/gi,
    certo: "a seu / a meu / a nosso / a este / a esse / a cada / a qualquer / a todo",
    regra: "Não há crase antes de pronomes possessivos masculinos, demonstrativos masculinos ou pronomes indefinidos.",
    categoria: "proibida",
  },

  // ── CRASE PROIBIDA — ANTES DE VERBO ─────────────────────
  {
    errado: /\bà\s+(?:fazer|ser|estar|ter|ir|vir|dizer|saber|poder|dever|querer|precisar|realizar|trabalhar|estudar)\b/gi,
    certo: "a fazer / a ser / a estar / a ter…",
    regra: "Não há crase antes de verbos no infinitivo. Use 'a' simples: 'começou a trabalhar'.",
    categoria: "proibida",
  },

  // ── CRASE PROIBIDA — PRONOMES PESSOAIS ───────────────────
  {
    errado: /\bà\s+(?:ela|elas|ele|eles|você|vocês|mim|nós|vós)\b/gi,
    certo: "a ela / a elas / a ele / a você…",
    regra: "Não há crase antes de pronomes pessoais. Use 'a' simples: 'disse a ela', 'entregou a você'.",
    categoria: "proibida",
  },

  // ── CRASE PROIBIDA — APÓS PREPOSIÇÃO ────────────────────
  {
    errado: /\b(?:per|por|de|em|com|para|sob|sobre|entre|até|desde|contra)\s+à\b/gi,
    certo: "… a (sem crase após preposição)",
    regra: "Não há crase após outra preposição. Ex: 'para a cidade' (não 'para à cidade').",
    categoria: "proibida",
  },
  {
    errado: /\bpara\s+à\b/gi,
    certo: "para a",
    regra: "Não há crase após a preposição 'para'. Use 'para a', nunca 'para à'.",
    categoria: "proibida",
  },
  {
    errado: /\bde\s+à\b/gi,
    certo: "de a / da",
    regra: "Não há crase após a preposição 'de'. Use 'da' (contração) ou 'de a'.",
    categoria: "proibida",
  },

  // ── CRASE — "A QUE" vs "À QUE" ──────────────────────────
  {
    errado: /\bà\s+que\s+(?:você|ele|ela|eles|elas|se|nos)\b/gi,
    certo: "a que",
    regra: "'À que' só existe quando há artigo feminino antes de 'que' relativo referindo-se a substantivo feminino anterior. Na maioria dos casos, use 'a que'.",
    categoria: "facultativa",
  },

  // ── PAÍSES, CIDADES E NOMES PRÓPRIOS ────────────────────
  {
    errado: /\bfoi\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Bélgica|Suécia|Noruega|Dinamarca|Grécia|Portugal|Irlanda|Áustria|Suíça)\b/gi,
    certo: "foi à França / à Espanha / à Itália…",
    regra: "Países femininos com artigo definido exigem crase: 'foi à França', 'voltou da França'. Países sem artigo não usam crase.",
    categoria: "paises",
  },
  {
    errado: /\bvoltou\s+de\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda)\b/gi,
    certo: "voltou da França / da Espanha…",
    regra: "Com verbos de retorno, use a contração 'da' (de + a): 'voltou da França'.",
    categoria: "paises",
  },
  {
    errado: /\bvou\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Bélgica|Suécia|Portugal|Irlanda|Grécia)\b/gi,
    certo: "vou à França / à Espanha…",
    regra: "Países femininos com artigo exigem crase no destino: 'vou à França'.",
    categoria: "paises",
  },

  // ── CRASE FACULTATIVA — PRONOMES POSSESSIVOS FEMININOS ──
  {
    errado: /\bdirigiu-se\s+a\s+sua\b/gi,
    certo: "dirigiu-se à sua (facultativo)",
    regra: "Antes de pronomes possessivos femininos, a crase é facultativa: 'a sua casa' ou 'à sua casa'. Na escrita formal, a crase é preferível.",
    categoria: "facultativa",
  },
  {
    errado: /\brecorreu\s+a\s+sua\b/gi,
    certo: "recorreu à sua (facultativo)",
    regra: "Antes de pronomes possessivos femininos, a crase é facultativa. Na escrita formal, prefira 'recorreu à sua'.",
    categoria: "facultativa",
  },

  // ── CONFUSÃO COMUM: "À MEDIDA QUE" x "NA MEDIDA EM QUE" ─
  {
    errado: /\bna\s+medida\s+que\b/gi,
    certo: "na medida em que / à medida que",
    regra: "'Na medida em que' indica causa (= porque). 'À medida que' indica proporção (= conforme). 'Na medida que' sem 'em' é incorreto.",
    categoria: "obrigatoria",
  },
];

const REGRAS_ATIVAS = REGRAS_CRASE.filter(r => r.certo !== null && r.regra !== null);

const CORES_CATEGORIA = {
  obrigatoria:   { cor: "#da77f2", label: "Crase Obrigatória",  bg: "#f8f0ff" },
  proibida:      { cor: "#f03e3e", label: "Crase Proibida",     bg: "#fff5f5" },
  facultativa:   { cor: "#74c0fc", label: "Crase Facultativa",  bg: "#e8f4fd" },
  horas:         { cor: "#ffd43b", label: "Horas",              bg: "#fff9db" },
  demonstrativo: { cor: "#63e6be", label: "Demonstrativo",      bg: "#e6fcf5" },
  paises:        { cor: "#ff922b", label: "Países",             bg: "#fff4e6" },
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

const TEXTO_INICIAL = `Ela chegou a tarde e ficou a vontade durante a reunião. O projeto foi desenvolvido a base de muito esforço e chegou a beira do fracasso. Vou a França na próxima semana. O evento começa a três horas da tarde. Não faça isso à ela. Disse a ela para ir a direita. Na medida que o tempo passa, tudo muda.`;

export default function AgenteCrase() {
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
      const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.obrigatoria;
      const isAtivo = erroAtivo?.inicio === erro.inicio;
      partes.push(
        <span key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px wavy ${cat.cor}`,
            cursor: "pointer",
            background: isAtivo ? cat.cor + "20" : "transparent",
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

  // Estatísticas
  const stats = Object.entries(CORES_CATEGORIA).map(([key, val]) => ({
    key, ...val,
    count: erros.filter(e => e.categoria === key).length,
  })).filter(s => s.count > 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a0a2e",
      fontFamily: "sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 24px",
    }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 760, marginBottom: 28 }}>

        {/* Título com o acento grave como elemento visual central */}
        <div style={{ marginBottom: 20, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <span style={{
              fontFamily: "monospace", fontSize: 10, letterSpacing: "0.22em",
              color: "#da77f2", background: "#2d1a4a",
              border: "1px solid #da77f233",
              padding: "3px 10px", borderRadius: 2,
              textTransform: "uppercase",
            }}>AGENTE 6</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{
                fontSize: 52, fontWeight: 900, color: "#da77f2",
                fontFamily: "'Georgia', serif", lineHeight: 1,
                textShadow: "0 0 40px #da77f244",
              }}>à</span>
              <h1 style={{
                fontSize: 28, fontWeight: 400, color: "#e8d8f8",
                margin: 0, fontFamily: "'Georgia', serif",
                letterSpacing: "0.02em",
              }}>
                Inspetor de Crase
              </h1>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
              {totalCorrigidos > 0 && (
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "#63e6be" }}>✓ {totalCorrigidos}</span>
              )}
              <span style={{
                fontSize: 12, fontFamily: "monospace",
                color: erros.length === 0 ? "#63e6be" : "#da77f2",
                background: erros.length === 0 ? "#0d2a1a" : "#2d1a4a",
                border: `1px solid ${erros.length === 0 ? "#63e6be44" : "#da77f244"}`,
                padding: "5px 14px", borderRadius: 3,
              }}>
                {erros.length === 0 ? "✓ sem ocorrências" : `${erros.length} ocorrência${erros.length > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          <p style={{ fontSize: 12, color: "#6a4a8a", margin: 0, lineHeight: 1.6 }}>
            Crase obrigatória, proibida e facultativa · Locuções adverbiais · Horas · Países · Pronomes demonstrativos
          </p>
        </div>

        {/* Mini painel de categorias */}
        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {stats.map(s => (
              <div key={s.key} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px",
                background: s.cor + "18",
                border: `1px solid ${s.cor}33`,
                borderRadius: 4,
              }}>
                <span style={{ fontSize: 13, color: s.cor, fontWeight: 700 }}>à</span>
                <span style={{ fontSize: 11, color: s.cor, fontFamily: "monospace" }}>{s.label}</span>
                <span style={{ fontSize: 11, color: s.cor, fontFamily: "monospace", fontWeight: 700 }}>({s.count})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 760, position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          padding: "22px 26px", fontSize: 17, lineHeight: 1.9,
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
            width: "100%", minHeight: 240,
            padding: "22px 26px", fontSize: 17, lineHeight: 1.9,
            background: "#120820", color: "#e0d0f0",
            border: "1px solid #2a1a3e",
            borderRadius: 8,
            resize: "vertical", outline: "none",
            fontFamily: "'Georgia', serif", caretColor: "#da77f2",
            boxSizing: "border-box", position: "relative", zIndex: 1,
          }}
          spellCheck={false}
          placeholder="Digite para inspecionar o uso da crase..."
        />

        {/* Float */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute", left: posFloat.x, top: posFloat.y,
              zIndex: 100, width: 320,
              background: "#0d0518",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor || "#da77f2"}55`,
              borderRadius: 10, padding: "15px 17px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              fontFamily: "sans-serif", pointerEvents: "all",
            }}
            onMouseLeave={() => setErroAtivo(null)}
          >
            {/* Badge categoria */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 11,
            }}>
              <span style={{
                fontSize: 18, color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
                fontFamily: "'Georgia', serif", lineHeight: 1,
              }}>à</span>
              <span style={{
                fontSize: 9, fontWeight: 700, fontFamily: "monospace",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
              }}>
                {CORES_CATEGORIA[erroAtivo.categoria]?.label}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "#a088c0", margin: "0 0 13px", lineHeight: 1.6 }}>
              {erroAtivo.regra}
            </p>

            <div style={{ borderTop: "1px solid #1e0d30", paddingTop: 11, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#ff6b6b", fontSize: 12, marginTop: 1 }}>✗</span>
                <span style={{
                  fontSize: 13, fontFamily: "monospace", color: "#ffa8a8",
                  background: "#2d1010", padding: "2px 8px", borderRadius: 3, lineHeight: 1.5,
                }}>{erroAtivo.texto}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: "#da77f2", fontSize: 12, marginTop: 1 }}>✓</span>
                <span
                  style={{
                    fontSize: 13, fontFamily: "monospace", color: "#e599f7",
                    background: "#200d30", padding: "2px 8px", borderRadius: 3,
                    cursor: "pointer", border: "1px solid #862e9c", lineHeight: 1.5,
                  }}
                  onClick={() => aplicarCorrecao(erroAtivo)}
                >{erroAtivo.certo}</span>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: "#3a1a50", fontFamily: "monospace" }}>
              clique para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div style={{ width: "100%", maxWidth: 760, marginTop: 16, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {Object.entries(CORES_CATEGORIA).map(([key, val]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6a4a8a" }}>
            <div style={{ width: 18, height: 3, background: val.cor, borderRadius: 2 }} />
            <span>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Relatório */}
      {erros.length > 0 && (
        <div style={{ width: "100%", maxWidth: 760, marginTop: 28, borderTop: "1px solid #2a1a3e", paddingTop: 22 }}>
          <div style={{
            fontSize: 10, color: "#6a4a8a", letterSpacing: "0.2em",
            textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace",
          }}>
            Relatório do Agente 6
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {erros.map((erro, i) => {
              const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.obrigatoria;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px", background: "#0d0518",
                  borderRadius: 6, border: "1px solid #1e0d30",
                  borderLeft: `3px solid ${cat.cor}`,
                }}>
                  <span style={{ fontSize: 9, fontFamily: "monospace", color: "#3a1a50", marginTop: 3, minWidth: 24 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{
                        fontSize: 13, fontFamily: "monospace",
                        color: "#ffa8a8", background: "#2d1010",
                        padding: "1px 6px", borderRadius: 3,
                      }}>{erro.texto}</span>
                      <span style={{ color: "#3a1a50" }}>→</span>
                      <span style={{
                        fontSize: 12, fontFamily: "monospace",
                        color: "#e599f7", background: "#200d30",
                        padding: "1px 6px", borderRadius: 3,
                        cursor: "pointer", border: "1px solid #862e9c", lineHeight: 1.5,
                      }} onClick={() => aplicarCorrecao(erro)}>{erro.certo}</span>
                      <span style={{
                        fontSize: 9, color: cat.cor,
                        background: cat.cor + "18",
                        border: `1px solid ${cat.cor}33`,
                        padding: "1px 6px", borderRadius: 3,
                        fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>{cat.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#7a5a9a", lineHeight: 1.5 }}>{erro.regra}</div>
                  </div>
                  <button onClick={() => aplicarCorrecao(erro)} style={{
                    background: "none", border: "1px solid #2a1a3e",
                    color: "#6a4a8a", fontSize: 11, padding: "4px 10px",
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
        width: "100%", maxWidth: 760, marginTop: 32,
        paddingTop: 14, borderTop: "1px solid #1e0d30",
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: "#3a1a50", fontFamily: "monospace",
      }}>
        <span>agente-6 / crase · {REGRAS_ATIVAS.length} padrões ativos</span>
        <span>detecção: 600ms debounce · coordenador: pronto para integrar</span>
      </div>
    </div>
  );
}
