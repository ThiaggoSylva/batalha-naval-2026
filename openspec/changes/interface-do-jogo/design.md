# Design

## Context

Ver `proposal.md` — Why e os deltas em `specs/`. O que molda o desenho:

- `src/app/dominio/` já entrega todas as regras como funções puras e imutáveis, com `Resultado<T>` em vez de exceções; a interface não deve reimplementar nenhuma regra.
- O shell existente (`app.ts`/`app.html`) tem apenas cabeçalho e `<main>` vazio; os tokens visuais (`fundo`, `texto`, `celula`, `agua`, `acerto`, `afundado`, `embarcacao`) já estão em `src/styles.css`.
- Angular 22 zoneless, componentes standalone e Signals; não há roteador configurado.
- `@lucide/angular` e Tailwind CSS 4 já estão instalados; nenhuma dependência nova é necessária.
- Vitest é o runner; o único teste de componente atual usa `TestBed` e `whenStable()`.

## Goals / Non-Goals

**Goals:**

- Uma única fonte de estado reativa (`PartidaStore`) que traduz o domínio para a interface e concentra mensagens em português.
- Componentes de apresentação pequenos, com o tabuleiro reutilizado nas três telas e sem conhecer regras além das visuais.
- Fluxo completo e verificável: apresentação → preparação → batalha → encerramento → nova preparação.
- Comportamento previsível em testes: o ataque do computador pode ser exercitado de forma síncrona no store; o atraso de interface fica isolado no componente.

**Non-Goals:**

- Roteamento, persistência, SSR, multiplayer ou estratégia de IA.
- Alterar contratos do domínio ou duplicar validações já existentes.
- Biblioteca de componentes ou sistema de design próprio.

## Decisions

### Estado central com Signals, sem NgRx

`PartidaStore` (`providedIn: 'root'`) mantém `estado = signal<EstadoPartida>(criarPartida())`, `iniciada` (se a apresentação foi concluída) e `mensagem` (feedback/erro). Os métodos chamam as funções do domínio, aplicam o `Resultado` e traduzem `CodigoErro` em texto. Computeds derivam frota, fase, turno, ataques e `frotaCompleta`.

- **Por quê:** o domínio já é imutável; um store fino evita duplicação e mantém a UI reativa em modo zoneless.
- **Alternativas:** estado local em cada componente (perde consistência entre preparação e batalha) e NgRx (peso desnecessário para um estado único).

### Sem roteador; `App` escolhe a tela por estado

`App` injeta o store e usa `@if`/`@switch`: apresentação quando `!iniciada()`, preparação quando `fase === 'preparacao'`, batalha nos demais casos. O encerramento é um painel sobre a batalha, preservando os tabuleiros visíveis.

- **Por quê:** o fluxo é linear e não há URLs ou deep links exigidos; menos configuração e nenhum estado de navegação a sincronizar.

### Tabuleiro como componente apresentacional

`Tabuleiro` recebe `celulas: readonly VisualCelula[]`, `preview`, `previewValido`, `desabilitado` e `rotulo`, e emite `casaSelecionada`. Ele não importa o domínio: apenas desenha a grade, as coordenadas, os símbolos e os estados de foco/hover.

`jogo/visual.ts` converte `Lado`/`Ataque[]` em `VisualCelula[]`:

- próprio: `embarcacao` para posições ocupadas, `acerto` para atingidas, `afundado` quando todas as posições da embarcação foram atingidas;
- adversário: apenas `agua`, `acerto` e `afundado` derivados dos ataques; posições não atacadas permanecem `livre`, sem revelar a frota;
- montagem: `embarcacao` para a frota posicionada e sobreposição de `preview`.

- **Por quê:** isola a apresentação, permite testar a tradução visual sem DOM e impede que o componente do tabuleiro receba a frota inimiga.
- **Alternativas:** passar `Tabuleiro` e `Frota` direto (arrisca vazar posições ocultas) e calcular tudo no template (difícil de testar).

### Preparação com seleção, orientação e pré-visualização

A tela mantém `tipoSelecionado` e `orientacao` como signals locais, e `preview` com as posições calculadas por `posicoesDeInicio`. A validade do preview considera limites e sobreposição com as demais embarcações (ignorando a própria, para permitir reposicionamento). O clique chama `PartidaStore.posicionar`, que delega a `posicionarEmbarcacaoJogador`; em sucesso, a próxima embarcação não posicionada é selecionada automaticamente.

- **Por quê:** feedback imediato sem duplicar as regras de validação do domínio; a mensagem final vem do `CodigoErro` do motor.

### Batalha com atraso curto do computador

O componente de batalha calcula os dois conjuntos de células visuais e, após um ataque válido do jogador, agenda `atacarComputador()` em `setTimeout` de ~900 ms, com `processando = true`. O timer é cancelado no `DestroyRef`. O store expõe `atacarComputador()` síncrono para testes e continua rejeitando ataques fora do turno.

- **Por quê:** dá tempo de o jogador ler o resultado do próprio ataque sem introduzir assincronismo no domínio.
- **Alternativas:** ataque imediato (confuso visualmente) e `interval`/RxJS (desnecessário).

### Acessibilidade e resultados não dependentes de cor

Cada célula é um `<button>` com `aria-label` contendo coordenada e estado; o tabuleiro tem `role="grid"`/`row`/`gridcell` semânticos via botões e rótulos. Mensagens usam `role="status"` e `role="alert"`. Resultados combinam ícone Lucide, texto na legenda e no histórico, além da cor. O foco usa `focus-visible` com anel de contraste.

- **Por quê:** atende ao requisito de não depender apenas de cor e mantém a operação por teclado.

### Testes

- `partida-store.spec.ts`: transições, erros traduzidos, início condicionado, ataque do jogador/computador, reinício.
- `visual.spec.ts`: mapeamento próprio/adversário, ocultação e detecção de embarcação destruída.
- `tabuleiro.spec.ts`: 100 células, rótulos de coordenadas, emissão de clique e bloqueio quando desabilitado.
- `app.spec.ts`: apresentação inicial e navegação para a preparação.
- Sem testes end-to-end no repositório; a verificação integrada usa `npm run lint`, `npm test`, `npm run build` e inspeção no navegador.

## Risks / Trade-offs

- **[Tabuleiro apertado em 360 px]** → grade com colunas `minmax(0, 1fr)`, tipografia mínima e sem padding interno; validação visual em 360 px e desktop.
- **[Ataque do computador concorrente com clique do jogador]** → `processando` desabilita o tabuleiro e o store rejeita `nao-e-o-turno`; timer cancelado ao destruir o componente.
- **[Mensagens de erro genéricas]** → mapa explícito de `CodigoErro` para texto em português com orientação de próxima ação.
- **[Acoplamento entre visual e domínio]** → `visual.ts` é a única ponte; componentes de apresentação recebem apenas `VisualCelula[]`.
- **[Frota inimiga exposta por engano]** → `visual.ts` para o adversário nunca lê `frota`; teste garante que posições não atacadas ficam `livre`.
