import { z } from 'zod';

export const generateSimuladoSchema = z.object({
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    studentId: z.string().trim().min(1, 'ID do aluno é obrigatório'),
    subject: z.string().trim().min(1, 'A matéria é obrigatória'),
    concept: z.string().trim().min(1, 'O conceito é obrigatório'),
});

export type GenerateSimuladoInput = z.infer<typeof generateSimuladoSchema>;
=======
=======
>>>>>>> Stashed changes
    //studentId: z.string().trim().min(1, 'ID do aluno é obrigatório'),
    subject: z.string().trim().min(1, 'A matéria é obrigatória'),
    //concept: z.string().trim().min(1, 'O conceito é obrigatório'),
    quantidade: z.number().int().min(1, 'A dificuldade mínima é 1'),
});

export type GenerateSimuladoInput = z.infer<typeof generateSimuladoSchema>;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
