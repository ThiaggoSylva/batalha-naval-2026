# preparacao-da-frota Specification

## Purpose

Permitir que o jogador monte sua frota no tabuleiro, com escolha de orientação, validação e feedback claros, antes de iniciar a batalha.

## Requirements

### Requirement: Tabuleiro e frota na preparação

A preparação SHALL exibir o tabuleiro 10 × 10 do jogador com as coordenadas `A1`–`J10` e a frota padrão de cinco embarcações, cada uma com nome e tamanho. As posições ocupadas SHALL ser visualmente distintas das posições livres.

#### Scenario: Exibir tabuleiro e frota

- **WHEN** o jogador entra na preparação
- **THEN** o tabuleiro 10 × 10 é exibido com linhas `A`–`J` e colunas `1`–`10`
- **AND** as cinco embarcações aparecem listadas com nome e tamanho

#### Scenario: Identificar embarcação posicionada

- **WHEN** uma embarcação é posicionada
- **THEN** suas posições passam a ser destacadas no tabuleiro
- **AND** a lista indica que ela está posicionada

### Requirement: Seleção de embarcação e orientação

O jogador SHALL escolher qual embarcação posicionar e alternar entre as orientações horizontal e vertical. A interface SHALL indicar a embarcação selecionada e a orientação ativa, além de pré-visualizar as posições antes da confirmação.

#### Scenario: Alternar orientação

- **WHEN** o jogador alterna a orientação
- **THEN** a indicação visual da orientação muda
- **AND** a pré-visualização passa a considerar a nova orientação

#### Scenario: Pré-visualizar posicionamento

- **WHEN** o ponteiro ou o foco está sobre uma posição do tabuleiro durante a preparação
- **THEN** as posições que a embarcação ocuparia são destacadas
- **AND** o destaque diferencia um posicionamento válido de um inválido

### Requirement: Posicionamento e validação

Ao escolher uma posição inicial, a interface SHALL posicionar a embarcação selecionada somente se todas as posições estiverem dentro do tabuleiro e livres. Um posicionamento inválido SHALL ser rejeitado com mensagem em português, sem alterar as embarcações já posicionadas.

#### Scenario: Aceitar posicionamento válido

- **WHEN** o jogador posiciona um cruzador na horizontal em `B2`, `B3` e `B4`
- **THEN** as três posições passam a ser ocupadas
- **AND** nenhuma mensagem de erro é exibida

#### Scenario: Rejeitar posicionamento fora da borda

- **WHEN** o jogador tenta posicionar um porta-aviões horizontalmente a partir de `A8`
- **THEN** o posicionamento é rejeitado com mensagem explicativa
- **AND** o tabuleiro permanece inalterado

#### Scenario: Rejeitar sobreposição

- **WHEN** o jogador tenta posicionar uma embarcação sobre uma posição já ocupada
- **THEN** o posicionamento é rejeitado com mensagem explicativa
- **AND** o posicionamento válido existente é preservado

### Requirement: Remoção e reposicionamento

O jogador SHALL poder remover e reposicionar qualquer embarcação enquanto a partida estiver em preparação, sem perder o posicionamento das demais.

#### Scenario: Remover embarcação

- **WHEN** o jogador remove uma embarcação posicionada
- **THEN** suas posições deixam de estar ocupadas
- **AND** as demais embarcações permanecem onde estavam

#### Scenario: Reposicionar embarcação

- **WHEN** o jogador escolhe uma nova posição para uma embarcação já posicionada
- **THEN** o novo posicionamento substitui o anterior
- **AND** as posições antigas são liberadas

### Requirement: Início da batalha condicionado à frota

A interface SHALL habilitar o início da batalha somente quando as cinco embarcações estiverem posicionadas. Enquanto a frota estiver incompleta, o controle SHALL permanecer desabilitado e a interface SHALL informar quais embarcações faltam.

#### Scenario: Bloquear início com frota incompleta

- **WHEN** a frota ainda tem embarcações não posicionadas
- **THEN** o controle de início permanece desabilitado
- **AND** a interface informa que a frota precisa estar completa

#### Scenario: Permitir início com frota completa

- **WHEN** as cinco embarcações estão posicionadas
- **THEN** o controle de início é habilitado
- **AND** acioná-lo inicia a batalha
