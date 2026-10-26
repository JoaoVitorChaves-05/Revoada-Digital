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

    const [attempts, studentsWithMorePoints] = await Promise.all([
      this.dashboardRepository.findSubmittedAttemptsInPeriod(
        student.id,
        startDate,
        endDate,
      ),
      this.dashboardRepository.countStudentsWithMorePoints(
        student.points,
      ),
    ]);

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
      ranking_position: studentsWithMorePoints + 1,
      weekly_correct_answers: {
        total,
        daily,
      },
    };
  }
}

export const dashboardService = new DashboardService();