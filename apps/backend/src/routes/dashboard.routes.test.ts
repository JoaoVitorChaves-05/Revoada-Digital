import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import dashboardRouter from './dashboard.routes';
import { dashboardService } from '../services/dashboard.service';

// Substitui o service para não acessar o banco.
vi.mock('../services/dashboard.service', () => ({
  dashboardService: {
    getMyDashboard: vi.fn(),
  },
}));

const app = express();

app.use(express.json());
app.use('/dashboard', dashboardRouter);

const getMyDashboardMock = vi.mocked(
  dashboardService.getMyDashboard,
);

// Chave fictícia, usada somente nestes testes.
const TEST_SECRET = 'dashboard-test-secret';
const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('GET /dashboard/me', () => {
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

  it('retorna o dashboard do usuário identificado pelo token', async () => {
    const dashboard = {
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
    };

    getMyDashboardMock.mockResolvedValue(dashboard);

    const response = await request(app)
      .get('/dashboard/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(dashboard);
    expect(getMyDashboardMock).toHaveBeenCalledExactlyOnceWith(
      USER_ID,
    );
  });

  it('retorna 401 quando o token não é fornecido', async () => {
    const response = await request(app)
      .get('/dashboard/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Token de autenticação não fornecido',
    });
    expect(getMyDashboardMock).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token é inválido', async () => {
    const response = await request(app)
      .get('/dashboard/me')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: 'Token inválido ou expirado',
    });
    expect(getMyDashboardMock).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token foi assinado com outra chave', async () => {
    const invalidToken = jwt.sign(
      {},
      'outra-chave-de-teste',
      {
        subject: USER_ID,
        expiresIn: '1h',
      },
    );

    const response = await request(app)
      .get('/dashboard/me')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(response.status).toBe(401);
    expect(getMyDashboardMock).not.toHaveBeenCalled();
  });

  it('retorna 401 quando o token está expirado', async () => {
    const expiredToken = jwt.sign({}, TEST_SECRET, {
      subject: USER_ID,
      expiresIn: -1,
    });

    const response = await request(app)
      .get('/dashboard/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(getMyDashboardMock).not.toHaveBeenCalled();
  });

  it('retorna 404 quando o perfil de aluno não existe', async () => {
    getMyDashboardMock.mockRejectedValue(
      new Error('Perfil de aluno não encontrado'),
    );

    const response = await request(app)
      .get('/dashboard/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Perfil de aluno não encontrado',
    });
  });

  it('retorna 500 sem expor detalhes do erro interno', async () => {
    getMyDashboardMock.mockRejectedValue(
      new Error('Detalhe interno da consulta'),
    );

    const response = await request(app)
      .get('/dashboard/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Erro ao consultar dashboard',
    });
  });
});