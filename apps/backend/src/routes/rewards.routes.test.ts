import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import rewardsRouter from './rewards.routes';
import { rewardService } from '../services/reward.service';

vi.mock('../services/reward.service', () => ({
  rewardService: {
    findAvailable: vi.fn(),
  },
}));

const app = express();
app.use('/rewards', rewardsRouter);

const findAvailableMock = vi.mocked(rewardService.findAvailable);
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
});
