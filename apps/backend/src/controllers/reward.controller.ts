import type { Request, Response } from 'express';
import { RewardError } from '../errors/reward.error';
import { rewardService } from '../services/reward.service';

export async function createReward(req: Request, res: Response) {
  try {
    const reward = await rewardService.create(req.body);
    return res.status(201).json(reward);
  } catch (error) {
    if (error instanceof RewardError) {
      return res.status(409).json({ code: error.code, error: error.message });
    }
    return res.status(500).json({ error: 'Erro ao criar recompensa' });
  }
}

export async function updateReward(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reward = await rewardService.update(id, req.body);
    return res.status(200).json(reward);
  } catch (error) {
    if (error instanceof RewardError) {
      const status = error.code === 'REWARD_NOT_FOUND' ? 404 : 409;
      return res.status(status).json({ code: error.code, error: error.message });
    }
    return res.status(500).json({ error: 'Erro ao atualizar recompensa' });
  }
}

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

export async function redeemReward(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const result = await rewardService.redeem(userId, req.body);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof RewardError) {
      const status =
        error.code === 'REWARD_NOT_FOUND' ||
        error.code === 'STUDENT_NOT_FOUND'
          ? 404
          : 409;

      return res.status(status).json({
        code: error.code,
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Erro ao resgatar recompensa',
    });
  }
}
