import { z } from 'zod';

const attemptFieldsSchema = z.object({
    id: z.string().uuid('ID inválido'),
    userId: z.string().uuid('ID de usuário inválido'),
    score: z.number().min(0, 'Pontuação deve ser maior ou igual a 0'),
    time: z.number().min(0, 'Tempo deve ser maior ou igual a 0'),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createAttemptSchema = attemptFieldsSchema;
export const updateAttemptSchema = attemptFieldsSchema.partial();

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;
export type UpdateAttemptInput = z.infer<typeof updateAttemptSchema>;