import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  LucideBot,
  LucideCrosshair,
  LucideDroplets,
  LucideFlame,
  LucideHistory,
  LucideShip,
  LucideUser,
  LucideWaves,
  LucideX,
} from '@lucide/angular';
import { Ataque } from '../../dominio';
import { PartidaStore } from '../partida-store';
import { resumirAtaque } from '../rotulos';
import { celulasDoAdversario, celulasDoLado, criarCelulasVazias } from '../visual';
import { Tabuleiro } from '../tabuleiro/tabuleiro';

const ATRASO_COMPUTADOR = 900;

@Component({
  selector: 'app-batalha',
  imports: [
    LucideBot,
    LucideCrosshair,
    LucideDroplets,
    LucideFlame,
    LucideHistory,
    LucideShip,
    LucideUser,
    LucideWaves,
    LucideX,
    Tabuleiro,
  ],
  templateUrl: './batalha.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Batalha {
  private readonly store = inject(PartidaStore);
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | null = null;

  protected readonly fase = this.store.fase;
  protected readonly turno = this.store.turno;
  protected readonly mensagem = this.store.mensagem;
  protected readonly mensagemEhErro = this.store.mensagemEhErro;
  protected readonly ataquesJogador = this.store.ataquesJogador;
  protected readonly ataquesComputador = this.store.ataquesComputador;
  protected readonly processando = signal(false);

  protected readonly celulasJogador = computed(() => {
    const estado = this.store.estado();
    return estado.fase === 'preparacao' ? criarCelulasVazias() : celulasDoLado(estado.jogador);
  });
  protected readonly celulasComputador = computed(() => celulasDoAdversario(this.ataquesJogador()));
  protected readonly historicoJogador = computed(() => [...this.ataquesJogador()].reverse());
  protected readonly historicoComputador = computed(() => [...this.ataquesComputador()].reverse());
  protected readonly computadorDesabilitado = computed(
    () => this.processando() || this.turno() !== 'jogador' || this.fase() !== 'em-andamento',
  );
  protected readonly textoTurno = computed(() => {
    if (this.fase() === 'encerrada') {
      return 'Partida encerrada';
    }

    if (this.processando() || this.turno() === 'computador') {
      return 'Vez do computador';
    }

    return 'Sua vez';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.cancelarTimer());
  }

  protected aoAtacar(indice: number): void {
    if (this.processando() || this.turno() !== 'jogador') {
      return;
    }

    if (!this.store.atacar(indice)) {
      return;
    }

    if (this.store.fase() !== 'em-andamento') {
      return;
    }

    this.processando.set(true);
    this.timer = setTimeout(() => {
      this.store.atacarComputador();
      this.processando.set(false);
      this.timer = null;
    }, ATRASO_COMPUTADOR);
  }

  protected resumo(ataque: Ataque): string {
    return resumirAtaque(ataque.resultado, ataque.tipoEmbarcacao);
  }

  private cancelarTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
