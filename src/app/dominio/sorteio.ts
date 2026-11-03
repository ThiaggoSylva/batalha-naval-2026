import { TOTAL_POSICOES } from './coordenada';
import { Embarcacao, posicoesDeInicio } from './embarcacao';
import { criarFrotaPadrao, Frota } from './frota';
import { falha, Orientacao, Resultado, sucesso } from './tipos';

export type Sorteio = () => number;

export const sorteioPadrao: Sorteio = () => Math.random();

export function indiceAleatorio(sorteio: Sorteio, limite: number): number {
  if (!Number.isInteger(limite) || limite <= 0) {
    return 0;
  }

  const valor = sorteio();
  const normalizado = Number.isFinite(valor) ? Math.min(Math.max(valor, 0), 0.999999999) : 0;

  return Math.floor(normalizado * limite);
}

export function embaralhar<T>(itens: readonly T[], sorteio: Sorteio = sorteioPadrao): readonly T[] {
  const resultado = [...itens];

  for (let indiceAtual = resultado.length - 1; indiceAtual > 0; indiceAtual--) {
    const indiceSorteado = indiceAleatorio(sorteio, indiceAtual + 1);
    const atual = resultado[indiceAtual];
    const alvo = resultado[indiceSorteado];

    if (atual === undefined || alvo === undefined) {
      continue;
    }

    resultado[indiceAtual] = alvo;
    resultado[indiceSorteado] = atual;
  }

  return resultado;
}

interface Posicionamento {
  readonly posicoes: readonly number[];
  readonly orientacao: Orientacao;
}

export function gerarFrotaComputador(sorteio: Sorteio = sorteioPadrao): Resultado<Frota> {
  const embarcacoes = criarFrotaPadrao().embarcacoes;
  const escolhas: (Posicionamento | null)[] = embarcacoes.map(() => null);
  const ocupadas = new Set<number>();

  const posicionar = (indiceEmbarcacao: number): boolean => {
    if (indiceEmbarcacao >= embarcacoes.length) {
      return true;
    }

    const embarcacao = embarcacoes[indiceEmbarcacao];

    if (!embarcacao) {
      return false;
    }

    const candidatos = candidatosLivres(embarcacao, ocupadas);

    for (const candidato of embaralhar(candidatos, sorteio)) {
      for (const posicao of candidato.posicoes) {
        ocupadas.add(posicao);
      }

      escolhas[indiceEmbarcacao] = candidato;

      if (posicionar(indiceEmbarcacao + 1)) {
        return true;
      }

      escolhas[indiceEmbarcacao] = null;

      for (const posicao of candidato.posicoes) {
        ocupadas.delete(posicao);
      }
    }

    return false;
  };

  if (!posicionar(0)) {
    return falha('frota-incompleta');
  }

  return sucesso({
    embarcacoes: embarcacoes.map((embarcacao, indice) => {
      const escolha = escolhas[indice];

      return escolha
        ? { ...embarcacao, orientacao: escolha.orientacao, posicoes: escolha.posicoes }
        : embarcacao;
    }),
  });
}

function candidatosLivres(
  embarcacao: Embarcacao,
  ocupadas: ReadonlySet<number>,
): readonly Posicionamento[] {
  const candidatos: Posicionamento[] = [];

  for (const orientacao of ['horizontal', 'vertical'] as const) {
    for (let inicio = 0; inicio < TOTAL_POSICOES; inicio++) {
      const posicoes = posicoesDeInicio(inicio, orientacao, embarcacao.tamanho);

      if (!posicoes.sucesso) {
        continue;
      }

      if (posicoes.valor.some((posicao) => ocupadas.has(posicao))) {
        continue;
      }

      candidatos.push({ posicoes: posicoes.valor, orientacao });
    }
  }

  return candidatos;
}
