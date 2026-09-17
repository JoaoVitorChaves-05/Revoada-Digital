// src/schemas/question.schema.ts
import { z } from 'zod';

export const createQuestionSchema = z.object({
  statement: z.string({ required_error: "O enunciado (statement) é obrigatório." }),
  difficulty: z.string({ required_error: "A dificuldade é obrigatória." }),
  alternatives: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean()
    })
  )
  .min(1, "É obrigatório enviar pelo menos uma alternativa.")
  .refine((alts) => alts.some((alt) => alt.isCorrect === true), {
    message: "Pelo menos uma alternativa deve estar marcada como correta (isCorrect: true).",
  }),
});