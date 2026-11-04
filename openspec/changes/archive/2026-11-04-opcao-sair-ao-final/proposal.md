# Proposal

## Why

Ao final da partida, o jogador só pode jogar novamente. Se não quiser recomeçar, não há caminho claro para encerrar a experiência e voltar à tela inicial sem recarregar a página.

## What Changes

- Adiciona a opção **Sair** ao painel de resultado final, ao lado de **Jogar novamente**.
- Ao sair, a partida atual é descartada e a aplicação volta à tela de apresentação, pronta para iniciar uma nova partida do zero.
- A opção aparece apenas quando a partida está encerrada; durante a batalha e a preparação o fluxo permanece inalterado.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `encerramento-da-partida`: nova opção de sair após o encerramento, retornando à apresentação com o estado da partida descartado.

## Impact

- `src/app/jogo/partida-store.ts`: ação para encerrar a sessão atual e retornar ao estado inicial.
- `src/app/jogo/batalha/batalha.ts` e `batalha.html`: botão e ação de sair no painel final.
- `src/app/jogo/batalha/batalha.spec.ts`: cobertura do novo fluxo.
- `README.md`: menção à opção de sair no fluxo de uso.
