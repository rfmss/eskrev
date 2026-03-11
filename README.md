# eskrev

![CI](https://github.com/rafamass/eskrev/actions/workflows/ci.yml/badge.svg)
![Offline-first](https://img.shields.io/badge/offline--first-PWA-2f5bff)
![Human-written](https://img.shields.io/badge/Human--written-.skv-2B2F36)

**Escrito aqui. Verificável por qualquer pessoa.**

Editor offline para escritores — sem rastreamento, sem nuvem, sem intermediários.

---

## O que é

eskrev é um editor de texto **offline-first** criado para escritores que precisam de privacidade e rastreabilidade do processo criativo. Funciona completamente no navegador, não envia dados a lugar nenhum, e exporta arquivos `.skv` com registro técnico do processo de escrita.

**Stack:** Vanilla JS (ES2020) · CSS puro · esbuild · PWA com Service Worker

---

## Authoria — verificação técnica de autoria

O **Authoria** é a ferramenta de verificação do eskrev.

Ao exportar um texto pelo eskrev, o arquivo `.skv` contém:
- Hash SHA-256 do texto final
- Registro temporal do processo (keystrokes, inserções, deleções, pausas)
- Cadeia criptográfica de sessões de escrita
- Metadata de sessão e configuração

O Authoria carrega o arquivo, recalcula o hash e gera um **relatório técnico pericial** — para uso como evidência técnica complementar por editoras, avaliadores e instituições.

> Não é detecção de IA. Não é análise de estilo. É verificação técnica do processo.

---

## Funcionalidades

- Editor keyboard-first, sem distrações
- Cortes (*slices*) — fragmentos que não viram página
- Post-its vinculados ao texto
- Pomodoro integrado (25/50 min)
- QR code sync desktop ↔ mobile
- Temas (paper, ink, blueprint, dark)
- Suporte a PT, EN, ES, FR
- Templates: romance, roteiro, redação ENEM, ensaio, acadêmico
- Régua de leitura para revisão
- Vocabulary X-ray — mapa visual do processo de escrita

---

## Testes

```bash
# Instalar ambiente Python
make venv

# Rodar suíte completa
make test

# Checks individuais
python3 tests/check_copy_inventory.py
python3 tests/check_uix_budget.py
python3 tests/check_dom_wiring.py
python3 tests/check_lang_duplicates.py
python3 tests/check_lang_schema.py
python3 tests/check_lang_codes.py
```

---

## Build

```bash
npm install
npm run bundle:index2        # com sourcemap
npm run bundle:index2:min    # minificado
npm run watch:index2         # desenvolvimento
```

---

## CI

GitHub Actions roda automaticamente a cada push em `main` e `dev`:
- Checks de qualidade (copy inventory, i18n, DOM wiring, UIX budget)
- Build do bundle com verificação de tamanho máximo (500KB)
- Validações de estrutura HTML (manifest, SW, Authoria)

---

## Filosofia

O eskrev não promete autoria legal.
Oferece dados técnicos claros — a interpretação cabe a quem avalia.

Criado por um escritor usando LLMs como ferramentas de programação.
A escrita, humana.
