import { describe, expect, it } from 'vitest';
import {
  colunaDoIndice,
  indiceDeLinhaColuna,
  indiceDeTexto,
  linhaDoIndice,
  textoDeIndice,
  TOTAL_POSICOES,
} from './coordenada';

describe('coordenadas', () => {
  it('converte A1 para linha 0 e coluna 0', () => {
    const resultado = indiceDeTexto('A1');

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    expect(resultado.valor).toBe(0);
    expect(linhaDoIndice(resultado.valor)).toBe(0);
    expect(colunaDoIndice(resultado.valor)).toBe(0);
  });

  it('converte J10 para linha 9 e coluna 9', () => {
    const resultado = indiceDeTexto('J10');

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    expect(resultado.valor).toBe(99);
    expect(linhaDoIndice(resultado.valor)).toBe(9);
    expect(colunaDoIndice(resultado.valor)).toBe(9);
  });

  it('reconstrói a coordenada textual após a ida e volta', () => {
    for (const coordenada of ['A1', 'C7', 'J10']) {
      const indice = indiceDeTexto(coordenada);
      expect(indice.sucesso).toBe(true);
      if (!indice.sucesso) {
        continue;
      }

      const texto = textoDeIndice(indice.valor);
      expect(texto.sucesso).toBe(true);
      if (texto.sucesso) {
        expect(texto.valor).toBe(coordenada);
      }
    }
  });

  it('normaliza coordenadas em minúsculas e com espaços', () => {
    const resultado = indiceDeTexto('  b3 ');

    expect(resultado.sucesso).toBe(true);
    if (resultado.sucesso) {
      expect(resultado.valor).toBe(12);
    }
  });

  it('rejeita coordenadas com formato ou posição inválidas', () => {
    for (const coordenada of ['K1', 'A0', 'A11', '1A', '', 'A']) {
      const resultado = indiceDeTexto(coordenada);

      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toBe('coordenada-invalida');
      }
    }
  });

  it('converte linha e coluna válidas para índice', () => {
    expect(indiceDeLinhaColuna(0, 0)).toEqual({ sucesso: true, valor: 0 });
    expect(indiceDeLinhaColuna(9, 9)).toEqual({ sucesso: true, valor: 99 });
  });

  it('rejeita linha e coluna fora da grade', () => {
    for (const [linha, coluna] of [
      [-1, 0],
      [0, -1],
      [10, 0],
      [0, 10],
    ]) {
      const resultado = indiceDeLinhaColuna(linha, coluna);

      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toBe('fora-do-tabuleiro');
      }
    }
  });

  it('rejeita índices fora da grade ao gerar texto', () => {
    for (const indice of [-1, TOTAL_POSICOES, 1.5]) {
      const resultado = textoDeIndice(indice);

      expect(resultado.sucesso).toBe(false);
    }
  });
});
