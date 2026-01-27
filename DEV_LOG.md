# DEV LOG — TΦT Writer

Data: 2026-01-27

## Contexto
- Sessão focada em estabilizar UI/UX, i18n e comportamento dos modais (Manifesto/Termos/Rastro/Leitor).
- Ajustes recentes priorizaram: tooltips/hints dentro da viewport, hierarquia visual dos modais, e coerência offline.

## Alterações recentes (resumo)
- Terms modal: aceite via botões 25/50 (sem checkbox), scroll mínimo para habilitar, prioridade de z-index e bloqueio de clique fora.
- i18n de Termos: traduções EN/ES/FR corrigidas para link/hint/botões e removidos textos de checkbox (já não existe).
- Rastro: tooltips ajustados (direção/limites), melhorias de espaçamento e controle de arraste no modal.
- Leitor: tooltips posicionados abaixo; botão fechar com “×” visível; ícones com tamanho consistente.
- HUD/ícones: normalização de tamanho e visibilidade.
- Proteção de marcadores: bloqueio de Backspace no início de bloco quando linha anterior é chapter-mark.
- Fontes/UI: uso de fonte “autor/mono” como padrão em UI e editor (sem CDN).

## Pontos para validação manual
- Fluxo de primeira visita: manifesto → termos → escolha 25/50 → criação de sessão.
- Modal de Termos deve sempre aparecer acima do manifesto e impedir clique atrás.
- Rastro: tooltips devem ficar dentro da viewport e não sobrepor leitura.
- Leitor: hints não vazam; botão fechar visível em todos os temas.
- Totbooks: ícone de Notas/Totbooks visível na HUD (sem perder contraste).

## Arquivos tocados recentemente
- `src/js/modules/lang.js`
- `src/js/modules/auth.js`
- `src/js/modules/editor.js`
- `src/css/components.css`
- `index.html`

## Próximos passos sugeridos
- Rodar verificação completa do fluxo de onboarding (manifesto/termos/pomodoro).
- Validar hard reset (expurgo total sem restauração por bfcache).
- Revisar inconsistências de tema (selects/checkboxes em modais).

