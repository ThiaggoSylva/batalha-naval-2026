# Spec Delta

## Purpose

Define as regras puras do Batalha Naval — tabuleiro, frota, posicionamento, ataques, destruição, fim de partida e ataques do computador — para que a interface e as fases seguintes reutilizem um único motor testável, sem depender de Angular.

## ADDED Requirements

### Requirement: Tabuleiro e coordenadas

O motor SHALL representar cada tabuleiro como uma grade 10 × 10, com linhas `A` a `J` e colunas `1` a `10`. Coordenadas externas SHALL ser convertidas para índices de linha e coluna entre 0 e 9 e novamente para a notação textual. Entradas fora do tabuleiro ou com formato inválido SHALL ser rejeitadas.

#### Scenario: Converter coordenada válida

- **WHEN** a coordenada `A1` é convertida
- **THEN** o resultado é linha 0 e coluna 0
- **AND** a coordenada `J10` resulta em linha 9 e coluna 9

#### Scenario: Reconstruir a coordenada textual

- **WHEN** uma coordenada válida é convertida para índices e depois de volta para texto
- **THEN** o texto resultante é igual ao original em maiúsculas

#### Scenario: Rejeitar coordenada inválida

- **WHEN** são informadas coordenadas como `K1`, `A0`, `A11` ou `1A`
- **THEN** a conversão é rejeitada com indicação de coordenada inválida
- **AND** nenhum índice fora de 0 a 9 é produzido

### Requirement: Frota padrão

Cada participante SHALL possuir exatamente uma frota com porta-aviões (5 posições), encouraçado (4), cruzador (3), submarino (3) e destroyer (2), totalizando 17 posições. Cada embarcação SHALL ser identificável individualmente, com tipo, orientação e posições próprias.

#### Scenario: Composição inicial da frota

- **WHEN** uma frota é criada
- **THEN** ela contém as cinco embarcações previstas
- **AND** cada uma tem o tamanho correspondente ao seu tipo

#### Scenario: Total de posições ocupadas

- **WHEN** todas as embarcações da frota estão posicionadas sem sobreposição
- **THEN** exatamente 17 posições do tabuleiro estão ocupadas

### Requirement: Posicionamento de embarcações

Uma embarcação SHALL ocupar posições consecutivas em linha reta, somente na horizontal ou na vertical. O posicionamento SHALL ser aceito apenas se todas as posições estiverem dentro do tabuleiro e nenhuma estiver ocupada por outra embarcação. Embarcações PODEM ficar encostadas, inclusive nas diagonais.

#### Scenario: Aceitar posicionamento válido

- **WHEN** um cruzador é posicionado na horizontal em `B2`, `B3` e `B4`
- **THEN** o posicionamento é aceito
- **AND** as três posições passam a constar como ocupadas

#### Scenario: Rejeitar posicionamento fora da borda

- **WHEN** um porta-aviões é posicionado horizontalmente a partir de `A8`
- **THEN** o posicionamento é rejeitado
- **AND** o tabuleiro permanece inalterado

#### Scenario: Rejeitar sobreposição

- **WHEN** uma embarcação é posicionada sobre uma posição já ocupada por outra
- **THEN** o posicionamento é rejeitado
- **AND** o posicionamento válido existente é preservado

#### Scenario: Permitir embarcações encostadas

- **WHEN** duas embarcações são posicionadas lado a lado sem compartilhar posições
- **THEN** ambos os posicionamentos são aceitos

#### Scenario: Rejeitar posicionamento não retilíneo

- **WHEN** uma embarcação tenta ocupar `B2`, `B3` e `C4`
- **THEN** o posicionamento é rejeitado por não ser consecutivo em linha reta

### Requirement: Reconfiguração durante a preparação

Enquanto a partida estiver em preparação, o participante SHALL poder remover e reposicionar suas embarcações. Uma tentativa inválida SHALL ser rejeitada sem alterar o posicionamento válido já existente.

#### Scenario: Remover e reposicionar embarcação

- **WHEN** uma embarcação posicionada é removida e depois posicionada em outro local válido
- **THEN** o novo posicionamento é aceito
- **AND** as posições antigas deixam de estar ocupadas

#### Scenario: Preservar estado após tentativa inválida

- **WHEN** uma tentativa de posicionamento é rejeitada
- **THEN** todas as embarcações válidas permanecem nas posições anteriores

### Requirement: Início da batalha

A batalha SHALL começar somente quando as frotas do jogador e do computador estiverem completas e válidas. Ao iniciar, o motor SHALL distribuir automaticamente a frota do computador respeitando as mesmas regras de posicionamento, definir o estado como em andamento e conceder o primeiro ataque ao jogador.

#### Scenario: Impedir início com frota incompleta

- **WHEN** o jogador tenta iniciar a batalha sem todas as embarcações posicionadas
- **THEN** o início é rejeitado
- **AND** o estado permanece em preparação

#### Scenario: Iniciar com frotas completas

- **WHEN** as frotas do jogador e do computador estão completas e válidas
- **THEN** o estado passa a ser em andamento
- **AND** o primeiro turno pertence ao jogador

#### Scenario: Frota do computador válida

- **WHEN** a batalha é iniciada
- **THEN** a frota do computador ocupa 17 posições distintas dentro do tabuleiro
- **AND** nenhuma embarcação do computador se sobrepõe a outra

### Requirement: Resolução de ataques

Cada participante SHALL realizar no máximo um ataque por turno. Um ataque SHALL selecionar uma coordenada ainda não atacada do tabuleiro adversário e SHALL produzir um resultado de água, acerto ou embarcação destruída. Uma tentativa inválida SHALL ser rejeitada sem consumir o turno.

#### Scenario: Ataque em água

- **WHEN** o jogador ataca uma coordenada sem embarcação
- **THEN** o resultado é água
- **AND** o turno passa ao computador

#### Scenario: Ataque com acerto

- **WHEN** o jogador ataca uma posição ocupada por uma embarcação ainda não destruída
- **THEN** o resultado é acerto
- **AND** a posição é registrada como atingida

#### Scenario: Ataque que destrói embarcação

- **WHEN** o ataque atinge a última posição intacta de uma embarcação
- **THEN** o resultado informa que a embarcação foi destruída

#### Scenario: Rejeitar ataque repetido

- **WHEN** o jogador tenta atacar uma coordenada que ele já atacou
- **THEN** o ataque é rejeitado
- **AND** o turno permanece com o jogador

#### Scenario: Rejeitar ataque fora do tabuleiro

- **WHEN** é tentado um ataque em coordenada inexistente
- **THEN** o ataque é rejeitado
- **AND** o turno permanece com o jogador

### Requirement: Destruição de embarcações

Uma embarcação SHALL ser considerada destruída quando todas as suas posições tiverem sido atingidas. O motor SHALL informar a destruição no resultado do ataque, sem revelar as posições restantes de outras embarcações.

#### Scenario: Acerto parcial não destrói

- **WHEN** apenas parte das posições de uma embarcação foi atingida
- **THEN** a embarcação continua ativa
- **AND** o resultado do ataque é apenas acerto

#### Scenario: Última posição destrói a embarcação

- **WHEN** todas as posições de uma embarcação já foram atingidas após um ataque
- **THEN** a embarcação é marcada como destruída
- **AND** a destruição é informada no resultado

### Requirement: Fim da partida

A partida SHALL terminar imediatamente quando todas as embarcações de um participante forem destruídas. O jogador vence se a frota do computador for destruída primeiro e perde se a própria frota for destruída primeiro. Depois do encerramento, nenhum ataque SHALL ser aceito.

#### Scenario: Vitória do jogador

- **WHEN** o jogador destrói a última embarcação do computador
- **THEN** o estado passa a vitória do jogador
- **AND** o computador não realiza outro ataque

#### Scenario: Derrota do jogador

- **WHEN** o computador destrói a última embarcação do jogador
- **THEN** o estado passa a vitória do computador
- **AND** o jogador não realiza outro ataque

#### Scenario: Ataque após o encerramento

- **WHEN** qualquer participante tenta atacar depois que a partida terminou
- **THEN** o ataque é rejeitado
- **AND** o resultado final permanece inalterado

### Requirement: Registro de ataques

O motor SHALL manter, para cada participante, o histórico das coordenadas atacadas e do resultado de cada ataque, permitindo distinguir água, acerto e embarcação destruída. O histórico SHALL impedir que a mesma coordenada seja atacada novamente pelo mesmo participante.

#### Scenario: Registrar ataque realizado

- **WHEN** um ataque válido é concluído
- **THEN** a coordenada e o resultado são acrescentados ao histórico do atacante
- **AND** a mesma coordenada passa a constar como já atacada

#### Scenario: Consultar ataques anteriores

- **WHEN** o estado da partida é consultado durante a batalha
- **THEN** todos os ataques anteriores de ambos os participantes estão disponíveis
- **AND** cada um mantém seu resultado original

### Requirement: Ataque aleatório do computador

No turno do computador, o motor SHALL escolher aleatoriamente uma coordenada que o computador ainda não atacou. A função de sorteio SHALL ser injetada, de modo que os testes possam determinar a escolha. Se o computador não tiver coordenadas disponíveis, nenhum ataque SHALL ser realizado.

#### Scenario: Escolher entre coordenadas não atacadas

- **WHEN** é solicitado o ataque do computador
- **THEN** a coordenada escolhida não está no histórico de ataques do computador

#### Scenario: Sorteio determinístico em teste

- **WHEN** uma função de sorteio controlada é fornecida ao motor
- **THEN** o ataque do computador corresponde à coordenada indicada pela função

#### Scenario: Sem coordenadas disponíveis

- **WHEN** o computador já atacou todas as coordenadas possíveis
- **THEN** nenhum ataque é realizado
- **AND** o estado não é alterado

### Requirement: Nova partida

Após o encerramento, o motor SHALL permitir iniciar uma nova partida, descartando tabuleiros, frotas, histórico de ataques e resultado anterior, e retornando ao estado de preparação.

#### Scenario: Reiniciar após o fim

- **WHEN** uma nova partida é iniciada após o encerramento
- **THEN** o estado volta para preparação
- **AND** os tabuleiros, históricos e resultado anterior são descartados

#### Scenario: Nova partida exige nova preparação

- **WHEN** uma nova partida foi iniciada
- **THEN** nenhuma embarcação do jogador está posicionada
- **AND** a batalha só pode começar após nova preparação completa
