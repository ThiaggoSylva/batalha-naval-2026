import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideDroplets, LucideFlame, LucideX } from '@lucide/angular';
import { textoDeIndice } from '../../dominio';
import { EstadoVisual, VisualCelula } from '../visual';

interface LinhaTabuleiro {
  readonly letra: string;
  readonly celulas: readonly VisualCelula[];
}

const ROTULOS_ESTADO: Record<EstadoVisual, string> = {
  livre: 'posição livre',
  embarcacao: 'embarcação',
  agua: 'água',
  acerto: 'acerto',
  afundado: 'embarcação destruída',
};

const CLASSES_ESTADO: Record<EstadoVisual, string> = {
  livre:
    'bg-celula text-slate-500 border-celula-borda hover:bg-slate-300 focus-visible:bg-slate-300',
  embarcacao: 'bg-embarcacao text-white border-embarcacao',
  agua: 'bg-agua/40 text-sky-900 border-agua',
  acerto: 'bg-acerto text-white border-acerto',
  afundado: 'bg-afundado text-white border-afundado',
};

const CLASSES_BASE =
  'relative flex aspect-square min-w-0 items-center justify-center rounded-sm border transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-70';

@Component({
  selector: 'app-tabuleiro',
  imports: [LucideDroplets, LucideFlame, LucideX],
  templateUrl: './tabuleiro.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tabuleiro {
  readonly celulas = input.required<readonly VisualCelula[]>();
  readonly rotulo = input.required<string>();
  readonly preview = input<readonly number[]>([]);
  readonly previewValido = input(true);
  readonly desabilitado = input(false);

  readonly casaSelecionada = output<number>();
  readonly casaSobre = output<number>();
  readonly casaFora = output<void>();

  protected readonly colunas = Array.from({ length: 10 }, (_, indice) => indice + 1);
  protected readonly linhas = computed<readonly LinhaTabuleiro[]>(() =>
    Array.from({ length: 10 }, (_, linha) => ({
      letra: String.fromCharCode('A'.charCodeAt(0) + linha),
      celulas: this.celulas().slice(linha * 10, linha * 10 + 10),
    })),
  );
  protected readonly previewSet = computed(() => new Set(this.preview()));

  protected coordenada(indice: number): string {
    const resultado = textoDeIndice(indice);
    return resultado.sucesso ? resultado.valor : '';
  }

  protected classesCelula(celula: VisualCelula): string {
    const preview = this.previewSet().has(celula.indice);
    const destaque = preview
      ? this.previewValido()
        ? ' outline-2 outline-offset-1 outline-embarcacao'
        : ' outline-2 outline-offset-1 outline-acerto'
      : '';

    return `${CLASSES_BASE} ${CLASSES_ESTADO[celula.estado]}${destaque}`;
  }

  protected rotuloCelula(celula: VisualCelula): string {
    return `${this.coordenada(celula.indice)}: ${ROTULOS_ESTADO[celula.estado]}`;
  }

  protected aoSelecionar(indice: number): void {
    if (this.desabilitado()) {
      return;
    }

    this.casaSelecionada.emit(indice);
  }

  protected aoEntrar(indice: number): void {
    if (this.desabilitado()) {
      return;
    }

    this.casaSobre.emit(indice);
  }

  protected aoSair(): void {
    this.casaFora.emit();
  }
}
