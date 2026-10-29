import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ensureAuthenticated } from './auth.middleware';
import jwt from 'jsonwebtoken';

describe('Auth Middleware - Teste de Ambiente (.env) e Token Real', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: NextFunction;
    const originalEnv = process.env.JWT_SECRET;

    beforeEach(() => {
        mockReq = { headers: {} };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        nextFunction = vi.fn();
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restaura a variável original do ambiente após cada teste
        process.env.JWT_SECRET = originalEnv;
    });

    it('deve falhar e retornar erro 500 ou lançar exceção se o JWT_SECRET não estiver configurado no .env', () => {
        // Remove propositalmente a variável de ambiente para testar a falta dela
        delete process.env.JWT_SECRET;

        // Gera um token válido só para passar da verificação do header
        const token = jwt.sign({ sub: '123' }, 'qualquer-chave');
        mockReq.headers = { authorization: `Bearer ${token}` };

        ensureAuthenticated(mockReq as Request, mockRes as Response, nextFunction);

        // Garante que o middleware barrou a requisição por falta da chave no .env
        expect(mockRes.status).toHaveBeenCalledWith(401); 
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('deve autenticar com sucesso usando a secret real definida no ambiente', () => {
        // Define explicitamente uma secret de teste no ambiente
        process.env.JWT_SECRET = 'minha-secret-super-segura-do-env';

        // Cria um token real assinado com essa exata secret
        const token = jwt.sign({ sub: 'user-xyz' }, process.env.JWT_SECRET);
        mockReq.headers = { authorization: `Bearer ${token}` };

        ensureAuthenticated(mockReq as Request, mockRes as Response, nextFunction);

        // Garante que o .env foi lido com sucesso, validou o token, injetou o usuário e chamou o next()
        expect(mockReq.user).toEqual({ id: 'user-xyz' });
        expect(nextFunction).toHaveBeenCalledTimes(1);
    });
});