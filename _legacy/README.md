# _legacy — Acervo de Referência

Arquivos desligados da produção. **Não deletar.**

Usados para transplante de features, consulta histórica e comparação.

| Arquivo | Papel original |
|---------|---------------|
| `fullm.html` | App desktop completo — editor, drawers, modais, Authoria. Fonte principal de transplante. |
| `onep.html` | Versão lean que se tornou `index.html`. Idêntico ao index atual no momento do arquivamento. |
| `i2.html` | Protótipo anterior (index2) — JS totalmente inline. |
| `i2v2.html` | Segunda iteração do protótipo i2 — JS inline, comentário morto `// chamar app.js via adapter`. |
| `totbooks.html` | Mesa de livros standalone — 1615 linhas inline, sem módulos externos. |

## Como usar

```bash
# buscar uma feature no fullm para transplante
grep -n "nomeDaFeature" _legacy/fullm.html

# comparar implementação
diff _legacy/onep.html index.html
```

Estes arquivos **não são servidos** pelo Service Worker nem referenciados em nenhuma rota de produção.
