import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import dashboardRouter from './dashboard.routes';
import { dashboardService, SchoolNotFoundError } from '../services/dashboard.service';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// 1. Mockamos o service, o prisma e o jwt para isolar o teste da rota
vi.mock('../services/dashboard.service', () => ({
    dashboardService: {
        getClassPerformance: vi.fn(),
    },
    SchoolNotFoundError: class SchoolNotFoundError extends Error {},
}));

vi.mock('../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('jsonwebtoken');

//mini aplicação Express apenas para testar o router
const app = express();
app.use(express.json());
app.use('/dashboard', dashboardRouter);

describe('GET /dashboard/director Route Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'fake-secret';
    });

    it('deve retornar 401 se o token de autenticação não for enviado', async () => {
        const response = await request(app).get('/dashboard/director?school_id=123');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });

    it('deve retornar 403 se o usuário autenticado não for ADMIN', async () => {
        // Simula token válido
        vi.mocked(jwt.verify).mockReturnValueOnce({ sub: 'user-student' } as any);
        // Simula usuário STUDENT no banco
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ profileType: 'STUDENT' } as any);

        const response = await request(app)
            .get('/dashboard/director?school_id=123')
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(403);
        expect(response.body.error).toContain('Acesso negado');
    });

    it('deve retornar 400 se o school_id não for fornecido na query', async () => {
        // Simula token válido
        vi.mocked(jwt.verify).mockReturnValueOnce({ sub: 'user-admin' } as any);
        // Simula usuário ADMIN no banco
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ profileType: 'ADMIN' } as any);

        const response = await request(app)
            .get('/dashboard/director') // Sem o school_id
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('school_id é obrigatório');
    });

    it('deve retornar 200 e os dados de performance se o admin for autorizado', async () => {
        // Simula token válido
        vi.mocked(jwt.verify).mockReturnValueOnce({ sub: 'user-admin' } as any);
        // Simula usuário ADMIN no banco
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ profileType: 'ADMIN' } as any);
        // Simula sucesso no service (ja testado antes)
        const mockPerformanceData = { averageScore: 85, totalStudents: 40 };
        vi.mocked(dashboardService.getClassPerformance).mockResolvedValueOnce(mockPerformanceData as any);

        const response = await request(app)
            .get('/dashboard/director?school_id=uuid-escola-123')
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPerformanceData);
        expect(dashboardService.getClassPerformance).toHaveBeenCalledWith('uuid-escola-123');
    });
});