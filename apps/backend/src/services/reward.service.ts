import { RewardRepository } from '../repositories/reward.repository';

export class RewardService {
  constructor(
    private readonly rewardRepository = new RewardRepository(),
  ) {}

  async findAvailable() {
    const rewards = await this.rewardRepository.findAvailable();

    return rewards.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsCost: reward.pointsCost,
    }));
  }
}

export const rewardService = new RewardService();
