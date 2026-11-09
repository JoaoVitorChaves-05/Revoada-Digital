import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import {
    dashboardService,
    SchoolNotFoundError,
    StudentNotFoundError,
} from '../services/dashboard.service';
import { getDashboard, getDesempenhoAreas } from './dashboard.controller';

vi.mock('../services/dashboard.service', () => ({
    dashboardService: {
        getClassPerformance: vi.fn(),
        getDesempenhoAreas: vi.fn(),
    },
    SchoolNotFoundError: class SchoolNotFoundError extends Error {
        constructor() {
            super('Escola não encontrada');
        }
    },
    StudentNotFoundError: class StudentNotFoundError extends Error {
        constructor() {
            super('Perfil de aluno não encontrado');
        }
    },
}));

function createRequestMock(query: Request['query']): Request {
    return { query } as unknown as Request;
}

function createAuthRequestMock(userId?: string): Request {
    return {
        user: userId ? { id: userId } : undefined,
    } as unknown as Request;
}

function createResponseMock() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
}

describe('getDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('retorna 400 quando school_id não foi informado', async () => {
        const response = createResponseMock();

        await getDashboard(
            createRequestMock({}),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'school_id é obrigatório' });
        expect(dashboardService.getClassPerformance).not.toHaveBeenCalled();
    });

    it('retorna 404 quando a escola não existe', async () => {
        const response = createResponseMock();
        vi.mocked(dashboardService.getClassPerformance).mockRejectedValue(
            new SchoolNotFoundError(),
        );

        await getDashboard(
            createRequestMock({ school_id: 'missing-school' }),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({ error: 'Escola não encontrada' });
    });

    it('retorna 200 com o desempenho agregado por matéria', async () => {
        const response = createResponseMock();
        const performance = [
            {
                subject: 'Matemática',
                students: 3,
                totalAnswers: 12,
                correctAnswers: 9,
                accuracy: 75,
            },
        ];
        vi.mocked(dashboardService.getClassPerformance).mockResolvedValue(performance);

        await getDashboard(
            createRequestMock({ school_id: 'school-1' }),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(performance);
    });
});

describe('getDesempenhoAreas', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('retorna 401 quando o usuário não está autenticado', async () => {
        const response = createResponseMock();

        await getDesempenhoAreas(
            createAuthRequestMock(undefined),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(401);
        expect(dashboardService.getDesempenhoAreas).not.toHaveBeenCalled();
    });

    it('retorna 404 quando o aluno não existe', async () => {
        const response = createResponseMock();
        vi.mocked(dashboardService.getDesempenhoAreas).mockRejectedValue(
            new StudentNotFoundError(),
        );

        await getDesempenhoAreas(
            createAuthRequestMock('user-1'),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
            error: 'Perfil de aluno não encontrado',
        });
    });

    it('retorna 200 com as áreas, inclusive quando o aluno não tem respostas', async () => {
        const response = createResponseMock();
        const areas = [
            {
                area: 'Linguagens',
                questoesResolvidas: 0,
                taxaAcerto: 0,
                porDificuldade: [
                    { nivel: 'Fáceis', taxaAcerto: 0 },
                    { nivel: 'Médias', taxaAcerto: 0 },
                    { nivel: 'Difíceis', taxaAcerto: 0 },
                ],
            },
        ];
        vi.mocked(dashboardService.getDesempenhoAreas).mockResolvedValue(
            areas as never,
        );

        await getDesempenhoAreas(
            createAuthRequestMock('user-1'),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({ areas });
        expect(dashboardService.getDesempenhoAreas).toHaveBeenCalledWith('user-1');
    });

    it('retorna 500 quando o service falha por outro motivo', async () => {
        const response = createResponseMock();
        vi.mocked(dashboardService.getDesempenhoAreas).mockRejectedValue(
            new Error('Falha inesperada'),
        );

        await getDesempenhoAreas(
            createAuthRequestMock('user-1'),
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(500);
    });
});