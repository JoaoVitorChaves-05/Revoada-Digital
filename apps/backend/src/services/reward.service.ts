import { RewardRepository } from '../repositories/reward.repository';
import type { RedeemRewardInput } from '../schemas/reward.schema';
import { RewardError } from '../errors/reward.error';

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

  async redeem(userId: string, input: RedeemRewardInput) {
    const student = await this.rewardRepository.findStudentByUserId(userId);
    if (!student) {
      throw new RewardError(
        'STUDENT_NOT_FOUND',
        'Perfil de aluno não encontrado',
      );
    }

    const reward = await this.rewardRepository.findById(input.rewardId);
    if (!reward) {
      throw new RewardError('REWARD_NOT_FOUND', 'Recompensa não encontrada');
    }

    if (!reward.isAvailable) {
      throw new RewardError('REWARD_INACTIVE', 'Recompensa indisponível');
    }

    if (reward.stock !== null && reward.stock < 1) {
      throw new RewardError('OUT_OF_STOCK', 'Recompensa sem estoque');
    }

    if (student.points < reward.pointsCost) {
      throw new RewardError(
        'INSUFFICIENT_POINTS',
        'Saldo de pontos insuficiente',
      );
    }

    return this.rewardRepository.redeemTransaction({
      studentId: student.id,
      rewardId: reward.id,
      pointsCost: reward.pointsCost,
    });
  }
}

export const rewardService = new RewardService();
