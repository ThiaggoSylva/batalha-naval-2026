import {
  criarEmbarcacao,
  Embarcacao,
  estaPosicionada,
  ORDEM_FROTA,
  validarPosicoes,
} from './embarcacao';
import { falha, Resultado, sucesso, TipoEmbarcacao } from './tipos';

export interface Frota {
  readonly embarcacoes: readonly Embarcacao[];
}

export function criarFrotaPadrao(): Frota {
  return { embarcacoes: ORDEM_FROTA.map((tipo) => criarEmbarcacao(tipo)) };
}

export function buscarEmbarcacao(frota: Frota, tipo: TipoEmbarcacao): Embarcacao | undefined {
  return frota.embarcacoes.find((embarcacao) => embarcacao.tipo === tipo);
}

export function posicionarEmbarcacao(
  frota: Frota,
  tipo: TipoEmbarcacao,
  posicoes: readonly number[],
): Resultado<Frota> {
  const embarcacao = buscarEmbarcacao(frota, tipo);

  if (!embarcacao) {
    return falha('embarcacao-nao-posicionada');
  }

  const validacao = validarPosicoes(posicoes, embarcacao.tamanho);

  if (!validacao.sucesso) {
    return validacao;
  }

  const ocupadas = posicoesOcupadas(frota, tipo);

  if (validacao.valor.posicoes.some((posicao) => ocupadas.has(posicao))) {
    return falha('posicao-ocupada');
  }

  return sucesso({
    embarcacoes: frota.embarcacoes.map((item) =>
      item.tipo === tipo
        ? {
            ...item,
            orientacao: validacao.valor.orientacao,
            posicoes: validacao.valor.posicoes,
          }
        : item,
    ),
  });
}

export function removerEmbarcacao(frota: Frota, tipo: TipoEmbarcacao): Resultado<Frota> {
  const embarcacao = buscarEmbarcacao(frota, tipo);

  if (!embarcacao || !estaPosicionada(embarcacao)) {
    return falha('embarcacao-nao-posicionada');
  }

  return sucesso({
    embarcacoes: frota.embarcacoes.map((item) =>
      item.tipo === tipo ? { ...item, orientacao: null, posicoes: [] } : item,
    ),
  });
}

export function frotaCompleta(frota: Frota): boolean {
  return frota.embarcacoes.every((embarcacao) => estaPosicionada(embarcacao));
}

export function posicoesOcupadas(frota: Frota, ignorar?: TipoEmbarcacao): ReadonlySet<number> {
  const ocupadas = new Set<number>();

  for (const embarcacao of frota.embarcacoes) {
    if (embarcacao.tipo === ignorar) {
      continue;
    }

    for (const posicao of embarcacao.posicoes) {
      ocupadas.add(posicao);
    }
  }

  return ocupadas;
}

export function totalPosicoesOcupadas(frota: Frota): number {
  return posicoesOcupadas(frota).size;
}

export function embarcacaoEm(frota: Frota, indice: number): Embarcacao | undefined {
  return frota.embarcacoes.find((embarcacao) => embarcacao.posicoes.includes(indice));
}
