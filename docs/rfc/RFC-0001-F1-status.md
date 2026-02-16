# RFC-0001 F1 - Status de Execucao (2026-02-16)

## Resumo
- Status geral: **em andamento**
- Evidencia automatica: checks tecnicos passaram.
- Pendencias: validacao manual de gestos/fluxo visual em mobile.
- Observacao de ambiente: browser headless bloqueado no sandbox (Playwright/Chromium), entao a rodada visual-interativa precisa de execucao manual no dispositivo/navegador real.

## Evidencias automatizadas
- `python3 tests/check_uix_budget.py` -> **pass**
- `python3 tests/check_dom_wiring.py` -> **pass**
- `python3 tests/check_lang_schema.py` -> **pass**
- `python3 tests/check_lang_duplicates.py` -> **pass**
- `python3 tests/check_lang_codes.py` -> **pass**
- `python3 tests/check_copy_inventory.py` -> **pass**
- `scripts/visual_audit.py` executado com sucesso.

## Itens F1 validados por codigo/teste

### A. Fluxo Mobile Wallet
- [x] Entrada sem loop por regra de roteamento (`index.html` ignora `mobile=notes`; wallet em `mobile.html` sem redirect forcado).
- [ ] Abrir/fechar caderninhos (pendente teste manual).
- [ ] Arrastar para baixo e confirmar delete (pendente teste manual).
- [ ] Empty state e limite de projetos (pendente teste manual).

### B. Mobile Notes Standalone
- [x] Botao `NOTAS` abre `index.html?mobile=notes&standalone=1` (`src/mobile/mobile.js`).
- [x] Onboarding/dedicatoria inibidos em standalone (`src/js/app.js` + `src/css/mobile-only.css`).
- [x] Painel de notas aberto por padrao em `mobile=notes` (`src/js/app.js`).
- [ ] Criacao/edicao/remocao de notas com tags/pastas (pendente teste manual completo).

### C. Importacao e Merge (QR/Arquivo)
- [x] Modal de destino antes de importar (`pickMobileImportTarget`).
- [x] `append_active` para destino ativo (QR/arquivo).
- [x] Criacao de projeto para destino novo (`createMobileImportProject`).
- [x] Resumo de merge em sucesso (`buildImportMergeSummary` + `handleImportSuccess`).
- [x] Caminho seguro para payload invalido (`showImportInvalidError`, sem aplicar merge).

### D. Regressao Visual e Tema
- [x] Icones sem filtro xilo indevido (`src/css/base.css`: `filter: none`).
- [ ] Consistencia visual xilo/papel desktop/mobile (pendente inspeção manual).
- [ ] Modais sem quebra de contraste (pendente inspeção manual).

### E. Performance e Telemetria Local
- [x] Estrutura de funil local ativa (`skrv_mobile_funnel_v1`, debug `?debug=1`).
- [ ] Medicao formal de tempo ate primeira acao util (<30s) pendente rodada manual.
- [ ] Travas visiveis em importacao/scan pendente rodada manual.

## Proxima rodada recomendada (manual guiada)
1. Rodar roteiro mobile wallet: abrir projeto, arrastar/delete, empty state, limite.
2. Rodar roteiro notes standalone: criar/editar/remover notas, tags, pastas.
3. Rodar roteiro QR: importar para ativo e novo, validar resumo e fallback invalido.
4. Registrar capturas e tempos no checklist F1.
