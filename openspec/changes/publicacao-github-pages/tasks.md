# Tasks

## 1. Pipeline de CI/CD

- [x] 1.1 Criar o workflow do GitHub Actions com gatilhos em `main` e manual, permissões de Pages via OIDC e concorrência controlada.
- [x] 1.2 Adicionar os passos de instalação, lint, testes, build com `baseHref`, fallback `404.html` e publicação do diretório `browser`.

## 2. Documentação

- [x] 2.1 Documentar no `README.md` o endereço público, o gatilho de deploy e como acompanhar a execução no GitHub Actions.

## 3. Verificação e publicação

- [x] 3.1 Executar o build local com `--base-href=/batalha-naval-2026/` e confirmar o caminho dos assets no `index.html`.
- [x] 3.2 Habilitar o GitHub Pages com origem GitHub Actions, enviar o workflow e confirmar execução concluída com sucesso.
- [x] 3.3 Abrir a URL publicada e verificar que a aplicação carrega e inicia uma partida.
- [x] 3.4 Validar o change com `openspec validate publicacao-github-pages --strict`.

## Workflow follow-up

- Sincronizar as specs (não aplicável: `skip_specs: true`) e arquivar a change após a publicação bem-sucedida.
