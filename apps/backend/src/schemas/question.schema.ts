import { z } from 'zod';

const alternativeSchema = z.object({
  text: z.string().trim().min(1, 'O texto da alternativa é obrigatório.'),
  isCorrect: z.boolean(),
});

export const createQuestionSchema = z.object({
  text: z.string().trim().min(1, 'O texto da questão é obrigatório.'),
  difficulty: z.coerce.number().int().min(1, 'A dificuldade deve ser maior que zero.'),
  alternatives: z.array(alternativeSchema).optional().default([]),
});

export const updateQuestionSchema = z.object({
  text: z.string().trim().min(1, 'O texto da questão é obrigatório.').optional(),
  difficulty: z.coerce.number().int().min(1, 'A dificuldade deve ser maior que zero.').optional(),
  alternatives: z.array(alternativeSchema).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Informe ao menos um campo para atualizar.',
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
