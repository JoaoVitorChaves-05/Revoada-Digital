import { describe, expect, it } from 'vitest';
import { createQuestionSchema, updateQuestionSchema } from './question.schema';

const baseQuestion = {
    text: 'Qual a capital do Brasil?',
    difficulty: 1,
    alternatives: [
        { text: 'Brasília', isCorrect: true },
        { text: 'Rio de Janeiro', isCorrect: false }
    ]
};

describe('createQuestionSchema', () => {
    it('aceita uma questão válida', () => {
        const result = createQuestionSchema.safeParse(baseQuestion);
        expect(result.success).toBe(true);
    });

    it('rejeita questão com texto vazio', () => {
        const result = createQuestionSchema.safeParse({ ...baseQuestion, text: '' });
        expect(result.success).toBe(false);
    });

    it('rejeita dificuldade menor que 1', () => {
        const result = createQuestionSchema.safeParse({ ...baseQuestion, difficulty: 0 });
        expect(result.success).toBe(false);
    });
});

describe('updateQuestionSchema', () => {
    it('aceita atualização parcial apenas do texto', () => {
        const result = updateQuestionSchema.safeParse({ text: 'Novo texto' });
        expect(result.success).toBe(true);
    });

    it('aceita atualização parcial apenas da dificuldade', () => {
        const result = updateQuestionSchema.safeParse({ difficulty: 2 });
        expect(result.success).toBe(true);
    });

    it('rejeita atualização parcial com dificuldade inválida', () => {
        const result = updateQuestionSchema.safeParse({ difficulty: 0 });
        expect(result.success).toBe(false);
    });
});