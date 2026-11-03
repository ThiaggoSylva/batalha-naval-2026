import { describe, expect, it } from 'vitest';
import { indiceDeTexto, textoDeIndice } from './coordenada';
import { totalPosicoesOcupadas } from './frota';
import {
  criarPartida,
  EstadoEmAndamento,
  EstadoPartida,
  iniciarBatalha,
  Lado,
  novaPartida,
  posicionarEmbarcacaoJogador,
  realizarAtaqueComputador,
  realizarAtaqueJogador,
  removerEmbarcacaoJogador,
  sortearAtaqueComputador,
} from './partida';
import { Sorteio } from './sorteio';
import { foiAtingida } from './tabuleiro';
import { Resultado, TipoEmbarcacao } from './tipos';

export function indice(coordenada: string): number {
  const resultado = indiceDeTexto(coordenada);

  if (!resultado.sucesso) {
    throw new Error(`Coordenada inválida no teste: ${coordenada}`);
  }

  return resultado.valor;
}

export function sorteioComSemente(semente: number): Sorteio {
  let estado = semente >>> 0;

  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0;
    return estado / 4294967296;
  };
}

export function posicionar(
  estado: EstadoPartida,
  tipo: TipoEmbarcacao,
  coordenadas: readonly string[],
): EstadoPartida {
  const resultado = posicionarEmbarcacaoJogador(
    estado,
    tipo,
    coordenadas.map((coordenada) => indice(coordenada)),
  );

  if (!resultado.sucesso) {
    throw new Error(`Posicionamento falhou no teste: ${resultado.erro}`);
  }

  return resultado.valor;
}

export function jogadorComFrotaCompleta(): EstadoPartida {
  let estado = criarPartida();
  estado = posicionar(estado, 'porta-avioes', ['A1', 'A2', 'A3', 'A4', 'A5']);
  estado = posicionar(estado, 'encouracado', ['B1', 'B2', 'B3', 'B4']);
  estado = posicionar(estado, 'cruzador', ['C1', 'C2', 'C3']);
  estado = posicionar(estado, 'submarino', ['D1', 'D2', 'D3']);
  return posicionar(estado, 'destroyer', ['E1', 'E2']);
}

describe('partida — preparação', () => {
  it('inicia em preparação com a frota vazia e o tabuleiro livre', () => {
    const estado = criarPartida();

    expect(estado.fase).toBe('preparacao');
    expect(estado.jogador.frota.embarcacoes).toHaveLength(5);
    expect(totalPosicoesOcupadas(estado.jogador.frota)).toBe(0);
    expect(estado.jogador.tabuleiro.celulas.every((celula) => !celula.ocupada)).toBe(true);
  });

  it('posiciona e remove embarcações durante a preparação', () => {
    const comCruzador = posicionar(criarPartida(), 'cruzador', ['B2', 'B3', 'B4']);

    expect(comCruzador.fase).toBe('preparacao');
    expect(totalPosicoesOcupadas(comCruzador.jogador.frota)).toBe(3);

    const removido = removerEmbarcacaoJogador(comCruzador, 'cruzador');
    expect(removido.sucesso).toBe(true);
    if (!removido.sucesso) {
      return;
    }

    expect(removido.valor.fase).toBe('preparacao');
    expect(totalPosicoesOcupadas(removido.valor.jogador.frota)).toBe(0);
    expect(removido.valor.jogador.tabuleiro.celulas.every((celula) => !celula.ocupada)).toBe(true);
  });

  it('rejeita remoção de embarcação que não foi posicionada', () => {
    const resultado = removerEmbarcacaoJogador(criarPartida(), 'destroyer');

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('embarcacao-nao-posicionada');
    }
  });

  it('impede iniciar a batalha com a frota incompleta', () => {
    const estado = posicionar(criarPartida(), 'cruzador', ['B2', 'B3', 'B4']);
    const resultado = iniciarBatalha(estado, sorteioComSemente(1));

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('frota-incompleta');
    }
    expect(estado.fase).toBe('preparacao');
  });

  it('rejeita posicionamento depois do início da batalha', () => {
    const completo = jogadorComFrotaCompleta();
    const iniciada = iniciarBatalha(completo, sorteioComSemente(1));

    expect(iniciada.sucesso).toBe(true);
    if (!iniciada.sucesso) {
      return;
    }

    const resultado = posicionarEmbarcacaoJogador(iniciada.valor, 'destroyer', [
      indice('J9'),
      indice('J10'),
    ]);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('fase-invalida');
    }
  });
});

describe('partida — início da batalha', () => {
  it('inicia com as duas frotas completas e concede o primeiro turno ao jogador', () => {
    const resultado = iniciarBatalha(jogadorComFrotaCompleta(), sorteioComSemente(42));

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    const estado = resultado.valor;
    expect(estado.fase).toBe('em-andamento');
    if (estado.fase !== 'em-andamento') {
      return;
    }

    expect(estado.turno).toBe('jogador');
    expect(estado.ataquesJogador).toEqual([]);
    expect(estado.ataquesComputador).toEqual([]);
    expect(estado.computador.frota.embarcacoes).toHaveLength(5);
    expect(totalPosicoesOcupadas(estado.computador.frota)).toBe(17);
    expect(estado.computador.tabuleiro.celulas.filter((celula) => celula.ocupada)).toHaveLength(17);
  });

  it('distribui a frota do computador sem sobreposição', () => {
    const resultado = iniciarBatalha(jogadorComFrotaCompleta(), sorteioComSemente(7));

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso || resultado.valor.fase !== 'em-andamento') {
      return;
    }

    const posicoes = resultado.valor.computador.frota.embarcacoes.flatMap(
      (embarcacao) => embarcacao.posicoes,
    );

    expect(new Set(posicoes).size).toBe(17);
    expect(posicoes.every((posicao) => posicao >= 0 && posicao <= 99)).toBe(true);
  });
});

function aplicar(resultado: Resultado<EstadoPartida>): EstadoPartida {
  if (!resultado.sucesso) {
    throw new Error(`Operação falhou no teste: ${resultado.erro}`);
  }

  return resultado.valor;
}

function comoEmAndamento(estado: EstadoPartida): EstadoEmAndamento {
  if (estado.fase !== 'em-andamento') {
    throw new Error(`Esperava partida em andamento, recebi ${estado.fase}`);
  }

  return estado;
}

export function estadoIniciado(semente = 42): EstadoEmAndamento {
  return comoEmAndamento(
    aplicar(iniciarBatalha(jogadorComFrotaCompleta(), sorteioComSemente(semente))),
  );
}

function posicoesOcupadasDoLado(lado: Lado): ReadonlySet<number> {
  return new Set(lado.frota.embarcacoes.flatMap((embarcacao) => embarcacao.posicoes));
}

function primeiraAgua(lado: Lado): number {
  const ocupadas = posicoesOcupadasDoLado(lado);

  for (let indice = 0; indice < 100; indice++) {
    if (!ocupadas.has(indice)) {
      return indice;
    }
  }

  throw new Error('Não há posição de água no tabuleiro.');
}

function primeiraAguaDisponivel(
  lado: Lado,
  ataques: readonly { readonly indice: number }[],
): number {
  const ocupadas = posicoesOcupadasDoLado(lado);
  const atacadas = new Set(ataques.map((ataque) => ataque.indice));

  for (let indice = 0; indice < 100; indice++) {
    if (!ocupadas.has(indice) && !atacadas.has(indice)) {
      return indice;
    }
  }

  throw new Error('Não há posição de água disponível.');
}

function proximaPosicaoOcupadaNaoAtingida(lado: Lado): number {
  for (const embarcacao of lado.frota.embarcacoes) {
    for (const posicao of embarcacao.posicoes) {
      if (!foiAtingida(lado.tabuleiro, posicao)) {
        return posicao;
      }
    }
  }

  throw new Error('Não há posição ocupada não atingida.');
}

function indicesDisponiveisParaComputador(estado: EstadoEmAndamento): readonly number[] {
  const atacadas = new Set(estado.ataquesComputador.map((ataque) => ataque.indice));
  const disponiveis: number[] = [];

  for (let indice = 0; indice < 100; indice++) {
    if (!atacadas.has(indice) && !foiAtingida(estado.jogador.tabuleiro, indice)) {
      disponiveis.push(indice);
    }
  }

  return disponiveis;
}

function sorteioParaIndice(estado: EstadoEmAndamento, alvo: number): Sorteio {
  const disponiveis = indicesDisponiveisParaComputador(estado);
  const posicao = disponiveis.indexOf(alvo);

  if (posicao < 0) {
    throw new Error(`O índice ${alvo} não está disponível para o computador.`);
  }

  return () => (posicao + 0.5) / disponiveis.length;
}

function ataqueComputadorEmAgua(estado: EstadoEmAndamento): EstadoEmAndamento {
  const ocupadas = posicoesOcupadasDoLado(estado.jogador);
  const alvo = indicesDisponiveisParaComputador(estado).find((indice) => !ocupadas.has(indice));

  if (alvo === undefined) {
    throw new Error('Não há água disponível para o computador atacar.');
  }

  return comoEmAndamento(
    aplicar(realizarAtaqueComputador(estado, sorteioParaIndice(estado, alvo))),
  );
}

function destruirFrotaDoComputador(estado: EstadoEmAndamento): EstadoPartida {
  let atual: EstadoPartida = estado;

  while (atual.fase === 'em-andamento') {
    if (atual.turno === 'jogador') {
      const alvo = proximaPosicaoOcupadaNaoAtingida(atual.computador);
      atual = aplicar(realizarAtaqueJogador(atual, alvo));
    } else {
      atual = ataqueComputadorEmAgua(atual);
    }
  }

  return atual;
}

function destruirFrotaDoJogador(estado: EstadoEmAndamento): EstadoPartida {
  let atual: EstadoPartida = estado;

  while (atual.fase === 'em-andamento') {
    if (atual.turno === 'jogador') {
      atual = aplicar(
        realizarAtaqueJogador(
          atual,
          primeiraAguaDisponivel(atual.computador, atual.ataquesJogador),
        ),
      );
    } else {
      const alvo = proximaPosicaoOcupadaNaoAtingida(atual.jogador);
      atual = aplicar(realizarAtaqueComputador(atual, sorteioParaIndice(atual, alvo)));
    }
  }

  return atual;
}

describe('partida — ataques', () => {
  it('resolve um ataque em água e passa o turno ao computador', () => {
    const estado = estadoIniciado();
    const alvo = primeiraAgua(estado.computador);
    const resultado = realizarAtaqueJogador(estado, alvo);

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    const atualizado = comoEmAndamento(resultado.valor);
    expect(atualizado.turno).toBe('computador');
    expect(atualizado.ataquesJogador).toHaveLength(1);
    expect(atualizado.ataquesJogador[0]?.resultado).toBe('agua');
    const coordenada = textoDeIndice(alvo);
    expect(atualizado.ataquesJogador[0]?.coordenada).toBe(
      coordenada.sucesso ? coordenada.valor : '',
    );
    expect(foiAtingida(atualizado.computador.tabuleiro, alvo)).toBe(true);
  });

  it('resolve um ataque com acerto sem destruir a embarcação', () => {
    const estado = estadoIniciado();
    const alvo = proximaPosicaoOcupadaNaoAtingida(estado.computador);
    const resultado = realizarAtaqueJogador(estado, alvo);

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    const atualizado = comoEmAndamento(resultado.valor);
    expect(atualizado.ataquesJogador[0]?.resultado).toBe('acerto');
    expect(atualizado.ataquesJogador[0]?.tipoEmbarcacao).toBeDefined();
    expect(atualizado.turno).toBe('computador');
  });

  it('informa a destruição ao atingir a última posição intacta', () => {
    let estado = estadoIniciado();
    const destroyer = estado.computador.frota.embarcacoes.find(
      (embarcacao) => embarcacao.tipo === 'destroyer',
    );

    expect(destroyer).toBeDefined();
    if (!destroyer) {
      return;
    }

    const [primeira, segunda] = destroyer.posicoes;
    expect(primeira).toBeDefined();
    expect(segunda).toBeDefined();
    if (primeira === undefined || segunda === undefined) {
      return;
    }

    estado = comoEmAndamento(aplicar(realizarAtaqueJogador(estado, primeira)));
    expect(estado.ataquesJogador[0]?.resultado).toBe('acerto');
    estado = ataqueComputadorEmAgua(estado);

    estado = comoEmAndamento(aplicar(realizarAtaqueJogador(estado, segunda)));
    expect(estado.ataquesJogador[1]?.resultado).toBe('embarcacao-destruida');
    expect(estado.ataquesJogador[1]?.tipoEmbarcacao).toBe('destroyer');
  });

  it('rejeita ataque repetido sem consumir o turno', () => {
    let estado = estadoIniciado();
    const alvo = primeiraAgua(estado.computador);

    estado = comoEmAndamento(aplicar(realizarAtaqueJogador(estado, alvo)));
    estado = ataqueComputadorEmAgua(estado);

    const repetido = realizarAtaqueJogador(estado, alvo);

    expect(repetido.sucesso).toBe(false);
    if (!repetido.sucesso) {
      expect(repetido.erro).toBe('ataque-repetido');
    }
    expect(estado.turno).toBe('jogador');
    expect(estado.ataquesJogador).toHaveLength(1);
  });

  it('rejeita ataque fora do tabuleiro sem consumir o turno', () => {
    const estado = estadoIniciado();

    for (const indice of [-1, 100]) {
      const resultado = realizarAtaqueJogador(estado, indice);

      expect(resultado.sucesso).toBe(false);
      if (!resultado.sucesso) {
        expect(resultado.erro).toBe('fora-do-tabuleiro');
      }
    }

    expect(estado.turno).toBe('jogador');
  });

  it('rejeita ataque fora do turno', () => {
    const estado = estadoIniciado();
    const aposAtaque = comoEmAndamento(
      aplicar(realizarAtaqueJogador(estado, primeiraAgua(estado.computador))),
    );
    const resultado = realizarAtaqueJogador(aposAtaque, 0);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('nao-e-o-turno');
    }
  });

  it('registra os ataques dos dois participantes com os resultados originais', () => {
    let estado = estadoIniciado();
    estado = comoEmAndamento(
      aplicar(realizarAtaqueJogador(estado, primeiraAgua(estado.computador))),
    );
    estado = ataqueComputadorEmAgua(estado);

    expect(estado.ataquesJogador).toHaveLength(1);
    expect(estado.ataquesComputador).toHaveLength(1);
    expect(estado.ataquesJogador[0]?.resultado).toBe('agua');
    expect(estado.ataquesComputador[0]?.resultado).toBe('agua');
  });
});

describe('partida — ataque do computador', () => {
  it('escolhe uma coordenada ainda não atacada', () => {
    let estado = estadoIniciado();
    estado = comoEmAndamento(
      aplicar(realizarAtaqueJogador(estado, primeiraAgua(estado.computador))),
    );

    const sorteado = sortearAtaqueComputador(estado, () => 0);

    expect(sorteado.sucesso).toBe(true);
    if (!sorteado.sucesso) {
      return;
    }

    expect(estado.ataquesComputador.map((ataque) => ataque.indice)).not.toContain(sorteado.valor);
  });

  it('usa a função de sorteio controlada para determinar o ataque', () => {
    let estado = estadoIniciado();
    estado = comoEmAndamento(
      aplicar(realizarAtaqueJogador(estado, primeiraAgua(estado.computador))),
    );
    const disponiveis = indicesDisponiveisParaComputador(estado);
    const primeiro = disponiveis[0];

    expect(primeiro).toBeDefined();
    if (primeiro === undefined) {
      return;
    }

    const sorteado = sortearAtaqueComputador(estado, () => 0);
    expect(sorteado).toEqual({ sucesso: true, valor: primeiro });

    const atualizado = comoEmAndamento(aplicar(realizarAtaqueComputador(estado, () => 0)));
    expect(atualizado.ataquesComputador[0]?.indice).toBe(primeiro);
  });

  it('não realiza ataque quando não há coordenadas disponíveis', () => {
    let estado = estadoIniciado();
    estado = comoEmAndamento(
      aplicar(realizarAtaqueJogador(estado, primeiraAgua(estado.computador))),
    );

    const todosAtacados = Array.from({ length: 100 }, (_, indice) => ({
      indice,
      coordenada: '',
      resultado: 'agua' as const,
    }));
    const semDisponiveis: EstadoEmAndamento = {
      ...estado,
      ataquesComputador: todosAtacados,
    };

    const resultado = sortearAtaqueComputador(semDisponiveis, () => 0);

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('sem-coordenada-disponivel');
    }
    expect(semDisponiveis.ataquesComputador).toHaveLength(100);
  });
});

describe('partida — fim e nova partida', () => {
  it('encerra imediatamente com a vitória do jogador e bloqueia novos ataques', () => {
    const estado = destruirFrotaDoComputador(estadoIniciado());

    expect(estado.fase).toBe('encerrada');
    if (estado.fase !== 'encerrada') {
      return;
    }

    expect(estado.vencedor).toBe('jogador');

    const aposFim = realizarAtaqueComputador(estado, () => 0);
    expect(aposFim.sucesso).toBe(false);
    if (!aposFim.sucesso) {
      expect(aposFim.erro).toBe('partida-encerrada');
    }
    expect(estado.vencedor).toBe('jogador');
  });

  it('encerra com a vitória do computador quando a frota do jogador é destruída', () => {
    const estado = destruirFrotaDoJogador(estadoIniciado());

    expect(estado.fase).toBe('encerrada');
    if (estado.fase !== 'encerrada') {
      return;
    }

    expect(estado.vencedor).toBe('computador');

    const aposFim = realizarAtaqueJogador(estado, 0);
    expect(aposFim.sucesso).toBe(false);
    if (!aposFim.sucesso) {
      expect(aposFim.erro).toBe('partida-encerrada');
    }
  });

  it('inicia uma nova partida em preparação com tabuleiros e históricos limpos', () => {
    const encerrada = destruirFrotaDoComputador(estadoIniciado());
    const resultado = novaPartida(encerrada);

    expect(resultado.sucesso).toBe(true);
    if (!resultado.sucesso) {
      return;
    }

    const nova = resultado.valor;
    expect(nova.fase).toBe('preparacao');
    expect(totalPosicoesOcupadas(nova.jogador.frota)).toBe(0);
    expect(nova.jogador.tabuleiro.celulas.every((celula) => !celula.ocupada)).toBe(true);

    const inicioSemPreparacao = iniciarBatalha(nova, sorteioComSemente(1));
    expect(inicioSemPreparacao.sucesso).toBe(false);
    if (!inicioSemPreparacao.sucesso) {
      expect(inicioSemPreparacao.erro).toBe('frota-incompleta');
    }
  });

  it('rejeita nova partida antes do encerramento', () => {
    const resultado = novaPartida(estadoIniciado());

    expect(resultado.sucesso).toBe(false);
    if (!resultado.sucesso) {
      expect(resultado.erro).toBe('fase-invalida');
    }
  });
});
