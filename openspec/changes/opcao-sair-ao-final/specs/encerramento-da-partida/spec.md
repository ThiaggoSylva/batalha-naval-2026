# Spec Delta

## ADDED Requirements

### Requirement: Sair após o encerramento

Quando a partida estiver encerrada, a interface SHALL oferecer, além de jogar novamente, a opção de sair. Ao sair, a sessão atual SHALL ser descartada e a aplicação SHALL voltar à tela de apresentação.

#### Scenario: Voltar à apresentação

- **WHEN** o jogador aciona a opção de sair após o encerramento
- **THEN** a aplicação exibe a tela de apresentação
- **AND** a partida, os tabuleiros e os históricos anteriores são descartados

#### Scenario: Iniciar do zero após sair

- **WHEN** o jogador sai ao final de uma partida e escolhe começar outra
- **THEN** a preparação é exibida com a frota vazia
- **AND** nenhum resultado da partida anterior permanece visível
