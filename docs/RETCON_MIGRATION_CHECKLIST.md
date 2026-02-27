# RETCON Migration Checklist (Repetível por Feature)

Use este checklist para cada feature migrada para `index2.html`.

## 1. Escopo da Feature

- [ ] Nome da feature e owner definido.
- [ ] Página(s) impactada(s): `index2.html`, `mobile.html`, `verify.html`, `totbooks.html`.
- [ ] Tipo de mudança: visual, comportamento, persistência, integração externa.

## 2. Dependências

- [ ] Dependências JS mapeadas (módulos, libs globais, browser APIs).
- [ ] Dependências CSS mapeadas (tokens, classes globais, temas).
- [ ] Dependências de assets mapeadas (ícones, fontes, JSON, áudio).
- [ ] Dependências de SW/cache identificadas.

## 3. Contratos DOM

- [ ] IDs/classes/data-* exigidos pela feature documentados.
- [ ] Eventos globais documentados (`window`/`document`).
- [ ] Ordem de carregamento garantida.
- [ ] Compatibilidade com contratos legados validada (`check_dom_wiring`).

## 4. Contratos de Estado e Dados

- [ ] Chaves de `localStorage/sessionStorage` da feature documentadas.
- [ ] Namespace v2 aplicado (`skrv_v2_*`) quando houver novo schema.
- [ ] Migração de dados definida (forward/backward).
- [ ] Fluxo offline (SW/cache) avaliado.

## 5. CSS Safety

- [ ] Escopo do CSS v2 definido (`.retcon-v2` ou `body[data-ui-version="v2"]`).
- [ ] Sem uso novo de seletores universais globais.
- [ ] Sem `!important` novo fora de exceções justificadas.
- [ ] Regras em `@layer retcon` (quando adotado).

## 6. Segurança e Privacidade

- [ ] Sem envio de dados sensíveis não previsto.
- [ ] `postMessage` valida `origin`.
- [ ] Clipboard/câmera/crypto/caches com tratamento de erro.
- [ ] Hard reset/clear storage sem apagar dados fora do escopo do app.

## 7. Testes Obrigatórios

- [ ] `python3 tests/check_uix_budget.py`
- [ ] `python3 tests/check_dom_wiring.py`
- [ ] `python3 tests/check_lang_schema.py`
- [ ] `python3 tests/check_lang_codes.py`
- [ ] Smoke manual da feature em desktop e mobile.

## 8. Visual Diff

- [ ] Baseline capturado (`scripts/visual_audit.py`).
- [ ] Comparação desktop (`1440x900`) concluída.
- [ ] Comparação mobile (`390x844`) concluída.
- [ ] Sem overflow horizontal e sem offscreen crítico.

## 9. Rollback

- [ ] Feature flag/rota de fallback definida.
- [ ] Plano de rollback em < 5 minutos testado.
- [ ] Rollback não depende de limpeza destrutiva de storage.
- [ ] Procedimento registrado no PR/issue.

## 10. Done Criteria

- [ ] Critérios de aceite funcionais atendidos.
- [ ] Critérios de a11y atendidos (teclado/foco/modal/aria).
- [ ] Critérios de performance atendidos (boot e interação).
- [ ] Documentação de contratos atualizada (`docs/RETCON_AUDIT.md` e referência da feature).

## Template rápido por feature

- Feature:
- Owner:
- Risco (Baixo/Médio/Alto):
- Dependências críticas:
- Contratos DOM tocados:
- Chaves de storage tocadas:
- Testes executados:
- Visual diff:
- Rollback:
- Status final:
