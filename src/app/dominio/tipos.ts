export type Participante = 'jogador' | 'computador';

export type FasePartida = 'preparacao' | 'em-andamento' | 'encerrada';

export type TipoEmbarcacao =
  'porta-avioes' | 'encouracado' | 'cruzador' | 'submarino' | 'destroyer';

export type Orientacao = 'horizontal' | 'vertical';

export type CodigoErro =
  | 'coordenada-invalida'
  | 'fora-do-tabuleiro'
  | 'posicionamento-invalido'
  | 'posicao-ocupada'
  | 'embarcacao-nao-posicionada'
  | 'frota-incompleta'
  | 'fase-invalida'
  | 'ataque-repetido'
  | 'partida-encerrada'
  | 'nao-e-o-turno'
  | 'sem-coordenada-disponivel';

export type Resultado<T> =
  | { readonly sucesso: true; readonly valor: T }
  | { readonly sucesso: false; readonly erro: CodigoErro };

export function sucesso<T>(valor: T): Resultado<T> {
  return { sucesso: true, valor };
}

export function falha<T = never>(erro: CodigoErro): Resultado<T> {
  return { sucesso: false, erro };
}
