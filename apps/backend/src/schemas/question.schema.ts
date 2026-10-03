import { z } from 'zod';

const questionFieldsSchema = z.object({
    text: z.string().trim().min(1, 'O enunciado da questão é obrigatório'),
    difficulty: z.number().int('A dificuldade deve ser um número inteiro').min(1, 'A dificuldade mínima é 1'),
    alternatives: z.array(
        z.object({
            text: z.string().trim().min(1, 'O texto da alternativa é obrigatório'),
            isCorrect: z.boolean()
        })
    ).min(1, 'É obrigatório enviar pelo menos uma alternativa')
        .refine((alts) => alts.some((alt) => alt.isCorrect === true), {
            message: 'Pelo menos uma alternativa deve estar correta',
        }),
    subject: z.string().trim().min(1, 'A matéria é obrigatória'),
    concept: z.string().trim().min(1, 'O conceito é obrigatório')
});

export const createQuestionSchema = questionFieldsSchema;
export const updateQuestionSchema = questionFieldsSchema.partial();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;