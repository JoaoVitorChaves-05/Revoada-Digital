import { prisma } from '../lib/prisma';
import { AttemptStatus } from '@prisma/client';

export class AttemptRepository {
  async create(mockExamId: string) {
    return prisma.attempt.create({
      data: {
        mockExamId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });
  }

  async findById(id: string) {
    return prisma.attempt.findUnique({
      where: { id },
      include: {
        answers: true,
        mockExam: {
          include: {
            student: true,
            questions: {
              include: {
                question: {
                  include: {
                    alternatives: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Executa a entrega da avaliação dentro de uma transação:
   * 1. Registra as respostas individuais em AttemptAnswer.
   * 2. Atualiza o status do Attempt para SUBMITTED com nota e estatísticas.
   * 3. Atualiza os pontos (Learn-to-Earn) do StudentProfile.
   */
  async submitAttemptTransaction(data: {
    attemptId: string;
    studentId: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    earnedPoints: number;
    answers: {
      questionId: string;
      selectedAlternativeId?: string | null;
      isCorrect: boolean;
    }[];
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Gravar as respostas do aluno
      await tx.attemptAnswer.createMany({
        data: data.answers.map((ans) => ({
          attemptId: data.attemptId,
          questionId: ans.questionId,
          selectedAlternativeId: ans.selectedAlternativeId || null,
          isCorrect: ans.isCorrect,
          answeredAt: new Date(),
        })),
      });

      // 2. Atualizar o registro da tentativa
      const updatedAttempt = await tx.attempt.update({
        where: { id: data.attemptId },
        data: {
          status: AttemptStatus.SUBMITTED,
          submittedAt: new Date(),
          score: data.score,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          earnedPoints: data.earnedPoints,
        },
      });

      // 3. Incrementar pontos do Learn-to-Earn do aluno
      if (data.earnedPoints > 0) {
        await tx.studentProfile.update({
          where: { id: data.studentId },
          data: {
            points: {
              increment: data.earnedPoints,
            },
          },
        });
      }

      return updatedAttempt;
    });
  }

  async delete(id: string) {
    return prisma.attempt.delete({ where: { id } });
  }
}