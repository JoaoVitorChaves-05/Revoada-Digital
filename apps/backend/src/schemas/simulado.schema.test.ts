import { describe, expect, it } from 'vitest';
import {
	createSimuladoSchema,
	updateSimuladoSchema,
} from './simulado.schema';

const baseSimulado = {
	studentId: 'aluno-1',
	questionIds: ['questao-1', 'questao-2'],
};

describe('createSimuladoSchema', () => {
	it('aceita simulado com aluno e questões', () => {
		const result = createSimuladoSchema.safeParse(baseSimulado);

		expect(result.success).toBe(true);
	});

	it('rejeita simulado sem aluno', () => {
		const result = createSimuladoSchema.safeParse({
			...baseSimulado,
			studentId: '',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita simulado sem questões', () => {
		const result = createSimuladoSchema.safeParse({
			...baseSimulado,
			questionIds: [],
		});

		expect(result.success).toBe(false);
	});

	it('rejeita questão com ID vazio', () => {
		const result = createSimuladoSchema.safeParse({
			...baseSimulado,
			questionIds: [''],
		});

		expect(result.success).toBe(false);
	});
});

describe('updateSimuladoSchema', () => {
	it('aceita atualização das questões', () => {
		const result = updateSimuladoSchema.safeParse({
			questionIds: ['questao-3', 'questao-4'],
		});

		expect(result.success).toBe(true);
	});

	it('rejeita atualização com lista de questões vazia', () => {
		const result = updateSimuladoSchema.safeParse({
			questionIds: [],
		});

		expect(result.success).toBe(false);
	});
});