# batalha-por-turnos Specification

## Purpose

Oferecer a batalha por turnos contra o computador, com dois tabuleiros, resultados explícitos e alternância automática de ataques.

## Requirements

### Requirement: Tabuleiros durante a batalha

Durante a batalha, a interface SHALL exibir o tabuleiro do jogador com suas embarcações e os ataques recebidos e o tabuleiro do computador com a frota oculta. Cada tabuleiro SHALL manter as coordenadas `A1`–`J10` visíveis.

#### Scenario: Exibir o tabuleiro do jogador

- **WHEN** a batalha começa
- **THEN** o tabuleiro do jogador mostra suas embarcações e os ataques recebidos
- **AND** as coordenadas continuam legíveis

#### Scenario: Ocultar a frota do computador

- **WHEN** a batalha está em andamento
- **THEN** o tabuleiro do computador não revela posições de embarcações não atingidas
- **AND** apenas os ataques realizados pelo jogador são exibidos

### Requirement: Ataque do jogador por coordenada

O jogador SHALL atacar selecionando uma coordenada do tabuleiro do computador. Um ataque válido SHALL produzir água, acerto ou embarcação destruída. Uma tentativa em coordenada já atacada ou fora do turno SHALL ser rejeitada sem consumir o turno.

#### Scenario: Ataque válido

- **WHEN** o jogador seleciona uma coordenada ainda não atacada no tabuleiro do computador
- **THEN** o ataque é registrado com seu resultado
- **AND** a coordenada passa a mostrar o resultado

#### Scenario: Rejeitar ataque repetido

- **WHEN** o jogador seleciona uma coordenada que já atacou
- **THEN** o ataque é ignorado
- **AND** o turno não é alterado

#### Scenario: Rejeitar ataque fora do turno

- **WHEN** o jogador tenta atacar durante o turno do computador
- **THEN** o ataque é ignorado
- **AND** a interface permanece no turno do computador

### Requirement: Resultados compreensíveis sem cor

Cada posição atacada SHALL exibir um símbolo ou texto que identifique água, acerto ou embarcação destruída. A interface SHALL oferecer legenda e histórico textual para que os resultados não dependam apenas de cor.

#### Scenario: Identificar resultado na célula

- **WHEN** uma posição é atacada
- **THEN** a célula mostra um símbolo correspondente ao resultado
- **AND** a legenda explica o significado do símbolo

#### Scenario: Identificar embarcação destruída

- **WHEN** um ataque destrói uma embarcação
- **THEN** a interface informa a destruição e o tipo da embarcação
- **AND** as posições da embarcação destruída passam a ser distinguíveis das demais

### Requirement: Turno e ataque do computador

Após um ataque válido do jogador, se a partida não tiver terminado, o computador SHALL realizar automaticamente um ataque em coordenada ainda não atacada, escolhida ao acaso. A interface SHALL indicar o turno atual e impedir novos ataques do jogador enquanto o computador joga.

#### Scenario: Computador ataca após o jogador

- **WHEN** o jogador conclui um ataque válido e a partida continua
- **THEN** a interface indica que é a vez do computador
- **AND** o computador realiza um ataque em coordenada não atacada

#### Scenario: Bloquear ação durante o ataque do computador

- **WHEN** o computador está escolhendo ou resolvendo seu ataque
- **THEN** o tabuleiro do computador não aceita novos ataques do jogador
- **AND** o jogador é avisado de que aguarda o computador

#### Scenario: Devolver o turno ao jogador

- **WHEN** o ataque do computador termina e a partida continua
- **THEN** o turno volta para o jogador
- **AND** o tabuleiro do computador volta a aceitar ataques

### Requirement: Histórico de ataques

A interface SHALL manter visível o histórico de ataques dos dois participantes, com a coordenada e o resultado de cada ataque, atualizado a cada turno concluído.

#### Scenario: Registrar ataques no histórico

- **WHEN** um ataque é concluído por qualquer participante
- **THEN** a coordenada e o resultado são acrescentados ao histórico correspondente
- **AND** o histórico anterior permanece disponível

#### Scenario: Distinguir atacante

- **WHEN** o histórico é exibido
- **THEN** os ataques do jogador e do computador são identificados separadamente
- **AND** cada ataque mantém seu resultado original
