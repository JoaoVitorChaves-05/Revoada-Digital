import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ensureAuthenticated } from './auth.middleware';

const JWT_SECRET_TEST = 'chave-jwt-apenas-para-testes';

function executeMiddleware(authorization?: string) {
	const req = {
		headers: { authorization },
	} as Request;

	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn(),
	};

	const next = vi.fn();

	ensureAuthenticated(
		req,
		res as unknown as Response,
		next,
	);

	return { req, res, next };
}

describe('ensureAuthenticated', () => {
	beforeEach(() => {
		vi.stubEnv('JWT_SECRET', JWT_SECRET_TEST);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('identifica o usuário e libera acesso com token válido', () => {
		const token = jwt.sign({}, JWT_SECRET_TEST, {
			subject: 'user-1',
			expiresIn: '24h',
			algorithm: 'HS256',
		});

		const { req, res, next } =
			executeMiddleware(`Bearer ${token}`);

		expect(req.user).toEqual({ id: 'user-1' });
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.status).not.toHaveBeenCalled();
	});

	it.each([
		['header ausente', () => undefined],
		['formato incorreto', () => 'Basic qualquer-valor'],
		['token inválido', () => 'Bearer token-invalido'],
		[
			'token expirado',
			() => `Bearer ${jwt.sign({}, JWT_SECRET_TEST, {
				subject: 'user-1',
				expiresIn: -1,
			})}`,
		],
		[
			'assinatura incorreta',
			() => `Bearer ${jwt.sign({}, 'outra-chave', {
				subject: 'user-1',
				expiresIn: '24h',
			})}`,
		],
		[
			'token sem identificação do usuário',
			() => `Bearer ${jwt.sign({}, JWT_SECRET_TEST, {
				expiresIn: '24h',
			})}`,
		],
		[
			'token sem expiração',
			() => `Bearer ${jwt.sign({}, JWT_SECRET_TEST, {
				subject: 'user-1',
			})}`,
		],
	])('retorna 401 para %s', (_, createHeader) => {
		const { req, res, next } =
			executeMiddleware(createHeader());

		expect(res.status).toHaveBeenCalledWith(401);
		expect(req.user).toBeUndefined();
		expect(next).not.toHaveBeenCalled();
	});

	it.each([undefined, '   '])(
		'retorna 500 quando JWT_SECRET é %s',
		(secret) => {
			vi.stubEnv('JWT_SECRET', secret);

			const { res, next } =
				executeMiddleware('Bearer token-de-teste');

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Erro na configuração de autenticação',
			});
			expect(next).not.toHaveBeenCalled();
		},
	);
});