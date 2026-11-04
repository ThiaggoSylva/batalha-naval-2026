# Tasks

## 1. Estado da partida

- [x] 1.1 Adicionar ao `PartidaStore` uma ação de sair que descarta a partida e volta ao estado inicial, com teste unitário cobrindo `iniciada()`, `fase()` e frotas vazias.

## 2. Interface de encerramento

- [x] 2.1 Adicionar o botão **Sair** ao painel final da batalha, com ícone e estilo secundário, e verificar no teste de componente que ele aparece apenas com a partida encerrada.
- [x] 2.2 Ligar o botão à ação de sair, cancelando o temporizador pendente, e verificar no teste de componente que a aplicação volta à apresentação e permite iniciar uma preparação vazia.

## 3. Documentação e verificação

- [x] 3.1 Registrar a opção de sair no fluxo de uso do `README.md` e verificar que o texto corresponde ao comportamento implementado.
- [ ] 3.2 Rodar lint, testes, build e validar o change com `openspec validate opcao-sair-ao-final --strict`.
