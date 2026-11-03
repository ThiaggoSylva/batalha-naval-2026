import { describe, expect, it } from 'vitest';
import {
  Ataque,
  criarFrotaPadrao,
  criarTabuleiro,
  definirOcupadas,
  Frota,
  Lado,
  marcarAtingida,
  posicoesOcupadas,
  posicionarEmbarcacao,
  Resultado,
  Tabuleiro,
} from '../dominio';
import { celulasDaFrota, celulasDoAdversario, celulasDoLado, indicesAfundados } from './visual';

function aplicar<T>(resultado: Resultado<T>): T {
  if (!resultado.sucesso) {
    throw new Error(`Operação falhou no teste: ${resultado.erro}`);
  }

  return resultado.valor;
}

function montarLado(): Lado {
  let frota: Frota = criarFrotaPadrao();
  frota = aplicar(posicionarEmbarcacao(frota, 'destroyer', [0, 1]));
  frota = aplicar(posicionarEmbarcacao(frota, 'cruzador', [20, 21, 22]));

  let tabuleiro: Tabuleiro = aplicar(definirOcupadas(criarTabuleiro(), posicoesOcupadas(frota)));

  for (const indice of [0, 1, 10, 20]) {
    tabuleiro = aplicar(marcarAtingida(tabuleiro, indice));
  }

  return { frota, tabuleiro };
}

function estadoDe(lado: Lado, indice: number): string | undefined {
  return celulasDoLado(lado)[indice]?.estado;
}

describe('visual do tabuleiro', () => {
  it('distingue embarcação intacta, acerto, água e embarcação destruída', () => {
    const lado = montarLado();

    expect(estadoDe(lado, 21)).toBe('embarcacao');
    expect(estadoDe(lado, 20)).toBe('acerto');
    expect(estadoDe(lado, 10)).toBe('agua');
    expect(estadoDe(lado, 0)).toBe('afundado');
    expect(estadoDe(lado, 1)).toBe('afundado');
    expect(estadoDe(lado, 50)).toBe('livre');
  });

  it('considera destruída apenas a embarcação com todas as posições atingidas', () => {
    const lado = montarLado();
    const afundadas = indicesAfundados(lado);

    expect([...afundadas].sort((a, b) => a - b)).toEqual([0, 1]);
  });

  it('mostra a frota posicionada na montagem', () => {
    const lado = montarLado();
    const celulas = celulasDaFrota(lado.frota);

    expect(celulas[0]?.estado).toBe('embarcacao');
    expect(celulas[20]?.estado).toBe('embarcacao');
    expect(celulas[50]?.estado).toBe('livre');
  });

  it('oculta posições não atacadas do adversário', () => {
    const ataques: readonly Ataque[] = [
      { indice: 0, coordenada: 'A1', resultado: 'acerto', tipoEmbarcacao: 'destroyer' },
      {
        indice: 1,
        coordenada: 'A2',
        resultado: 'embarcacao-destruida',
        tipoEmbarcacao: 'destroyer',
      },
      { indice: 10, coordenada: 'B1', resultado: 'agua' },
    ];
    const celulas = celulasDoAdversario(ataques);

    expect(celulas[0]?.estado).toBe('afundado');
    expect(celulas[1]?.estado).toBe('afundado');
    expect(celulas[10]?.estado).toBe('agua');
    expect(celulas[20]?.estado).toBe('livre');
    expect(celulas.every((celula) => celula.estado !== 'embarcacao')).toBe(true);
  });

  it('mantém acertos de embarcação não destruída', () => {
    const ataques: readonly Ataque[] = [
      { indice: 20, coordenada: 'C1', resultado: 'acerto', tipoEmbarcacao: 'cruzador' },
    ];

    expect(celulasDoAdversario(ataques)[20]?.estado).toBe('acerto');
  });
});
