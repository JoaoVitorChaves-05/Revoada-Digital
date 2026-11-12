import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import rewardsRouter from './rewards.routes';
import { rewardService } from '../services/reward.service';
import { RewardError } from '../errors/reward.error';

vi.mock('../services/reward.service', () => ({
  rewardService: {
    findAvailable: vi.fn(),
    redeem: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/rewards', rewardsRouter);

const findAvailableMock = vi.mocked(rewardService.findAvailable);
const redeemMock = vi.mocked(rewardService.redeem);
const TEST_SECRET = 'rewards-test-secret';
const USER_ID = '11111111-1111-4111-8111-111111111111';

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
