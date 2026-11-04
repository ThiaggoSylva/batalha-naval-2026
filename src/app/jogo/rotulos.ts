import { CodigoErro, Orientacao, ResultadoAtaque, TipoEmbarcacao } from '../dominio';

export const NOMES_EMBARCACAO: Record<TipoEmbarcacao, string> = {
  'porta-avioes': 'Porta-aviões',
  encouracado: 'Encouraçado',
  cruzador: 'Cruzador',
  submarino: 'Submarino',
  destroyer: 'Destroyer',
};

export const DESCRICOES_RESULTADO: Record<ResultadoAtaque, string> = {
  agua: 'Água',
  acerto: 'Acerto',
  'embarcacao-destruida': 'Embarcação destruída',
};

export const NOMES_ORIENTACAO: Record<Orientacao, string> = {
  horizontal: 'Horizontal',
  vertical: 'Vertical',
};

export const MENSAGENS_ERRO: Record<CodigoErro, string> = {
  'coordenada-invalida': 'Coordenada inválida. Use uma posição de A1 a J10.',
  'fora-do-tabuleiro': 'Essa posição fica fora do tabuleiro. Escolha outra posição ou orientação.',
  'posicionamento-invalido': 'A embarcação precisa ocupar posições consecutivas em linha reta.',
  'posicao-ocupada': 'Já existe uma embarcação nessa posição. Escolha outro lugar.',
  'embarcacao-nao-posicionada': 'Essa embarcação ainda não está posicionada.',
  'frota-incompleta': 'Posicione todas as embarcações antes de iniciar a batalha.',
  'fase-invalida': 'Essa ação não está disponível nesta fase da partida.',
  'ataque-repetido': 'Você já atacou essa coordenada. Escolha outra.',
  'partida-encerrada': 'A partida já terminou. Inicie uma nova partida.',
  'nao-e-o-turno': 'Aguarde: não é o seu turno.',
  'sem-coordenada-disponivel': 'Não há coordenadas disponíveis para atacar.',
};

export function mensagemDeErro(codigo: CodigoErro): string {
  return MENSAGENS_ERRO[codigo];
}

export function nomeEmbarcacao(tipo: TipoEmbarcacao): string {
  return NOMES_EMBARCACAO[tipo];
}

export function descreverAtaque(
  coordenada: string,
  resultado: ResultadoAtaque,
  tipoEmbarcacao?: TipoEmbarcacao,
): string {
  if (resultado === 'agua') {
    return `Água em ${coordenada}.`;
  }

  if (resultado === 'embarcacao-destruida') {
    return tipoEmbarcacao
      ? `Embarcação destruída em ${coordenada}: ${nomeEmbarcacao(tipoEmbarcacao)}.`
      : `Embarcação destruída em ${coordenada}.`;
  }

  return tipoEmbarcacao
    ? `Acerto em ${coordenada}: ${nomeEmbarcacao(tipoEmbarcacao)}.`
    : `Acerto em ${coordenada}.`;
}

export function resumirAtaque(resultado: ResultadoAtaque, tipoEmbarcacao?: TipoEmbarcacao): string {
  if (resultado === 'agua') {
    return DESCRICOES_RESULTADO.agua;
  }

  if (resultado === 'embarcacao-destruida') {
    return tipoEmbarcacao
      ? `Destruída: ${nomeEmbarcacao(tipoEmbarcacao)}`
      : DESCRICOES_RESULTADO['embarcacao-destruida'];
  }

  return tipoEmbarcacao ? `Acerto: ${nomeEmbarcacao(tipoEmbarcacao)}` : DESCRICOES_RESULTADO.acerto;
}
