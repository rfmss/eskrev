# eskrev

![Human-written](https://img.shields.io/badge/Human--written-.skr-2B2F36)

**Escrito aqui. Verificável por qualquer pessoa.**

.skr é um editor offline, portátil e não rastreável, criado para escrita humana em tempos de IA.

Textos exportados em `.skr` contêm registro técnico do processo de escrita humana.

Aqui, o texto é produzido exclusivamente por digitação humana.
O sistema registra tecnicamente o processo de escrita — tempo, pausas e revisões — e gera uma cápsula verificável (.skr).

## O que é um arquivo .skr

Um arquivo `.skr` contém:
- o texto completo
- metadados do processo de escrita
- hash criptográfico do conteúdo
- registro técnico verificável

Esse arquivo pode ser analisado por qualquer pessoa usando o **.skr Verify**.

## .skr Verify

O .skr Verify permite verificar se um texto corresponde a um processo real de escrita humana registrado no .skr.

Não é detecção de IA.
Não é análise de estilo.
É verificação técnica do processo.

👉 https://tot.undo.it/verify

## Filosofia

O .skr não promete autoria legal.
Ele oferece dados técnicos claros.

A interpretação cabe sempre a quem avalia.

## Status

Projeto ativo, em desenvolvimento contínuo.
Criado por um escritor usando LLMs como ferramentas de programação.

## Testes

Para validar o inventário de textos:

```bash
python3 tests/check_copy_inventory.py
```

Para validar orçamento técnico de UIX (tamanho/linhas/inline style/inline handlers/IDs duplicados):

```bash
python3 tests/check_uix_budget.py
```

Para validar wiring DOM (IDs usados no JS vs IDs declarados no HTML):

```bash
python3 tests/check_dom_wiring.py
```

Para validar colisões de chave no i18n (chaves duplicadas por idioma):

```bash
python3 tests/check_lang_duplicates.py
```

Para validar consistência de schema i18n (mesmas chaves em todos os idiomas):

```bash
python3 tests/check_lang_schema.py
```

Para validar consistência entre `languages[]` e os blocos de idioma em `lang.js`:

```bash
python3 tests/check_lang_codes.py
```

Para rodar suíte com `pytest` (quando houver rede para instalar dependências):

```bash
make venv
make test
```
