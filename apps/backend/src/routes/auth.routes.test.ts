import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authRouter from './auth.routes';
import { authService } from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
	authService: { login: vi.fn() },
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

const loginMock = vi.mocked(authService.login);
const input = { email: 'aluno@example.com', password: '123456' };
const user = {
	id: 'usuario-1',
	email: input.email,
	full_name: 'Aluno Exemplo',
	profileType: 'STUDENT' as const,
};

const postLogin = (body: object) =>
	request(app).post('/auth/login').send(body);

describe('POST /auth/login', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('retorna token e usuário no JSON e normaliza o email', async () => {
		loginMock.mockResolvedValue({ token: 'token-de-teste', user });

		const response = await postLogin({
			...input,
			email: `  ${input.email}  `,
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: 'Login realizado com sucesso',
			token: 'token-de-teste',
			user,
		});
		expect(loginMock).toHaveBeenCalledExactlyOnceWith(input);
	});

	it.each([
		['email inválido', { ...input, email: 'invalido' }, 'email'],
		['email ausente', { password: input.password }, 'email'],
		['senha vazia', { ...input, password: '' }, 'password'],
		['senha ausente', { email: input.email }, 'password'],
	])('retorna 400 para %s', async (_, body, path) => {
		const response = await postLogin(body);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Dados inválidos');
		expect(response.body.details).toEqual(
			expect.arrayContaining([expect.objectContaining({ path })]),
		);
		expect(loginMock).not.toHaveBeenCalled();
	});

	it.each([
		[
			'Email ou senha inválidos',
			401,
			{ message: 'Email ou senha inválidos' },
		],
		[
			'JWT_SECRET não configurado',
			500,
			{ error: 'Ocorreu um erro ao processar a solicitação de login' },
		],
	])('trata o erro "%s"', async (message, status, body) => {
		loginMock.mockRejectedValue(new Error(message));

		const response = await postLogin(input);

		expect(response.status).toBe(status);
		expect(response.body).toEqual(body);
	});
});