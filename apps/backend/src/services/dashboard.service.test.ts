import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { DashboardRepository } from '../repositories/dashboard.repository';
import { DashboardService } from './dashboard.service';

// Evita carregar o repository real e sua conexão com o Prisma.
vi.mock('../repositories/dashboard.repository', () => ({
  DashboardRepository: vi.fn(),
}));

const repositoryMock = {
  findStudentByUserId:
    vi.fn<DashboardRepository['findStudentByUserId']>(),

  findSubmittedAttemptsInPeriod:
    vi.fn<DashboardRepository['findSubmittedAttemptsInPeriod']>(),

  countStudentsWithMorePoints:
    vi.fn<DashboardRepository['countStudentsWithMorePoints']>(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });

    // Quarta-feira, 28/10/2026, às 12h em Brasília.
    vi.setSystemTime(new Date('2026-10-28T15:00:00.000Z'));

    repositoryMock.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 100,
    });

    repositoryMock.findSubmittedAttemptsInPeriod
      .mockResolvedValue([]);

    repositoryMock.countStudentsWithMorePoints
      .mockResolvedValue(0);

    service = new DashboardService(repositoryMock);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna coins, posição no ranking e acertos da semana', async () => {
    repositoryMock.findSubmittedAttemptsInPeriod
      .mockResolvedValue([
        {
          submittedAt: new Date('2026-10-26T13:00:00.000Z'),
          correctAnswers: 4,
        },
        {
          submittedAt: new Date('2026-10-27T13:00:00.000Z'),
          correctAnswers: 3,
        },
        {
          submittedAt: new Date('2026-10-27T18:00:00.000Z'),
          correctAnswers: 2,
        },
      ]);

    repositoryMock.countStudentsWithMorePoints
      .mockResolvedValue(3);

    const result = await service.getMyDashboard('user-1');

    expect(result).toEqual({
      coins: 100,
      ranking_position: 4,
      weekly_correct_answers: {
        total: 9,
        daily: [
          { date: '2026-10-26', correct_answers: 4 },
          { date: '2026-10-27', correct_answers: 5 },
          { date: '2026-10-28', correct_answers: 0 },
          { date: '2026-10-29', correct_answers: 0 },
          { date: '2026-10-30', correct_answers: 0 },
          { date: '2026-10-31', correct_answers: 0 },
          { date: '2026-11-01', correct_answers: 0 },
        ],
      },
    });

    expect(repositoryMock.findStudentByUserId)
      .toHaveBeenCalledWith('user-1');

    expect(repositoryMock.findSubmittedAttemptsInPeriod)
      .toHaveBeenCalledWith(
        'student-1',
        new Date('2026-10-26T03:00:00.000Z'),
        new Date('2026-11-02T03:00:00.000Z'),
      );

    expect(repositoryMock.countStudentsWithMorePoints)
      .toHaveBeenCalledWith(100);
  });

  it('retorna sete dias zerados quando não existem tentativas', async () => {
    const result = await service.getMyDashboard('user-1');

    expect(result.weekly_correct_answers.total).toBe(0);
    expect(result.weekly_correct_answers.daily).toHaveLength(7);

    expect(
      result.weekly_correct_answers.daily.every(
        (day) => day.correct_answers === 0,
      ),
    ).toBe(true);

    expect(result.ranking_position).toBe(1);
  });

  it('rejeita usuário sem perfil de aluno', async () => {
    repositoryMock.findStudentByUserId.mockResolvedValue(null);

    await expect(
      service.getMyDashboard('user-1'),
    ).rejects.toThrow('Perfil de aluno não encontrado');

    expect(repositoryMock.findSubmittedAttemptsInPeriod)
      .not.toHaveBeenCalled();

    expect(repositoryMock.countStudentsWithMorePoints)
      .not.toHaveBeenCalled();
  });

  it('agrupa os acertos pelo dia de Brasília', async () => {
    repositoryMock.findSubmittedAttemptsInPeriod
      .mockResolvedValue([
        {
          // Em Brasília, ainda é segunda-feira, às 23h59.
          submittedAt: new Date('2026-10-27T02:59:00.000Z'),
          correctAnswers: 2,
        },
        {
          // Em Brasília, já é terça-feira, às 00h.
          submittedAt: new Date('2026-10-27T03:00:00.000Z'),
          correctAnswers: 3,
        },
      ]);

    const result = await service.getMyDashboard('user-1');

    expect(result.weekly_correct_answers.daily[0])
      .toEqual({
        date: '2026-10-26',
        correct_answers: 2,
      });

    expect(result.weekly_correct_answers.daily[1])
      .toEqual({
        date: '2026-10-27',
        correct_answers: 3,
      });

    expect(result.weekly_correct_answers.total).toBe(5);
  });

  it('mantém a semana anterior enquanto ainda é domingo em Brasília', async () => {
    // Segunda em UTC, mas domingo às 23h59 em Brasília.
    vi.setSystemTime(
      new Date('2026-11-02T02:59:00.000Z'),
    );

    await service.getMyDashboard('user-1');

    expect(repositoryMock.findSubmittedAttemptsInPeriod)
      .toHaveBeenCalledWith(
        'student-1',
        new Date('2026-10-26T03:00:00.000Z'),
        new Date('2026-11-02T03:00:00.000Z'),
      );
  });

  it('inicia uma nova semana à meia-noite de segunda em Brasília', async () => {
    vi.setSystemTime(
      new Date('2026-11-02T03:00:00.000Z'),
    );

    const result = await service.getMyDashboard('user-1');

    expect(repositoryMock.findSubmittedAttemptsInPeriod)
      .toHaveBeenCalledWith(
        'student-1',
        new Date('2026-11-02T03:00:00.000Z'),
        new Date('2026-11-09T03:00:00.000Z'),
      );

    expect(result.weekly_correct_answers.daily[0]?.date)
      .toBe('2026-11-02');
  });

  it('propaga falhas do repository', async () => {
    repositoryMock.findSubmittedAttemptsInPeriod
      .mockRejectedValue(new Error('Falha na consulta'));

    await expect(
      service.getMyDashboard('user-1'),
    ).rejects.toThrow('Falha na consulta');
  });
});