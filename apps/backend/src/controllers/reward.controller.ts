import type { Request, Response } from 'express';
import { rewardService } from '../services/reward.service';

export async function getAvailableRewards(
  _req: Request,
  res: Response,
) {
  try {
    const rewards = await rewardService.findAvailable();
    return res.status(200).json(rewards);
  } catch {
    return res.status(500).json({
      error: 'Erro ao consultar catálogo de recompensas',
    });
  }
}
