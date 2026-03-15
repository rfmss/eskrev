## Contributing

eskrev is an offline-first editor for writers. Contributions are welcome via issues and pull requests.

### Arquitetura resumida

| Camada | Arquivo | Descrição |
|--------|---------|-----------|
| App principal | `index.html` | Única página de produção — modo desktop e mobile |
| Verificação | `verify.html` | Authoria — verifica integridade de arquivos `.skv` |
| Mobile QR | `mobile.html` | Sync via QR code |
| Entry point JS | `js/main.js` | Inicializa todos os módulos do editor |
| Módulos JS | `js/modules/` | 20 módulos: slices, mesa, grammarLint, corpus, etc. |
| Módulos src | `src/js/modules/` | Módulos compartilhados: crypto_manager, lang, corpus |
| CSS principal | `styles/index2.css` | Tokens e estilos do modo editor |
| Service Worker | `sw.js` | Cache offline — CACHE_NAME atual: `skrv-cache-v119` |

### Formato de exportação

O eskrev exporta arquivos `.skv` (JSON renomeado). Um arquivo `.skv` válido contém:
- `projects[]` — array de projetos com `id`, `name`, `content`, `date`
- `activeId` — projeto ativo
- `notes[]` — notas laterais (`skrv_mobile_notes_v1`)
- `postits[]` — post-its com posição, cor e conteúdo
- `pagesHtml[]` — HTML formatado das páginas do editor
- `proof` — hash SHA-256 + timestamp (gerado automaticamente na exportação)

### Referência de arquivos legados

Arquivos desligados da produção vivem em `_legacy/` — não deletar. São usados para transplante de features. Consulte `_legacy/README.md`.

### Regras

- Manter compatibilidade com `localStorage` key `skrv_data` (compartilhada entre sessões)
- Todo novo asset precisa ser adicionado ao `sw.js` (CORE_ASSETS ou CACHE_ASSETS_ALL)
- Commits em português descrevem mudanças de produto; inglês para infraestrutura
- Keep discussions technical, respectful and focused.
