import { z } from 'zod';

export const generateSimuladoSchema = z.object({
    studentId: z.string().trim().min(1, 'ID do aluno é obrigatório'),
    subject: z.string().trim().min(1, 'A matéria é obrigatória'),
    concept: z.string().trim().min(1, 'O conceito é obrigatório'),
});

export type GenerateSimuladoInput = z.infer<typeof generateSimuladoSchema>;