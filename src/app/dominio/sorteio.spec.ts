import { describe, expect, it } from 'vitest';
import { TOTAL_POSICOES } from './coordenada';
import { validarPosicoes } from './embarcacao';
import { totalPosicoesOcupadas } from './frota';
import { embaralhar, gerarFrotaComputador, indiceAleatorio, Sorteio } from './sorteio';

function criarSorteioComSemente(semente: number): Sorteio {
  let estado = semente >>> 0;

  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

describe('sorteio', () => {
  it('produz a mesma ordem para a mesma sequência controlada', () => {
    const primeira = embaralhar([1, 2, 3, 4, 5], criarSorteioComSemente(42));
    const segunda = embaralhar([1, 2, 3, 4, 5], criarSorteioComSemente(42));

    expect(primeira).toEqual(segunda);
    expect(primeira).not.toEqual([1, 2, 3, 4, 5]);
  });

  it('não perde nem duplica elementos ao embaralhar', () => {
    const original = ['a', 'b', 'c', 'd', 'e', 'f'];
    const resultado = embaralhar(original, criarSorteioComSemente(7));

    expect(resultado).toHaveLength(original.length);
    expect([...resultado].sort()).toEqual([...original].sort());
  });

  it('mantém o índice sorteado dentro do limite', () => {
    for (const valor of [0, 0.25, 0.5, 0.999]) {
      const indice = indiceAleatorio(() => valor, 10);
      expect(indice).toBeGreaterThanOrEqual(0);
      expect(indice).toBeLessThan(10);
    }
  });
});

describe('frota do computador', () => {
  it.each([1, 42, 123456])('gera uma frota válida e completa com a semente %i', (semente) => {
    const resultado = gerarFrotaComputador(criarSorteioComSemente(semente));

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    const frota = resultado.valor;
    expect(frota.embarcacoes).toHaveLength(5);
    expect(totalPosicoesOcupadas(frota)).toBe(17);

    const todasAsPosicoes = frota.embarcacoes.flatMap((embarcacao) => embarcacao.posicoes);
    expect(new Set(todasAsPosicoes).size).toBe(17);
    expect(todasAsPosicoes.every((posicao) => posicao >= 0 && posicao < TOTAL_POSICOES)).toBe(true);

    for (const embarcacao of frota.embarcacoes) {
      expect(embarcacao.posicoes).toHaveLength(embarcacao.tamanho);
      expect(embarcacao.orientacao).not.toBeNull();

      const validacao = validarPosicoes(embarcacao.posicoes, embarcacao.tamanho);
      expect(validacao.sucesso).toBe(true);
    }
  });
});
