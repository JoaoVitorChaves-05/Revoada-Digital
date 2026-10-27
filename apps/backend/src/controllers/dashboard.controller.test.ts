import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { dashboardService, SchoolNotFoundError } from '../services/dashboard.service';
import { getDashboard } from './dashboard.controller';

vi.mock('../services/dashboard.service', () => ({
    dashboardService: {
        getClassPerformance: vi.fn(),
    },
    SchoolNotFoundError: class SchoolNotFoundError extends Error {},
}));

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
            { query: {} } as Request,
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith({ error: 'school_id é obrigatório' });
        expect(dashboardService.getClassPerformance).not.toHaveBeenCalled();
    });

    it('retorna 404 quando a escola não existe', async () => {
        const response = createResponseMock();
        vi.mocked(dashboardService.getClassPerformance).mockRejectedValue(
            new SchoolNotFoundError('Escola não encontrada'),
        );

        await getDashboard(
            { query: { school_id: 'missing-school' } } as Request,
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
            { query: { school_id: 'school-1' } } as Request,
            response as unknown as Response,
        );

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith(performance);
    });
});
