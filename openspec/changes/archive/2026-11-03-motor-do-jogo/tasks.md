# Tasks

## 1. Base do domínio e coordenadas

- [x] 1.1 Criar `src/app/dominio/` com `tipos.ts` (participante, fase, tipo de embarcação, orientação, códigos de erro e `Resultado<T>`) e `index.ts` como API pública; verificar com `npm run build` que os arquivos compilam sem imports de Angular.
- [x] 1.2 Implementar `coordenada.ts` com índice linear (`linha * 10 + coluna`), conversão `A1`–`J10` ↔ índices e normalização da entrada; verificar com `coordenada.spec.ts` os casos `A1`, `J10`, ida e volta e rejeição de `K1`, `A0`, `A11` e `1A`.
- [x] 1.3 Exportar as funções de coordenada no `index.ts` e registrar no `src/app/dominio/README.md` a notação e a regra de índice; verificar que o README descreve exatamente as funções exportadas e que `npm test` passa.

## 2. Tabuleiro

- [x] 2.1 Implementar `tabuleiro.ts` com criação da grade 10 × 10, marcação de posições ocupadas, consulta de ocupação e validação de limites; verificar com `tabuleiro.spec.ts` que posições válidas são aceitas e índices fora da grade rejeitados.
- [x] 2.2 Cobrir com testes a consulta de células livres, ocupadas e atingidas, garantindo que uma posição não muda de estado sem operação explícita; verificar que `npm test` executa apenas os testes do domínio com `npx vitest run src/app/dominio` e passa.

## 3. Frota e posicionamento

- [x] 3.1 Implementar `embarcacao.ts` e `frota.ts` com a frota padrão (5, 4, 3, 3, 2), posicionamento horizontal/vertical e validação de tamanho, limites e sobreposição; verificar com testes a composição da frota e o total de 17 posições.
- [x] 3.2 Adicionar testes de posicionamento cobrindo cruzador em `B2`–`B4`, porta-aviões a partir de `A8` (rejeitado), sobreposição (rejeitada), embarcações encostadas (aceitas) e posição não retilínea `B2`, `B3`, `C4` (rejeitada); verificar que `npm test` passa.
- [x] 3.3 Implementar remoção e reposicionamento durante a preparação, preservando o estado válido quando uma tentativa falha; verificar com testes de remover/reposicionar e de tentativa inválida sem alteração do tabuleiro.

## 4. Sorteio e geração da frota do computador

- [x] 4.1 Implementar `sorteio.ts` com o tipo `Sorteio` (`() => number` em `[0, 1)`), valor padrão `Math.random` e embaralhamento Fisher–Yates; verificar com testes que uma função controlada produz ordem determinística e que o embaralhamento não perde nem duplica elementos.
- [x] 4.2 Implementar a geração da frota do computador por backtracking aleatorizado usando o sorteio injetado; verificar com testes que a frota tem 17 posições distintas, sem sobreposição, dentro do tabuleiro e com os tamanhos corretos em pelo menos três sorteios diferentes.

## 5. Preparação e início da partida

- [x] 5.1 Implementar `partida.ts` com o estado inicial em preparação, posicionamento das embarcações do jogador e início da batalha apenas com a frota completa; verificar com testes que o início é rejeitado com frota incompleta e que o estado permanece em preparação.
- [x] 5.2 Testar o início com as duas frotas completas: estado em andamento, frota do computador com 17 posições válidas e primeiro turno do jogador; verificar que `npm test` passa.

## 6. Ataques, destruição e fim da partida

- [x] 6.1 Implementar a resolução de ataques com resultados de água, acerto e embarcação destruída, histórico por participante, troca de turno e rejeição de coordenada repetida ou fora do tabuleiro sem consumir o turno; verificar cada caso com testes.
- [x] 6.2 Implementar o ataque aleatório do computador entre coordenadas ainda não atacadas, usando o sorteio injetado; verificar com testes que a coordenada escolhida nunca está no histórico e que uma função controlada determina o ataque.
- [x] 6.3 Implementar o encerramento imediato ao destruir a última embarcação, vitória do jogador ou do computador, bloqueio de ataques após o fim e o reinício para o estado de preparação com tabuleiros e históricos limpos; verificar com testes de vitória sem contra-ataque, derrota, ataque após o fim e nova partida.

## 7. Integração e documentação do motor

- [x] 7.1 Documentar no `src/app/dominio/README.md` a API pública (funções de coordenada, tabuleiro, frota, partida e ataque), o formato de `Resultado<T>` e os códigos de erro; verificar que cada símbolo citado existe no `index.ts`.
- [x] 7.2 Rodar `npm run lint`, `npm test` e `npm run build` e verificar que os três terminam sem erros; confirmar que nenhum arquivo em `src/app/dominio/` importa de `@angular/*` ou de `src/app/app.*`.
- [x] 7.3 Conferir a matriz de cobertura da spec: cada requisito e cenário de `specs/motor-do-jogo/spec.md` tem ao menos um teste correspondente em `src/app/dominio/*.spec.ts`; registrar no README do domínio onde cada grupo de regras é testado.

## Workflow follow-up

- Arquivar a change após a revisão das fases seguintes confirmar que o motor atende à preparação e à batalha.
- Verificar o resultado arquivado.
