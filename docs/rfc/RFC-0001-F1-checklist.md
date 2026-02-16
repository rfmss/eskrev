# RFC-0001 F1 - Checklist de Execucao Tecnica

## Objetivo da F1
Consolidar os fluxos por modo (escrita, notas, transferencia, leitura) com estabilidade de UX e sem regressao de performance.

## Escopo F1
- Mobile wallet estavel.
- Mobile notes standalone estavel.
- Importacao QR/arquivo com confirmacao de destino e merge previsivel.
- Guardrails de regressao visual e de fluxo.

## Checklist

### A. Fluxo Mobile Wallet
- [ ] Validar entrada em `mobile.html` sem redirecionamento em loop.
- [ ] Validar caderninhos com abrir/fechar consistente.
- [ ] Validar gesto de arrastar para baixo e confirmar delete.
- [ ] Validar empty state e limite de projetos.

### B. Fluxo Mobile Notes Standalone
- [ ] Validar botao `NOTAS` no wallet abrindo `index.html?mobile=notes&standalone=1`.
- [ ] Validar ausencia de onboarding/dedicatoria no standalone.
- [ ] Validar painel de notas aberto por padrao.
- [ ] Validar criacao/edicao/remocao de notas com tags/pastas.

### C. Importacao e Merge (QR/Arquivo)
- [ ] Garantir modal de destino antes de importar (`ativo`, `novo`, `cancelar`).
- [ ] Garantir `append_active` quando destino for projeto ativo.
- [ ] Garantir criacao de projeto quando destino for novo.
- [ ] Exibir resumo de merge apos sucesso.
- [ ] Garantir rollback seguro em payload invalido.

### D. Regressao Visual e Tema
- [ ] Verificar consistencia dos temas xilo/papel em desktop e mobile.
- [ ] Verificar modais sem quebra de contraste.
- [ ] Verificar icones sem filtros indevidos.

### E. Performance e Telemetria Local
- [ ] Medir tempo de entrada no mobile notes (alvo: primeira acao util < 30s).
- [ ] Validar que debug de funil local continua funcional (`?debug=1`).
- [ ] Garantir ausencia de travas visiveis em importacao/scan.

## Criterio de aceite F1
- Todos os itens A/B/C concluidos.
- Nenhuma regressao critica em D.
- Sinais minimos de desempenho em E.

## Evidencias esperadas
- Capturas por fluxo.
- Logs de teste manual.
- Lista de regressao conhecida (se houver) com severidade.
