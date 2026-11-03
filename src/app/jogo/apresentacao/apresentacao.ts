import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  LucideAnchor,
  LucideCrosshair,
  LucidePlay,
  LucideShip,
  LucideSwords,
  LucideWaves,
} from '@lucide/angular';
import { PartidaStore } from '../partida-store';
import { nomeEmbarcacao } from '../rotulos';

@Component({
  selector: 'app-apresentacao',
  imports: [LucideAnchor, LucideCrosshair, LucidePlay, LucideShip, LucideSwords, LucideWaves],
  templateUrl: './apresentacao.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Apresentacao {
  private readonly store = inject(PartidaStore);

  protected readonly frota = this.store.frotaJogador;
  protected readonly nomeEmbarcacao = nomeEmbarcacao;

  protected comecar(): void {
    this.store.iniciarJogo();
  }
}
