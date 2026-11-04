# Tasks

## 1. Estado e tradução visual

- [x] 1.1 Criar `src/app/jogo/rotulos.ts` com nomes de embarcações, resultados, orientações e o mapa de `CodigoErro` para mensagens em português; verificar com teste unitário que todos os códigos do domínio têm mensagem.
- [x] 1.2 Criar `src/app/jogo/visual.ts` convertendo `Lado` e `Ataque[]` em `VisualCelula[]`, incluindo montagem, tabuleiro próprio, tabuleiro adversário oculto e detecção de embarcação destruída; verificar com `visual.spec.ts` que posições inimigas não atacadas permanecem `livre`.
- [x] 1.3 Criar `PartidaStore` com signals para estado, início da apresentação e mensagem, e métodos `iniciarJogo`, `posicionar`, `remover`, `iniciarBatalha`, `atacar`, `atacarComputador` e `reiniciar`; verificar com `partida-store.spec.ts` as transições e mensagens de erro.
- [x] 1.4 Cobrir no store o início bloqueado por frota incompleta, o ataque fora do turno, o ataque do computador e o reinício com frota vazia; verificar que `npx vitest run src/app/jogo` passa.

## 2. Apresentação e preparação da frota

- [x] 2.1 Criar o componente de apresentação com nome, objetivo, resumo da frota e chamada para começar, usando tokens e ícones Lucide; verificar que acionar a chamada define `iniciada` e exibe a preparação.
- [x] 2.2 Criar o componente `Tabuleiro` reaproveitável com grade 10 × 10, coordenadas, estados visuais, legenda, rótulos acessíveis e emissão de coordenada; verificar com `tabuleiro.spec.ts` a renderização de 100 botões e o bloqueio quando desabilitado.
- [x] 2.3 Criar a tela de preparação com lista da frota, seleção de embarcação, alternância de orientação, pré-visualização, remoção, reposicionamento e mensagens de erro; verificar manualmente que A8 rejeita o porta-aviões e B2–B4 aceita o cruzador.
- [x] 2.4 Desabilitar o início até a frota completa e exibir quais embarcações faltam; verificar que a batalha só começa com as cinco posicionadas.
- [x] 2.5 Integrar `App` para alternar apresentação e preparação por signals e atualizar `app.spec.ts`; verificar que `npm test` passa com o novo fluxo inicial.

## 3. Batalha por turnos

- [x] 3.1 Criar a tela de batalha com os dois tabuleiros, indicador de turno e legenda, empilhados no mobile e lado a lado no desktop; verificar que a frota do computador não aparece antes de ser atingida.
- [x] 3.2 Implementar o ataque do jogador por clique/teclado, ignorando coordenadas repetidas e turnos inválidos, com atualização imediata do tabuleiro; verificar com testes de componente ou do store que o resultado aparece na célula.
- [x] 3.3 Implementar o ataque automático do computador com atraso curto, bloqueio do tabuleiro durante o processamento e cancelamento do timer ao sair da tela; verificar que o turno volta ao jogador após o ataque.
- [x] 3.4 Exibir o histórico separado dos ataques do jogador e do computador, com coordenada, resultado e tipo de embarcação quando houver; verificar que os resultados não dependem apenas de cor.

## 4. Encerramento e experiência de uso

- [ ] 4.1 Exibir painel de vitória ou derrota mantendo os tabuleiros visíveis e bloqueando novos ataques; verificar que o resultado final aparece ao destruir a última embarcação.
- [ ] 4.2 Implementar a ação de nova partida, retornando à preparação com frotas, históricos e resultado limpos; verificar que nenhuma embarcação permanece posicionada.
- [ ] 4.3 Revisar responsividade em 360 px e desktop, sem rolagem horizontal e com células selecionáveis; verificar com o navegador em ambas as larguras.
- [ ] 4.4 Revisar acessibilidade: foco visível, operação por teclado, `role="status"`/`alert`, `aria-label` das células e contraste; verificar navegando pelo tabuleiro apenas com teclado.
- [ ] 4.5 Documentar no `README.md` o fluxo de uso e a matriz de cobertura das capabilities; verificar que os comandos documentados continuam válidos.

## 5. Verificação final

- [ ] 5.1 Rodar `npm run lint`, `npm test` e `npm run build` e confirmar os três verdes.
- [ ] 5.2 Abrir a aplicação, jogar um fluxo completo (preparação, ataques, fim, nova partida) e confirmar console sem erros e textos em português.
- [ ] 5.3 Rodar `openspec validate interface-do-jogo --strict` e confirmar a change válida antes do arquivamento.

## Workflow follow-up

- Arquivar a change após a revisão e sincronizar as quatro capabilities com `openspec/specs/`.
- Verificar as specs principais e o diretório arquivado.
