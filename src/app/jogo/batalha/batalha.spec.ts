import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TipoEmbarcacao, foiAtingida } from '../../dominio';
import { PartidaStore } from '../partida-store';
import { Batalha } from './batalha';

const POSICIONAMENTO: readonly (readonly [TipoEmbarcacao, number])[] = [
  ['porta-avioes', 0],
  ['encouracado', 10],
  ['cruzador', 20],
  ['submarino', 30],
  ['destroyer', 40],
];

function prepararBatalha(store: PartidaStore): void {
  for (const [tipo, indice] of POSICIONAMENTO) {
    expect(store.posicionar(tipo, indice, 'horizontal')).toBe(true);
  }

  expect(store.iniciarBatalha()).toBe(true);
}

function alvoDoComputador(store: PartidaStore): number {
  const estado = store.estado();

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

function jogarAteOVencedor(store: PartidaStore): void {
  let rodadas = 0;

  while (store.fase() === 'em-andamento' && rodadas < 300) {
    rodadas++;

    if (store.turno() === 'jogador') {
      expect(store.atacar(alvoDoComputador(store))).toBe(true);
    } else {
      expect(store.atacarComputador()).toBe(true);
    }
  }

  expect(rodadas).toBeLessThan(300);
}

describe('Batalha', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Batalha],
    }).compileComponents();
  });

  it('mostra os dois tabuleiros e mantém a frota do computador oculta', () => {
    const store = TestBed.inject(PartidaStore);
    prepararBatalha(store);

    const fixture = TestBed.createComponent(Batalha);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const tabuleiros = elemento.querySelectorAll('app-tabuleiro');

    expect(tabuleiros).toHaveLength(2);
    expect(tabuleiros[0]?.querySelectorAll('button')).toHaveLength(100);
    expect(tabuleiros[1]?.querySelectorAll('button')).toHaveLength(100);
    expect(tabuleiros[0]?.querySelector('button')?.getAttribute('aria-label')).toContain(
      'embarcação',
    );
    expect(tabuleiros[1]?.querySelector('button')?.getAttribute('aria-label')).toContain('livre');
    expect(elemento.textContent).toContain('Sua vez');
  });

  it('resolve o ataque do jogador e devolve o turno após o computador', async () => {
    const store = TestBed.inject(PartidaStore);
    prepararBatalha(store);

    const fixture = TestBed.createComponent(Batalha);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const computador = elemento.querySelectorAll('app-tabuleiro')[1];
    const celulas = computador?.querySelectorAll('button') ?? [];

    celulas[0]?.click();
    fixture.detectChanges();

    expect(store.ataquesJogador()).toHaveLength(1);
    expect(store.turno()).toBe('computador');
    expect(elemento.textContent).toContain('Vez do computador');
    expect(elemento.textContent).toContain('O computador está escolhendo uma coordenada');

    await new Promise((resolve) => setTimeout(resolve, 1200));
    fixture.detectChanges();

    expect(store.ataquesComputador()).toHaveLength(1);
    expect(store.turno()).toBe('jogador');
    expect(elemento.textContent).toContain('Sua vez');

    fixture.destroy();
  });

  it('mostra o resultado final e permite jogar novamente', () => {
    const store = TestBed.inject(PartidaStore);
    prepararBatalha(store);
    jogarAteOVencedor(store);

    expect(store.fase()).toBe('encerrada');
    expect(store.vencedor()).toBe('jogador');

    const fixture = TestBed.createComponent(Batalha);
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const computador = elemento.querySelectorAll('app-tabuleiro')[1];
    const celulas = computador?.querySelectorAll('button') ?? [];

    expect(elemento.textContent).toContain('Você venceu!');
    expect(elemento.textContent).toContain('Jogar novamente');
    expect(elemento.textContent).toContain('Partida encerrada');
    expect(celulas[0]?.disabled).toBe(true);

    const reiniciar = Array.from(elemento.querySelectorAll('button')).find((botao) =>
      botao.textContent?.includes('Jogar novamente'),
    );

    reiniciar?.click();
    fixture.detectChanges();

    expect(store.fase()).toBe('preparacao');
    expect(
      store.frotaJogador().embarcacoes.every((embarcacao) => embarcacao.posicoes.length === 0),
    ).toBe(true);
    expect(store.ataquesJogador()).toEqual([]);
  });
});
