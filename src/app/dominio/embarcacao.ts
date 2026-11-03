import { colunaDoIndice, linhaDoIndice, TAMANHO_TABULEIRO } from './coordenada';
import { falha, Orientacao, Resultado, sucesso, TipoEmbarcacao } from './tipos';

export const TAMANHOS: Record<TipoEmbarcacao, number> = {
  'porta-avioes': 5,
  encouracado: 4,
  cruzador: 3,
  submarino: 3,
  destroyer: 2,
};

export const ORDEM_FROTA: readonly TipoEmbarcacao[] = [
  'porta-avioes',
  'encouracado',
  'cruzador',
  'submarino',
  'destroyer',
];

export interface Embarcacao {
  readonly tipo: TipoEmbarcacao;
  readonly tamanho: number;
  readonly orientacao: Orientacao | null;
  readonly posicoes: readonly number[];
}

export function criarEmbarcacao(tipo: TipoEmbarcacao): Embarcacao {
  return {
    tipo,
    tamanho: TAMANHOS[tipo],
    orientacao: null,
    posicoes: [],
  };
}

export function estaPosicionada(embarcacao: Embarcacao): boolean {
  return embarcacao.posicoes.length === embarcacao.tamanho;
}

export function posicoesDeInicio(
  indiceInicial: number,
  orientacao: Orientacao,
  tamanho: number,
): Resultado<readonly number[]> {
  if (!Number.isInteger(indiceInicial) || !Number.isInteger(tamanho) || tamanho <= 0) {
    return falha('coordenada-invalida');
  }

  if (indiceInicial < 0 || indiceInicial >= TAMANHO_TABULEIRO * TAMANHO_TABULEIRO) {
    return falha('fora-do-tabuleiro');
  }

  const linha = linhaDoIndice(indiceInicial);
  const coluna = colunaDoIndice(indiceInicial);
  const excedeHorizontal = coluna + tamanho > TAMANHO_TABULEIRO;
  const excedeVertical = linha + tamanho > TAMANHO_TABULEIRO;

  if (
    (orientacao === 'horizontal' && excedeHorizontal) ||
    (orientacao === 'vertical' && excedeVertical)
  ) {
    return falha('fora-do-tabuleiro');
  }

  const passo = orientacao === 'horizontal' ? 1 : TAMANHO_TABULEIRO;
  const posicoes: number[] = [];

  for (let deslocamento = 0; deslocamento < tamanho; deslocamento++) {
    posicoes.push(indiceInicial + deslocamento * passo);
  }

  return sucesso(posicoes);
}

export interface PosicoesValidadas {
  readonly posicoes: readonly number[];
  readonly orientacao: Orientacao;
}

export function validarPosicoes(
  posicoes: readonly number[],
  tamanho: number,
): Resultado<PosicoesValidadas> {
  if (posicoes.length !== tamanho) {
    return falha('posicionamento-invalido');
  }

  const ordenadas: number[] = [];

  for (const posicao of posicoes) {
    if (!Number.isInteger(posicao)) {
      return falha('coordenada-invalida');
    }

    if (posicao < 0 || posicao >= TAMANHO_TABULEIRO * TAMANHO_TABULEIRO) {
      return falha('fora-do-tabuleiro');
    }

    ordenadas.push(posicao);
  }

  ordenadas.sort((a, b) => a - b);

  if (new Set(ordenadas).size !== tamanho) {
    return falha('posicionamento-invalido');
  }

  const linhaInicial = linhaDoIndice(ordenadas[0] ?? 0);
  const colunaInicial = colunaDoIndice(ordenadas[0] ?? 0);
  const mesmaLinha = ordenadas.every((posicao) => linhaDoIndice(posicao) === linhaInicial);
  const mesmaColuna = ordenadas.every((posicao) => colunaDoIndice(posicao) === colunaInicial);

  if (!mesmaLinha && !mesmaColuna) {
    return falha('posicionamento-invalido');
  }

  const passo = mesmaLinha ? 1 : TAMANHO_TABULEIRO;

  for (let indice = 1; indice < ordenadas.length; indice++) {
    const anterior = ordenadas[indice - 1] ?? 0;
    const atual = ordenadas[indice] ?? 0;

    if (atual - anterior !== passo) {
      return falha('posicionamento-invalido');
    }
  }

  return sucesso({
    posicoes: ordenadas,
    orientacao: mesmaLinha ? 'horizontal' : 'vertical',
  });
}
