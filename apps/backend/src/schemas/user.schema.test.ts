import { describe, expect, it } from 'vitest';
import { createUserSchema, updateUserSchema } from './user.schema';

const baseUser = {
	email: 'usuario@example.com',
	full_name: 'Usuario Exemplo',
	rg: '123456789',
	cpf: '12345678901',
};

describe('createUserSchema', () => {
	it('aceita estudante com escola', () => {
		const result = createUserSchema.safeParse({ ...baseUser, profileType: 'STUDENT', school: 'Escola A' });

		expect(result.success).toBe(true);
	});

	it('rejeita estudante sem escola', () => {
		const result = createUserSchema.safeParse({ ...baseUser, profileType: 'STUDENT' });

		expect(result.success).toBe(false);
	});

	it('aceita administrador sem escola', () => {
		const result = createUserSchema.safeParse({ ...baseUser, profileType: 'ADMIN' });

		expect(result.success).toBe(true);
	});

	it('rejeita CPF com quantidade incorreta de dígitos', () => {
		const result = createUserSchema.safeParse({
			...baseUser,
			cpf: '123',
			profileType: 'ADMIN',
		});

		expect(result.success).toBe(false);
	});
});

describe('updateUserSchema', () => {
	it('aceita atualização parcial de nome', () => {
		const result = updateUserSchema.safeParse({ full_name: 'Novo Nome' });

		expect(result.success).toBe(true);
	});

	it('exige escola ao mudar o perfil para professor', () => {
		const result = updateUserSchema.safeParse({ profileType: 'TEACHER' });

		expect(result.success).toBe(false);
	});
});