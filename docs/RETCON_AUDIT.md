# RETCON Audit - Eskrev

Data da auditoria: 2026-02-21
Escopo: auditoria técnica completa para suportar RETCON de UI com `index2.html` em paralelo, sem alterar comportamento atual do `index.html`.

## A) Exec Summary

### Como o app roda (dev/prod)

- Runtime principal: MPA estático (HTML + JS/CSS + Service Worker), sem bundler JS (`package.json` não existe; somente `requirements-dev.txt` com `pytest`) (`requirements-dev.txt:1`, `Makefile:1-22`).
- Desenvolvimento: servir estático via HTTP local (há tooling interna assumindo `http://127.0.0.1:4173`) (`scripts/visual_audit.py:14-20`).
- Produção: arquivos estáticos + PWA cache via `sw.js` (`sw.js:1-40`, `sw.js:211-260`) e `manifest.json` (`manifest.json:1-27`).

### Entry points reais

- `index.html` (app desktop/tablet principal) (`index.html:1`, `index.html:1791`).
- `mobile.html` (wallet/transfer mobile) (`mobile.html:1`, `mobile.html:146-149`).
- `verify.html` (`.skv Verify`) (`verify.html:1`, `verify.html:447-870`).
- `totbooks.html` (`.skrBooks` em página própria/iframe) (`totbooks.html:1`, `totbooks.html:687`).
- `index.html` redireciona automaticamente para `mobile.html` em dispositivos móveis (`index.html:22-48`, `src/js/app.js:274-287`).

### Top 10 riscos para RETCON (com severidade e mitigação)

1. **Alta** - Acoplamento forte por IDs globais no runtime principal.
Evidência: acesso massivo com `getElementById/querySelector` em `app.js` e módulos (`src/js/app.js:261+`, `src/js/modules/editor.js`, `src/js/modules/ui.js`, `src/js/modules/auth.js`).
Mitigação: contrato de compatibilidade (camada adapter de IDs), ou feature-flag para novo DOM + shims temporários.

2. **Alta** - `app.js` monolítico e central (ordem de init sensível).
Evidência: `src/js/app.js` importa todos módulos e inicializa no `DOMContentLoaded` (`src/js/app.js:5-23`, `src/js/app.js:261`).
Mitigação: bootstrap do `index2` com init progressivo por fatias (router/views, editor, modais, transfer).

3. **Alta** - CSS global agressivo com reset universal e `!important`.
Evidência: `* { ... outline: none !important; }` (`src/css/base.css:516`), `!important` em layout/theme (`src/css/main.css:191-194`, `src/css/theme_iso.css:133-167`).
Mitigação: cascade layers (`@layer reset, legacy, retcon`) + namespace raiz do RETCON (`.retcon-v2`).

4. **Alta** - Service Worker com lista de cache rígida não inclui `index2.html`.
Evidência: `CACHE_NAME` + arrays estáticas (`sw.js:1-2`, `sw.js:2-185`).
Mitigação: incluir `index2.html` e assets do RETCON no cache versionado, com bump de cache e rollout controlado.

5. **Alta** - Estado crítico em `localStorage/sessionStorage` sem namespacing estrito por versão de UI.
Evidência: chaves `skrv_`, `lit_`, `tot_` espalhadas (`src/js/app.js:266-268`, `src/js/modules/store.js:22-203`, `src/js/modules/ui.js:259+`).
Mitigação: namespace `skrv_v2_*` no `index2`, com migração explícita de schema e rollback reversível.

6. **Média/Alta** - `verify.html` e `totbooks.html` dependem de integração por `postMessage` + `storage`.
Evidência: listeners de `message/storage` (`verify.html:457-465`, `totbooks.html:693-701`, `totbooks.html:810-817`).
Mitigação: manter contrato de mensagens (`{type:"theme"|"lang"}`) e validar origem sempre.

7. **Média/Alta** - Dependência de bibliotecas globais UMD em mobile (`QRCode`, `jsQR`, `LZString`).
Evidência: ordem de scripts em `mobile.html` (`mobile.html:146-149`), uso em `src/mobile/mobile.js` (`src/mobile/mobile.js:525-543`, `674-702`, `776-787`).
Mitigação: preservar ordem exata ou encapsular com carregador e checagens de disponibilidade.

8. **Média** - `index.html` contém scripts inline de redirecionamento e analytics cedo no head.
Evidência: scripts inline (`index.html:13-48`).
Mitigação: no `index2`, manter comportamento de redirect/telemetria em bloco mínimo isolado, sem acoplar UI.

9. **Média** - Seletores e classes de estado no `<body>` controlam muito layout/comportamento.
Evidência: `body` classes/dataset (`index.html:58`, `src/js/modules/editor.js:1310-1318`, `src/css/theme_iso.css:3-75`).
Mitigação: mapear state-machine visual para classes v2 (`body[data-ui-version="v2"]`), evitando colisão com legacy.

10. **Média** - Cobertura de testes focada em lint estrutural/contratos, pouca cobertura funcional E2E para fluxos completos.
Evidência: testes chamam scripts de checks (`tests/test_dom_wiring.py:9-20`, `tests/test_uix_budget.py:9-20`) e Playwright opcional (`tests/test_lang_apply_behavior_playwright.py:9-18`).
Mitigação: adicionar smoke E2E mínimos por fluxo crítico antes do swap default.

### Recomendação de abordagem de migração

- Estratégia recomendada: **paralelo com rotas separadas + flag de ativação**.
- Manter `index.html` intacto; servir `index2.html` como opt-in (`/index2.html` ou `?ui=2`) com bootstrap JS próprio.
- Fatiar migração por capacidade (shell/layout -> painéis -> editor -> modais -> transfer -> hard reset).
- Só inverter default para v2 após passar checklist de contratos + smoke + visual diff + a11y/perf.

---

## B) Mapa do Sistema

### Estrutura de pastas e responsabilidades

- `index.html`, `mobile.html`, `verify.html`, `totbooks.html`: páginas entrypoint MPA.
- `src/js/app.js`: bootstrap principal desktop/tablet + integração de módulos.
- `src/js/modules/*`: domínio por funcionalidade (`auth`, `editor`, `ui`, `qr_transfer`, `mobile`, `views_router`, etc).
- `src/mobile/mobile.js`: runtime mobile standalone (wallet/QR).
- `src/css/*`: CSS global e temas.
- `src/mobile/mobile.css`: CSS da página mobile standalone.
- `src/assets/*`: ícones, fontes, áudio, JSON, libs minificadas.
- `sw.js`: cache/offline + lifecycle PWA.
- `tests/*`: checks estruturais e smoke de contratos.
- `scripts/visual_audit.py`: captura visual automatizada (Playwright).

### Rotas / páginas / templates

- MPA, não SPA.
- Páginas principais:
  - `/index.html`
  - `/mobile.html`
  - `/verify.html`
  - `/totbooks.html`
  - `/sobre/privacidade*.html` (conteúdo legal por idioma)
- Templates de conteúdo para escrita guiada:
  - `content/templates/*.md`
  - `config/persona-templates.json`
  - `content/enem/themes.json`

### Pipeline de assets

- Sem build step: assets servidos diretamente via caminhos relativos.
- CSS principal usa `@import` encadeado em runtime (`src/css/main.css:2-8`).
- Fontes via `@font-face` (`src/css/fonts.css:1-119` e `src/css/base.css:1-7`).
- Ícones por SVG sprite (`src/assets/icons/phosphor-sprite.svg`) e arquivos individuais.
- PWA/Offline:
  - `manifest.json` (`manifest.json:1-27`)
  - cache versionado em `sw.js` (`sw.js:1-2`, `sw.js:211-243`).

### Estado e dados (fetch/stores/storage)

- Persistência principal em `localStorage` (`src/js/modules/store.js:22-203`).
- Uso intenso de `sessionStorage` para flags de fluxo e import (`src/js/app.js:266-268`, `src/js/app.js:3233-3309`).
- Export/import de payload `.skv/.b64` e cadeia de prova (`src/js/modules/export_skrv.js`).
- Fetch de conteúdo/config:
  - `config/persona-templates.json` (`src/js/app.js:1342`)
  - `src/assets/figures/figures_ptbr.json` (`src/js/app.js:1351`)
  - `content/enem/themes.json` (`src/js/app.js:1588`)
  - termos/privacidade (`src/js/modules/auth.js:448-456`)
- Mobile standalone usa armazenamento próprio `skrv_mobile_payloads` (`src/mobile/mobile.js:229-310`).

---

## C) DOM & JS Contracts (Crítico)

### Ordem de carregamento por página

- `index.html`
  1. Inline analytics opcional (`index.html:13-21`).
  2. Inline redirect mobile (`index.html:22-48`).
  3. Módulo principal `src/js/app.js` (`index.html:1791`) que importa módulos (`src/js/app.js:5-23`) e inicializa no `DOMContentLoaded` (`src/js/app.js:261`).

- `mobile.html`
  1. `qrcode.min.js`
  2. `jsqr.min.js`
  3. `lz-string.min.js`
  4. `src/mobile/mobile.js`
  (`mobile.html:146-149`)

- `verify.html`
  1. Script inline `type="module"` importando `lang` (`verify.html:447-449`).

- `totbooks.html`
  1. Script inline único (`totbooks.html:687`).

### Scripts que consultam DOM e contratos

1. `index.html` inline (head)
- Seletores/DOM: criação dinâmica de `<script>` para GoatCounter (`index.html:15-20`), controle de `document.documentElement.style.visibility` (`index.html:37-43`).
- Eventos globais: nenhum.
- Dependências externas: GoatCounter (`gc.zgo.at`) condicionado a hostname (`index.html:14-19`).

2. `src/js/app.js`
- Seletores (amostra crítica): `#editor`, `#drawer`, `#booksFrame`, `#verifyFrame`, `#onboardingModal`, `#dedicationModal`, `#mobileGateModal`, `.modal-overlay.active`, `[data-terms-open]`, `[data-privacy-open]`, `[data-manifesto-open]`.
- Eventos globais: `DOMContentLoaded`, `click`, `keydown`, `visibilitychange`, `fullscreenchange`, `beforeunload`, `pageshow`, `pagehide`, `resize`, `orientationchange`, `focus`, `load`, SW `message`.
- Dependências externas: Service Worker (`navigator.serviceWorker`), `fetch`, `localStorage/sessionStorage`, integração com iframes via `postMessage`.
- Evidência: `src/js/app.js:261-533`, `src/js/app.js:1342-1857`.

3. `src/js/modules/auth.js`
- Seletores: `#gatekeeper`, `#viewSetup`, `#viewLock`, `#manifestoModal`, `#termsModal`, `#privacyModal`, `.password-toggle`, `.policy-body`.
- Eventos globais: `document lang:changed`.
- Dependências: `fetch` de páginas de privacidade/termos, `window.crypto.subtle`, `localStorage`.
- Evidência: `src/js/modules/auth.js:54-607`.

4. `src/js/modules/editor.js`
- Seletores: `#editorWrap`, `#lexiconPopup`, `#selectionToolbar`, `#goalLadderBtn`, `#xrayPanel`, `.panel`, `.modal-overlay.active`, `.nav-overview-*`.
- Eventos globais: `document keydown/click/selectionchange/pointer*`, `window resize/mouse*`.
- Dependências: `fetch` (dados léxicos), `AudioContext`, `localStorage`.
- Evidência: `src/js/modules/editor.js:193-2109`.

5. `src/js/modules/ui.js`
- Seletores: `.hud`, `.controls-inner`, `#drawer`, `#projectList`, `#chapterList`, `#memoArea`, `#pomodoroModal`, `#booksFrame`, `#verifyFrame`, `#themeMonoBtn`.
- Eventos globais: `document lang:changed/copy/cut`, `window resize`.
- Dependências: `localStorage`, `setModalActive`, iframes (`postMessage` theme/lang).
- Evidência: `src/js/modules/ui.js:17-621`.

6. `src/js/modules/mobile.js` (modo mobile dentro de `index.html`)
- Seletores: `#mobileImportTargetModal`, `#mobileMemoInput`, `#btnMobileScanQr`, `.mobile-view-item`, `#panelActions`, `#panelNav`.
- Eventos globais: `document keydown/touchstart`.
- Dependências: `localStorage/sessionStorage`, integrações via funções globais `window.skv*`.
- Evidência: `src/js/modules/mobile.js:215-796`.

7. `src/js/modules/qr_transfer.js`
- Seletores: `#qrScanModal`, `#qrScanVideo`, `#qrStreamModal`, `#qrStreamCode`, `#btnScanQr`, `#actionQrStream`.
- Eventos globais: `document click/keydown`.
- Dependências: `QRCode`, `jsQR`, `LZString`, câmera (`navigator.mediaDevices`), clipboard.
- Evidência: `src/js/modules/qr_transfer.js` (contrato também refletido em checks `tests/check_dom_wiring.py:9-19`).

8. `src/js/modules/views_router.js`
- Seletores: `#editorView`, `#booksView`, `#verifyView`, `.panel`.
- Eventos globais: nenhum (controlado por chamadas de app).
- Dependências: `localStorage`, iframes com `postMessage` de idioma.
- Evidência: `src/js/modules/views_router.js:12-70`.

9. `src/js/modules/modal_accessibility.js`
- Seletores: `.modal-overlay.active`, `#gatekeeper`, `#dedicationModal`, `#onboardingModal`.
- Eventos globais: `document focusin/keydown`.
- Dependências: nenhuma externa.
- Evidência: `src/js/modules/modal_accessibility.js:14-78`.

10. `src/js/modules/lang.js`
- Seletores: `[data-i18n]`, `[data-i18n-html]`, `[data-i18n-ph]`, `[data-i18n-title]`, `[data-i18n-tip]`.
- Eventos globais: emite/consome `lang:changed` via document.
- Dependências: `localStorage`.
- Evidência: testes validam contrato (`tests/test_lang_apply_behavior_playwright.py:98-104`).

11. `src/mobile/mobile.js` (runtime de `mobile.html`)
- Seletores: `#booksGrid`, `#mobileGate`, `#qrScanModal`, `#qrStreamModal`, `#bookModal`, `[data-i18n*]`.
- Eventos globais: `window DOMContentLoaded/resize`, `document click`.
- Dependências: `QRCode`, `jsQR`, `LZString`, `navigator.mediaDevices`, `localStorage/sessionStorage`.
- Evidência: `mobile.html:146-149`, `src/mobile/mobile.js:525-787`, `src/mobile/mobile.js:847-1204`.

12. `verify.html` inline module
- Seletores: `#fileInput`, `#dropZone`, `#verifyStatus`, métricas `#metric*`, `#btnReportCopy`, `#btnFaqPdf`.
- Eventos globais: `window storage/message`.
- Dependências: `crypto.subtle`, `FileReader`, clipboard, import `lang`.
- Evidência: `verify.html:447-870`.

13. `totbooks.html` inline script
- Seletores: `#library`, `#overlay`, `#modal`, `#trash-zone`, `.totbook`, `.page-text`, `.scrim`.
- Eventos globais: `window storage/message/keydown/resize`.
- Dependências: `localStorage`, `window.location.origin` message contract.
- Evidência: `totbooks.html:689-1599`.

### Dependências externas usadas pelos contratos

- GoatCounter (`index.html` head) (`index.html:14-19`).
- `qrcode.min.js`, `jsqr.min.js`, `lz-string.min.js` (`mobile.html:146-149`; também usados em transfer no runtime principal).
- Browser APIs: `serviceWorker`, `caches`, `crypto.subtle`, `clipboard`, `mediaDevices`.

---

## D) CSS Contracts (Crítico)

### Globals que podem vazar

- Reset universal com impacto global:
  - `* { box-sizing: border-box; outline: none !important; scrollbar-width: none; }` (`src/css/base.css:516`).
  - `*::-webkit-scrollbar { width:0; height:0; }` (`src/css/base.css:521-524`).
- Base global de `html, body` com overflow oculto e texturas (`src/css/base.css:533-558`).
- `body.calm-ui *` aplicando transição em toda árvore (`src/css/base.css:560-563`).
- Muitos overrides com `!important` em tema/layout (`src/css/main.css:191-194`, `src/css/theme_iso.css:133-167`).

### Frameworks / reset / normalize

- Não há Tailwind/Bootstrap/normalize externo.
- Arquitetura CSS própria com:
  - `main.css` fazendo `@import` de todos blocos (`src/css/main.css:2-8`).
  - tokens/tema custom (`src/css/base.css:88-260`, `src/css/tokens_iso.css:1-72`, `src/css/theme_iso.css:1-260`).

### Variáveis/tokens existentes

- Tokens globais em múltiplos pontos `:root` (`src/css/base.css:88`, `src/css/base.css:119`, `src/css/main.css:13`).
- Tema por atributo `[data-theme="..."]` (`src/css/base.css:142+`).
- Tokenização “iso” separada (`src/css/tokens_iso.css:1-72`) e aplicação por classes no `body` (`src/css/theme_iso.css:3-75`).

### Riscos de cascade/colisão no RETCON

- Alto risco de colisão com qualquer novo HTML que reutilize classes comuns (`.panel`, `.drawer`, `.modal-box`, `.btn-*`).
- `@import` em cascata única dificulta isolamento por página.
- Estados via classes no `body` (`layout-2030`, `drawer-open`, `editor-mode-*`) podem alterar visual de novos componentes sem intenção.

### Sugestões objetivas (cascade layers / namespace / scoping)

1. Introduzir `@layer reset, legacy, retcon;` e mover CSS novo para `@layer retcon`.
2. Encapsular novo UI em namespace raiz: `body[data-ui-version="v2"]` ou `.retcon-v2`.
3. Evitar classes genéricas no v2 (`.panel`, `.drawer`), usar prefixo (`.v2-panel`, `.v2-drawer`).
4. Para convivência, carregar CSS v2 após legacy, mas escopado por namespace para não quebrar `index.html`.
5. Manter tokens separados: `--v2-*` com fallback explícito para tokens antigos apenas quando necessário.

---

## E) Test Harness & Safety

### Existe teste? Como rodar?

- Sim: checks estruturais + pytest wrapper.
- Comandos:
  - `python3 tests/check_copy_inventory.py`
  - `python3 tests/check_uix_budget.py`
  - `python3 tests/check_dom_wiring.py`
  - `python3 tests/check_lang_duplicates.py`
  - `python3 tests/check_lang_schema.py`
  - `python3 tests/check_lang_codes.py`
  - `make test` (pytest) (`README.md`, `Makefile:1-22`).
- Playwright browser test é condicional por ambiente (`tests/test_lang_apply_behavior_playwright.py:9-18`).

### Se não cobre tudo: smoke tests mínimos propostos para RETCON

1. **Smoke boot**: abrir `index.html` e `index2.html` sem erro de console crítico.
2. **Smoke contrato DOM**: script de wiring para v2 (IDs obrigatórios, modais, botões principais).
3. **Smoke persistência**: criar projeto, editar, recarregar, validar estado persistido.
4. **Smoke i18n/theme**: troca idioma/tema e propagação para iframes (`verify/totbooks`) via `postMessage`.
5. **Smoke QR/import-export**: fluxo mínimo abrir modal, iniciar scanner (com fallback sem câmera), importar arquivo.

### Visual diff manual/automatizado viável

- Já existe base automatizada de screenshot com Playwright (`scripts/visual_audit.py:14-24`, `:96-190`).
- Proposta:
  - rodar baseline `index.html` e `index2.html` em desktop/mobile;
  - armazenar em `prints/visual_audit_*`;
  - comparar por página/viewport + relatório de overflow/offscreen (já no script).

### Fallback/rollback

- Estratégia de rollback imediato:
  - manter `index.html` como rota default;
  - `index2.html` só opt-in via flag/query;
  - remover flag em runtime/config para desativar v2 sem deploy destrutivo.
- Para cache/PWA:
  - versionar `CACHE_NAME` e manter compatibilidade do cache antigo (`sw.js:1`, `sw.js:234-243`).

---

## F) Plano RETCON

### Como servir `index2.html` em paralelo sem quebrar `index.html`

1. Criar `index2.html` como entrypoint isolado, sem alterar markup legacy.
2. Reutilizar apenas módulos seguros por contrato (ex.: `lang.js`, parte de store), evitando acoplamento cego de `app.js`.
3. Garantir SW/manifest suportando `index2.html` (cache versionado).
4. Preservar integração com `mobile.html`, `verify.html`, `totbooks.html` via contrato de mensagens e tema/idioma.

### Como alternar (flag, route, env)

- Opção A (recomendada): rota explícita `/index2.html`.
- Opção B: `index.html?ui=2` redirecionando para `index2.html` cedo no head.
- Opção C: flag em `localStorage` (`skrv_ui_version=v2`) lida no bootstrap do `index.html` (somente para canary interno).

### Sequência de migração por fatias (menor -> maior risco)

1. Shell visual (header/hud/layout) com namespace v2.
2. Drawer/painéis não destrutivos (files/nav/notes view state).
3. i18n/theme sync + iframes (`verify/totbooks`).
4. Modais secundários (help, manifesto, terms/privacy).
5. Editor core (input/selection/search/page mode).
6. QR transfer/import/export.
7. Hard reset/security-sensitive flows.
8. Tornar v2 default após janela de canary.

### Critérios de aceite (a11y, perf, regressão)

- A11y:
  - foco visível (não regressão do `outline`), navegação teclado, trap de modal, `aria-hidden` consistente.
- Perf:
  - sem aumento significativo de payload inicial;
  - tempo de boot equivalente ou melhor em desktop/mobile.
- Regressão funcional:
  - todos checks existentes passam;
  - smoke flows críticos passam em `index.html` e `index2.html`.
- Offline/PWA:
  - `index2.html` e assets críticos disponíveis offline com SW atualizado.

---

## Evidências principais (arquivo + linha aproximada)

- Sem bundler JS tradicional: ausência de `package.json` e presença de stack estática/Python (`requirements-dev.txt:1`, `Makefile:1-22`).
- Entrypoints/scripts:
  - `index.html:13-48`, `index.html:1791`
  - `mobile.html:146-149`
  - `verify.html:447-870`
  - `totbooks.html:687+`
- Import chain principal: `src/js/app.js:5-23`.
- Mobile redirect: `index.html:22-48`, `src/js/app.js:274-287`.
- SW/PWA: `sw.js:1-40`, `sw.js:211-260`, `manifest.json:1-27`.
- CSS global/riscos:
  - `src/css/main.css:2-8`, `src/css/main.css:191-194`
  - `src/css/base.css:516-558`, `src/css/base.css:560-563`
  - `src/css/theme_iso.css:3-75`, `src/css/theme_iso.css:133-167`
- Test harness:
  - `tests/test_dom_wiring.py:9-20`
  - `tests/test_uix_budget.py:9-20`
  - `tests/check_dom_wiring.py:9-101`
  - `tests/check_uix_budget.py:11-214`
  - `scripts/visual_audit.py:14-24`, `scripts/visual_audit.py:96-193`
