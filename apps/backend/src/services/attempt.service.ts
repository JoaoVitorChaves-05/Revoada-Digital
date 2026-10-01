import { AttemptRepository } from '../repositories/attempt.repository';
import { CreateAttemptInput, SubmitAttemptInput } from '../schemas/attempt.schema';
import { AttemptStatus } from '@prisma/client';

export class AttemptService {
  constructor(private readonly attemptRepository = new AttemptRepository()) {}

  async createAttempt(data: CreateAttemptInput) {
    return this.attemptRepository.create(data.mockExamId);
  }

  async readAttempt(id: string) {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new Error('Tentativa não encontrada');
    }
    return attempt;
  }

  async submitAttempt(attemptId: string, data: SubmitAttemptInput) {
    const attempt = await this.attemptRepository.findById(attemptId);

    if (!attempt) {
      throw new Error('Tentativa não encontrada.');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new Error('Esta tentativa já foi finalizada ou cancelada.');
    }

    const mockQuestions = attempt.mockExam.questions;
    const totalQuestions = mockQuestions.length;

    if (totalQuestions === 0) {
      throw new Error('O simulado associado não possui questões vinculadas.');
    }

    let correctAnswersCount = 0;
    let totalEarnedPoints = 0;

    // Processamento e validação de cada resposta recebida
    const processedAnswers = data.answers.map((answerInput) => {
      const mockQuestion = mockQuestions.find((mq) => mq.questionId === answerInput.questionId);

      if (!mockQuestion) {
        throw new Error(`A questão ${answerInput.questionId} não faz parte deste simulado.`);
      }

      const questionData = mockQuestion.question;
      const selectedAlternative = questionData.alternatives.find(
        (alt) => alt.id === answerInput.selectedAlternativeId
      );

      const isCorrect = selectedAlternative ? selectedAlternative.isCorrect : false;

      if (isCorrect) {
        correctAnswersCount++;
        // Exemplo de cálculo de pontos baseado no nível de dificuldade da questão (ex: dificuldade * 10)
        totalEarnedPoints += (questionData.difficulty || 1) * 10;
      }

      return {
        questionId: answerInput.questionId,
        selectedAlternativeId: answerInput.selectedAlternativeId,
        isCorrect,
      };
    });

    // Cálculo da nota final em porcentagem (0 - 100)
    const score = Math.round((correctAnswersCount / totalQuestions) * 100);

    // Execução da transação de salvamento e atribuição dos pontos
    return this.attemptRepository.submitAttemptTransaction({
      attemptId,
      studentId: attempt.mockExam.studentId,
      score,
      correctAnswers: correctAnswersCount,
      totalQuestions,
      earnedPoints: totalEarnedPoints,
      answers: processedAnswers,
    });
  }

  async deleteAttempt(id: string) {
    const attempt = await this.attemptRepository.findById(id);
    if (!attempt) {
      throw new Error('Tentativa não encontrada');
    }
    return this.attemptRepository.delete(id);
  }
}

export const attemptService = new AttemptService();