import { computed, Injectable, signal } from '@angular/core';
import {
  Ataque,
  buscarEmbarcacao,
  criarPartida,
  EstadoPartida,
  frotaCompleta,
  iniciarBatalha,
  novaPartida,
  Orientacao,
  posicoesDeInicio,
  posicionarEmbarcacaoJogador,
  removerEmbarcacaoJogador,
  realizarAtaqueComputador,
  realizarAtaqueJogador,
  Sorteio,
  sorteioPadrao,
  TipoEmbarcacao,
} from '../dominio';
import { descreverAtaque, mensagemDeErro, nomeEmbarcacao } from './rotulos';

@Injectable({ providedIn: 'root' })
export class PartidaStore {
  private readonly _estado = signal<EstadoPartida>(criarPartida());
  private readonly _iniciada = signal(false);
  private readonly _mensagem = signal<string | null>(null);
  private readonly _mensagemEhErro = signal(false);

  readonly estado = this._estado.asReadonly();
  readonly iniciada = this._iniciada.asReadonly();
  readonly mensagem = this._mensagem.asReadonly();
  readonly mensagemEhErro = this._mensagemEhErro.asReadonly();

  readonly fase = computed(() => this._estado().fase);
  readonly frotaJogador = computed(() => this._estado().jogador.frota);
  readonly frotaCompleta = computed(() => frotaCompleta(this.frotaJogador()));
  readonly faltantes = computed(() =>
    this.frotaJogador()
      .embarcacoes.filter((embarcacao) => embarcacao.posicoes.length !== embarcacao.tamanho)
      .map((embarcacao) => nomeEmbarcacao(embarcacao.tipo)),
  );
  readonly turno = computed(() => {
    const estado = this._estado();
    return estado.fase === 'em-andamento' ? estado.turno : null;
  });
  readonly vencedor = computed(() => {
    const estado = this._estado();
    return estado.fase === 'encerrada' ? estado.vencedor : null;
  });
  readonly ataquesJogador = computed(() => {
    const estado = this._estado();
    return estado.fase === 'preparacao' ? [] : estado.ataquesJogador;
  });
  readonly ataquesComputador = computed(() => {
    const estado = this._estado();
    return estado.fase === 'preparacao' ? [] : estado.ataquesComputador;
  });

  iniciarJogo(): void {
    this._iniciada.set(true);
    this.limparMensagem();
  }

  posicionar(tipo: TipoEmbarcacao, indiceInicial: number, orientacao: Orientacao): boolean {
    const embarcacao = buscarEmbarcacao(this.frotaJogador(), tipo);

    if (!embarcacao) {
      return this.falhar('embarcacao-nao-posicionada');
    }

    const posicoes = posicoesDeInicio(indiceInicial, orientacao, embarcacao.tamanho);

    if (!posicoes.sucesso) {
      return this.falhar(posicoes.erro);
    }

    const resultado = posicionarEmbarcacaoJogador(this._estado(), tipo, posicoes.valor);

    if (!resultado.sucesso) {
      return this.falhar(resultado.erro);
    }

    this._estado.set(resultado.valor);
    this.informar(`${nomeEmbarcacao(tipo)} posicionada.`);
    return true;
  }

  remover(tipo: TipoEmbarcacao): boolean {
    const resultado = removerEmbarcacaoJogador(this._estado(), tipo);

    if (!resultado.sucesso) {
      return this.falhar(resultado.erro);
    }

    this._estado.set(resultado.valor);
    this.informar(`${nomeEmbarcacao(tipo)} removida.`);
    return true;
  }

  iniciarBatalha(sorteio: Sorteio = sorteioPadrao): boolean {
    const resultado = iniciarBatalha(this._estado(), sorteio);

    if (!resultado.sucesso) {
      return this.falhar(resultado.erro);
    }

    this._estado.set(resultado.valor);
    this.informar('Batalha iniciada. Sua vez de atacar.');
    return true;
  }

  atacar(indice: number): boolean {
    const resultado = realizarAtaqueJogador(this._estado(), indice);

    if (!resultado.sucesso) {
      return this.falhar(resultado.erro);
    }

    this._estado.set(resultado.valor);
    const ataque = this.ultimoAtaqueDoJogador(resultado.valor);

    if (ataque) {
      this.informar(descreverAtaque(ataque.coordenada, ataque.resultado, ataque.tipoEmbarcacao));
    }

    return true;
  }

  atacarComputador(sorteio: Sorteio = sorteioPadrao): boolean {
    const resultado = realizarAtaqueComputador(this._estado(), sorteio);

    if (!resultado.sucesso) {
      return this.falhar(resultado.erro);
    }

    this._estado.set(resultado.valor);
    const ataque = this.ultimoAtaqueDoComputador(resultado.valor);

    if (ataque) {
      this.informar(
        `Computador atacou ${ataque.coordenada}: ${descreverAtaque(
          ataque.coordenada,
          ataque.resultado,
          ataque.tipoEmbarcacao,
        )}`,
      );
    }

    return true;
  }

  reiniciar(): boolean {
    const resultado = novaPartida(this._estado());

    if (!resultado.sucesso) {
      return this.falhar(resultado.erro);
    }

    this._estado.set(resultado.valor);
    this.limparMensagem();
    return true;
  }

  limparMensagem(): void {
    this._mensagem.set(null);
    this._mensagemEhErro.set(false);
  }

  private informar(mensagem: string): void {
    this._mensagem.set(mensagem);
    this._mensagemEhErro.set(false);
  }

  private falhar(codigo: Parameters<typeof mensagemDeErro>[0]): false {
    this._mensagem.set(mensagemDeErro(codigo));
    this._mensagemEhErro.set(true);
    return false;
  }

  private ultimoAtaqueDoJogador(estado: EstadoPartida): Ataque | undefined {
    return estado.fase === 'preparacao' ? undefined : this.ultimoAtaque(estado.ataquesJogador);
  }

  private ultimoAtaqueDoComputador(estado: EstadoPartida): Ataque | undefined {
    return estado.fase === 'preparacao' ? undefined : this.ultimoAtaque(estado.ataquesComputador);
  }

  private ultimoAtaque(ataques: readonly Ataque[]): Ataque | undefined {
    return ataques[ataques.length - 1];
  }
}
