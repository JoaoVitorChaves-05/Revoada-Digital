import type { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { RewardError } from '../errors/reward.error';

export class RewardRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  findAvailable() {
    return this.client.reward.findMany({
      where: {
        isAvailable: true,
        OR: [{ stock: null }, { stock: { gt: 0 } }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        cost: true,
      },
      orderBy: { cost: 'asc' },
    });
  }

  findStudentByUserId(userId: string) {
    return this.client.studentProfile.findUnique({
      where: { userId },
      select: { id: true, points: true },
    });
  }

  findById(id: string) {
    return this.client.reward.findUnique({
      where: { id },
      select: {
        id: true,
        cost: true,
        isAvailable: true,
        stock: true,
      },
    });
  }

  redeemTransaction(data: {
    studentId: string;
    rewardId: string;
    cost: number;
  }) {
    return this.client.$transaction(async (tx) => {
      const debit = await tx.studentProfile.updateMany({
        where: {
          id: data.studentId,
          points: { gte: data.cost },
        },
        data: {
          points: { decrement: data.cost },
        },
      });

      if (debit.count === 0) {
        throw new RewardError(
          'INSUFFICIENT_POINTS',
          'Saldo de pontos insuficiente',
        );
      }

      const currentReward = await tx.reward.findUnique({
        where: { id: data.rewardId },
        select: {
          id: true,
          cost: true,
          isAvailable: true,
          stock: true,
        },
      });

      this.assertRewardCanBeRedeemed(currentReward, data.cost);

      const inventory = await tx.reward.updateMany({
        where: {
          id: data.rewardId,
          isAvailable: true,
          cost: data.cost,
          ...(currentReward.stock === null
            ? { stock: null }
            : { stock: { gte: 1 } }),
        },
        data:
          currentReward.stock === null
            ? { isAvailable: true }
            : { stock: { decrement: 1 } },
      });

      if (inventory.count === 0) {
        const latestReward = await tx.reward.findUnique({
          where: { id: data.rewardId },
          select: {
            id: true,
            cost: true,
            isAvailable: true,
            stock: true,
          },
        });
        this.assertRewardCanBeRedeemed(latestReward, data.cost);
        throw new RewardError(
          'REWARD_CHANGED',
          'A recompensa foi alterada durante o resgate',
        );
      }

      const redemption = await tx.redemption.create({
        data: {
          studentId: data.studentId,
          rewardId: data.rewardId,
          pointsSpent: data.cost,
        },
        select: {
          id: true,
          rewardId: true,
          pointsSpent: true,
          createdAt: true,
        },
      });

      const student = await tx.studentProfile.findUnique({
        where: { id: data.studentId },
        select: { points: true },
      });

      if (!student) {
        throw new RewardError(
          'STUDENT_NOT_FOUND',
          'Perfil de aluno não encontrado',
        );
      }

      return { redemption, balance: student.points };
    });
  }

  private assertRewardCanBeRedeemed(
    reward: {
      id: string;
      cost: number;
      isAvailable: boolean;
      stock: number | null;
    } | null,
    expectedCost: number,
  ): asserts reward is NonNullable<typeof reward> {
    if (!reward) {
      throw new RewardError('REWARD_NOT_FOUND', 'Recompensa não encontrada');
    }

    if (!reward.isAvailable) {
      throw new RewardError('REWARD_INACTIVE', 'Recompensa indisponível');
    }

    if (reward.stock !== null && reward.stock < 1) {
      throw new RewardError('OUT_OF_STOCK', 'Recompensa sem estoque');
    }

    if (reward.cost !== expectedCost) {
      throw new RewardError(
        'REWARD_CHANGED',
        'O custo da recompensa foi alterado',
      );
    }
  }
}
