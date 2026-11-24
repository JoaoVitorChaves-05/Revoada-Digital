import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { RewardRepository } from '../repositories/reward.repository';
import { RewardService } from './reward.service';

const databaseUrl = process.env.REWARD_CONCURRENCY_TEST_DATABASE_URL;
const concurrencySuite = describe.skipIf(!databaseUrl);

function assertSafeTestDatabaseUrl(value: string): void {
  const url = new URL(value);
  const databaseName = decodeURIComponent(url.pathname.slice(1));

  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    !databaseName.endsWith('_test')
  ) {
    throw new Error(
      'REWARD_CONCURRENCY_TEST_DATABASE_URL deve apontar para PostgreSQL local com nome terminado em _test',
    );
  }
}

function createBarrier(parties: number): () => Promise<void> {
  let arrived = 0;
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });

  return async () => {
    arrived += 1;
    if (arrived === parties) {
      release();
    }
    await barrier;
  };
}

class PrecheckedRewardRepository extends RewardRepository {
  constructor(
    client: PrismaClient,
    private readonly waitForBothStudents: () => Promise<void>,
    private readonly waitForBothRewards: () => Promise<void>,
  ) {
    super(client);
  }

  override async findStudentByUserId(userId: string) {
    const student = await super.findStudentByUserId(userId);
    await this.waitForBothStudents();
    return student;
  }

  override async findById(id: string) {
    const reward = await super.findById(id);
    await this.waitForBothRewards();
    return reward;
  }
}

concurrencySuite('RewardService concorrência no PostgreSQL', () => {
  let firstClient: PrismaClient | undefined;
  let secondClient: PrismaClient | undefined;
  let schoolId = '';
  let firstUserId = '';
  let secondUserId = '';
  let firstStudentId = '';
  let secondStudentId = '';
  let balanceRewardId = '';
  let stockRewardId = '';

  beforeAll(async () => {
    assertSafeTestDatabaseUrl(databaseUrl!);

    firstClient = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl! }),
    });
    secondClient = new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl! }),
    });

    const school = await firstClient.school.create({
      data: {
        school_name: `Reward concurrency ${randomUUID()}`,
        school_city: 'Test',
      },
      select: { id: true },
    });
    schoolId = school.id;

    const createStudent = async (label: string) =>
      firstClient!.user.create({
        data: {
          email: `${randomUUID()}@reward-test.invalid`,
          password: 'integration-test',
          full_name: `Reward test ${label}`,
          cpf: randomUUID(),
          profileType: 'STUDENT',
          studentProfile: {
            create: {
              points: 100,
              yearId: 2026,
              school: { connect: { id: schoolId } },
            },
          },
        },
        select: {
          id: true,
          studentProfile: { select: { id: true } },
        },
      });

    const firstStudent = await createStudent('A');
    const secondStudent = await createStudent('B');
    firstUserId = firstStudent.id;
    firstStudentId = firstStudent.studentProfile!.id;
    secondUserId = secondStudent.id;
    secondStudentId = secondStudent.studentProfile!.id;

    const balanceReward = await firstClient.reward.create({
      data: {
        name: 'Balance concurrency reward',
        description: 'Used to test conditional point debits',
        cost: 100,
        stock: 2,
      },
      select: { id: true },
    });
    const stockReward = await firstClient.reward.create({
      data: {
        name: 'Stock concurrency reward',
        description: 'Used to test conditional inventory updates',
        cost: 100,
        stock: 1,
      },
      select: { id: true },
    });
    balanceRewardId = balanceReward.id;
    stockRewardId = stockReward.id;
  });

  afterAll(async () => {
    try {
      if (firstClient) {
        await firstClient.$transaction(async (tx) => {
          const rewardIds = [balanceRewardId, stockRewardId].filter(Boolean);

          if (rewardIds.length > 0) {
            await tx.redemption.deleteMany({
              where: { rewardId: { in: rewardIds } },
            });
            await tx.reward.deleteMany({
              where: { id: { in: rewardIds } },
            });
          }

          const userIds = [firstUserId, secondUserId].filter(Boolean);
          if (userIds.length > 0) {
            await tx.user.deleteMany({ where: { id: { in: userIds } } });
          }

          if (schoolId) {
            await tx.school.deleteMany({ where: { id: schoolId } });
          }
        });
      }
    } finally {
      await Promise.all([
        firstClient?.$disconnect(),
        secondClient?.$disconnect(),
      ]);
    }
  });

  it('permite apenas um resgate quando duas chamadas competem pelo mesmo saldo', async () => {
    const waitForBothStudents = createBarrier(2);
    const waitForBothRewards = createBarrier(2);
    const firstService = new RewardService(
      new PrecheckedRewardRepository(
        firstClient!,
        waitForBothStudents,
        waitForBothRewards,
      ),
    );
    const secondService = new RewardService(
      new PrecheckedRewardRepository(
        secondClient!,
        waitForBothStudents,
        waitForBothRewards,
      ),
    );

    const results = await Promise.allSettled([
      firstService.redeem(firstUserId, { rewardId: balanceRewardId }),
      secondService.redeem(firstUserId, { rewardId: balanceRewardId }),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected).toMatchObject({
      status: 'rejected',
      reason: expect.objectContaining({ code: 'INSUFFICIENT_POINTS' }),
    });

    const [student, reward, redemptions] = await Promise.all([
      firstClient!.studentProfile.findUnique({
        where: { id: firstStudentId },
        select: { points: true },
      }),
      firstClient!.reward.findUnique({
        where: { id: balanceRewardId },
        select: { stock: true },
      }),
      firstClient!.redemption.count({
        where: { rewardId: balanceRewardId },
      }),
    ]);

    expect(student?.points).toBe(0);
    expect(reward?.stock).toBe(1);
    expect(redemptions).toBe(1);
  });

  it('reverte o débito quando duas chamadas competem pelo último item', async () => {
    await firstClient!.studentProfile.update({
      where: { id: firstStudentId },
      data: { points: 100 },
    });

    const waitForBothStudents = createBarrier(2);
    const waitForBothRewards = createBarrier(2);
    const firstService = new RewardService(
      new PrecheckedRewardRepository(
        firstClient!,
        waitForBothStudents,
        waitForBothRewards,
      ),
    );
    const secondService = new RewardService(
      new PrecheckedRewardRepository(
        secondClient!,
        waitForBothStudents,
        waitForBothRewards,
      ),
    );

    const results = await Promise.allSettled([
      firstService.redeem(firstUserId, { rewardId: stockRewardId }),
      secondService.redeem(secondUserId, { rewardId: stockRewardId }),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected).toMatchObject({
      status: 'rejected',
      reason: expect.objectContaining({ code: 'OUT_OF_STOCK' }),
    });

    const [firstStudent, secondStudent, reward, redemptions] =
      await Promise.all([
        firstClient!.studentProfile.findUnique({
          where: { id: firstStudentId },
          select: { points: true },
        }),
        firstClient!.studentProfile.findUnique({
          where: { id: secondStudentId },
          select: { points: true },
        }),
        firstClient!.reward.findUnique({
          where: { id: stockRewardId },
          select: { stock: true },
        }),
        firstClient!.redemption.count({
          where: { rewardId: stockRewardId },
        }),
      ]);

    expect(
      [firstStudent?.points, secondStudent?.points].sort(),
    ).toEqual([0, 100]);
    expect(reward?.stock).toBe(0);
    expect(redemptions).toBe(1);
  });
});
