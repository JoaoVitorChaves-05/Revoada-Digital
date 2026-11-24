import { z } from 'zod';

export const redeemRewardSchema = z
  .object({
    rewardId: z.string().uuid('ID da recompensa inválido'),
  })
  .strict();

export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;

export const createRewardSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório'),
    description: z.string().trim().min(1, 'Descrição é obrigatória'),
    cost: z.number().int('Custo deve ser inteiro').positive('Custo deve ser maior que zero'),
    isAvailable: z.boolean().optional(),
    stock: z.number().int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo').nullable().optional(),
  })
  .strict();

export type CreateRewardInput = z.infer<typeof createRewardSchema>;

export const updateRewardSchema = z
  .object({
    name: z.string().trim().min(1, 'Nome é obrigatório').optional(),
    description: z.string().trim().min(1, 'Descrição é obrigatória').optional(),
    cost: z.number().int('Custo deve ser inteiro').positive('Custo deve ser maior que zero').optional(),
    isAvailable: z.boolean().optional(),
    stock: z.number().int('Estoque deve ser inteiro').min(0, 'Estoque não pode ser negativo').nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;
