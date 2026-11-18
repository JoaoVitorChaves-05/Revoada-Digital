import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import usersRouter from './users.routes';
import { StudentProfileNotFoundError, userService } from '../services/user.service';

vi.mock('../services/user.service', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../services/user.service')>();
	return {
		...actual,
		userService: {
			getPoints: vi.fn(),
		},
	};
});

vi.mock('../services/emailVerification.service', () => ({
	emailVerificationService: { enviarVerificacao: vi.fn() },
}));

// Impede a inicialização do Prisma; a rota usa o service mockado.
vi.mock('../repositories/user.repository', () => ({
	UserRepository: class {},
}));

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

const getPointsMock = vi.mocked(userService.getPoints);
const TEST_SECRET = 'users-points-test-secret';
const USER_ID = '11111111-1111-4111-8111-111111111111';

describe('GET /users/me/points', () => {
	let token: string;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.stubEnv('JWT_SECRET', TEST_SECRET);
		token = jwt.sign({}, TEST_SECRET, {
			subject: USER_ID,
			expiresIn: '1h',
			algorithm: 'HS256',
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	const getPoints = () => request(app)
		.get('/users/me/points?userId=outro-usuario')
		.set('Authorization', `Bearer ${token}`);

	it.each([120, 0])('retorna %i pontos usando a identidade do token', async (points) => {
		getPointsMock.mockResolvedValue({ points });

		const response = await getPoints();

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ points });
		expect(getPointsMock).toHaveBeenCalledExactlyOnceWith(USER_ID);
	});

	it.each(['', 'Bearer token-invalido'])('retorna 401 para autenticação "%s"', async (authorization) => {
		const call = request(app).get('/users/me/points');
		if (authorization) call.set('Authorization', authorization);
		const response = await call;

		expect(response.status).toBe(401);
		expect(getPointsMock).not.toHaveBeenCalled();
	});

	it.each([
		[404, new StudentProfileNotFoundError(), 'Perfil de aluno não encontrado'],
		[500, new Error('Detalhes internos'), 'Erro ao consultar saldo de pontos'],
	] as const)('retorna %i ao falhar a consulta', async (status, error, message) => {
		getPointsMock.mockRejectedValue(error);
		const response = await getPoints();

		expect(response.status).toBe(status);
		expect(response.body).toEqual({ error: message });
	});
});
