import { TOTAL_POSICOES } from './coordenada';
import { falha, Resultado, sucesso } from './tipos';

export interface Celula {
  readonly indice: number;
  readonly ocupada: boolean;
  readonly atingida: boolean;
}

export interface Tabuleiro {
  readonly celulas: readonly Celula[];
}

export function criarTabuleiro(): Tabuleiro {
  const celulas: Celula[] = [];

  for (let indice = 0; indice < TOTAL_POSICOES; indice++) {
    celulas.push({ indice, ocupada: false, atingida: false });
  }

  return { celulas };
}

export function indiceNoTabuleiro(indice: number): boolean {
  return Number.isInteger(indice) && indice >= 0 && indice < TOTAL_POSICOES;
}

export function consultarCelula(tabuleiro: Tabuleiro, indice: number): Resultado<Celula> {
  if (!Number.isInteger(indice)) {
    return falha('coordenada-invalida');
  }

  if (!indiceNoTabuleiro(indice)) {
    return falha('fora-do-tabuleiro');
  }

  const celula = tabuleiro.celulas[indice];
  return celula ? sucesso(celula) : falha('fora-do-tabuleiro');
}

export function estaOcupada(tabuleiro: Tabuleiro, indice: number): boolean {
  const celula = consultarCelula(tabuleiro, indice);
  return celula.sucesso && celula.valor.ocupada;
}

export function foiAtingida(tabuleiro: Tabuleiro, indice: number): boolean {
  const celula = consultarCelula(tabuleiro, indice);
  return celula.sucesso && celula.valor.atingida;
}

export function marcarOcupada(tabuleiro: Tabuleiro, indice: number): Resultado<Tabuleiro> {
  return atualizarCelula(tabuleiro, indice, { ocupada: true });
}

export function desmarcarOcupada(tabuleiro: Tabuleiro, indice: number): Resultado<Tabuleiro> {
  return atualizarCelula(tabuleiro, indice, { ocupada: false });
}

export function marcarAtingida(tabuleiro: Tabuleiro, indice: number): Resultado<Tabuleiro> {
  return atualizarCelula(tabuleiro, indice, { atingida: true });
}

export function definirOcupadas(
  tabuleiro: Tabuleiro,
  indices: Iterable<number>,
): Resultado<Tabuleiro> {
  const ocupadas = new Set(indices);

  for (const indice of ocupadas) {
    if (!indiceNoTabuleiro(indice)) {
      return falha('fora-do-tabuleiro');
    }
  }

  return sucesso({
    celulas: tabuleiro.celulas.map((celula) => ({
      ...celula,
      ocupada: ocupadas.has(celula.indice),
    })),
  });
}

export function indicesOcupados(tabuleiro: Tabuleiro): readonly number[] {
  return tabuleiro.celulas.filter((celula) => celula.ocupada).map((celula) => celula.indice);
}

function atualizarCelula(
  tabuleiro: Tabuleiro,
  indice: number,
  alteracao: Partial<Pick<Celula, 'ocupada' | 'atingida'>>,
): Resultado<Tabuleiro> {
  const consulta = consultarCelula(tabuleiro, indice);

  if (!consulta.sucesso) {
    return consulta;
  }

  return sucesso({
    celulas: tabuleiro.celulas.map((celula) =>
      celula.indice === indice ? { ...celula, ...alteracao } : celula,
    ),
  });
}
