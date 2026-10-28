import { DashboardRepository } from '../repositories/dashboard.repository';

const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export class DashboardService {
  constructor(
    private readonly dashboardRepository = new DashboardRepository(),
  ) {}

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
      this.dashboardRepository.findStudentsForRanking()
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

    const globalPosition =
      ranking.filter(isAhead).length + 1;

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