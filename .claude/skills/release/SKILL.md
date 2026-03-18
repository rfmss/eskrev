---
name: release
description: Use before any deploy or git push in eskrev. Covers test status, sw.js CACHE_NAME bump, asset registration, tasks/todo.md update, and high-level summary.
---

# Skill: Release
Checklist antes de qualquer deploy ou git push:
1. Todos os testes passando
2. Bump `CACHE_NAME` em `sw.js` (formato: `skrv-cache-v{N}`)
3. Novos assets JS/CSS adicionados em `CORE_ASSETS` ou `CACHE_ASSETS_ALL` do `sw.js`
4. `tasks/todo.md` atualizado
5. `tasks/lessons.md` revisado
6. Resumo de alto nível gerado antes do commit
