import { AttemptStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class DashboardRepository {
  // retorna as respostas submetidas de uma escola específica,
  // incluindo se a resposta está correta,
  // o assunto da questão e o ID do aluno que respondeu.
  async findSubmittedAnswersBySchoolId(schoolId: string) {
    return prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          status: AttemptStatus.SUBMITTED,
          mockExam: { student: { schoolId } },
        },
      },
      select: {
        isCorrect: true,
        question: {
          select: { subject: true },
        },
        attempt: {
          select: {
            mockExam: { select: { studentId: true } },
          },
        },
      },
    });
  }

  // Retorna o perfil do aluno pelo ID do usuário
  async findStudentByUserId(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        points: true,
        schoolId: true,
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

  async findStudentsForRanking() {
    return prisma.studentProfile.findMany({
      select: {
        id: true,
        schoolId: true,
        mockExams: {
          select: {
            attempts: {
              where: {
                status: AttemptStatus.SUBMITTED,
              },
              select: {
                answers: {
                  select: {
                    isCorrect: true,
                    selectedAlternativeId: true,
                    question: {
                      select: {
                        difficulty: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
