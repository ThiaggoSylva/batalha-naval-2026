import { describe, expect, it } from 'vitest';
import { EstadoPartida, foiAtingida, Sorteio, TipoEmbarcacao } from '../dominio';
import { PartidaStore } from './partida-store';

const POSICIONAMENTO: readonly (readonly [TipoEmbarcacao, readonly number[]])[] = [
  ['porta-avioes', [0, 1, 2, 3, 4]],
  ['encouracado', [10, 11, 12, 13]],
  ['cruzador', [20, 21, 22]],
  ['submarino', [30, 31, 32]],
  ['destroyer', [40, 41]],
];

function sorteioComSemente(semente: number): Sorteio {
  let estado = semente >>> 0;

  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

function posicionarFrota(store: PartidaStore): void {
  for (const [tipo, posicoes] of POSICIONAMENTO) {
    expect(store.posicionar(tipo, posicoes[0] ?? 0, 'horizontal')).toBe(true);
  }
}

function iniciarBatalha(store: PartidaStore): void {
  posicionarFrota(store);
  expect(store.iniciarBatalha(sorteioComSemente(42))).toBe(true);
}

function alcance(store: PartidaStore): EstadoPartida {
  return store.estado();
}

function alvoDoComputador(estado: EstadoPartida): number {
  if (estado.fase !== 'em-andamento') {
    throw new Error('A partida precisa estar em andamento.');
  }

  for (const embarcacao of estado.computador.frota.embarcacoes) {
    for (const posicao of embarcacao.posicoes) {
      if (!foiAtingida(estado.computador.tabuleiro, posicao)) {
        return posicao;
      }
    }
  }

  throw new Error('Não há alvo disponível.');
}

function primeiraAgua(estado: EstadoPartida): number {
  if (estado.fase !== 'em-andamento') {
    throw new Error('A partida precisa estar em andamento.');
  }

  const ocupadas = new Set(
    estado.computador.frota.embarcacoes.flatMap((embarcacao) => embarcacao.posicoes),
  );

  for (let indice = 0; indice < 100; indice++) {
    if (!ocupadas.has(indice) && !foiAtingida(estado.computador.tabuleiro, indice)) {
      return indice;
    }
  }

  throw new Error('Não há água disponível.');
}

function sorteioParaAgua(estado: EstadoPartida): Sorteio {
  if (estado.fase !== 'em-andamento') {
    throw new Error('A partida precisa estar em andamento.');
  }

  const disponiveis: number[] = [];

  for (let indice = 0; indice < 100; indice++) {
    if (!foiAtingida(estado.jogador.tabuleiro, indice)) {
      disponiveis.push(indice);
    }
  }

  const agua = primeiraAguaDoJogador(estado);
  const posicao = disponiveis.indexOf(agua);

  if (posicao < 0) {
    throw new Error('A água escolhida não está disponível.');
  }

  return () => (posicao + 0.5) / disponiveis.length;
}

function primeiraAguaDoJogador(estado: EstadoPartida): number {
  const ocupadas = new Set(
    estado.jogador.frota.embarcacoes.flatMap((embarcacao) => embarcacao.posicoes),
  );

  for (let indice = 0; indice < 100; indice++) {
    if (!ocupadas.has(indice) && !foiAtingida(estado.jogador.tabuleiro, indice)) {
      return indice;
    }
  }

  throw new Error('Não há água disponível no tabuleiro do jogador.');
}

describe('PartidaStore', () => {
  it('começa na preparação, com a apresentação ainda não iniciada', () => {
    const store = new PartidaStore();

    expect(store.fase()).toBe('preparacao');
    expect(store.iniciada()).toBe(false);
    expect(store.frotaJogador().embarcacoes).toHaveLength(5);
    expect(store.frotaCompleta()).toBe(false);
    expect(store.faltantes()).toHaveLength(5);
  });

  it('inicia a experiência a partir da apresentação', () => {
    const store = new PartidaStore();
    store.iniciarJogo();

    expect(store.iniciada()).toBe(true);
    expect(store.fase()).toBe('preparacao');
  });

  it('posiciona, informa e remove embarcações', () => {
    const store = new PartidaStore();

    expect(store.posicionar('cruzador', 11, 'horizontal')).toBe(true);
    expect(store.mensagem()).toContain('Cruzador');
    expect(store.mensagemEhErro()).toBe(false);

    expect(store.remover('cruzador')).toBe(true);
    expect(store.mensagem()).toContain('removida');
    expect(store.faltantes()).toHaveLength(5);
  });

  it('rejeita posicionamento fora da borda com mensagem em português', () => {
    const store = new PartidaStore();

    expect(store.posicionar('porta-avioes', 7, 'horizontal')).toBe(false);
    expect(store.mensagemEhErro()).toBe(true);
    expect(store.mensagem()).toContain('fora do tabuleiro');
    expect(store.faltantes()).toHaveLength(5);
  });

  it('rejeita sobreposição e preserva o posicionamento existente', () => {
    const store = new PartidaStore();

    expect(store.posicionar('destroyer', 0, 'horizontal')).toBe(true);
    expect(store.posicionar('cruzador', 1, 'horizontal')).toBe(false);
    expect(store.mensagem()).toContain('Já existe');
    expect(
      store.frotaJogador().embarcacoes.find((item) => item.tipo === 'destroyer')?.posicoes,
    ).toEqual([0, 1]);
  });

  it('bloqueia o início com a frota incompleta', () => {
    const store = new PartidaStore();
    store.posicionar('destroyer', 0, 'horizontal');

    expect(store.iniciarBatalha(sorteioComSemente(1))).toBe(false);
    expect(store.mensagem()).toContain('todas as embarcações');
    expect(store.fase()).toBe('preparacao');
  });

  it('inicia a batalha com as duas frotas completas e o primeiro turno do jogador', () => {
    const store = new PartidaStore();
    iniciarBatalha(store);

    expect(store.fase()).toBe('em-andamento');
    expect(store.turno()).toBe('jogador');
    expect(store.frotaCompleta()).toBe(true);
    expect(store.ataquesJogador()).toEqual([]);

    const estado = alcance(store);
    expect(estado.fase).toBe('em-andamento');
    if (estado.fase === 'em-andamento') {
      expect(estado.computador.frota.embarcacoes.flatMap((item) => item.posicoes)).toHaveLength(17);
    }
  });

  it('resolve um ataque em água e passa o turno ao computador', () => {
    const store = new PartidaStore();
    iniciarBatalha(store);

    const agua = primeiraAgua(alcance(store));
    expect(store.atacar(agua)).toBe(true);
    expect(store.turno()).toBe('computador');
    expect(store.ataquesJogador()).toHaveLength(1);
    expect(store.mensagem()).toContain('Água');
  });

  it('rejeita ataque repetido sem consumir o turno', () => {
    const store = new PartidaStore();
    iniciarBatalha(store);

    const agua = primeiraAgua(alcance(store));
    expect(store.atacar(agua)).toBe(true);
    expect(store.atacarComputador(sorteioParaAgua(alcance(store)))).toBe(true);
    expect(store.turno()).toBe('jogador');

    expect(store.atacar(agua)).toBe(false);
    expect(store.mensagem()).toContain('já atacou');
    expect(store.turno()).toBe('jogador');
    expect(store.ataquesJogador()).toHaveLength(1);
  });

  it('impede o jogador de atacar fora do turno', () => {
    const store = new PartidaStore();
    iniciarBatalha(store);
    store.atacar(primeiraAgua(alcance(store)));

    expect(store.atacar(0)).toBe(false);
    expect(store.mensagem()).toContain('não é o seu turno');
    expect(store.turno()).toBe('computador');
  });

  it('permite ao computador atacar apenas no turno dele', () => {
    const store = new PartidaStore();
    iniciarBatalha(store);

    expect(store.atacarComputador(() => 0)).toBe(false);
    expect(store.mensagem()).toContain('não é o seu turno');
    expect(store.ataquesComputador()).toHaveLength(0);
  });

  it('joga até a vitória e reinicia com a frota vazia', () => {
    const store = new PartidaStore();
    iniciarBatalha(store);

    let rodadas = 0;

    while (store.fase() === 'em-andamento' && rodadas < 200) {
      rodadas++;

      if (store.turno() === 'jogador') {
        expect(store.atacar(alvoDoComputador(alcance(store)))).toBe(true);
      } else {
        expect(store.atacarComputador(sorteioParaAgua(alcance(store)))).toBe(true);
      }
    }

    expect(rodadas).toBeLessThan(200);
    expect(store.fase()).toBe('encerrada');
    expect(store.vencedor()).toBe('jogador');

    expect(store.reiniciar()).toBe(true);
    expect(store.fase()).toBe('preparacao');
    expect(store.frotaJogador().embarcacoes.every((item) => item.posicoes.length === 0)).toBe(true);
    expect(store.ataquesJogador()).toEqual([]);
    expect(store.vencedor()).toBeNull();
  });

  it('rejeita reinício antes do encerramento', () => {
    const store = new PartidaStore();

    expect(store.reiniciar()).toBe(false);
    expect(store.mensagem()).toContain('não está disponível');
  });
});
