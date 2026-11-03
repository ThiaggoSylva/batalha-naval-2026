import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('apresenta o jogo com nome, objetivo e frota antes de começar', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('h1')?.textContent).toContain('Batalha Naval');
    expect(elemento.querySelector('header svg')).toBeTruthy();
    expect(elemento.querySelector('main')).toBeTruthy();
    expect(elemento.querySelector('app-apresentacao')).toBeTruthy();
    expect(elemento.textContent).toContain('Começar a partida');
    expect(elemento.textContent).toContain('Porta-aviões');
    expect(elemento.textContent).toContain('Destroyer');
  });

  it('troca a apresentação pela preparação da frota', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    const botao = Array.from(elemento.querySelectorAll('button')).find((item) =>
      item.textContent?.includes('Começar a partida'),
    );

    expect(botao).toBeTruthy();
    botao?.click();
    await fixture.whenStable();

    expect(elemento.querySelector('app-apresentacao')).toBeNull();
    expect(elemento.querySelector('app-preparacao')).toBeTruthy();
    expect(elemento.textContent).toContain('Prepare sua frota');
    expect(elemento.querySelectorAll('app-tabuleiro button')).toHaveLength(100);

    const iniciar = Array.from(elemento.querySelectorAll('button')).find((item) =>
      item.textContent?.includes('Iniciar batalha'),
    );
    expect(iniciar?.disabled).toBe(true);
  });
});
