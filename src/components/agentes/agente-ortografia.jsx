import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// AGENTE 1 — ORTOGRAFIA
// Base de conhecimento: erros frequentes do português brasileiro
// ============================================================

const REGRAS_ORTOGRAFIA = [
  // Pares confundidos
  { errado: /\bcesso\b/gi, certo: "acesso", regra: "Acesso (entrada/chegada) não existe sem o 'a' inicial.", categoria: "grafia" },
  { errado: /\bmau\s+humor\b/gi, certo: "mau humor", regra: "Correto. Mas atenção: 'mal-humorado' leva hífen.", categoria: "grafia" },
  { errado: /\bprovável(?!mente)\b/gi, certo: null, regra: null, categoria: null }, // válida
  { errado: /\bchegou\s+em\b/gi, certo: "chegou a", regra: "'Chegar' rege preposição 'a', não 'em'.", categoria: "regencia" },
  { errado: /\bprefiro\s+mais\b/gi, certo: "prefiro", regra: "'Prefiro' já indica comparação. 'Prefiro mais' é redundante.", categoria: "pleonasmo" },
  { errado: /\bmeia\s+noite\b/gi, certo: "meia-noite", regra: "'Meia-noite' é grafado com hífen.", categoria: "hifen" },
  { errado: /\bmeia\s+dia\b/gi, certo: "meio-dia", regra: "'Meio-dia' é grafado com hífen.", categoria: "hifen" },
  { errado: /\bpor\s+que\s+não\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bporquê\s+(?!\.)/gi, certo: "porque", regra: "'Porquê' com acento só aparece no final de frase ou como substantivo ('o porquê').", categoria: "acento" },
  { errado: /\bpor\s+quê\b(?![\.\?])/gi, certo: "por que", regra: "'Por quê' com acento é usado apenas antes de pausa (fim de frase ou vírgula).", categoria: "acento" },
  { errado: /\bà\s+nível\b/gi, certo: "em nível", regra: "'A nível de' é um galicismo. Use 'em nível de' ou reescreva a frase.", categoria: "norma" },
  { errado: /\bao\s+nível\b/gi, certo: "no nível", regra: "'Ao nível de' deve ser 'no nível de' quando indica comparação.", categoria: "norma" },
  { errado: /\bface\s+a\b/gi, certo: "diante de / em face de", regra: "A forma correta é 'em face de' ou 'diante de'.", categoria: "norma" },
  { errado: /\bempresas\s+como\s+a\s+mesma\b/gi, certo: "a empresa / ela", regra: "'A mesma' como pronome anafórico é uso informal. Prefira repetir o substantivo.", categoria: "norma" },
  { errado: /\bonde\s+(?=\w+\s+(disse|falou|escreveu|afirmou))/gi, certo: "em que / no qual", regra: "'Onde' indica lugar físico. Para citações, use 'em que' ou 'no qual'.", categoria: "semantica" },
  { errado: /\bestou\s+a\s+par\b/gi, certo: "estou a par", regra: null, categoria: null },
  { errado: /\bdesinformado\b/gi, certo: "desinformado", regra: null, categoria: null },
  { errado: /\binterrogação\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bmau\b(?!\s*humor|\s*\w+ado)/gi, certo: null, regra: "'Mau' (adjetivo) vs 'mal' (advérbio). Ex: 'mau caráter', 'ele age mal'.", categoria: "paronimia" },
  { errado: /\biniciar\s+com\b/gi, certo: "iniciar com / começar com", regra: null, categoria: null },
  { errado: /\binclusive\s+os\s+mesmo\b/gi, certo: "inclusive os mesmos", regra: null, categoria: null },
  // Acentuação pós-reforma 2009
  { errado: /\bpára\b/gi, certo: "para", regra: "Após a reforma ortográfica de 2009, 'pára' (verbo) perdeu o acento diferencial.", categoria: "acento" },
  { errado: /\bpêlo\b/gi, certo: "pelo", regra: "Após 2009, 'pêlo' (substantivo) perdeu o acento diferencial.", categoria: "acento" },
  { errado: /\bpólo\b/gi, certo: "polo", regra: "Após 2009, 'pólo' perdeu o acento diferencial.", categoria: "acento" },
  { errado: /\bvôo\b/gi, certo: "voo", regra: "Após 2009, 'vôo' perdeu o acento circunflexo.", categoria: "acento" },
  { errado: /\bzôo\b/gi, certo: "zoo", regra: "Após 2009, 'zôo' perdeu o acento circunflexo.", categoria: "acento" },
  { errado: /\bêle\b|\bêles\b|\bêla\b|\bêlas\b/gi, certo: "ele / eles / ela / elas", regra: "Pronomes pessoais não levam acento circunflexo.", categoria: "acento" },
  // Hífen
  { errado: /\banti\s+social\b/gi, certo: "antissocial", regra: "O prefixo 'anti' se aglutina quando o radical começa com consoante diferente de 'h'.", categoria: "hifen" },
  { errado: /\bsupra\s+nacional\b/gi, certo: "supranacional", regra: "Prefixo 'supra' se aglutina sem hífen.", categoria: "hifen" },
  { errado: /\bsob\-pena\b/gi, certo: "sob pena", regra: "'Sob pena' é locução prepositiva, sem hífen.", categoria: "hifen" },
  { errado: /\bguarda\s+chuva\b/gi, certo: "guarda-chuva", regra: "Compostos com 'guarda' levam hífen.", categoria: "hifen" },
  { errado: /\bpara\s+choque\b/gi, certo: "para-choque", regra: "Compostos com 'para' (proteção) levam hífen.", categoria: "hifen" },
  // Dupla grafia / erros frequentes
  { errado: /\bexcessão\b/gi, certo: "exceção", regra: "'Exceção' não tem duplo 's'.", categoria: "grafia" },
  { errado: /\bconcreto\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bconcretizar\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bbeneficiente\b/gi, certo: "beneficente", regra: "'Beneficente' (que faz o bem) não tem o 'i' antes do 'ente'.", categoria: "grafia" },
  { errado: /\bobstáculo\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\brecurso\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bfreqüente\b/gi, certo: "frequente", regra: "Após 2009, o trema foi eliminado do português brasileiro.", categoria: "acento" },
  { errado: /\baqüífero\b/gi, certo: "aquífero", regra: "Após 2009, o trema foi eliminado.", categoria: "acento" },
  { errado: /\btranqüilo\b/gi, certo: "tranquilo", regra: "Após 2009, o trema foi eliminado.", categoria: "acento" },
  { errado: /\blinguiça\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bsequer\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bdescumprir\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\binterseção\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bintersecção\b/gi, certo: "interseção", regra: "'Interseção' perdeu o duplo 'cc' após a reforma de 2009.", categoria: "grafia" },
  { errado: /\bimpecilho\b/gi, certo: "empecilho", regra: "'Empecilho' começa com 'em', não 'im'.", categoria: "grafia" },
  { errado: /\bténis\b/gi, certo: "tênis", regra: "'Tênis' leva acento circunflexo.", categoria: "acento" },
  { errado: /\bconcenso\b/gi, certo: "consenso", regra: "'Consenso' não tem 'c' antes de 'n'.", categoria: "grafia" },
  { errado: /\bdescernimento\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bpreviligio\b/gi, certo: "privilégio", regra: "A grafia correta é 'privilégio', com 'i' na segunda sílaba.", categoria: "grafia" },
  { errado: /\bprivilégio\b/gi, certo: null, regra: null, categoria: null },
  { errado: /\bcorriqueiro\b/gi, certo: null, regra: null, categoria: null },
];

// Filtra apenas regras com erro real (certo !== null e regra !== null)
const REGRAS_ATIVAS = REGRAS_ORTOGRAFIA.filter(r => r.certo !== null && r.regra !== null);

const CORES_CATEGORIA = {
  grafia: { cor: "#ef5350", label: "Grafia", bg: "#ffebee" },
  acento: { cor: "#7c4dff", label: "Acentuação", bg: "#ede7f6" },
  hifen: { cor: "#1565c0", label: "Hífen", bg: "#e3f2fd" },
  norma: { cor: "#e65100", label: "Norma Culta", bg: "#fff3e0" },
  semantica: { cor: "#2e7d32", label: "Semântica", bg: "#e8f5e9" },
  regencia: { cor: "#00838f", label: "Regência", bg: "#e0f7fa" },
  paronimia: { cor: "#ad1457", label: "Paronímia", bg: "#fce4ec" },
  pleonasmo: { cor: "#558b2f", label: "Pleonasmo", bg: "#f1f8e9" },
};

function detectarErros(texto) {
  const erros = [];
  for (const regra of REGRAS_ATIVAS) {
    let match;
    const re = new RegExp(regra.errado.source, regra.errado.flags.includes('g') ? regra.errado.flags : regra.errado.flags + 'g');
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
  // Remove sobreposições: mantém o mais longo
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

const TEXTO_INICIAL = `A empresa que foi fundada em 1990 celebrou seu jubileu. O diretor chegou em São Paulo ontem à noite. Prefiro mais trabalhar cedo do que tarde. O evento ocorreu às meia noite em ponto. Esse tipo de situação ocorre com certa freqüência. O projeto teve êxito, apesar do impecilho encontrado. A reunião durou até as vôo das ideias se dissiparem.`;

export default function AgenteOrtografia() {
  const [texto, setTexto] = useState(TEXTO_INICIAL);
  const [erros, setErros] = useState([]);
  const [erroAtivo, setErroAtivo] = useState(null);
  const [posFloat, setPosFloat] = useState({ x: 0, y: 0 });
  const [pausado, setPausado] = useState(false);
  const [totalCorrigidos, setTotalCorrigidos] = useState(0);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  // Detecta erros após pausa de digitação
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const encontrados = detectarErros(texto);
      setErros(encontrados);
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [texto]);

  // Aplica correção inline
  const aplicarCorrecao = useCallback((erro) => {
    const novoTexto = texto.slice(0, erro.inicio) + erro.certo + texto.slice(erro.fim);
    setTexto(novoTexto);
    setErroAtivo(null);
    setTotalCorrigidos(c => c + 1);
  }, [texto]);

  // Renderiza o overlay com sublinhados
  const renderOverlay = () => {
    if (!erros.length) return <span style={{ color: "transparent", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{texto}</span>;

    const partes = [];
    let cursor = 0;

    for (const erro of erros) {
      if (erro.inicio > cursor) {
        partes.push(<span key={`t${cursor}`} style={{ color: "transparent" }}>{texto.slice(cursor, erro.inicio)}</span>);
      }
      const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.grafia;
      partes.push(
        <span
          key={`e${erro.inicio}`}
          style={{
            color: "transparent",
            borderBottom: `2.5px ${erro.categoria === "acento" ? "dotted" : "wavy"} ${cat.cor}`,
            cursor: "pointer",
            borderRadius: "1px",
            background: erroAtivo?.inicio === erro.inicio ? cat.bg : "transparent",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            const rect = e.target.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            setPosFloat({
              x: rect.left - containerRect.left,
              y: rect.bottom - containerRect.top + 6,
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
      partes.push(<span key={`tf`} style={{ color: "transparent" }}>{texto.slice(cursor)}</span>);
    }

    return <>{partes}</>;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
    }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 760, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11,
            color: "#ef5350",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>
            AGENTE 1
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 400,
            color: "#f5f0e8",
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Inspetor de Ortografia
          </h1>
          <div style={{
            marginLeft: "auto",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}>
            {totalCorrigidos > 0 && (
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#81C784" }}>
                ✓ {totalCorrigidos} {totalCorrigidos === 1 ? "correção" : "correções"}
              </span>
            )}
            <span style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: erros.length === 0 ? "#81C784" : "#ef5350",
              background: erros.length === 0 ? "#1b2e1c" : "#2d1212",
              padding: "4px 10px",
              borderRadius: 4,
              border: `1px solid ${erros.length === 0 ? "#2e5d2f" : "#5a1a1a"}`,
            }}>
              {erros.length === 0 ? "✓ sem erros" : `${erros.length} ocorrência${erros.length > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#666", margin: 0, fontFamily: "sans-serif" }}>
          Pausa de 600ms após digitação → detecção automática · Hover para ver a regra · Clique para corrigir
        </p>
      </div>

      {/* Editor */}
      <div ref={containerRef} style={{ width: "100%", maxWidth: 760, position: "relative" }}>

        {/* Overlay de sublinhados */}
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            padding: "20px 24px",
            fontSize: 17,
            lineHeight: 1.85,
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

        {/* Textarea real */}
        <textarea
          ref={textareaRef}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          style={{
            width: "100%",
            minHeight: 320,
            padding: "20px 24px",
            fontSize: 17,
            lineHeight: 1.85,
            background: "#1a1a1a",
            color: "#f0ebe0",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            resize: "vertical",
            outline: "none",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            caretColor: "#ef5350",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          spellCheck={false}
          placeholder="Digite ou cole seu texto aqui..."
        />

        {/* Float de explicação */}
        {erroAtivo && (
          <div
            style={{
              position: "absolute",
              left: Math.min(posFloat.x, 500),
              top: posFloat.y,
              zIndex: 100,
              width: 300,
              background: "#1e1e1e",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor || "#ef5350"}`,
              borderRadius: 8,
              padding: "14px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              fontFamily: "sans-serif",
              pointerEvents: "all",
            }}
            onMouseEnter={() => {}}
            onMouseLeave={() => setErroAtivo(null)}
          >
            {/* Badge categoria */}
            <div style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: CORES_CATEGORIA[erroAtivo.categoria]?.cor,
              background: CORES_CATEGORIA[erroAtivo.categoria]?.bg + "22",
              border: `1px solid ${CORES_CATEGORIA[erroAtivo.categoria]?.cor}44`,
              padding: "2px 7px",
              borderRadius: 3,
              marginBottom: 10,
            }}>
              {CORES_CATEGORIA[erroAtivo.categoria]?.label || erroAtivo.categoria}
            </div>

            {/* Regra */}
            <p style={{ fontSize: 13, color: "#ccc", margin: "0 0 12px", lineHeight: 1.5 }}>
              {erroAtivo.regra}
            </p>

            {/* Comparativo */}
            <div style={{ borderTop: "1px solid #333", paddingTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#ef5350", fontFamily: "monospace" }}>✗</span>
                <span style={{
                  fontSize: 13,
                  color: "#ef5350",
                  fontFamily: "'Courier New', monospace",
                  background: "#2d1212",
                  padding: "2px 6px",
                  borderRadius: 3,
                }}>{erroAtivo.texto}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#81C784", fontFamily: "monospace" }}>✓</span>
                <span style={{
                  fontSize: 13,
                  color: "#81C784",
                  fontFamily: "'Courier New', monospace",
                  background: "#1b2e1c",
                  padding: "2px 6px",
                  borderRadius: 3,
                  cursor: "pointer",
                  border: "1px solid #2e5d2f",
                }}
                  onClick={() => aplicarCorrecao(erroAtivo)}
                >
                  {erroAtivo.certo}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: "#555", fontFamily: "monospace" }}>
              clique na correção para aplicar →
            </div>
          </div>
        )}
      </div>

      {/* Legenda de categorias */}
      <div style={{
        width: "100%",
        maxWidth: 760,
        marginTop: 24,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
      }}>
        {Object.entries(CORES_CATEGORIA).map(([key, val]) => (
          <div key={key} style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "sans-serif",
            fontSize: 12,
            color: "#666",
          }}>
            <div style={{
              width: 20,
              height: 3,
              background: val.cor,
              borderRadius: 2,
            }} />
            <span>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Lista de ocorrências */}
      {erros.length > 0 && (
        <div style={{
          width: "100%",
          maxWidth: 760,
          marginTop: 32,
          borderTop: "1px solid #222",
          paddingTop: 24,
        }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "#555",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            Relatório do Agente 1
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {erros.map((erro, i) => {
              const cat = CORES_CATEGORIA[erro.categoria] || CORES_CATEGORIA.grafia;
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "12px 16px",
                  background: "#161616",
                  borderRadius: 6,
                  border: "1px solid #222",
                  borderLeft: `3px solid ${cat.cor}`,
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#444", minWidth: 28 }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: "#ef5350", background: "#2d1212", padding: "1px 6px", borderRadius: 3 }}>
                        {erro.texto}
                      </span>
                      <span style={{ color: "#444" }}>→</span>
                      <span
                        style={{ fontFamily: "monospace", fontSize: 13, color: "#81C784", background: "#1b2e1c", padding: "1px 6px", borderRadius: 3, cursor: "pointer", border: "1px solid #2e5d2f" }}
                        onClick={() => aplicarCorrecao(erro)}
                      >
                        {erro.certo}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: cat.cor,
                        background: cat.bg + "18",
                        border: `1px solid ${cat.cor}33`,
                        padding: "1px 6px",
                        borderRadius: 3,
                        fontFamily: "sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}>
                        {cat.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", fontFamily: "sans-serif", lineHeight: 1.4 }}>
                      {erro.regra}
                    </div>
                  </div>
                  <button
                    onClick={() => aplicarCorrecao(erro)}
                    style={{
                      background: "none",
                      border: "1px solid #333",
                      color: "#666",
                      fontSize: 11,
                      padding: "4px 10px",
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

      {/* Footer técnico */}
      <div style={{
        width: "100%",
        maxWidth: 760,
        marginTop: 40,
        paddingTop: 20,
        borderTop: "1px solid #1a1a1a",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "monospace",
        fontSize: 11,
        color: "#333",
      }}>
        <span>agente-1 / ortografia · {REGRAS_ATIVAS.length} padrões ativos</span>
        <span>detecção: 600ms debounce · coordenador: pendente</span>
      </div>
    </div>
  );
}
