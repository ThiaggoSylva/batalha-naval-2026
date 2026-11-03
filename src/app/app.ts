import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideShip } from '@lucide/angular';
import { Apresentacao } from './jogo/apresentacao/apresentacao';
import { PartidaStore } from './jogo/partida-store';
import { Preparacao } from './jogo/preparacao/preparacao';

@Component({
  imports: [Apresentacao, LucideShip, Preparacao],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(PartidaStore);
}
