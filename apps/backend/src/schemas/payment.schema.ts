import { z } from 'zod';

export const createPaymentSchema = z
  .object({
    catalogItemId: z.string().uuid('ID do item do catálogo inválido'),
    phoneNumber: z
      .string()
      .transform((value) => value.replace(/\D/g, ''))
      .pipe(z.string().regex(/^\d{2}9\d{8}$/, 'Telefone inválido')),
  })
  .strict();

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
