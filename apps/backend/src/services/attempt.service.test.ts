import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttemptRepository } from '../repositories/attempt.repository';
import { AttemptStatus } from '@prisma/client';
import { AttemptService } from './attempt.service';

vi.mock('../repositories/attempt.repository', () => ({
  AttemptRepository: class {},
}));

function createRepositoryMock() {
  return {
    findByUserId: vi.fn(),
    findById: vi.fn(),
    submitAttemptTransaction: vi.fn(),
  };
}

function attemptForSubmission() {
  return {
    status: AttemptStatus.IN_PROGRESS,
    mockExam: {
      studentId: 'student-1',
      questions: [
        {
          questionId: 'question-easy',
          question: {
            difficulty: 1,
            alternatives: [{ id: 'alternative-easy', isCorrect: true }],
          },
        },
        {
          questionId: 'question-medium',
          question: {
            difficulty: 2,
            alternatives: [{ id: 'alternative-medium', isCorrect: true }],
          },
        },
        {
          questionId: 'question-hard',
          question: {
            difficulty: 3,
            alternatives: [{ id: 'alternative-hard', isCorrect: true }],
          },
        },
        {
          questionId: 'question-wrong',
          question: {
            difficulty: 1,
            alternatives: [{ id: 'alternative-wrong', isCorrect: false }],
          },
        },
      ],
    },
  };
}

function answersForSubmission() {
  return [
    { questionId: 'question-easy', selectedAlternativeId: 'alternative-easy' },
    { questionId: 'question-medium', selectedAlternativeId: 'alternative-medium' },
    { questionId: 'question-hard', selectedAlternativeId: 'alternative-hard' },
    { questionId: 'question-wrong', selectedAlternativeId: 'alternative-wrong' },
  ];
}

describe('AttemptService', () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: AttemptService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new AttemptService(repository as unknown as AttemptRepository);
  });

  it('busca todas as tentativas do usuário', async () => {
    const attempts = [
      { id: 'tentativa-1', mockExamId: 'simulado-1' },
      { id: 'tentativa-2', mockExamId: 'simulado-2' },
    ];
    repository.findByUserId.mockResolvedValue(attempts);

    await expect(service.getUserAttempts('usuario-1')).resolves.toEqual(attempts);
    expect(repository.findByUserId).toHaveBeenCalledOnce();
    expect(repository.findByUserId).toHaveBeenCalledWith('usuario-1');
  });

  it('calcula os pontos das respostas enviadas e envia um único crédito à transação', async () => {
    repository.findById.mockResolvedValue(attemptForSubmission() as never);
    repository.submitAttemptTransaction.mockResolvedValue({
      earnedPoints: 6,
      coinsCredited: true,
    } as never);

    await service.submitAttempt('attempt-1', {
      answers: answersForSubmission(),
    });

    expect(repository.submitAttemptTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        correctAnswers: 3,
        earnedPoints: 6,
        coinsCredited: true,
        answers: [
          expect.objectContaining({ questionId: 'question-easy', isCorrect: true }),
          expect.objectContaining({ questionId: 'question-medium', isCorrect: true }),
          expect.objectContaining({ questionId: 'question-hard', isCorrect: true }),
          expect.objectContaining({ questionId: 'question-wrong', isCorrect: false }),
        ],
      }),
    );
  });

  it('não credita pontos quando o aluno escolhe não creditar', async () => {
    repository.findById.mockResolvedValue(attemptForSubmission() as never);
    repository.submitAttemptTransaction.mockResolvedValue({
      earnedPoints: 0,
      coinsCredited: false,
    } as never);

    await service.submitAttempt('attempt-1', {
      answers: answersForSubmission(),
      creditarCoins: false,
    });

    expect(repository.submitAttemptTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        earnedPoints: 0,
        coinsCredited: false,
      }),
    );
  });
});
