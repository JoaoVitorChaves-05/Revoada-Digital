import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ensureAdmin } from './ensureAdmin.middleware';
import { prisma } from '../lib/prisma';

// 1. Mockamos o cliente do Prisma para isolar o banco de dados
vi.mock('../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

describe('EnsureAdmin Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockReq = {
            user: { id: 'user-123' }, // Simula que o middleware de auth já injetou o ID
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        nextFunction = vi.fn();
        vi.clearAllMocks();
    });

    it('deve chamar o next() se o usuário possuir o profileType ADMIN', async () => {
        // Simula que o Prisma encontrou um usuário ADMIN no banco
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            profileType: 'ADMIN',
        } as any);

        await ensureAdmin(mockReq as Request, mockRes as Response, nextFunction);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 'user-123' },
            select: { profileType: true },
        });
        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se o req.user.id não estiver presente', async () => {
        mockReq.user = undefined; // Simula ausência de autenticação

        await ensureAdmin(mockReq as Request, mockRes as Response, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não autenticado' });
        expect(nextFunction).not.toHaveBeenCalled();
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('deve retornar 404 se o usuário não for encontrado no banco de dados', async () => {
        // Simula que o Prisma não encontrou nenhum usuário com esse ID
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

        await ensureAdmin(mockReq as Request, mockRes as Response, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('deve retornar 403 se o usuário for do tipo STUDENT ou TEACHER (não ADMIN)', async () => {
        // Simula um usuário comum (Estudante) tentando acessar uma rota de admin
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            profileType: 'STUDENT',
        } as any);

        await ensureAdmin(mockReq as Request, mockRes as Response, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Acesso negado. Apenas administradores/diretores podem acessar esta ferramenta.',
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});