# Checklist de Validacao Mobile (Device Real)

## Objetivo
Validar funil de entrada -> primeira acao -> sucesso em aparelho real, sem depender de ambiente de dev.

## Preparacao
1. Abrir o site no mobile.
2. Opcional (debug): adicionar `?debug=1` na URL para exibir painel de funil local.
3. Garantir permissao de camera para fluxo QR.

## Cenarios (10)
1. Entrada direta:
Esperado: abrir em notas, CTAs visiveis, sem travas indevidas.
2. CTA `NOVA NOTA`:
Esperado: foco no campo de nota.
3. Criar primeira nota:
Esperado: nota salva na lista e contador atualizado.
4. CTA `PUXAR DO CELULAR (QR)`:
Esperado: seletor de destino abre (ativo/novo/cancelar).
5. Import QR para projeto ativo:
Esperado: conteudo importado, modal de sessao mostra fluxo + resumo de merge.
6. Import QR para novo projeto:
Esperado: novo projeto criado e conteudo importado nesse projeto.
7. CTA `IMPORTAR ARQUIVO`:
Esperado: seletor de destino abre e fluxo de arquivo funciona.
8. Arquivo invalido:
Esperado: erro claro no mobile (origem da falha indicada).
9. Confirmacao da sessao importada:
Esperado: senha provisoria validada, modal fecha e retorna para notas.
10. Painel local (debug):
Esperado: KPIs + JSON atualizam; botao limpar zera dados locais do funil.

## Saida esperada
- TTV abaixo de 30s para usuario novo em condicoes normais.
- Importacao concluida por QR/arquivo sem ambiguidade de destino.
- Sem regressao em salvamento de nota, projeto ativo e fluxo de sessao.
