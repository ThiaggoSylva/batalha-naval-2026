import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  LucideArrowDown,
  LucideArrowRight,
  LucideCheckCircle2,
  LucideCircle,
  LucideTrash2,
  LucideWaves,
} from '@lucide/angular';
import {
  buscarEmbarcacao,
  Embarcacao,
  estaPosicionada,
  Orientacao,
  posicoesDeInicio,
  posicoesOcupadas,
  TipoEmbarcacao,
} from '../../dominio';
import { PartidaStore } from '../partida-store';
import { NOMES_ORIENTACAO, nomeEmbarcacao } from '../rotulos';
import { celulasDaFrota } from '../visual';
import { Tabuleiro } from '../tabuleiro/tabuleiro';

@Component({
  selector: 'app-preparacao',
  imports: [
    LucideArrowDown,
    LucideArrowRight,
    LucideCheckCircle2,
    LucideCircle,
    LucideTrash2,
    LucideWaves,
    Tabuleiro,
  ],
  templateUrl: './preparacao.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Preparacao {
  private readonly store = inject(PartidaStore);

  protected readonly frota = this.store.frotaJogador;
  protected readonly faltantes = this.store.faltantes;
  protected readonly frotaCompleta = this.store.frotaCompleta;
  protected readonly mensagem = this.store.mensagem;
  protected readonly mensagemEhErro = this.store.mensagemEhErro;

  protected readonly tipoSelecionado = signal<TipoEmbarcacao | null>(null);
  protected readonly orientacao = signal<Orientacao>('horizontal');
  protected readonly indiceSobre = signal<number | null>(null);

  protected readonly celulas = computed(() => celulasDaFrota(this.frota()));
  protected readonly nomeEmbarcacao = nomeEmbarcacao;
  protected readonly nomeOrientacao = NOMES_ORIENTACAO;
  protected readonly estaPosicionada = estaPosicionada;

  protected readonly preview = computed<readonly number[]>(() => {
    const tipo = this.tipoSelecionado();
    const indice = this.indiceSobre();

    if (!tipo || indice === null) {
      return [];
    }

    const embarcacao = buscarEmbarcacao(this.frota(), tipo);

    if (!embarcacao) {
      return [];
    }

    const posicoes = posicoesDeInicio(indice, this.orientacao(), embarcacao.tamanho);
    return posicoes.sucesso ? posicoes.valor : [indice];
  });

  protected readonly previewValido = computed(() => {
    const tipo = this.tipoSelecionado();
    const indice = this.indiceSobre();

    if (!tipo || indice === null) {
      return true;
    }

    const embarcacao = buscarEmbarcacao(this.frota(), tipo);

    if (!embarcacao) {
      return false;
    }

    const posicoes = posicoesDeInicio(indice, this.orientacao(), embarcacao.tamanho);

    if (!posicoes.sucesso) {
      return false;
    }

    const ocupadas = posicoesOcupadas(this.frota(), tipo);
    return !posicoes.valor.some((posicao) => ocupadas.has(posicao));
  });

  constructor() {
    this.selecionarProxima();
  }

  protected selecionar(tipo: TipoEmbarcacao): void {
    this.tipoSelecionado.set(tipo);
    this.store.limparMensagem();
  }

  protected alternarOrientacao(orientacao: Orientacao): void {
    this.orientacao.set(orientacao);
  }

  protected aoSobre(indice: number): void {
    this.indiceSobre.set(indice);
  }

  protected aoSair(): void {
    this.indiceSobre.set(null);
  }

  protected posicionarEm(indice: number): void {
    const tipo = this.tipoSelecionado();

    if (!tipo) {
      return;
    }

    if (this.store.posicionar(tipo, indice, this.orientacao())) {
      this.indiceSobre.set(null);
      this.selecionarProxima();
    }
  }

  protected remover(tipo: TipoEmbarcacao): void {
    if (this.store.remover(tipo)) {
      this.tipoSelecionado.set(tipo);
      this.indiceSobre.set(null);
    }
  }

  protected iniciarBatalha(): void {
    this.store.iniciarBatalha();
  }

  private selecionarProxima(): void {
    const pendente = this.frota().embarcacoes.find(
      (embarcacao: Embarcacao) => embarcacao.posicoes.length !== embarcacao.tamanho,
    );
    this.tipoSelecionado.set(pendente?.tipo ?? null);
  }
}
