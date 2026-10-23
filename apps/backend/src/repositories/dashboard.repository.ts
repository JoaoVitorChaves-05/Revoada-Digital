import { AttemptStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class DashboardRepository {
  // Retorna o perfil do aluno pelo ID do usuário
  async findStudentByUserId(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        points: true,
      },
    });
  }

  // Retorna todas as tentativas submetidas de um aluno em um período específico
  async findSubmittedAttemptsInPeriod(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return prisma.attempt.findMany({
      where: {
        status: AttemptStatus.SUBMITTED,
        mockExam: {
          studentId,
        },
        submittedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        submittedAt: true,
        correctAnswers: true,
      },
    });
  }

    // Conta quantos alunos possuem mais pontos 
  async countStudentsWithMorePoints(points: number) {
    return prisma.studentProfile.count({
      where: {
        points: {
          gt: points,
        },
      },
    });
  }
}