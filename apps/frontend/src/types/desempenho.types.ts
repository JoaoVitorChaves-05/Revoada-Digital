// Contrato de dados do Painel Individual do Aluno (CHA-30).
// Define o shape esperado da resposta do endpoint GET /dashboard/me/defasagem.
// A implementacao do endpoint NAO faz parte desta spec (frontend puro por contrato).

// Niveis de defasagem de um conteudo. Fonte unica da uniao literal.
export type NivelDefasagem = 'baixa' | 'média' | 'alta';

// Um conteudo/conceito dentro de uma materia, no mapa de defasagem.
export interface Conteudo {
  nome: string;
  percentualAcerto: number; // 0..100
  nivel: NivelDefasagem;
}

// Desempenho agregado de uma materia + seu mapa de defasagem por conteudo.
export interface DesempenhoPorMateria {
  materia: string;
  totalQuestoes: number;
  acertos: number;
  percentualAcerto: number; // 0..100
  mapaDefasagem: Conteudo[];
}

// Resposta completa do endpoint de defasagem.
export interface RespostaDefasagem {
  materias: DesempenhoPorMateria[];
}