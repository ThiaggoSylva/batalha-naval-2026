# Proposal

## Why

O motor do jogo já existe em `src/app/dominio/`, mas a aplicação continua sendo apenas um cabeçalho vazio: não há como iniciar uma partida, montar a frota, atacar ou jogar novamente. Sem a camada de interface, o enunciado inteiro — preparação manual, batalha por turnos contra o computador, encerramento e reinício — permanece inacessível ao usuário.

## What Changes

- Adiciona uma camada de estado Angular com Signals que conecta o domínio puro à interface, sem duplicar regras de jogo.
- Entrega a tela de apresentação com identidade do jogo e chamada para começar.
- Implementa a preparação da frota: seleção de embarcação, escolha de orientação, pré-visualização no tabuleiro, posicionamento, remoção e mensagens de erro em português.
- Implementa a batalha por turnos: tabuleiro próprio com embarcações e ataques recebidos, tabuleiro adversário com frota oculta, ataque por coordenada, resultado de água/acerto/destruído e ataque automático do computador.
- Exibe o histórico de ataques dos dois participantes e o indicador de turno.
- Implementa o encerramento imediato com vitória ou derrota e a opção de iniciar nova partida.
- Aplica responsividade de 360 px a desktop, acessibilidade por teclado e resultados que não dependem apenas de cor.
- Atualiza o `README.md` com o fluxo de uso e a matriz de cobertura da interface.

**Fora de escopo:** multiplayer, persistência, ranking, dificuldade estratégica do computador e alterações nas regras do motor do jogo.

## Capabilities

### New Capabilities

- `preparacao-da-frota`: tabuleiro de montagem, seleção e orientação de embarcações, validação do posicionamento, remoção, reposicionamento e bloqueio do início da batalha.
- `batalha-por-turnos`: os dois tabuleiros durante a partida, ocultação da frota adversária, ataque por coordenada, resultados, turno do computador e histórico de ataques.
- `encerramento-da-partida`: vitória, derrota, bloqueio de novos ataques e reinício com nova preparação.
- `experiencia-de-uso`: apresentação inicial, indicadores de estado, responsividade, acessibilidade e resultados compreensíveis sem depender de cor.

### Modified Capabilities

Nenhuma. O motor existente (`motor-do-jogo`) permanece com o mesmo contrato; esta change apenas o consome.

## Impact

- **Arquivos novos:** `src/app/jogo/**` (store com Signals, componentes de apresentação, preparação, batalha, tabuleiro e fim de partida, rótulos e testes).
- **Arquivos modificados:** `src/app/app.ts`, `src/app/app.html`, `src/app/app.spec.ts`, `src/styles.css` (se necessário para detalhes visuais) e `README.md`.
- **Dependências:** nenhuma nova; reutiliza `@lucide/angular` e Tailwind CSS já instalados.
- **Fases impactadas:** encerra o escopo funcional do projeto; as quatro capabilities restantes passam a existir nas specs principais.
- **Riscos:** manter o tabuleiro legível em telas pequenas; garantir que o ataque automático do computador não permita ações concorrentes do jogador; evitar acoplamento entre componentes e regras do domínio.
