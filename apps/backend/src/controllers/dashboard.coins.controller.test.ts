import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import {
  dashboardService,
  StudentNotFoundError,
} from '../services/dashboard.service';
import { getCoins } from './dashboard.controller';

vi.mock('../services/dashboard.service', () => ({
  dashboardService: {
    getCoins: vi.fn(),
  },
  SchoolNotFoundError: class SchoolNotFoundError extends Error {},
  StudentNotFoundError: class StudentNotFoundError extends Error {
    constructor() {
      super('Perfil de aluno não encontrado');
    }
  },
}));

function createRequestMock(query: Request['query']): Request {
  return { query } as unknown as Request;
}

function createResponseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('getCoins', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 400 quando userId nao foi informado', async () => {
    const response = createResponseMock();

    await getCoins(
      createRequestMock({}),
      response as unknown as Response,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(dashboardService.getCoins).not.toHaveBeenCalled();
  });

  it('retorna 200 com o saldo de coins', async () => {
    const response = createResponseMock();
    vi.mocked(dashboardService.getCoins).mockResolvedValue({ coins: 220 });

    await getCoins(
      createRequestMock({ userId: 'user-1' }),
      response as unknown as Response,
    );

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ coins: 220 });
    expect(dashboardService.getCoins).toHaveBeenCalledWith('user-1');
  });

  it('retorna 404 quando o aluno nao existe', async () => {
    const response = createResponseMock();
    vi.mocked(dashboardService.getCoins).mockRejectedValue(
      new StudentNotFoundError(),
    );

    await getCoins(
      createRequestMock({ userId: 'user-1' }),
      response as unknown as Response,
    );

    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('retorna 500 em falha inesperada', async () => {
    const response = createResponseMock();
    vi.mocked(dashboardService.getCoins).mockRejectedValue(
      new Error('boom'),
    );

    await getCoins(
      createRequestMock({ userId: 'user-1' }),
      response as unknown as Response,
    );

    expect(response.status).toHaveBeenCalledWith(500);
  });
});