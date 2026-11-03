import { Ataque, Frota, foiAtingida, Lado, TipoEmbarcacao, TOTAL_POSICOES } from '../dominio';

export type EstadoVisual = 'livre' | 'embarcacao' | 'agua' | 'acerto' | 'afundado';

export interface VisualCelula {
  readonly indice: number;
  readonly estado: EstadoVisual;
}

export function criarCelulasVazias(): VisualCelula[] {
  return Array.from({ length: TOTAL_POSICOES }, (_, indice) => ({
    indice,
    estado: 'livre' as const,
  }));
}

export function indicesAfundados(lado: Lado): ReadonlySet<number> {
  const indices = new Set<number>();

  for (const embarcacao of lado.frota.embarcacoes) {
    const completa = embarcacao.posicoes.length === embarcacao.tamanho;
    const destruida =
      completa && embarcacao.posicoes.every((posicao) => foiAtingida(lado.tabuleiro, posicao));

    if (destruida) {
      for (const posicao of embarcacao.posicoes) {
        indices.add(posicao);
      }
    }
  }

  return indices;
}

export function celulasDoLado(lado: Lado): VisualCelula[] {
  const afundadas = indicesAfundados(lado);

  return lado.tabuleiro.celulas.map((celula) => {
    let estado: EstadoVisual = 'livre';

    if (celula.atingida) {
      if (!celula.ocupada) {
        estado = 'agua';
      } else {
        estado = afundadas.has(celula.indice) ? 'afundado' : 'acerto';
      }
    } else if (celula.ocupada) {
      estado = 'embarcacao';
    }

    return { indice: celula.indice, estado };
  });
}

export function celulasDaFrota(frota: Frota): VisualCelula[] {
  const celulas = criarCelulasVazias();

  for (const embarcacao of frota.embarcacoes) {
    for (const posicao of embarcacao.posicoes) {
      const atual = celulas[posicao];

      if (atual) {
        celulas[posicao] = { indice: atual.indice, estado: 'embarcacao' };
      }
    }
  }

  return celulas;
}

export function celulasDoAdversario(ataques: readonly Ataque[]): VisualCelula[] {
  const destruidas = tiposDestruidos(ataques);
  const celulas = criarCelulasVazias();

  for (const ataque of ataques) {
    let estado: EstadoVisual = ataque.resultado === 'agua' ? 'agua' : 'acerto';

    if (ataque.tipoEmbarcacao && destruidas.has(ataque.tipoEmbarcacao)) {
      estado = 'afundado';
    }

    celulas[ataque.indice] = { indice: ataque.indice, estado };
  }

  return celulas;
}

function tiposDestruidos(ataques: readonly Ataque[]): ReadonlySet<TipoEmbarcacao> {
  const tipos = new Set<TipoEmbarcacao>();

  for (const ataque of ataques) {
    if (ataque.resultado === 'embarcacao-destruida' && ataque.tipoEmbarcacao) {
      tipos.add(ataque.tipoEmbarcacao);
    }
  }

  return tipos;
}
