import { prisma } from '../lib/prisma';

export class RewardRepository {
  findAvailable() {
    return prisma.reward.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        name: true,
        description: true,
        pointsCost: true,
      },
      orderBy: { pointsCost: 'asc' },
    });
  }
}
