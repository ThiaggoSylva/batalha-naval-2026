import { describe, expect, it } from 'vitest';
import { CodigoErro, TipoEmbarcacao } from '../dominio';
import {
  DESCRICOES_RESULTADO,
  descreverAtaque,
  MENSAGENS_ERRO,
  mensagemDeErro,
  NOMES_EMBARCACAO,
  nomeEmbarcacao,
} from './rotulos';

const CODIGOS: readonly CodigoErro[] = [
  'coordenada-invalida',
  'fora-do-tabuleiro',
  'posicionamento-invalido',
  'posicao-ocupada',
  'embarcacao-nao-posicionada',
  'frota-incompleta',
  'fase-invalida',
  'ataque-repetido',
  'partida-encerrada',
  'nao-e-o-turno',
  'sem-coordenada-disponivel',
];

const TIPOS: readonly TipoEmbarcacao[] = [
  'porta-avioes',
  'encouracado',
  'cruzador',
  'submarino',
  'destroyer',
];

describe('rotulos', () => {
  it('tem mensagem em português para todos os códigos de erro', () => {
    for (const codigo of CODIGOS) {
      expect(mensagemDeErro(codigo)).toBe(MENSAGENS_ERRO[codigo]);
      expect(mensagemDeErro(codigo).length).toBeGreaterThan(10);
    }
  });

  it('nomeia todas as embarcações', () => {
    for (const tipo of TIPOS) {
      expect(nomeEmbarcacao(tipo)).toBe(NOMES_EMBARCACAO[tipo]);
      expect(nomeEmbarcacao(tipo).length).toBeGreaterThan(3);
    }
  });

  it('descreve os três resultados de ataque', () => {
    expect(descreverAtaque('B2', 'agua')).toBe('Água em B2.');
    expect(descreverAtaque('B2', 'acerto', 'cruzador')).toBe('Acerto em B2: Cruzador.');
    expect(descreverAtaque('B2', 'embarcacao-destruida', 'destroyer')).toBe(
      'Embarcação destruída em B2: Destroyer.',
    );
    expect(DESCRICOES_RESULTADO['embarcacao-destruida']).toBe('Embarcação destruída');
  });
});
