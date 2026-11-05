import express from 'express';
import request from 'supertest';
import { hash } from 'bcrypt';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import authRouter from './auth.routes';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const repositoryMock = vi.hoisted(() => ({
	findByEmail: vi.fn(),
}));

vi.mock('../repositories/user.repository', () => ({
	UserRepository: class {
		findByEmail = repositoryMock.findByEmail;
	},
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

// Rota exclusiva do teste para conferir o acesso protegido.
app.get('/protected', ensureAuthenticated, (req, res) => {
	return res.status(200).json({ userId: req.user?.id });
});

describe('Integração entre login e autenticação', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.stubEnv(
			'JWT_SECRET',
			'chave-jwt-apenas-para-testes',
		);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('usa o token do login para acessar uma rota protegida', async () => {
		repositoryMock.findByEmail.mockResolvedValue({
			id: 'user-1',
			email: 'aluno@example.com',
			password: await hash('senha123', 10),
			full_name: 'Aluno Exemplo',
			profileType: 'STUDENT',
		});

		const loginResponse = await request(app)
			.post('/auth/login')
			.send({
				email: 'aluno@example.com',
				password: 'senha123',
			});

		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body.token).toEqual(expect.any(String));
		expect(loginResponse.body.user).not.toHaveProperty('password');

		const protectedResponse = await request(app)
			.get('/protected')
			.set(
				'Authorization',
				`Bearer ${loginResponse.body.token}`,
			);

		expect(protectedResponse.status).toBe(200);
		expect(protectedResponse.body).toEqual({
			userId: 'user-1',
		});
	});
});