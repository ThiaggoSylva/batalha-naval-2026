# Domínio do jogo

Regras puras do Batalha Naval, em TypeScript, sem imports de Angular e sem estado global. A interface deve consumir este módulo apenas por `src/app/dominio/index.ts`.

## Coordenadas

O tabuleiro tem 10 linhas (`A` a `J`) e 10 colunas (`1` a `10`). Internamente cada posição é um índice linear entre 0 e 99:

```
indice = linha * 10 + coluna
```

Assim, `A1` corresponde a `0` e `J10` a `99`. A conversão de/para texto normaliza a entrada para maiúsculas e rejeita coordenadas fora da grade.

- `TAMANHO_TABULEIRO` / `TOTAL_POSICOES`: dimensão e total de posições da grade.
- `indiceDeTexto(texto)`: converte `A1`–`J10` em índice.
- `textoDeIndice(indice)`: converte um índice em coordenada textual.
- `indiceDeLinhaColuna(linha, coluna)`: converte linha e coluna (0–9) em índice.
- `linhaDoIndice(indice)` / `colunaDoIndice(indice)`: decompõem um índice.

## Resultado de operações

Operações que podem falhar retornam `Resultado<T>`:

```ts
type Resultado<T> = { sucesso: true; valor: T } | { sucesso: false; erro: CodigoErro };
```

Erros de regra não lançam exceção. Códigos possíveis: `coordenada-invalida`, `fora-do-tabuleiro`, `posicionamento-invalido`, `posicao-ocupada`, `embarcacao-nao-posicionada`, `frota-incompleta`, `fase-invalida`, `ataque-repetido`, `partida-encerrada`, `nao-e-o-turno` e `sem-coordenada-disponivel`. A tradução para mensagens em português é responsabilidade da interface.

## Tabuleiro

`Tabuleiro` é uma grade fixa de 100 `Celula` (`indice`, `ocupada`, `atingida`). As operações são imutáveis.

- `criarTabuleiro()`: cria a grade livre.
- `consultarCelula(tabuleiro, indice)`: devolve a célula ou um erro de coordenada/limite.
- `estaOcupada` / `foiAtingida`: consultas booleanas.
- `marcarOcupada` / `desmarcarOcupada` / `marcarAtingida`: alterações explícitas.
- `definirOcupadas(tabuleiro, indices)`: substitui as posições ocupadas preservando as atingidas.
- `indicesOcupados` / `indiceNoTabuleiro`: utilitários de consulta.

## Embarcações e frota

- `TAMANHOS`: porta-aviões 5, encouraçado 4, cruzador 3, submarino 3, destroyer 2.
- `ORDEM_FROTA`: ordem padrão usada na preparação e na geração do computador.
- `criarFrotaPadrao()`: as cinco embarcações, inicialmente sem posição.
- `posicoesDeInicio(indiceInicial, orientacao, tamanho)`: calcula as posições de uma embarcação a partir de uma extremidade.
- `validarPosicoes(posicoes, tamanho)`: verifica quantidade, limites, sobreposição interna e alinhamento horizontal/vertical.
- `posicionarEmbarcacao(frota, tipo, posicoes)`: posiciona ou reposiciona, rejeitando sobreposição com outras embarcações.
- `removerEmbarcacao(frota, tipo)`: devolve a embarcação ao estado não posicionado.
- `frotaCompleta`, `posicoesOcupadas`, `totalPosicoesOcupadas`, `embarcacaoEm`, `buscarEmbarcacao`: consultas da frota.

## Sorteio e computador

- `Sorteio`: função `() => number` no intervalo `[0, 1)`; `sorteioPadrao` usa `Math.random`.
- `indiceAleatorio(sorteio, limite)`: sorteia um índice dentro do limite.
- `embaralhar(itens, sorteio)`: Fisher–Yates sem perder nem duplicar itens.
- `gerarFrotaComputador(sorteio)`: distribui a frota completa por backtracking aleatorizado, sem sobreposição.

## Partida

`EstadoPartida` é uma união discriminada por `fase`:

- `preparacao`: apenas o lado do jogador, com frota e tabuleiro em montagem.
- `em-andamento`: os dois lados (`Lado` = `frota` + `tabuleiro`), `turno`, `ataquesJogador` e `ataquesComputador`.
- `encerrada`: os dois lados, os históricos e `vencedor`.

Cada `Ataque` registra `indice`, `coordenada`, `resultado` (`agua`, `acerto` ou `embarcacao-destruida`) e, quando houver, `tipoEmbarcacao`.

- `criarPartida()`: começa em preparação com a frota vazia do jogador.
- `posicionarEmbarcacaoJogador(estado, tipo, posicoes)` / `removerEmbarcacaoJogador(estado, tipo)`: só valem em preparação.
- `iniciarBatalha(estado, sorteio?)`: exige a frota do jogador completa, gera a do computador e dá o primeiro turno ao jogador.
- `realizarAtaqueJogador(estado, indice)`: resolve água, acerto ou destruição e passa o turno.
- `sortearAtaqueComputador(estado, sorteio?)`: escolhe uma coordenada ainda não atacada pelo computador.
- `realizarAtaqueComputador(estado, sorteio?)`: sorteia e resolve o ataque do computador.
- `novaPartida(estado)`: após o encerramento, volta para a preparação com tabuleiros e históricos limpos.

A partida termina imediatamente quando todas as embarcações de um lado são destruídas; o vencedor é o participante que realizou o ataque. Ataques depois do encerramento retornam `partida-encerrada`.

## Testes

Os testes ficam ao lado dos módulos e usam Vitest puro, sem TestBed:

```bash
npx vitest run src/app/dominio
```

## Matriz de cobertura da spec

| Requisito                           | Testes                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Tabuleiro e coordenadas             | `coordenada.spec.ts` e `tabuleiro.spec.ts`                                                     |
| Frota padrão                        | `frota.spec.ts` — composição e total de 17 posições                                            |
| Posicionamento de embarcações       | `frota.spec.ts` — válido, borda, sobreposição, encostadas e não retilíneo                      |
| Reconfiguração durante a preparação | `frota.spec.ts` e `partida.spec.ts` — remoção, reposição e estado preservado                   |
| Início da batalha                   | `partida.spec.ts` — frota incompleta, frota completa e frota do computador                     |
| Resolução de ataques                | `partida.spec.ts` — água, acerto, repetido, fora do tabuleiro e fora do turno                  |
| Destruição de embarcações           | `partida.spec.ts` — acerto parcial e última posição                                            |
| Fim da partida                      | `partida.spec.ts` — vitória do jogador, vitória do computador e ataque após o fim              |
| Registro de ataques                 | `partida.spec.ts` — históricos dos dois participantes                                          |
| Ataque aleatório do computador      | `sorteio.spec.ts` e `partida.spec.ts` — sorteio, coordenadas não atacadas e ausência de opções |
| Nova partida                        | `partida.spec.ts` — estado limpo e nova preparação obrigatória                                 |
