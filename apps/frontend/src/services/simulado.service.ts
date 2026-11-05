import { api } from './api';

// Tipos do fluxo de simulado (alinhados ao backend).
export interface AlternativaApi {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
}

export interface QuestaoApi {
  id: string;
  text: string;
  // subject/concept sao listas no backend (uma questao pode ser multi-materia).
  subject: string[];
  concept: string[];
  alternatives: AlternativaApi[];
}

export interface MockExamQuestionApi {
  position: number;
  question: QuestaoApi;
}

export interface AttemptApi {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
  mockExam: {
    id: string;
    name: string;
    questions: MockExamQuestionApi[];
  };
}

export interface RespostaSubmit {
  questionId: string;
  selectedAlternativeId: string | null;
}

export interface HistoricoItem {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
  score: number | null;
  correctAnswers: number | null;
  totalQuestions: number | null;
  earnedPoints: number | null;
  submittedAt: string | null;
  mockExam: { id: string; name: string };
}

class SimuladoService {
  // Descobre o studentId (StudentProfile) a partir do userId logado.
  async getStudentId(userId: string): Promise<string | null> {
    const resp = await api.get(`/users/${userId}`);
    return resp.data?.studentProfile?.id ?? null;
  }

  // Lista conceitos distintos de uma materia (extraidos das questoes do banco).
  // O backend nao filtra por subject, entao buscamos um lote grande e filtramos no cliente.
  async listarConceitos(subject: string): Promise<string[]> {
    const resp = await api.get('/questions', { params: { page: 1, limit: 1000 } });
    const corpo = resp.data;
    // subject/concept sao arrays (String[]): a questao entra se a lista de
    // materias contiver a materia pedida; os conceitos sao achatados numa lista.
    const questoes = (Array.isArray(corpo) ? corpo : corpo?.data ?? []) as Array<{
      subject?: string[];
      concept?: string[];
    }>;
    const conceitos = questoes
      .filter((q) => Array.isArray(q.subject) && q.subject.includes(subject))
      .flatMap((q) => (Array.isArray(q.concept) ? q.concept : []));
    return Array.from(new Set(conceitos)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  // Gera um simulado por materia + conceito (backend gera 8 questoes).
  async gerar(studentId: string, subject: string, concept: string) {
    const resp = await api.post('/simulados/generate', { studentId, subject, concept });
    return resp.data as { id: string };
  }

  // Cria uma tentativa a partir do mockExamId.
  async criarTentativa(mockExamId: string) {
    const resp = await api.post('/attempts', { mockExamId });
    return resp.data as { id: string };
  }

  // Busca a tentativa com as questoes para responder.
  async getTentativa(attemptId: string): Promise<AttemptApi> {
    const resp = await api.get(`/attempts/${attemptId}`);
    return resp.data as AttemptApi;
  }

  // Historico de tentativas do aluno (pelo userId do usuario logado).
  async listarHistorico(userId: string): Promise<HistoricoItem[]> {
    const resp = await api.get('/attempts', { params: { userId } });
    const corpo = resp.data;
    return (Array.isArray(corpo) ? corpo : corpo?.data ?? []) as HistoricoItem[];
  }

  // Submete as respostas e recebe o resultado (score, acertos, pontos).
  async submeter(attemptId: string, answers: RespostaSubmit[]) {
    const resp = await api.post(`/attempts/${attemptId}/submit`, { answers });
    return resp.data;
  }
}

export const simuladoService = new SimuladoService();