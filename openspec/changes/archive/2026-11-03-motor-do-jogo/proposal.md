# Proposal

## Why

A change `fundacao-do-projeto` entregou apenas o workspace Angular, os tokens visuais e o shell; não existe nenhuma regra de jogo executável. As fases seguintes (preparação da frota, batalha por turnos, encerramento e experiência de uso) precisam de uma base de domínio única e testável, para que as regras do enunciado não sejam duplicadas nem misturadas com componentes de interface.

## What Changes

- Cria o motor do jogo como código de domínio puro em `src/app/dominio/`, sem imports de Angular e sem estado global.
- Modela o tabuleiro de **10 × 10** com coordenadas internas de linha/coluna (0–9) e conversão de/para a notação `A1`–`J10`, incluindo validação de coordenadas.
- Define a frota padrão (porta-aviões 5, encouraçado 4, cruzador 3, submarino 3, destroyer 2) e as regras de posicionamento: orientação horizontal/vertical, dentro dos limites, sem sobreposição e com adjacência permitida.
- Implementa operações imutáveis de preparação: posicionar, remover e revalidar embarcações, além de indicar se a frota está completa e válida para iniciar a batalha.
- Implementa a resolução de ataques: água, acerto, embarcação destruída, rejeição de coordenada já atacada e rejeição de ataque após o fim da partida.
- Controla o estado da partida (`preparacao`, `em-andamento`, `vitoria-do-jogador`, `vitoria-do-computador`), de quem é o turno e o histórico de ataques de cada participante.
- Expõe a escolha aleatória de ataque do computador entre as coordenadas ainda não atacadas, recebendo uma função de sorteio injetável para permitir testes determinísticos.
- Cobre as regras com testes unitários em Vitest, incluindo as situações listadas no enunciado.

**Fora de escopo nesta change:** componentes visuais, serviço Angular com Signals, roteamento, persistência, estratégia de IA, partidas entre humanos e multiplayer. As telas e a orquestração de turnos pertencem às changes seguintes.

## Capabilities

### New Capabilities

- `motor-do-jogo`: regras puras do Batalha Naval — tabuleiro e coordenadas, frota e posicionamento, resolução de ataques, destruição de embarcações, fim de partida e seleção aleatória de ataques do computador.

### Modified Capabilities

Nenhuma. O projeto ainda não possui capabilities em `openspec/specs/`.

## Impact

- **Arquivos novos:** `src/app/dominio/**` (tipos, frota, tabuleiro, partida, ataques e testes) e `src/app/dominio/README.md`.
- **Arquivos modificados:** nenhum código de interface nesta change; o shell existente permanece inalterado.
- **Dependências:** nenhuma nova. Usa apenas TypeScript e o Vitest já configurado.
- **Fases impactadas:** `preparacao-da-frota` e `batalha-por-turnos` passam a consumir o motor em vez de reimplementar regras; `encerramento-da-partida` usa o estado final calculado aqui.
- **Riscos:** o modelo de estado imutável pode gerar mais código de atualização do que uma abordagem mutável; a separação entre regra de domínio e orquestração de turno precisa ficar clara para não antecipar a fase de batalha.
