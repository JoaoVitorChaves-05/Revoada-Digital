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

const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

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
      const subject = answer.question.subject;
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
