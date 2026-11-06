# Design

## Context

O projeto é uma SPA Angular 22 construída com `@angular/build:application`, sem roteamento e com saída estática em `dist/batalha-naval-2026/browser`. O repositório é público no GitHub e o endereço do Pages será `https://thiaggosylva.github.io/batalha-naval-2026/`.

## Goals / Non-Goals

**Goals:**

- Publicar automaticamente cada push na `main`, com lint e testes como portões.
- Usar apenas recursos nativos do GitHub Actions e Pages, sem branch `gh-pages` nem token de deploy manual.
- Manter o build local independente do caminho de publicação.

**Non-Goals:**

- Implantar backend, SSR ou ambientes de staging.
- Alterar o comportamento ou o layout do jogo.
- Publicar pré-visualizações de pull requests.

## Decisions

- **Artefatos oficiais do Pages** (`upload-pages-artifact` + `deploy-pages`): publicam o diretório de build diretamente via OIDC, sem gravar arquivos em uma branch. Alternativa descartada: `gh-pages` com `git push`, que exigiria permissão de escrita e histórico extra.
- **`baseHref` via argumento do build** (`--base-href=/batalha-naval-2026/`): mantém `angular.json` neutro e evita que o servidor local use um caminho de subdiretório. Alternativa descartada: fixar o `baseHref` na configuração de produção, o que afetaria todo build de produção local.
- **`404.html` como cópia de `index.html`**: o Pages serve esse arquivo em rotas desconhecidas, garantindo que a SPA carregue mesmo em acessos diretos.
- **Node 24 no workflow**: é a versão LTS compatível com os engines do Angular 22 (`^22.22.3 || ^24.15.0 || >=26.0.0`) e alinhada ao ambiente local.
- **Lint e testes antes do build**: falhas de qualidade impedem a publicação, evitando que uma versão quebrada chegue ao ar.

## Risks / Trade-offs

- [Pages desabilitado ou com origem errada] → Habilitar o Pages com `build_type=workflow` antes do primeiro deploy e verificar a execução do workflow.
- [Testes dependentes de navegador falham no runner] → A suíte usa Vitest com jsdom; o passo de testes reproduz o comando local `npm test -- --watch=false`.
- [Mudança no nome do repositório quebra o `baseHref`] → O caminho está documentado no workflow e no README para atualização em um único lugar.
