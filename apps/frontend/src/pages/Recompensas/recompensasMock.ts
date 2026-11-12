import type { Recompensa, Resgate } from './recompensa.types';

// Dados mock da Loja de Recompensas (CHA-43). Substituir por fetch quando os
// endpoints de recompensas (CHA-97) estiverem disponiveis.
export const RECOMPENSAS_MOCK: Recompensa[] = [
  {
    id: 'r1',
    nome: 'Correção de redação extra',
    descricao: 'Receba uma análise detalhada e dê o próximo passo na sua escrita.',
    custo: 500,
    categoria: 'Estudos',
    disponiveis: null,
    etiqueta: 'Ilimitado',
  },
  {
    id: 'r2',
    nome: 'Planner de estudos digital',
    descricao: 'Organize suas metas e planeje uma rotina de estudos do seu jeito.',
    custo: 300,
    categoria: 'Digital',
    disponiveis: null,
    etiqueta: 'Download imediato',
  },
  {
    id: 'r3',
    nome: 'Mentoria individual · 30 min',
    descricao: 'Converse com um especialista e trace sua estratégia de aprovação.',
    custo: 1000,
    categoria: 'Experiências',
    disponiveis: 8,
  },
  {
    id: 'r4',
    nome: 'Kit de papelaria Revoada',
    descricao: 'Um caderno, uma caneta e marcadores para acompanhar sua jornada.',
    custo: 1500,
    categoria: 'Produtos',
    disponiveis: 15,
  },
  {
    id: 'r5',
    nome: 'Aula de revisão exclusiva',
    descricao: 'Revise os principais temas do ENEM em uma aula especial ao vivo.',
    custo: 800,
    categoria: 'Estudos',
    disponiveis: 30,
  },
  {
    id: 'r6',
    nome: 'Vale-livro de R$ 50',
    descricao: 'Escolha uma nova leitura e continue ampliando seus horizontes.',
    custo: 2000,
    categoria: 'Produtos',
    disponiveis: 0, // esgotado
  },
];

export const RESGATES_MOCK: Resgate[] = [
  {
    id: 'rg1',
    recompensaNome: 'Planner de estudos digital',
    categoria: 'Digital',
    pontosGastos: 300,
    data: '2026-10-28T14:20:00.000Z',
    status: 'Entregue',
  },
  {
    id: 'rg2',
    recompensaNome: 'Correção de redação extra',
    categoria: 'Estudos',
    pontosGastos: 500,
    data: '2026-11-02T09:10:00.000Z',
    status: 'Solicitado',
  },
];