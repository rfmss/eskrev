# Funil UX - Mobile Notes (Entrada -> Primeira Acao -> Sucesso)

## Objetivo
Abrir o mobile direto em notas e reduzir tempo ate o primeiro sucesso util para menos de 30s.

## Funil atual (resumo)
1. Entrada: usuario chega no mobile sem contexto de destino do conteudo.
2. Primeira acao: cria nota ou tenta importar por caminhos dispersos.
3. Sucesso: nota salva, mas importacao/streaming ainda depende de descoberta de botao certo.

## Riscos de perda
- Ambiguidade entre "carteira", "projeto" e "nota".
- Importacao escondida fora do fluxo de notas.
- Falta de confirmacao clara de destino (projeto ativo) antes de merge/import.

## Mudancas priorizadas (impacto x risco)

### P1 (alto impacto, baixo risco)
- Exibir no painel de notas os botoes:
  - `Ler Streaming QR`
  - `Importar arquivo (.skv/.b64)`
- Manter projeto ativo visivel no topo do modulo.
- Confirmacao simples apos importacao: "conteudo adicionado ao projeto ativo".
- Status: concluido.

### P2 (alto impacto, medio risco)
- Dialogo de destino antes de aplicar importacao:
  - adicionar ao projeto ativo
  - criar novo projeto
- Resumo rapido de merge:
  - itens novos
  - itens atualizados
  - conflitos detectados
- Status: concluido.

### P3 (medio impacto, baixo risco)
- CTA inicial mais assertivo em mobile:
  - `Nova nota`
  - `Ler Streaming QR`
  - `Importar arquivo`
- Mover textos longos para ajuda secundaria.
- Status: concluido.

### P4 (medio impacto, medio risco)
- Telemetria local (sem envio) de funil para diagnostico:
  - abriu mobile
  - clicou em QR/importar
  - concluiu importacao
  - criou primeira nota
- Persistencia local: `localStorage.skrv_mobile_funnel_v1` (contadores + eventos recentes).
- Painel debug tecnico habilitado por `?debug=1` (ou `localStorage.skrv_debug_mobile=1`).
- KPI adicionais: tempo ate 1o import e conversao nota->import.
- Status: concluido.

## KPIs sugeridos
- Tempo para primeira nota salva (TTV)
- Taxa de importacao concluida por tentativa QR
- Taxa de abandono antes da primeira acao
- Percentual de importacao para projeto ativo vs novo projeto
- Painel debug local exibe KPI resumido + JSON bruto do funil.

## Criterio de sucesso
- Usuario novo entra no mobile e realiza uma acao util em < 30s.
- Fluxo de importacao fica descobrivel sem navegar para outras areas.
- Queda de abandono no primeiro minuto.
