/**
 * Tipos da resposta do endpoint GET /dashboard/me/desempenho-areas.
 *
 * O backend e a fonte unica do mapa materia -> area do ENEM: o frontend apenas
 * consome o resultado ja agregado. Sempre retorna as 4 areas (area sem
 * respostas vem zerada) e, em cada uma, as 3 faixas de dificuldade.
 */

export type FaixaDificuldade = 'Fáceis' | 'Médias' | 'Difíceis';

export interface DesempenhoPorDificuldade {
  /** Faixa de dificuldade (Fáceis = difficulty 0 e 1, Médias = 2, Difíceis = 3). */
  nivel: FaixaDificuldade;
  /** Taxa de acerto da faixa, 0..100 (inteiro). */
  taxaAcerto: number;
}

export interface DesempenhoArea {
  /** Nome da area do ENEM. */
  area: string;
  /** Total de questoes respondidas na area. */
  questoesResolvidas: number;
  /** Taxa de acerto geral da area, 0..100 (inteiro). */
  taxaAcerto: number;
  /** Taxa de acerto por faixa de dificuldade. */
  porDificuldade: DesempenhoPorDificuldade[];
}

export interface RespostaDesempenhoAreas {
  areas: DesempenhoArea[];
}