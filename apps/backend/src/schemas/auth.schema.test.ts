import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.schema';

describe('loginSchema', () => {
	it('aceita email e senha válidos', () => {
		const result = loginSchema.safeParse({
			email: 'aluno@example.com',
			password: '123456',
		});

		expect(result.success).toBe(true);
	});

	it('rejeita email inválido', () => {
		const result = loginSchema.safeParse({
			email: 'email-invalido',
			password: '123456',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita senha vazia', () => {
		const result = loginSchema.safeParse({
			email: 'aluno@example.com',
			password: '',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita requisição sem senha', () => {
		const result = loginSchema.safeParse({
			email: 'aluno@example.com',
		});

		expect(result.success).toBe(false);
	});
});