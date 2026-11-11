import { DashboardRepository } from '../repositories/dashboard.repository';
import { SchoolRepository } from '../repositories/school.repository';

type ClassPerformance = {
  subject: string;
  students: number;
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
};

export class SchoolNotFoundError extends Error {
  constructor() {
    super('Escola não encontrada');
    this.name = 'SchoolNotFoundError';
  }
}

export class StudentNotFoundError extends Error {
  constructor() {
    super('Perfil de aluno não encontrado');
    this.name = 'StudentNotFoundError';
  }
}

const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Áreas do ENEM na ordem em que devem ser retornadas. O backend é a fonte
// única do mapa matéria -> área; o frontend apenas consome o resultado.
export const AREAS_ENEM = [
  'Linguagens',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Matemática',
] as const;

export type AreaEnem = (typeof AREAS_ENEM)[number];

// Mapa matéria -> área do ENEM. Uma questão interdisciplinar (subject com
// mais de um item) contribui para cada área correspondente.
const SUBJECT_TO_AREA: Record<string, AreaEnem> = {
  'Língua Portuguesa': 'Linguagens',
  Literatura: 'Linguagens',
  Inglês: 'Linguagens',
  Espanhol: 'Linguagens',
  Artes: 'Linguagens',
  'Educação Física': 'Linguagens',
  História: 'Ciências Humanas',
  Geografia: 'Ciências Humanas',
  Filosofia: 'Ciências Humanas',
  Sociologia: 'Ciências Humanas',
  Biologia: 'Ciências da Natureza',
  Química: 'Ciências da Natureza',
  Física: 'Ciências da Natureza',
  Matemática: 'Matemática',
};

// Faixas de dificuldade exibidas, na ordem fixa de apresentação.
export const FAIXAS_DIFICULDADE = ['Fáceis', 'Médias', 'Difíceis'] as const;

export type FaixaDificuldade = (typeof FAIXAS_DIFICULDADE)[number];

// Mapa difficulty (0..3 no banco) -> faixa exibida.
// 0 e 1 = Fáceis, 2 = Médias, 3 = Difíceis.
function faixaDaDificuldade(difficulty: number): FaixaDificuldade | null {
  if (difficulty === 0 || difficulty === 1) {
    return 'Fáceis';
  }
  if (difficulty === 2) {
    return 'Médias';
  }
  if (difficulty === 3) {
    return 'Difíceis';
  }
  return null;
}

export type DesempenhoPorDificuldade = {
  nivel: FaixaDificuldade;
  taxaAcerto: number;
};

export type DesempenhoArea = {
  area: AreaEnem;
  questoesResolvidas: number;
  taxaAcerto: number;
  porDificuldade: DesempenhoPorDificuldade[];
};

// Resposta do aluno enriquecida com os dados da questão, como vem do
// repository. isCorrect pode ser null (questão não respondida/sem gabarito);
// null conta como não-acerto.
export type AnswerComQuestao = {
  isCorrect: boolean | null;
  question: {
    subject: string[];
    difficulty: number;
  };
};

type Contagem = { total: number; acertos: number };

function novaContagem(): Contagem {
  return { total: 0, acertos: 0 };
}

function taxa(contagem: Contagem): number {
  if (contagem.total === 0) {
    return 0;
  }
  return Math.round((contagem.acertos / contagem.total) * 100);
}

// Função pura: agrega as respostas do aluno por área do ENEM.
// Sempre retorna as 4 áreas, na ordem de AREAS_ENEM; uma área sem respostas
// vem zerada. Cada área traz as 3 faixas de dificuldade, também zeradas quando
// não houver respostas naquela faixa.
export function agregarPorArea(
  answers: AnswerComQuestao[],
): DesempenhoArea[] {
  const porArea = new Map<
    AreaEnem,
    { geral: Contagem; porFaixa: Map<FaixaDificuldade, Contagem> }
  >();

  for (const area of AREAS_ENEM) {
    porArea.set(area, {
      geral: novaContagem(),
      porFaixa: new Map(
        FAIXAS_DIFICULDADE.map((faixa) => [faixa, novaContagem()]),
      ),
    });
  }

  for (const answer of answers) {
    const acertou = answer.isCorrect === true;
    const faixa = faixaDaDificuldade(answer.question.difficulty);

    // Uma questão interdisciplinar conta para cada área à qual pertence.
    const areasDaQuestao = new Set<AreaEnem>();
    for (const subject of answer.question.subject) {
      const area = SUBJECT_TO_AREA[subject];
      if (area) {
        areasDaQuestao.add(area);
      }
    }

    for (const area of areasDaQuestao) {
      const registro = porArea.get(area)!;
      registro.geral.total += 1;
      if (acertou) {
        registro.geral.acertos += 1;
      }

      if (faixa) {
        const contagemFaixa = registro.porFaixa.get(faixa)!;
        contagemFaixa.total += 1;
        if (acertou) {
          contagemFaixa.acertos += 1;
        }
      }
    }
  }

  return AREAS_ENEM.map((area) => {
    const registro = porArea.get(area)!;
    return {
      area,
      questoesResolvidas: registro.geral.total,
      taxaAcerto: taxa(registro.geral),
      porDificuldade: FAIXAS_DIFICULDADE.map((nivel) => ({
        nivel,
        taxaAcerto: taxa(registro.porFaixa.get(nivel)!),
      })),
    };
  });
}

export class DashboardService {
  constructor(
    private readonly dashboardRepository = new DashboardRepository(),
    private readonly schoolRepository = new SchoolRepository(),
  ) {}

  async getClassPerformance(schoolId: string): Promise<ClassPerformance[]> {
    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new SchoolNotFoundError();
    }

    const answers =
      await this.dashboardRepository.findSubmittedAnswersBySchoolId(
        schoolId,
      );

    const performanceBySubject = new Map<
      string,
      Omit<ClassPerformance, 'students' | 'accuracy'> & {
        studentIds: Set<string>;
      }
    >();

    for (const answer of answers) {
      const studentId = answer.attempt.mockExam.studentId;
      // subject agora e uma lista (String[]): uma questao pode pertencer a
      // mais de uma materia, entao ela contribui para cada uma delas.
      const subjects = answer.question.subject;

      for (const subject of subjects) {
        const performance =
          performanceBySubject.get(subject) ?? {
            subject,
            totalAnswers: 0,
            correctAnswers: 0,
            studentIds: new Set<string>(),
          };

        performance.totalAnswers += 1;
        if (answer.isCorrect) {
          performance.correctAnswers += 1;
        }
        performance.studentIds.add(studentId);

        performanceBySubject.set(subject, performance);
      }
    }

    return Array.from(performanceBySubject.values())
      .map(({ studentIds, ...performance }) => ({
        ...performance,
        students: studentIds.size,
        accuracy:
          Math.round(
            (performance.correctAnswers /
              performance.totalAnswers) *
              10000,
          ) / 100,
      }))
      .sort((a, b) =>
        a.subject.localeCompare(b.subject, 'pt-BR'),
      );
  }

  // Saldo de coins (Learn-to-Earn) do aluno. Resolve pelo userId e retorna o
  // StudentProfile.points. Fonte unica do saldo exibido no header/home e na loja.
  async getCoins(userId: string): Promise<{ coins: number }> {
    const student =
      await this.dashboardRepository.findStudentByUserId(userId);

    if (!student) {
      throw new StudentNotFoundError();
    }

    return { coins: student.points };
  }

  async getMyDashboard(userId: string) {
    const student =
      await this.dashboardRepository.findStudentByUserId(userId);

    if (!student) {
      throw new Error('Perfil de aluno não encontrado');
    }

    // Desloca o instante para obter a data de Brasília usando métodos UTC
    const now = new Date();
    const brasiliaNow = new Date(
      now.getTime() - BRASILIA_OFFSET_MS,
    );

    const today = Date.UTC(
      brasiliaNow.getUTCFullYear(),
      brasiliaNow.getUTCMonth(),
      brasiliaNow.getUTCDate(),
    );

    //getUTCDay(): domingo = 0, segunda = 1 ...
    const daysSinceMonday = (brasiliaNow.getUTCDay() + 6) % 7;
    const monday = today - daysSinceMonday * DAY_MS;

    // Segunda, 00h em Brasília, corresponde a segunda, 03h UTC
    const startDate = new Date(monday + BRASILIA_OFFSET_MS);
    const endDate = new Date(startDate.getTime() + 7 * DAY_MS);

    const [attempts, studentsForRanking] = await Promise.all([
      this.dashboardRepository.findSubmittedAttemptsInPeriod(
        student.id,
        startDate,
        endDate,
      ),
      this.dashboardRepository.findStudentsForRanking(),
    ]);

    const ranking = studentsForRanking.map((rankedStudent) => {
      let totalScore = 0;
      let correctAnswers = 0;
      let answeredQuestions = 0;

      for (const mockExam of rankedStudent.mockExams) {
        for (const attempt of mockExam.attempts) {
          for (const answer of attempt.answers) {
            if (answer.selectedAlternativeId === null) {
              continue;
            }

            answeredQuestions++;

            if (answer.isCorrect === true) {
              correctAnswers++;
              totalScore += answer.question.difficulty;
            }
          }
        }
      }

      return {
        studentId: rankedStudent.id,
        schoolId: rankedStudent.schoolId,
        totalScore,
        correctAnswers,
        answeredQuestions,
      };
    });

    const currentStudentRanking = ranking.find(
      (entry) => entry.studentId === student.id,
    );

    if (!currentStudentRanking) {
      throw new Error('Perfil de aluno não encontrado');
    }

    const isAhead = (other: (typeof ranking)[number]) => {
      if (other.totalScore !== currentStudentRanking.totalScore) {
        return other.totalScore > currentStudentRanking.totalScore;
      }

      // Compara as taxas de acertos, evitando divisão por zero
      const otherTotal = other.answeredQuestions || 1;
      const currentTotal =
        currentStudentRanking.answeredQuestions || 1;

      return (
        other.correctAnswers * currentTotal >
        currentStudentRanking.correctAnswers * otherTotal
      );
    };

    const globalPosition = ranking.filter(isAhead).length + 1;

    const schoolPosition =
      ranking.filter(
        (entry) =>
          entry.schoolId === student.schoolId &&
          isAhead(entry),
      ).length + 1;

    const daily = Array.from({ length: 7 }, (_, index) => ({
      date: new Date(monday + index * DAY_MS)
        .toISOString()
        .slice(0, 10),
      correct_answers: 0,
    }));

    for (const attempt of attempts) {
      if (!attempt.submittedAt) {
        continue;
      }

      const dayIndex = Math.floor(
        (attempt.submittedAt.getTime() - startDate.getTime()) /
          DAY_MS,
      );

      const day = daily[dayIndex];

      if (day) {
        day.correct_answers += attempt.correctAnswers ?? 0;
      }
    }

    const total = daily.reduce(
      (sum, day) => sum + day.correct_answers,
      0,
    );

    return {
      coins: student.points,
      ranking_position: globalPosition,
      ranking_positions: {
        school: schoolPosition,
        global: globalPosition,
      },
      weekly_correct_answers: {
        total,
        daily,
      },
    };
  }
}

export const dashboardService = new DashboardService();