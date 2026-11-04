# experiencia-de-uso Specification

## Purpose

Garantir uma experiência inicial clara, responsiva e acessível em português, para que o jogo seja compreensível e utilizável em computadores e dispositivos móveis.

## Requirements

### Requirement: Apresentação inicial

A aplicação SHALL iniciar em uma tela de apresentação com o nome do jogo, uma explicação breve do objetivo, um resumo da frota e uma chamada para começar. Acionar a chamada SHALL levar à preparação da frota.

#### Scenario: Exibir apresentação

- **WHEN** a aplicação é aberta
- **THEN** a tela de apresentação mostra o nome, o objetivo e a composição da frota
- **AND** a chamada para começar fica visível

#### Scenario: Começar a partir da apresentação

- **WHEN** o jogador aciona a chamada para começar
- **THEN** a preparação da frota é exibida
- **AND** a apresentação deixa de ser mostrada

### Requirement: Responsividade e legibilidade

A interface SHALL ser utilizável em telas de 360 px de largura e em desktop, sem rolagem horizontal. Em telas estreitas, os dois tabuleiros SHALL ser empilhados e as células SHALL permanecer selecionáveis.

#### Scenario: Usar em tela estreita

- **WHEN** a interface é exibida em uma largura de 360 px
- **THEN** não há rolagem horizontal
- **AND** os tabuleiros permanecem completos e selecionáveis

#### Scenario: Usar em desktop

- **WHEN** a interface é exibida em uma largura de desktop
- **THEN** os dois tabuleiros podem ser exibidos lado a lado
- **AND** as coordenadas e legendas continuam legíveis

### Requirement: Acessibilidade e operação por teclado

Todos os controles SHALL ser operáveis por teclado, com foco visível e rótulos acessíveis. Mensagens de erro e de turno SHALL ser anunciadas e os resultados SHALL combinar símbolo, texto e cor.

#### Scenario: Operar o tabuleiro por teclado

- **WHEN** o jogador navega pelo tabuleiro com o teclado
- **THEN** o foco é visível em cada posição
- **AND** a posição pode ser acionada sem uso do mouse

#### Scenario: Anunciar mensagens de estado

- **WHEN** ocorre um erro de posicionamento ou uma mudança de turno
- **THEN** a mensagem é exibida e associada a uma região de status acessível
- **AND** o conteúdo não depende apenas de cor

### Requirement: Textos em português

Todos os textos voltados ao usuário SHALL estar em português. Mensagens de erro SHALL explicar o motivo da rejeição e a próxima ação esperada.

#### Scenario: Mensagem de posicionamento inválido

- **WHEN** um posicionamento é rejeitado
- **THEN** a mensagem em português explica o motivo
- **AND** orienta o jogador a escolher outra posição ou orientação
