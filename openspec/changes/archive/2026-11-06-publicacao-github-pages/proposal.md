# Proposal

## Why

A aplicação só está disponível localmente. Para que possa ser jogada por qualquer pessoa, é necessário publicá-la em um endereço estável e automatizar build e deploy a cada alteração na branch `main`.

## What Changes

- Adiciona um workflow de CI/CD no GitHub Actions que valida lint e testes antes de compilar.
- Publica o build de produção no GitHub Pages usando os artefatos oficiais do Pages.
- Configura o `baseHref` para o caminho do repositório e adiciona fallback `404.html` para carregar a aplicação em URLs diretas.
- Documenta o endereço publicado e como acompanhar a implantação no `README.md`.
- Não altera o comportamento do jogo; por isso a mudança não possui delta de spec (`skip_specs: true`).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

(nenhuma)

## Impact

- `.github/workflows/deploy-pages.yml`: pipeline de build e publicação.
- `README.md`: seção de deploy e endereço público.
- GitHub Pages do repositório precisa estar habilitado com origem **GitHub Actions**.
