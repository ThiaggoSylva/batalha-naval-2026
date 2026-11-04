# encerramento-da-partida Specification

## Purpose

Comunicar o resultado final da partida e permitir que o jogador recomece com tabuleiros, frotas e históricos renovados.

## Requirements

### Requirement: Encerramento imediato com resultado

A partida SHALL ser encerrada imediatamente quando todas as embarcações de um participante forem destruídas. A interface SHALL informar se o jogador venceu ou perdeu e SHALL impedir novos ataques depois do encerramento.

#### Scenario: Exibir vitória

- **WHEN** o jogador destrói a última embarcação do computador
- **THEN** a interface informa a vitória do jogador
- **AND** nenhum ataque adicional é aceito

#### Scenario: Exibir derrota

- **WHEN** o computador destrói a última embarcação do jogador
- **THEN** a interface informa a derrota do jogador
- **AND** nenhum ataque adicional é aceito

#### Scenario: Manter os tabuleiros visíveis

- **WHEN** a partida termina
- **THEN** os tabuleiros permanecem visíveis com os resultados dos ataques
- **AND** o resultado final fica em destaque

### Requirement: Nova partida

Após o encerramento, a interface SHALL oferecer a opção de iniciar uma nova partida. Ao iniciar, tabuleiros, frotas, históricos e resultado anterior SHALL ser descartados e o jogo SHALL voltar à preparação com a frota do jogador vazia.

#### Scenario: Reiniciar após o fim

- **WHEN** o jogador aciona a opção de nova partida
- **THEN** a interface volta para a preparação
- **AND** os tabuleiros, históricos e resultado anterior são descartados

#### Scenario: Exigir nova preparação

- **WHEN** uma nova partida é iniciada
- **THEN** nenhuma embarcação do jogador está posicionada
- **AND** a batalha só pode começar após a frota ser montada novamente

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
