import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { TipoEmbarcacao } from '../../dominio';
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
});
