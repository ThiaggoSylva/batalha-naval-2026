# Design

## Context

Ver `proposal.md` — Why e `specs/motor-do-jogo/spec.md` — requisitos. O que molda o desenho:

- A `fundacao-do-projeto` deixou `src/app/dominio/` reservado para regras puras, sem imports de Angular, mas a pasta não chegou a ser versionada; esta change a cria de fato.
- O runner é Vitest, já configurado pelo Angular CLI, e a suíte atual só tem o teste de fumaça do shell.
- Nenhuma dependência nova é necessária; o motor é TypeScript puro.
- As fases seguintes (preparação da frota e batalha por turnos) vão consumir o motor, mas a interface e o serviço com Signals ficam fora desta change.
- `openspec/config.yaml` não define `context` nem `rules` adicionais.

## Goals / Non-Goals

**Goals:**

- Uma API de domínio pequena, tipada e previsível, que as fases de UI possam chamar sem conhecer detalhes internos.
- Operações inválidas representadas como resultado, não como exceção, para que a UI decida como exibir o erro.
- Determinismo total nos testes: sorteios (frota do computador e ataques) recebem uma função injetável.
- Regras do enunciado cobertas por testes legíveis, um cenário por comportamento relevante.

**Non-Goals:**

- Serviço Angular, Signals, componentes, templates ou estilos.
- Persistência entre sessões, roteamento e telas de preparação/batalha/resultado.
- Estratégia de IA além do sorteio uniforme entre coordenadas não atacadas.
- Micro-otimizações de tabuleiro ou estruturas pensadas para tabuleiros maiores que 10 × 10.

## Decisions

### 1. Domínio em TypeScript puro, sem imports de Angular

Organizar `src/app/dominio/` em módulos por responsabilidade, com um `index.ts` como única porta de entrada pública:

```
src/app/dominio/
  tipos.ts          tipos compartilhados (participante, fase, resultados)
  coordenada.ts     conversão A1–J10 ↔ índices e validação
  embarcacao.ts     tipos de embarcação, tamanhos e orientação
  frota.ts          frota do jogador, posicionamento e validação
  tabuleiro.ts      grade 10 × 10, ocupação e consulta de células
  sorteio.ts        função de sorteio injetável + geração da frota do computador
  partida.ts        estado da partida, turnos, ataques, vitória e nova partida
  index.ts          API pública do motor
  *.spec.ts         testes colocados ao lado dos módulos
```

- **Alternativas:** um único arquivo `motor.ts` (simples no início, mas mistura responsabilidades e dificulta navegar nos testes); classes com métodos mutáveis (menos previsível para Signals nas fases seguintes).
- **Consequência:** a UI importa apenas de `./dominio`; nenhum componente conhece a estrutura interna do tabuleiro.

### 2. Estado imutável com funções que retornam resultado

O estado da partida é um objeto somente leitura. Cada operação retorna um novo estado ou um erro esperado, usando um tipo discriminado:

```
type Resultado<T> =
  | { sucesso: true; valor: T }
  | { sucesso: false; erro: CodigoErro };
```

Códigos de erro previstos: `coordenada-invalida`, `fora-do-tabuleiro`, `posicao-ocupada`, `embarcacao-nao-posicionada`, `frota-incompleta`, `ataque-repetido`, `partida-encerrada`, `nao-e-o-turno`, `sem-coordenada-disponivel`.

- **Alternativas:** lançar exceções (obriga cada chamador a usar `try/catch` para erros que são fluxo normal do jogo); mutar o estado diretamente (dificulta integração com Signals e testes de transição).
- **Consequência:** erros de regra não interrompem a aplicação e podem ser traduzidos para mensagens em português na fase de UI sem depender de texto de exceção.

### 3. Coordenadas internas por índice linear

Cada posição é identificada por `indice = linha * 10 + coluna`, com linha e coluna entre 0 e 9. Funções convertem `A1`–`J10` para índices e de volta, normalizando a entrada para maiúsculas. Tabuleiros guardam conjuntos/arrays de 100 posições; a notação textual existe apenas na borda da API.

- **Alternativas:** strings `A1` como chave de estado (mais validação a cada operação e ordenação textual confusa); pares `{ linha, coluna }` como chave (exige comparação estrutural em vez de igualdade simples).
- **Consequência:** histórico de ataques e ocupação usam `Set<number>`, com operações O(1); a UI converte apenas para exibir.

### 4. Modelo de estado separando preparação e batalha

`EstadoPartida` é uma união discriminada por `fase`:

- `preparacao`: tabuleiro e frota do jogador em montagem; frota do computador ainda não gerada.
- `em-andamento`: ambos os tabuleiros prontos, turno atual (`jogador` ou `computador`), históricos e contagem de embarcações destruídas.
- `encerrada`: vencedor (`jogador` ou `computador`) e o estado final para consulta.

Cada participante tem seu tabuleiro; o do computador contém as embarcações, mas a interface das fases seguintes é quem decide não renderizá-las durante a partida.

- **Alternativas:** um único objeto mutável com flags booleanas (`iniciada`, `terminou`) — mais fácil de produzir estados impossíveis (por exemplo, encerrada e em andamento ao mesmo tempo).
- **Consequência:** transições inválidas (atacar em preparação, iniciar duas vezes) são rejeitadas pelo tipo e por guardas explícitas.

### 5. Geração da frota do computador por backtracking aleatorizado

Para cada embarcação, em ordem decrescente de tamanho, listar todas as posições válidas no tabuleiro vazio/parcial, embaralhar com o sorteio injetado e tentar posicionar; se uma escolha levar a um beco sem saída, retroceder. Isso garante uma frota completa sempre que uma solução existir, sem laço de tentativas potencialmente infinito.

- **Alternativas:** tentar posições aleatórias até completar (simples, mas com risco teórico de não terminar); posicionamento fixo pré-calculado (fácil, porém o computador teria sempre a mesma frota e o requisito pede distribuição automática, não fixa).
- **Consequência:** a mesma função de sorteio usada nos ataques também determina a frota do computador, permitindo testes reproduzíveis.

### 6. Sorteio injetável com valor padrão

`criarSorteio` recebe `() => number` no intervalo `[0, 1)`; quando omitido, usa `Math.random`. O motor nunca chama `Math.random` diretamente, exceto no valor padrão do parâmetro. Funções de embaralhamento usam Fisher–Yates com esse sorteio.

- **Alternativas:** buscar `Math.random` dentro do módulo (impede testes determinísticos sem mocks globais); receber uma semente numérica (obrigaria a implementar um PRNG próprio, sem ganho para o escopo).
- **Consequência:** os testes passam funções controladas; o aplicativo real usa o padrão sem configuração extra.

### 7. Testes unitários com Vitest, sem TestBed

Os testes ficam ao lado dos módulos (`*.spec.ts`) e exercitam a API pública do domínio, sem Angular. Cada requisito e cenário da spec tem pelo menos um teste correspondente, incluindo as situações da tabela do `README.md`.

- **Alternativas:** testar via componente (acoplaria as regras à UI e exigiria TestBed); um único arquivo de teste (mais difícil de localizar a falha).
- **Consequência:** `npm test` continua sendo o único comando necessário; os testes rodam rápido e não dependem do DOM.

## Risks / Trade-offs

- **Imutabilidade gerar código repetitivo de clonagem** → centralizar a criação de novo estado em funções pequenas (`comTabuleiro`, `comTurno`, `comAtaque`) para não espalhar espalhamentos manuais.
- **Confusão entre regra de domínio e orquestração de turno** → o motor resolve um ataque e devolve o novo estado; a futura change `batalha-por-turnos` apenas encadeia chamadas e temporização, sem recalcular regras.
- **Backtracking aleatorizado ter bug silencioso e gerar frota incompleta** → teste dedicado que valida 17 posições distintas e compatíveis com todos os tipos após várias execuções com sorteios diferentes.
- **Códigos de erro virarem uma lista grande e instável** → manter apenas códigos usados por requisitos atuais; mensagens em português ficam na camada de UI.
- **Vazamento da frota do computador para a UI antes da hora** → documentar que o estado contém a frota, mas a renderização é responsabilidade das fases seguintes; os testes não devem assumir ocultação no domínio.
- **Escopo crescer para incluir serviço ou tela** → a change não altera `src/app/app.*`; qualquer integração visual pertence a `preparacao-da-frota`.

## Migration Plan

Mudança puramente aditiva: cria `src/app/dominio/` e seus testes. Nenhum código existente é alterado, não há dados a migrar e o rollback é remover a pasta. As fases seguintes passam a importar do domínio quando forem implementadas.

## Open Questions

- Se a tela de resultado precisará dos nomes das embarcações destruídas do computador, o motor já expõe a frota completa no estado final; a decisão de exibir fica para `encerramento-da-partida`.
