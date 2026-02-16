# RFC-0001 - Eskrev vNext (Calm Tech + Offline Duravel)

## 1. Contexto
Problema atual:
- O eskrev tem bons blocos (editor, notas, wallet mobile, QR), mas com sobreposicao de fluxos e carga cognitiva em alguns pontos.
- A direcao de produto precisa ficar explicita para evitar feature creep e regressao de performance.

Escopo desta RFC:
- Definir principios inquebraveis, arquitetura-alvo e limites de escopo para evolucao do eskrev.
- Unificar foco de escrita, notas mobile e transferencia local (QR/arquivo) com criterio tecnico mensuravel.

Fora de escopo:
- Reescrita total de stack.
- Banco de dados remoto/cloud obrigatorio.
- Transformar eskrev em workspace estilo Notion.

## 2. Manifesto (inquebravel)
1. Arquivo e o produto.
   O conteudo deve sobreviver fora do app: formatos legiveis, versionados e exportaveis (`.skv`, `.b64`, markdown/texto).
2. Latencia e feature.
   Startup e interacoes principais devem ser orcadas e medidas continuamente.
3. Calma por padrao, poder sob demanda.
   UI limpa por default; recursos avancados por comando/atalho/modal pontual, nao por poluicao persistente.

## 3. Estado atual (as-is)
Fluxos existentes:
- Desktop: editor principal + drawer + modais + notas + leitor + export/import.
- Mobile wallet (`mobile.html`): caderninhos, arrastar para deletar, importar por QR/arquivo.
- Mobile notes standalone: entrada via botao `NOTAS` para `index.html?mobile=notes&standalone=1`.

Riscos atuais:
- Mistura de contextos (escrever, organizar, transferir) em uma unica superficie.
- Regressao de UX por mudancas visuais sem guardrail de fluxo.
- Risco de bloat em modulo de notas/blocos se tentar copiar Notion integral.

## 4. Proposta (to-be)
### 4.1 Arquitetura por modos
- Modo Escrita: foco tipografico, painel secundario sob demanda.
- Modo Notas: operacao independente para captura/organizacao rapida.
- Modo Transferencia: QR/arquivo com confirmacao de destino antes de merge.
- Modo Leitura: superficie dedicada para leitura sem ruido de edicao.

### 4.2 Fronteiras tecnicas
- Persistencia local como fonte da verdade.
- Formatos com versao explicita e migracao progressiva.
- Modulos nao criticos carregados sob demanda (lazy).
- Sem dependencia de backend para operacao principal.

### 4.3 Blocos sem virar Notion
- Introduzir IDs estaveis por bloco como camada leve (fase 2), sem banco pesado.
- Reordenacao de blocos apenas onde agrega valor real de escrita.
- Slash commands curtos e limitados ao essencial.

## 5. Decisoes e tradeoffs
| Decisao | Beneficio | Custo | Alternativa rejeitada |
|---|---|---|---|
| Preservar `mobile.html` wallet + `mobile=notes&standalone=1` | Fluxos claros por intencao | Dois entrypoints mobile | Mobile unico com tudo misturado |
| Confirmacao de destino antes de import/merge | Reduz perda de dados e surpresa | 1 passo extra | Merge automatico silencioso |
| Evolucao incremental de blocos (IDs estaveis) | Estrutura sem perder leveza | Parser/serializacao mais cuidadosos | Copia de modelo Notion completo |
| Performance budget formal | Evita degradacao continua | Exige testes e disciplina | Ajuste ad-hoc sem meta |

## 6. Nao-objetivos
- Nao implementar banco de dados de blocos estilo Notion.
- Nao adicionar colaboracao realtime/cloud como dependencia core.
- Nao trocar stack por reescrita total antes de fechar gargalos de fluxo/UX atuais.

## 7. Performance budget
- TTI (desktop alvo): < 200ms em hardware de referencia.
- Primeira acao util no mobile notes: < 30s para usuario novo.
- Interacoes criticas (digitar, abrir nota, trocar modo): < 16ms/frame na maior parte do tempo.
- Evitar bundle inicial inchado: modulos secundarios em lazy-load.

## 8. Seguranca e longevidade
- Versao de schema em payloads de import/export.
- Compatibilidade retroativa para `.skv/.b64` em pelo menos duas versoes anteriores.
- Integridade de transferencia com validacao antes de aplicar dados.
- (Fase 3) avaliar vault por bloco para conteudo sensivel sem perder legibilidade do restante.

## 9. Plano de entrega
### F1 - Consolidacao de fluxo (curto prazo)
- Fechar UX por modo (escrita, notas, transferencia, leitura).
- Garantir standalone notes no mobile sem onboarding/site em volta.
- Fortalecer confirmacao de destino e resumo de merge em importacao.

### F2 - Estrutura leve de blocos (medio prazo)
- IDs estaveis por bloco no documento.
- Reordenacao minima e previsivel de blocos.
- Slash commands enxutos (conjunto pequeno e fixo).

### F3 - Durabilidade avancada (medio/longo prazo)
- Camada opcional de bloco protegido (vault parcial).
- Ferramentas de migracao/versionamento mais robustas.
- Auditoria automatica de performance por release.

## 10. Criterios de aceitacao
- [ ] Mobile wallet e notes standalone operam sem loop de redirecionamento.
- [ ] Importacao QR/arquivo sempre pergunta destino quando houver risco de merge.
- [ ] Nao ha regressao visual grave entre temas xilo/papel no fluxo principal.
- [ ] Indicadores de performance e funil mobile estao mensuraveis localmente.
- [ ] Mudancas de arquitetura respeitam os 3 principios do manifesto.

## 11. Rollback
- Toda mudanca de fluxo deve manter caminho de volta via flag/query param ou reversao simples.
- Em falha de importacao: abortar aplicacao e manter estado atual intacto.
- Em regressao de UI: fallback para modo anterior sem migracao destrutiva de dados.
