import { z } from 'zod';

export const redeemRewardSchema = z
  .object({
    rewardId: z.string().uuid('ID da recompensa inválido'),
  })
  .strict();

export type RedeemRewardInput = z.infer<typeof redeemRewardSchema>;
