// Tipos do Learn-to-Earn (espelham as tabelas rewards/redemptions - CHA-42).
// Nesta fase a tela usa dados mock; quando os endpoints (CHA-97) existirem,
// basta trocar a origem dos dados mantendo estes tipos.

export type CategoriaRecompensa = 'Estudos' | 'Digital' | 'Experiências' | 'Produtos';

export interface Recompensa {
  id: string;
  nome: string;
  descricao: string;
  custo: number; // em pontos
  categoria: CategoriaRecompensa;
  // Disponibilidade: numero de unidades, ou null para "ilimitado".
  disponiveis: number | null;
  // Observacao extra exibida no card (ex.: "Download imediato").
  etiqueta?: string;
}

export interface Resgate {
  id: string;
  recompensaNome: string;
  categoria: CategoriaRecompensa;
  pontosGastos: number;
  data: string; // ISO
  status: 'Solicitado' | 'Entregue';
}