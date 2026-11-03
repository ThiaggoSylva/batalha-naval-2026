import { falha, Resultado, sucesso } from './tipos';

export const TAMANHO_TABULEIRO = 10;
export const TOTAL_POSICOES = TAMANHO_TABULEIRO * TAMANHO_TABULEIRO;

const PADRAO_COORDENADA = /^([A-J])(10|[1-9])$/;

export function linhaDoIndice(indice: number): number {
  return Math.floor(indice / TAMANHO_TABULEIRO);
}

export function colunaDoIndice(indice: number): number {
  return indice % TAMANHO_TABULEIRO;
}

export function indiceDeLinhaColuna(linha: number, coluna: number): Resultado<number> {
  if (!Number.isInteger(linha) || !Number.isInteger(coluna)) {
    return falha('coordenada-invalida');
  }

  if (linha < 0 || linha >= TAMANHO_TABULEIRO || coluna < 0 || coluna >= TAMANHO_TABULEIRO) {
    return falha('fora-do-tabuleiro');
  }

  return sucesso(linha * TAMANHO_TABULEIRO + coluna);
}

export function indiceDeTexto(texto: string): Resultado<number> {
  const normalizado = texto.trim().toUpperCase();
  const partes = PADRAO_COORDENADA.exec(normalizado);

  if (!partes) {
    return falha('coordenada-invalida');
  }

  const letra = partes[1];
  const numero = partes[2];

  if (letra === undefined || numero === undefined) {
    return falha('coordenada-invalida');
  }

  const linha = letra.charCodeAt(0) - 'A'.charCodeAt(0);
  const coluna = Number(numero) - 1;

  return indiceDeLinhaColuna(linha, coluna);
}

export function textoDeIndice(indice: number): Resultado<string> {
  if (!Number.isInteger(indice)) {
    return falha('coordenada-invalida');
  }

  if (indice < 0 || indice >= TOTAL_POSICOES) {
    return falha('fora-do-tabuleiro');
  }

  const letra = String.fromCharCode('A'.charCodeAt(0) + linhaDoIndice(indice));
  return sucesso(`${letra}${colunaDoIndice(indice) + 1}`);
}
