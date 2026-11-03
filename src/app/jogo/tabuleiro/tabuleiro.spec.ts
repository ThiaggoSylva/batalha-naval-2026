import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Tabuleiro } from './tabuleiro';
import { criarCelulasVazias } from '../visual';

describe('Tabuleiro', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabuleiro],
    }).compileComponents();
  });

  it('renderiza 100 células com coordenadas de A1 a J10', async () => {
    const fixture = TestBed.createComponent(Tabuleiro);
    fixture.componentRef.setInput('celulas', criarCelulasVazias());
    fixture.componentRef.setInput('rotulo', 'Tabuleiro de teste');
    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;
    const botoes = elemento.querySelectorAll('button');

    expect(botoes).toHaveLength(100);
    expect(botoes[0]?.getAttribute('aria-label')).toContain('A1');
    expect(botoes[99]?.getAttribute('aria-label')).toContain('J10');
    expect(elemento.textContent).toContain('10');
    expect(elemento.textContent).toContain('J');
  });

  it('emite a coordenada selecionada', async () => {
    const fixture = TestBed.createComponent(Tabuleiro);
    fixture.componentRef.setInput('celulas', criarCelulasVazias());
    fixture.componentRef.setInput('rotulo', 'Tabuleiro de teste');
    fixture.detectChanges();

    let selecionada: number | undefined;
    fixture.componentInstance.casaSelecionada.subscribe((indice) => {
      selecionada = indice;
    });

    const botoes = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    botoes[11]?.click();

    expect(selecionada).toBe(11);
  });

  it('não emite seleção quando está desabilitado', async () => {
    const fixture = TestBed.createComponent(Tabuleiro);
    fixture.componentRef.setInput('celulas', criarCelulasVazias());
    fixture.componentRef.setInput('rotulo', 'Tabuleiro de teste');
    fixture.componentRef.setInput('desabilitado', true);
    fixture.detectChanges();

    let chamadas = 0;
    fixture.componentInstance.casaSelecionada.subscribe(() => {
      chamadas++;
    });

    const botoes = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    botoes[0]?.click();

    expect(botoes[0]?.disabled).toBe(true);
    expect(chamadas).toBe(0);
  });
});
