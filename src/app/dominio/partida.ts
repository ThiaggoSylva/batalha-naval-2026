import { textoDeIndice } from './coordenada';
import {
  criarFrotaPadrao,
  embarcacaoEm,
  Frota,
  frotaCompleta,
  posicoesOcupadas,
  posicionarEmbarcacao,
  removerEmbarcacao,
} from './frota';
import { gerarFrotaComputador, indiceAleatorio, Sorteio, sorteioPadrao } from './sorteio';
import {
  criarTabuleiro,
  definirOcupadas,
  foiAtingida,
  marcarAtingida,
  Tabuleiro,
} from './tabuleiro';
import { falha, Participante, Resultado, sucesso, TipoEmbarcacao } from './tipos';

export type ResultadoAtaque = 'agua' | 'acerto' | 'embarcacao-destruida';

export interface Ataque {
  readonly indice: number;
  readonly coordenada: string;
  readonly resultado: ResultadoAtaque;
  readonly tipoEmbarcacao?: TipoEmbarcacao;
}

export interface Lado {
  readonly frota: Frota;
  readonly tabuleiro: Tabuleiro;
}

export interface EstadoPreparacao {
  readonly fase: 'preparacao';
  readonly jogador: Lado;
}

export interface EstadoEmAndamento {
  readonly fase: 'em-andamento';
  readonly jogador: Lado;
  readonly computador: Lado;
  readonly turno: Participante;
  readonly ataquesJogador: readonly Ataque[];
  readonly ataquesComputador: readonly Ataque[];
}

export interface EstadoEncerrada {
  readonly fase: 'encerrada';
  readonly jogador: Lado;
  readonly computador: Lado;
  readonly ataquesJogador: readonly Ataque[];
  readonly ataquesComputador: readonly Ataque[];
  readonly vencedor: Participante;
}

export type EstadoPartida = EstadoPreparacao | EstadoEmAndamento | EstadoEncerrada;

export function criarPartida(): EstadoPartida {
  return {
    fase: 'preparacao',
    jogador: criarLado(criarFrotaPadrao()),
  };
}

export function posicionarEmbarcacaoJogador(
  estado: EstadoPartida,
  tipo: TipoEmbarcacao,
  posicoes: readonly number[],
): Resultado<EstadoPartida> {
  if (estado.fase !== 'preparacao') {
    return erroDeFase(estado);
  }

  const frota = posicionarEmbarcacao(estado.jogador.frota, tipo, posicoes);

  if (!frota.sucesso) {
    return frota;
  }

  const jogador = sincronizarLado(estado.jogador, frota.valor);

  if (!jogador.sucesso) {
    return jogador;
  }

  return sucesso({ fase: 'preparacao', jogador: jogador.valor });
}

export function removerEmbarcacaoJogador(
  estado: EstadoPartida,
  tipo: TipoEmbarcacao,
): Resultado<EstadoPartida> {
  if (estado.fase !== 'preparacao') {
    return erroDeFase(estado);
  }

  const frota = removerEmbarcacao(estado.jogador.frota, tipo);

  if (!frota.sucesso) {
    return frota;
  }

  const jogador = sincronizarLado(estado.jogador, frota.valor);

  if (!jogador.sucesso) {
    return jogador;
  }

  return sucesso({ fase: 'preparacao', jogador: jogador.valor });
}

export function iniciarBatalha(
  estado: EstadoPartida,
  sorteio: Sorteio = sorteioPadrao,
): Resultado<EstadoPartida> {
  if (estado.fase !== 'preparacao') {
    return erroDeFase(estado);
  }

  if (!frotaCompleta(estado.jogador.frota)) {
    return falha('frota-incompleta');
  }

  const frotaComputador = gerarFrotaComputador(sorteio);

  if (!frotaComputador.sucesso) {
    return frotaComputador;
  }

  return sucesso({
    fase: 'em-andamento',
    jogador: estado.jogador,
    computador: criarLado(frotaComputador.valor),
    turno: 'jogador',
    ataquesJogador: [],
    ataquesComputador: [],
  });
}

export function realizarAtaqueJogador(
  estado: EstadoPartida,
  indice: number,
): Resultado<EstadoPartida> {
  const validacao = validarAtaque(estado, 'jogador', indice);

  if (!validacao.sucesso) {
    return validacao;
  }

  return executarAtaque(validacao.valor, 'jogador', indice);
}

export function realizarAtaqueComputador(
  estado: EstadoPartida,
  sorteio: Sorteio = sorteioPadrao,
): Resultado<EstadoPartida> {
  const indice = sortearAtaqueComputador(estado, sorteio);

  if (!indice.sucesso) {
    return indice;
  }

  const validacao = validarAtaque(estado, 'computador', indice.valor);

  if (!validacao.sucesso) {
    return validacao;
  }

  return executarAtaque(validacao.valor, 'computador', indice.valor);
}

export function sortearAtaqueComputador(
  estado: EstadoPartida,
  sorteio: Sorteio = sorteioPadrao,
): Resultado<number> {
  const validacao = validarTurno(estado, 'computador');

  if (!validacao.sucesso) {
    return validacao;
  }

  const atacadas = new Set(validacao.valor.ataquesComputador.map((ataque) => ataque.indice));
  const disponiveis: number[] = [];

  for (let indice = 0; indice < validacao.valor.jogador.tabuleiro.celulas.length; indice++) {
    if (!atacadas.has(indice) && !foiAtingida(validacao.valor.jogador.tabuleiro, indice)) {
      disponiveis.push(indice);
    }
  }

  if (disponiveis.length === 0) {
    return falha('sem-coordenada-disponivel');
  }

  const escolhido = disponiveis[indiceAleatorio(sorteio, disponiveis.length)];

  if (escolhido === undefined) {
    return falha('sem-coordenada-disponivel');
  }

  return sucesso(escolhido);
}

export function novaPartida(estado: EstadoPartida): Resultado<EstadoPartida> {
  if (estado.fase !== 'encerrada') {
    return falha('fase-invalida');
  }

  return sucesso(criarPartida());
}

function criarLado(frota: Frota): Lado {
  const tabuleiro = definirOcupadas(criarTabuleiro(), posicoesOcupadas(frota));

  if (!tabuleiro.sucesso) {
    throw new Error('Não foi possível criar o tabuleiro a partir da frota.');
  }

  return { frota, tabuleiro: tabuleiro.valor };
}

function sincronizarLado(lado: Lado, frota: Frota): Resultado<Lado> {
  const tabuleiro = definirOcupadas(lado.tabuleiro, posicoesOcupadas(frota));

  if (!tabuleiro.sucesso) {
    return tabuleiro;
  }

  return sucesso({ frota, tabuleiro: tabuleiro.valor });
}

function erroDeFase(estado: EstadoPartida): Resultado<never> {
  return falha(estado.fase === 'encerrada' ? 'partida-encerrada' : 'fase-invalida');
}

function validarTurno(estado: EstadoPartida, atacante: Participante): Resultado<EstadoEmAndamento> {
  if (estado.fase === 'preparacao') {
    return falha('fase-invalida');
  }

  if (estado.fase === 'encerrada') {
    return falha('partida-encerrada');
  }

  if (estado.turno !== atacante) {
    return falha('nao-e-o-turno');
  }

  return sucesso(estado);
}

function validarAtaque(
  estado: EstadoPartida,
  atacante: Participante,
  indice: number,
): Resultado<EstadoEmAndamento> {
  const turno = validarTurno(estado, atacante);

  if (!turno.sucesso) {
    return turno;
  }

  if (!Number.isInteger(indice)) {
    return falha('coordenada-invalida');
  }

  const alvo = atacante === 'jogador' ? turno.valor.computador : turno.valor.jogador;

  if (!alvo.tabuleiro.celulas[indice]) {
    return falha('fora-do-tabuleiro');
  }

  if (foiAtingida(alvo.tabuleiro, indice)) {
    return falha('ataque-repetido');
  }

  return sucesso(turno.valor);
}

function executarAtaque(
  estado: EstadoEmAndamento,
  atacante: Participante,
  indice: number,
): Resultado<EstadoPartida> {
  const alvo = atacante === 'jogador' ? estado.computador : estado.jogador;
  const embarcacao = embarcacaoEm(alvo.frota, indice);
  const tabuleiro = marcarAtingida(alvo.tabuleiro, indice);

  if (!tabuleiro.sucesso) {
    return tabuleiro;
  }

  const alvoAtualizado: Lado = { frota: alvo.frota, tabuleiro: tabuleiro.valor };
  const destruida =
    embarcacao !== undefined &&
    embarcacao.posicoes.every((posicao) => foiAtingida(alvoAtualizado.tabuleiro, posicao));
  const resultado: ResultadoAtaque = !embarcacao
    ? 'agua'
    : destruida
      ? 'embarcacao-destruida'
      : 'acerto';
  const coordenada = textoDeIndice(indice);
  const ataque: Ataque = {
    indice,
    coordenada: coordenada.sucesso ? coordenada.valor : '',
    resultado,
    ...(embarcacao ? { tipoEmbarcacao: embarcacao.tipo } : {}),
  };
  const jogador = atacante === 'jogador' ? estado.jogador : alvoAtualizado;
  const computador = atacante === 'jogador' ? alvoAtualizado : estado.computador;
  const ataquesJogador =
    atacante === 'jogador' ? [...estado.ataquesJogador, ataque] : estado.ataquesJogador;
  const ataquesComputador =
    atacante === 'computador' ? [...estado.ataquesComputador, ataque] : estado.ataquesComputador;

  if (frotaDestruida(alvoAtualizado)) {
    return sucesso({
      fase: 'encerrada',
      jogador,
      computador,
      ataquesJogador,
      ataquesComputador,
      vencedor: atacante,
    });
  }

  return sucesso({
    fase: 'em-andamento',
    jogador,
    computador,
    turno: outroParticipante(atacante),
    ataquesJogador,
    ataquesComputador,
  });
}

function frotaDestruida(lado: Lado): boolean {
  return lado.frota.embarcacoes.every(
    (embarcacao) =>
      embarcacao.posicoes.length === embarcacao.tamanho &&
      embarcacao.posicoes.every((posicao) => foiAtingida(lado.tabuleiro, posicao)),
  );
}

function outroParticipante(participante: Participante): Participante {
  return participante === 'jogador' ? 'computador' : 'jogador';
}
