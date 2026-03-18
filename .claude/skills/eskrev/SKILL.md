---
name: eskrev
description: Master skill for the eskrev project. Use whenever working on any part of eskrev — editor, themes, corpus, storage, service worker, or .skv format. Provides full architectural context so Claude doesn't need to re-discover it each session.
---

# Skill: eskrev — Contexto Master

## O que é o eskrev
Editor de escrita offline-first para PT-BR. PWA. Página única (`index.html`). Dois modos históricos: **onep** (ativo, index.html) e **fullm** (legado em `_legacy/`). O modo fullm existe apenas para transplante de features — não é mais servido.

## Arquivos críticos (modo onep)
- `index.html` — entrada única (~281 linhas)
- `js/main.js` — entry point
- `js/modules/mesa.js` — projetos + exportSkv + importSkv
- `js/modules/slices.js` — todos os comandos `..x`
- `js/modules/themes.js` — ciclo de temas (paper → script → chumbo)
- `js/modules/postits.js` — post-its com persistência
- `styles/index2.css` — CSS completo do modo onep (self-contained)
- `sw.js` — Service Worker (CACHE_NAME `skrv-cache-v{N}`)

## Temas
3 temas ativos: `paper` (claro), `script` (sépia/pergaminho, fonte typewriter), `chumbo` (escuro near-black `#111110`).
- Ciclo via `..t` — troca instantânea, sem countdown
- Sons de teclado (`type.wav`, `enter.wav`, `backspace.wav`) ativos apenas no tema `script`
- Tokens em `src/css/tokens_iso.css`; regras de tema em `styles/index2.css`

## Formato .skv (v2)
Snapshot exportado por `exportSkv()` em `mesa.js`. Contém: `projects[]`, `pagesHtml[]`, `notes[]`, `postits[]`, `proof` (SHA-256), `skv_version: 2`.

## Storage (chaves ativas)
- `skrv_data` — projetos (localStorage — candidato a migrar para IndexedDB)
- `eskrev:onep:pages:v2` — HTML das páginas
- `skrv_mobile_notes_v1` — notas laterais
- `skrv_postits_v1` — post-its
- `skrv_theme_v1` — tema ativo
- `skrv_sfx_muted` — mudo/ativo

## Corpus linguístico
`src/assets/corpus/` — 22 arquivos JSON em 9 áreas. Facade: `src/js/modules/corpus.js` (`CorpusManager` singleton, lazy-load, cache em Map). Regras determinísticas — se não está no corpus, não acusa.

## Service Worker — regra de release
Toda mudança em JS/CSS exige:
1. Bump de `CACHE_NAME` em `sw.js` (`skrv-cache-v{N+1}`)
2. Novos assets adicionados em `CORE_ASSETS` ou `CACHE_ASSETS_ALL`

## Princípios do projeto
- Impacto mínimo: mude só o necessário
- Sem novos temas além de paper, script e chumbo
- Commits apenas quando o usuário pedir explicitamente
- UI/UX em português brasileiro
- `tasks/lessons.md` para erros não óbvios
