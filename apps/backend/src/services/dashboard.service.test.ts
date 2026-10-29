import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import type { DashboardRepository } from '../repositories/dashboard.repository';
import type { SchoolRepository } from '../repositories/school.repository';
import {
  DashboardService,
  SchoolNotFoundError,
} from './dashboard.service';

vi.mock('../repositories/dashboard.repository', () => ({
  DashboardRepository: class {},
}));

vi.mock('../repositories/school.repository', () => ({
  SchoolRepository: class {},
}));

function createDashboardRepositoryMock() {
  return {
    findSubmittedAnswersBySchoolId: vi.fn(),
    findStudentByUserId: vi.fn<DashboardRepository['findStudentByUserId']>(),
    findSubmittedAttemptsInPeriod:
      vi.fn<DashboardRepository['findSubmittedAttemptsInPeriod']>(),
    findStudentsForRanking:
      vi.fn<DashboardRepository['findStudentsForRanking']>(),
  };
}

function createSchoolRepositoryMock() {
  return {
    findById: vi.fn(),
  };
}

function createRankingStudent(
  id: string,
  schoolId: string,
  answers: {
    difficulty: number;
    isCorrect: boolean;
  }[] = [],
) {
  return {
    id,
    schoolId,
    mockExams: [
      {
        attempts: [
          {
            answers: answers.map((answer, index) => ({
              selectedAlternativeId: `alternative-${index}`,
              isCorrect: answer.isCorrect,
              question: {
                difficulty: answer.difficulty,
              },
            })),
          },
        ],
      },
    ],
  };
}

describe('DashboardService.getClassPerformance', () => {
  let dashboardRepository: ReturnType<typeof createDashboardRepositoryMock>;
  let schoolRepository: ReturnType<typeof createSchoolRepositoryMock>;
  let service: DashboardService;

  beforeEach(() => {
    dashboardRepository = createDashboardRepositoryMock();
    schoolRepository = createSchoolRepositoryMock();
    schoolRepository.findById.mockResolvedValue({ id: 'school-1' });
    service = new DashboardService(
      dashboardRepository as unknown as DashboardRepository,
      schoolRepository as unknown as SchoolRepository,
    );
  });

  it('agrega por matéria, conta alunos distintos, ordena e considera nulo como não correto', async () => {
    dashboardRepository.findSubmittedAnswersBySchoolId.mockResolvedValue([
      {
        isCorrect: true,
        question: { subject: 'Matemática' },
        attempt: { mockExam: { studentId: 'student-1' } },
      },
      {
        isCorrect: false,
        question: { subject: 'Biologia' },
        attempt: { mockExam: { studentId: 'student-1' } },
      },
      {
        isCorrect: null,
        question: { subject: 'Matemática' },
        attempt: { mockExam: { studentId: 'student-2' } },
      },
      {
        isCorrect: false,
        question: { subject: 'Matemática' },
        attempt: { mockExam: { studentId: 'student-2' } },
      },
    ]);

    const result = await service.getClassPerformance('school-1');

    expect(result).toEqual([
      {
        subject: 'Biologia',
        students: 1,
        totalAnswers: 1,
        correctAnswers: 0,
        accuracy: 0,
      },
      {
        subject: 'Matemática',
        students: 2,
        totalAnswers: 3,
        correctAnswers: 1,
        accuracy: 33.33,
      },
    ]);
    expect(
      dashboardRepository.findSubmittedAnswersBySchoolId,
    ).toHaveBeenCalledWith('school-1');
    expect(schoolRepository.findById).toHaveBeenCalledWith('school-1');
  });

  it('retorna uma lista vazia quando a escola ainda não tem respostas', async () => {
    dashboardRepository.findSubmittedAnswersBySchoolId.mockResolvedValue([]);

    await expect(service.getClassPerformance('school-1')).resolves.toEqual(
      [],
    );
  });

  it('rejeita quando a escola não existe', async () => {
    schoolRepository.findById.mockResolvedValue(null);

    await expect(
      service.getClassPerformance('missing-school'),
    ).rejects.toBeInstanceOf(SchoolNotFoundError);
    expect(
      dashboardRepository.findSubmittedAnswersBySchoolId,
    ).not.toHaveBeenCalled();
  });
});

describe('DashboardService.getMyDashboard', () => {
  let dashboardRepository: ReturnType<typeof createDashboardRepositoryMock>;
  let schoolRepository: ReturnType<typeof createSchoolRepositoryMock>;
  let service: DashboardService;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });

    // Quarta-feira, 28/10/2026, às 12h em Brasília.
    vi.setSystemTime(new Date('2026-10-28T15:00:00.000Z'));

    dashboardRepository = createDashboardRepositoryMock();
    schoolRepository = createSchoolRepositoryMock();

    dashboardRepository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 100,
      schoolId: 'school-1',
    });

    dashboardRepository.findSubmittedAttemptsInPeriod.mockResolvedValue([]);

    dashboardRepository.findStudentsForRanking.mockResolvedValue([
      createRankingStudent('student-1', 'school-1'),
    ]);

    service = new DashboardService(
      dashboardRepository as unknown as DashboardRepository,
      schoolRepository as unknown as SchoolRepository,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna coins, posição no ranking e acertos da semana', async () => {
    dashboardRepository.findSubmittedAttemptsInPeriod.mockResolvedValue([
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

    dashboardRepository.findStudentsForRanking.mockResolvedValue([
      createRankingStudent('student-1', 'school-1'),
      createRankingStudent('student-2', 'school-1', [
        { difficulty: 1, isCorrect: true },
      ]),
      createRankingStudent('student-3', 'school-1', [
        { difficulty: 2, isCorrect: true },
      ]),
      createRankingStudent('student-4', 'school-1', [
        { difficulty: 3, isCorrect: true },
      ]),
    ]);

    const result = await service.getMyDashboard('user-1');

    expect(result).toEqual({
      coins: 100,
      ranking_position: 4,
      ranking_positions: {
        school: 4,
        global: 4,
      },
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

    expect(dashboardRepository.findStudentByUserId).toHaveBeenCalledWith(
      'user-1',
    );

    expect(
      dashboardRepository.findSubmittedAttemptsInPeriod,
    ).toHaveBeenCalledWith(
      'student-1',
      new Date('2026-10-26T03:00:00.000Z'),
      new Date('2026-11-02T03:00:00.000Z'),
    );

    expect(dashboardRepository.findStudentsForRanking).toHaveBeenCalledTimes(1);
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
    dashboardRepository.findStudentByUserId.mockResolvedValue(null);

    await expect(service.getMyDashboard('user-1')).rejects.toThrow(
      'Perfil de aluno não encontrado',
    );

    expect(
      dashboardRepository.findSubmittedAttemptsInPeriod,
    ).not.toHaveBeenCalled();

    expect(
      dashboardRepository.findStudentsForRanking,
    ).not.toHaveBeenCalled();
  });

  it('agrupa os acertos pelo dia de Brasília', async () => {
    dashboardRepository.findSubmittedAttemptsInPeriod.mockResolvedValue([
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

    expect(result.weekly_correct_answers.daily[0]).toEqual({
      date: '2026-10-26',
      correct_answers: 2,
    });

    expect(result.weekly_correct_answers.daily[1]).toEqual({
      date: '2026-10-27',
      correct_answers: 3,
    });

    expect(result.weekly_correct_answers.total).toBe(5);
  });

  it('mantém a semana anterior enquanto ainda é domingo em Brasília', async () => {
    // Segunda em UTC, mas domingo às 23h59 em Brasília.
    vi.setSystemTime(new Date('2026-11-02T02:59:00.000Z'));

    await service.getMyDashboard('user-1');

    expect(
      dashboardRepository.findSubmittedAttemptsInPeriod,
    ).toHaveBeenCalledWith(
      'student-1',
      new Date('2026-10-26T03:00:00.000Z'),
      new Date('2026-11-02T03:00:00.000Z'),
    );
  });

  it('inicia uma nova semana à meia-noite de segunda em Brasília', async () => {
    vi.setSystemTime(new Date('2026-11-02T03:00:00.000Z'));

    const result = await service.getMyDashboard('user-1');

    expect(
      dashboardRepository.findSubmittedAttemptsInPeriod,
    ).toHaveBeenCalledWith(
      'student-1',
      new Date('2026-11-02T03:00:00.000Z'),
      new Date('2026-11-09T03:00:00.000Z'),
    );

    expect(result.weekly_correct_answers.daily[0]?.date).toBe('2026-11-02');
  });

  it('propaga falhas do repository', async () => {
    dashboardRepository.findSubmittedAttemptsInPeriod.mockRejectedValue(
      new Error('Falha na consulta'),
    );

    await expect(service.getMyDashboard('user-1')).rejects.toThrow(
      'Falha na consulta',
    );
  });

  it('soma a dificuldade dos acertos e não pontua erros', async () => {
    dashboardRepository.findStudentsForRanking.mockResolvedValue([
      createRankingStudent('student-1', 'school-1', [
        { difficulty: 1, isCorrect: true },
        { difficulty: 2, isCorrect: true },
        { difficulty: 3, isCorrect: true },
        { difficulty: 3, isCorrect: false },
      ]),
      createRankingStudent('student-2', 'school-1', [
        { difficulty: 3, isCorrect: true },
        { difficulty: 2, isCorrect: true },
        { difficulty: 2, isCorrect: true },
      ]),
    ]);

    const result = await service.getMyDashboard('user-1');

    // Aluno atual: 6 pontos. Outro aluno: 7 pontos.
    expect(result.ranking_position).toBe(2);

    // Coins permanecem independentes da pontuação calculada.
    expect(result.coins).toBe(100);
  });

  it('desempata a pontuação pela maior taxa de acerto', async () => {
    dashboardRepository.findStudentsForRanking.mockResolvedValue([
      createRankingStudent('student-1', 'school-1', [
        { difficulty: 3, isCorrect: true },
        { difficulty: 1, isCorrect: false },
      ]),
      createRankingStudent('student-2', 'school-1', [
        { difficulty: 1, isCorrect: true },
        { difficulty: 2, isCorrect: true },
      ]),
    ]);

    const result = await service.getMyDashboard('user-1');

    // Ambos têm 3 pontos; as taxas são 50% e 100%.
    expect(result.ranking_position).toBe(2);
  });

  it('separa escola e global e compartilha posições em empates', async () => {
    dashboardRepository.findStudentsForRanking.mockResolvedValue([
      createRankingStudent('student-1', 'school-1', [
        { difficulty: 1, isCorrect: true },
      ]),
      createRankingStudent('student-2', 'school-1', [
        { difficulty: 1, isCorrect: true },
      ]),
      createRankingStudent('student-3', 'school-2', [
        { difficulty: 3, isCorrect: true },
      ]),
    ]);

    const result = await service.getMyDashboard('user-1');

    expect(result.ranking_positions).toEqual({
      school: 1,
      global: 2,
    });

    expect(result.ranking_position).toBe(2);
  });
});
