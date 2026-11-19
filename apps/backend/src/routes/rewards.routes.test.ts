import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import rewardsRouter from './rewards.routes';
import { rewardService } from '../services/reward.service';
import { RewardError } from '../errors/reward.error';
import { prisma } from '../lib/prisma';

// Mock do Prisma usado pelo ensureAdmin.middleware (busca o profileType)
vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../services/reward.service', () => ({
  rewardService: {
    findAvailable: vi.fn(),
    redeem: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/rewards', rewardsRouter);

const findAvailableMock = vi.mocked(rewardService.findAvailable);
const redeemMock = vi.mocked(rewardService.redeem);
const createMock = vi.mocked(rewardService.create);
const updateMock = vi.mocked(rewardService.update);
const userFindUniqueMock = vi.mocked(prisma.user.findUnique);
const TEST_SECRET = 'rewards-test-secret';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const REWARD_ID = '22222222-2222-4222-8222-222222222222';

describe('GET /rewards/catalog', () => {
  let token: string;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('JWT_SECRET', TEST_SECRET);
    token = jwt.sign({}, TEST_SECRET, {
      subject: USER_ID,
      expiresIn: '1h',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retorna a lista de recompensas para usuário autenticado', async () => {
    const rewards = [
      {
        id: 'reward-1',
        name: 'Caderno',
        description: 'Caderno de estudos',
        pointsCost: 150,
      },
    ];
    findAvailableMock.mockResolvedValue(rewards);

    const response = await request(app)
      .get('/rewards/catalog')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(rewards);
    expect(findAvailableMock).toHaveBeenCalledOnce();
  });

  it('exige autenticação antes de consultar o catálogo', async () => {
    const response = await request(app).get('/rewards/catalog');

    expect(response.status).toBe(401);
    expect(findAvailableMock).not.toHaveBeenCalled();
  });

  it('valida o body e retorna 201 com o resgate e o saldo atualizado', async () => {
    const result = {
      redemption: {
        id: 'redemption-1',
        rewardId: USER_ID,
        pointsSpent: 150,
        createdAt: new Date('2026-11-08T12:00:00.000Z'),
      },
      balance: 50,
    };
    redeemMock.mockResolvedValue(result);

    const response = await request(app)
      .post('/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({ rewardId: USER_ID });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...result,
      redemption: {
        ...result.redemption,
        createdAt: '2026-11-08T12:00:00.000Z',
      },
    });
    expect(redeemMock).toHaveBeenCalledExactlyOnceWith(
      USER_ID,
      { rewardId: USER_ID },
    );
  });

  it('rejeita body inválido sem chamar o service', async () => {
    const response = await request(app)
      .post('/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({ rewardId: 'invalid', points: 9999 });

    expect(response.status).toBe(400);
    expect(redeemMock).not.toHaveBeenCalled();
  });

  it('mapeia saldo insuficiente para 409', async () => {
    redeemMock.mockRejectedValue(
      new RewardError(
        'INSUFFICIENT_POINTS',
        'Saldo de pontos insuficiente',
      ),
    );

    const response = await request(app)
      .post('/rewards/redeem')
      .set('Authorization', `Bearer ${token}`)
      .send({ rewardId: USER_ID });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      code: 'INSUFFICIENT_POINTS',
      error: 'Saldo de pontos insuficiente',
    });
  });
});

describe('Rotas de admin de recompensas (POST /rewards e PUT /rewards/:id)', () => {
  let token: string;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('JWT_SECRET', TEST_SECRET);
    token = jwt.sign({}, TEST_SECRET, {
      subject: USER_ID,
      expiresIn: '1h',
    });
    // Por padrão o usuário autenticado é ADMIN (o ensureAdmin consulta o Prisma)
    userFindUniqueMock.mockResolvedValue({ profileType: 'ADMIN' } as any);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const corpoCriar = {
    name: 'Caderno',
    description: 'Caderno de estudos',
    cost: 150,
  };

  it('cria a recompensa e retorna 201 quando o usuário é admin', async () => {
    const criada = {
      id: REWARD_ID,
      name: 'Caderno',
      description: 'Caderno de estudos',
      cost: 150,
      isAvailable: true,
      stock: null,
    };
    createMock.mockResolvedValue(criada);

    const response = await request(app)
      .post('/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(corpoCriar);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(criada);
    expect(createMock).toHaveBeenCalledExactlyOnceWith(corpoCriar);
  });

  it('exige autenticação antes de criar (401)', async () => {
    const response = await request(app).post('/rewards').send(corpoCriar);

    expect(response.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('bloqueia com 403 quando o usuário não é admin', async () => {
    userFindUniqueMock.mockResolvedValue({ profileType: 'STUDENT' } as any);

    const response = await request(app)
      .post('/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(corpoCriar);

    expect(response.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejeita body inválido ao criar sem chamar o service (400)', async () => {
    const response = await request(app)
      .post('/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', description: 'x', cost: -5 });

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('atualiza a recompensa e retorna 200 quando o usuário é admin', async () => {
    const atualizada = {
      id: REWARD_ID,
      name: 'Caderno novo',
      description: 'Caderno de estudos',
      cost: 120,
      isAvailable: true,
      stock: 10,
    };
    updateMock.mockResolvedValue(atualizada);

    const response = await request(app)
      .put(`/rewards/${REWARD_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Caderno novo', cost: 120, stock: 10 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(atualizada);
    expect(updateMock).toHaveBeenCalledExactlyOnceWith(REWARD_ID, {
      name: 'Caderno novo',
      cost: 120,
      stock: 10,
    });
  });

  it('retorna 404 ao atualizar recompensa inexistente', async () => {
    updateMock.mockRejectedValue(
      new RewardError('REWARD_NOT_FOUND', 'Recompensa não encontrada'),
    );

    const response = await request(app)
      .put(`/rewards/${REWARD_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Qualquer' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 'REWARD_NOT_FOUND',
      error: 'Recompensa não encontrada',
    });
  });

  it('rejeita update com body vazio sem chamar o service (400)', async () => {
    const response = await request(app)
      .put(`/rewards/${REWARD_ID}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
