import { describe, expect, it } from 'vitest';
import { indiceDeTexto } from './coordenada';
import { posicoesDeInicio, TAMANHOS } from './embarcacao';
import {
  buscarEmbarcacao,
  criarFrotaPadrao,
  embarcacaoEm,
  Frota,
  frotaCompleta,
  posicionarEmbarcacao,
  posicoesOcupadas,
  removerEmbarcacao,
  totalPosicoesOcupadas,
} from './frota';
import { TipoEmbarcacao } from './tipos';

function indice(coordenada: string): number {
  const resultado = indiceDeTexto(coordenada);
  if (!resultado.sucesso) {
    throw new Error(`Coordenada inválida no teste: ${coordenada}`);
  }

  return resultado.valor;
}

function posicionar(frota: Frota, tipo: TipoEmbarcacao, coordenadas: readonly string[]): Frota {
  const resultado = posicionarEmbarcacao(
    frota,
    tipo,
    coordenadas.map((coordenada) => indice(coordenada)),
  );

  if (!resultado.sucesso) {
    throw new Error(`Posicionamento falhou no teste: ${resultado.erro}`);
  }

  return resultado.valor;
}

function criarFrotaCompleta(): Frota {
  let frota = criarFrotaPadrao();
  frota = posicionar(frota, 'porta-avioes', ['A1', 'A2', 'A3', 'A4', 'A5']);
  frota = posicionar(frota, 'encouracado', ['B1', 'B2', 'B3', 'B4']);
  frota = posicionar(frota, 'cruzador', ['C1', 'C2', 'C3']);
  frota = posicionar(frota, 'submarino', ['D1', 'D2', 'D3']);
  return posicionar(frota, 'destroyer', ['E1', 'E2']);
}

describe('frota', () => {
  it('cria a frota padrão com as cinco embarcações e os tamanhos corretos', () => {
    const frota = criarFrotaPadrao();

    expect(frota.embarcacoes).toHaveLength(5);
    expect(frota.embarcacoes.map((embarcacao) => embarcacao.tipo)).toEqual([
      'porta-avioes',
      'encouracado',
      'cruzador',
      'submarino',
      'destroyer',
    ]);
    expect(frota.embarcacoes.map((embarcacao) => embarcacao.tamanho)).toEqual([5, 4, 3, 3, 2]);
    expect(frota.embarcacoes.every((embarcacao) => embarcacao.posicoes.length === 0)).toBe(true);
  });

  it('totaliza 17 posições ocupadas quando a frota está completa', () => {
    const frota = criarFrotaCompleta();

    expect(frotaCompleta(frota)).toBe(true);
    expect(totalPosicoesOcupadas(frota)).toBe(17);
    expect(Object.values(TAMANHOS).reduce((total, tamanho) => total + tamanho, 0)).toBe(17);
  });

  it('aceita um cruzador na horizontal em B2, B3 e B4', () => {
    const resultado = posicionarEmbarcacao(criarFrotaPadrao(), 'cruzador', [
      indice('B2'),
      indice('B3'),
      indice('B4'),
    ]);

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    const cruzador = buscarEmbarcacao(resultado.valor, 'cruzador');
    expect(cruzador?.orientacao).toBe('horizontal');
    expect(cruzador?.posicoes).toEqual([indice('B2'), indice('B3'), indice('B4')]);
    expect(posicoesOcupadas(resultado.valor)).toEqual(
      new Set([indice('B2'), indice('B3'), indice('B4')]),
    );
  });

  it('rejeita porta-aviões horizontal a partir de A8', () => {
    const posicoes = posicoesDeInicio(indice('A8'), 'horizontal', 5);

    expect(posicoes.sucesso).toBe(false);
    if (!posicoes.sucesso) {
      expect(posicoes.erro).toBe('fora-do-tabuleiro');
    }
  });

  it('rejeita sobreposição e preserva o posicionamento existente', () => {
    const comCruzador = posicionar(criarFrotaPadrao(), 'cruzador', ['B2', 'B3', 'B4']);
    const resultado = posicionarEmbarcacao(comCruzador, 'destroyer', [indice('B3'), indice('B4')]);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('posicao-ocupada');
    }

    expect(buscarEmbarcacao(comCruzador, 'cruzador')?.posicoes).toEqual([
      indice('B2'),
      indice('B3'),
      indice('B4'),
    ]);
    expect(buscarEmbarcacao(comCruzador, 'destroyer')?.posicoes).toEqual([]);
  });

  it('permite embarcações encostadas sem sobreposição', () => {
    let frota = posicionar(criarFrotaPadrao(), 'destroyer', ['A1', 'A2']);
    frota = posicionar(frota, 'submarino', ['B1', 'B2', 'B3']);

    expect(buscarEmbarcacao(frota, 'destroyer')?.posicoes).toHaveLength(2);
    expect(buscarEmbarcacao(frota, 'submarino')?.posicoes).toHaveLength(3);
  });

  it('rejeita posicionamento não retilíneo em B2, B3 e C4', () => {
    const resultado = posicionarEmbarcacao(criarFrotaPadrao(), 'cruzador', [
      indice('B2'),
      indice('B3'),
      indice('C4'),
    ]);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('posicionamento-invalido');
    }
  });

  it('rejeita posicionamento com quantidade de posições diferente do tamanho', () => {
    const resultado = posicionarEmbarcacao(criarFrotaPadrao(), 'cruzador', [
      indice('B2'),
      indice('B3'),
    ]);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('posicionamento-invalido');
    }
  });

  it('remove e reposiciona uma embarcação', () => {
    const comDestroyer = posicionar(criarFrotaPadrao(), 'destroyer', ['A1', 'A2']);
    const removido = removerEmbarcacao(comDestroyer, 'destroyer');

    expect(removido.sucesso).toBe(true);
    if (!removido.sucesso) {
      return;
    }

    expect(buscarEmbarcacao(removido.valor, 'destroyer')?.posicoes).toEqual([]);
    expect(posicoesOcupadas(removido.valor).size).toBe(0);

    const reposicionado = posicionar(removido.valor, 'destroyer', ['C5', 'C6']);
    expect(buscarEmbarcacao(reposicionado, 'destroyer')?.posicoes).toEqual([
      indice('C5'),
      indice('C6'),
    ]);
    expect(posicoesOcupadas(reposicionado).has(indice('A1'))).toBe(false);
  });

  it('rejeita remoção de embarcação não posicionada', () => {
    const resultado = removerEmbarcacao(criarFrotaPadrao(), 'destroyer');

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('embarcacao-nao-posicionada');
    }
  });

  it('encontra a embarcação que ocupa uma posição', () => {
    const frota = posicionar(criarFrotaPadrao(), 'destroyer', ['A1', 'A2']);

    expect(embarcacaoEm(frota, indice('A2'))?.tipo).toBe('destroyer');
    expect(embarcacaoEm(frota, indice('C7'))).toBeUndefined();
  });
});
