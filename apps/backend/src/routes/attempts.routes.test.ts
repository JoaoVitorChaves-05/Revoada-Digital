import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// --- Mock do Prisma usado pelo creditar-coins.middleware ---
vi.mock('../lib/prisma', () => ({
  prisma: {
    studentProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    attempt: {
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// --- Mock do service usado pelo attempt.controller ---
vi.mock('../services/attempt.service', () => ({
  attemptService: {
    submitAttempt: vi.fn(),
  },
}));

// Importa a rota e os módulos mockados só depois dos mocks registrados
import attemptsRouter from './attempts.routes';
import { prisma } from '../lib/prisma';
import { attemptService } from '../services/attempt.service';

const prismaMock = vi.mocked(prisma, true);
const submitAttemptMock = vi.mocked(attemptService.submitAttempt);

const JWT_SECRET_TEST = 'chave-jwt-apenas-para-testes';

// UUIDs v4 válidos exigidos pelo submitAttemptSchema (zod v4 valida a versão)
const QUESTION_ID = '11111111-1111-4111-8111-111111111111';
const ALTERNATIVE_ID = '22222222-2222-4222-8222-222222222222';
const ATTEMPT_ID = '33333333-3333-4333-8333-333333333333';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/attempts', attemptsRouter);
  return app;
}

function tokenFor(userId: string) {
  return jwt.sign({}, JWT_SECRET_TEST, {
    subject: userId,
    expiresIn: '24h',
    algorithm: 'HS256',
  });
}

function corpoValido(extra: Record<string, unknown> = {}) {
  return {
    answers: [
      { questionId: QUESTION_ID, selectedAlternativeId: ALTERNATIVE_ID },
    ],
    ...extra,
  };
}

describe('POST /attempts/:id/submit (rota + middleware de coins + controller)', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', JWT_SECRET_TEST);
    vi.clearAllMocks();
    app = buildApp();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('credita coins, chama o service e devolve o total ganho', async () => {
    const studentProfile = { id: 'student-1', userId: 'user-1' };

    prismaMock.studentProfile.findUnique.mockResolvedValue(studentProfile);
    prismaMock.attempt.count.mockResolvedValue(0);
    prismaMock.attempt.findUnique.mockResolvedValue({
      id: ATTEMPT_ID,
      coinsCredited: false,
      mockExam: { studentId: 'student-1' },
      answers: [
        { isCorrect: true, question: { difficulty: 1 } },
        { isCorrect: true, question: { difficulty: 3 } },
        { isCorrect: false, question: { difficulty: 2 } },
      ],
    });
    prismaMock.$transaction.mockResolvedValue([]);
    submitAttemptMock.mockResolvedValue({ score: 50 });

    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send(corpoValido());

    expect(res.status).toBe(200);
    // 1 (fácil) + 3 (difícil) = 4
    expect(res.body.totalCoinsGanho).toBe(4);
    expect(res.body.score).toBe(50);
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(submitAttemptMock).toHaveBeenCalledOnce();
    expect(submitAttemptMock).toHaveBeenCalledWith(
      ATTEMPT_ID,
      expect.objectContaining({ answers: expect.any(Array) }),
    );
  });

  it('sem token retorna 401 e não chama o service', async () => {
    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .send(corpoValido());

    expect(res.status).toBe(401);
    expect(submitAttemptMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('corpo inválido (sem answers) retorna 400 antes do middleware de coins', async () => {
    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Dados inválidos');
    expect(prismaMock.studentProfile.findUnique).not.toHaveBeenCalled();
    expect(submitAttemptMock).not.toHaveBeenCalled();
  });

  it('quando creditarCoins=false pula o crédito mas ainda chama o service', async () => {
    submitAttemptMock.mockResolvedValue({ score: 70 });

    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send(corpoValido({ creditarCoins: false }));

    expect(res.status).toBe(200);
    expect(res.body.totalCoinsGanho).toBeUndefined();
    expect(prismaMock.studentProfile.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(submitAttemptMock).toHaveBeenCalledOnce();
  });

  it('bloqueia com 400 quando já pontuou 2 vezes em 24h', async () => {
    prismaMock.studentProfile.findUnique.mockResolvedValue({
      id: 'student-1',
      userId: 'user-1',
    });
    prismaMock.attempt.count.mockResolvedValue(2);

    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send(corpoValido());

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Limite diário atingido');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(submitAttemptMock).not.toHaveBeenCalled();
  });

  it('retorna 403 quando a tentativa é de outro estudante', async () => {
    prismaMock.studentProfile.findUnique.mockResolvedValue({
      id: 'student-1',
      userId: 'user-1',
    });
    prismaMock.attempt.count.mockResolvedValue(0);
    prismaMock.attempt.findUnique.mockResolvedValue({
      id: ATTEMPT_ID,
      coinsCredited: false,
      mockExam: { studentId: 'outro-student' },
      answers: [],
    });

    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send(corpoValido());

    expect(res.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(submitAttemptMock).not.toHaveBeenCalled();
  });

  it('retorna 400 quando os coins já foram creditados antes', async () => {
    prismaMock.studentProfile.findUnique.mockResolvedValue({
      id: 'student-1',
      userId: 'user-1',
    });
    prismaMock.attempt.count.mockResolvedValue(0);
    prismaMock.attempt.findUnique.mockResolvedValue({
      id: ATTEMPT_ID,
      coinsCredited: true,
      mockExam: { studentId: 'student-1' },
      answers: [],
    });

    const res = await request(app)
      .post(`/attempts/${ATTEMPT_ID}/submit`)
      .set('Authorization', `Bearer ${tokenFor('user-1')}`)
      .send(corpoValido());

    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(submitAttemptMock).not.toHaveBeenCalled();
  });
});
