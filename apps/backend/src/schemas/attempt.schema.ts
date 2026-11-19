import { z } from 'zod';

// Schema para criação de uma tentativa
export const createAttemptSchema = z.object({
  mockExamId: z.string().uuid('ID do simulado inválido'),
});

// Schema para submissão/entrega da avaliação
export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid('ID da questão inválido'),
        selectedAlternativeId: z.string().uuid('ID da alternativa inválido').nullable().optional(),
      })
    )
    .min(1, 'A avaliação deve conter ao menos uma resposta enviada.'),
  // Flag opcional: o aluno pode escolher não creditar coins deste simulado.
  // Precisa constar no schema, senão o validateSchema a remove do corpo
  // antes de chegar ao creditarCoinsMiddleware.
  creditarCoins: z.boolean().optional(),
});

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;