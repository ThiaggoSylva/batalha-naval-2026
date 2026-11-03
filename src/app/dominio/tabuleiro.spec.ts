import { describe, expect, it } from 'vitest';
import {
  consultarCelula,
  criarTabuleiro,
  definirOcupadas,
  estaOcupada,
  foiAtingida,
  indicesOcupados,
  marcarAtingida,
  marcarOcupada,
} from './tabuleiro';

describe('tabuleiro', () => {
  it('cria uma grade de 100 células livres e não atingidas', () => {
    const tabuleiro = criarTabuleiro();

    expect(tabuleiro.celulas).toHaveLength(100);
    expect(tabuleiro.celulas.every((celula) => !celula.ocupada && !celula.atingida)).toBe(true);
  });

  it('marca uma posição válida como ocupada', () => {
    const resultado = marcarOcupada(criarTabuleiro(), 12);

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    expect(estaOcupada(resultado.valor, 12)).toBe(true);
    expect(indicesOcupados(resultado.valor)).toEqual([12]);
  });

  it('rejeita índices fora da grade sem alterar o tabuleiro original', () => {
    const tabuleiro = criarTabuleiro();

    for (const indice of [-1, 100, 1.5]) {
      const resultado = marcarOcupada(tabuleiro, indice);

      expect(resultado.sucesso).toBe(false);
    }

    expect(tabuleiro.celulas.every((celula) => !celula.ocupada)).toBe(true);
  });

  it('distingue células livres, ocupadas e atingidas', () => {
    const ocupado = marcarOcupada(criarTabuleiro(), 5);
    expect(ocupado.sucesso).toBe(true);
    if (!ocupado.sucesso) {
      return;
    }

    const atingido = marcarAtingida(ocupado.valor, 5);
    expect(atingido.sucesso).toBe(true);
    if (!atingido.sucesso) {
      return;
    }

    expect(estaOcupada(atingido.valor, 5)).toBe(true);
    expect(foiAtingida(atingido.valor, 5)).toBe(true);
    expect(estaOcupada(atingido.valor, 6)).toBe(false);
    expect(foiAtingida(atingido.valor, 6)).toBe(false);

    const livre = consultarCelula(atingido.valor, 6);
    expect(livre).toEqual({
      sucesso: true,
      valor: { indice: 6, ocupada: false, atingida: false },
    });
  });

  it('não altera uma posição sem operação explícita', () => {
    const original = criarTabuleiro();
    const alterado = marcarOcupada(original, 42);

    expect(alterado.sucesso).toBe(true);
    expect(estaOcupada(original, 42)).toBe(false);
    expect(estaOcupada(criarTabuleiro(), 42)).toBe(false);
  });

  it('reconstrói as posições ocupadas preservando as atingidas', () => {
    const comAtingida = marcarAtingida(criarTabuleiro(), 7);
    expect(comAtingida.sucesso).toBe(true);
    if (!comAtingida.sucesso) {
      return;
    }

    const resultado = definirOcupadas(comAtingida.valor, [7, 8, 9]);
    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    expect(indicesOcupados(resultado.valor)).toEqual([7, 8, 9]);
    expect(foiAtingida(resultado.valor, 7)).toBe(true);
  });

  it('rejeita posições inválidas ao redefinir ocupações', () => {
    const resultado = definirOcupadas(criarTabuleiro(), [1, 100]);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('fora-do-tabuleiro');
    }
  });
});
