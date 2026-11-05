export interface DiaFrequencia {
  /** Data do dia (meia-noite local), identificando o bucket. */
  data: string; // ISO date (YYYY-MM-DD)
  /** Rotulo curto p/ eixo (ex: "seg"). */
  rotulo: string;
  /** Houve ao menos uma answer nesse dia. */
  estudou: boolean;
  /** Marca a barra do dia atual (R11.3). */
  ehHoje: boolean;
}

export interface MetricasDashboard {
  questoesResolvidas: number; // R5.2
  taxaAcerto: number | null; // 0..100, null => Estado_Vazio (R6.3)
  streakDias: number; // R8.3
  frequencia7Dias: DiaFrequencia[]; // length 7 (R11.2)
  diasComEstudo: number; // 0..7, resumo "X de 7" (R11.4)
}
