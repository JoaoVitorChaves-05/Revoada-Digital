import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentService, type RechargeProvider } from './payment.service';

const databaseUrl = process.env.PAYMENT_CONCURRENCY_TEST_DATABASE_URL;
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
      'PAYMENT_CONCURRENCY_TEST_DATABASE_URL deve apontar para PostgreSQL local com nome terminado em _test',
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

class PrecheckedPaymentRepository extends PaymentRepository {
  constructor(
    client: PrismaClient,
    private readonly waitForBothStudents: () => Promise<void>,
    private readonly waitForBothItems: () => Promise<void>,
  ) {
    super(client);
  }

  override async findStudentByUserId(userId: string) {
    const student = await super.findStudentByUserId(userId);
    await this.waitForBothStudents();
    return student;
  }

  override async findAvailableCatalogItem(id: string) {
    const item = await super.findAvailableCatalogItem(id);
    await this.waitForBothItems();
    return item;
  }
}

concurrencySuite('PaymentService concorrência no PostgreSQL', () => {
  let firstClient: PrismaClient | undefined;
  let secondClient: PrismaClient | undefined;
  let schoolId = '';
  let userId = '';
  let studentId = '';
  let catalogItemId = '';

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
        school_name: `Payment concurrency ${randomUUID()}`,
        school_city: 'Test',
      },
      select: { id: true },
    });
    schoolId = school.id;

    const user = await firstClient.user.create({
      data: {
        email: `${randomUUID()}@payment-test.invalid`,
        password: 'integration-test',
        full_name: 'Payment concurrency test',
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
    userId = user.id;
    studentId = user.studentProfile!.id;

    const catalogItem = await firstClient.rechargeCatalogItem.create({
      data: {
        name: 'Concurrency test recharge',
        amountBRL: 10,
        coinsCost: 100,
      },
      select: { id: true },
    });
    catalogItemId = catalogItem.id;
  });

  afterAll(async () => {
    try {
      if (firstClient) {
        await firstClient.$transaction(async (tx) => {
          if (studentId) {
            await tx.payment.deleteMany({ where: { studentId } });
          }
          if (catalogItemId) {
            await tx.rechargeCatalogItem.deleteMany({
              where: { id: catalogItemId },
            });
          }
          if (userId) {
            await tx.user.deleteMany({ where: { id: userId } });
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

  it('reserva saldo uma vez quando chamadas concorrentes competem pelos mesmos coins', async () => {
    const waitForBothStudents = createBarrier(2);
    const waitForBothItems = createBarrier(2);
    const createService = (client: PrismaClient) =>
      new PaymentService(
        new PrecheckedPaymentRepository(
          client,
          waitForBothStudents,
          waitForBothItems,
        ),
        {
          createRecharge: async () => ({ externalId: randomUUID() }),
        },
      );

    const results = await Promise.allSettled([
      createService(firstClient!).createRecharge(userId, {
        catalogItemId,
        phoneNumber: '11912345678',
      }),
      createService(secondClient!).createRecharge(userId, {
        catalogItemId,
        phoneNumber: '11912345678',
      }),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = results.find((result) => result.status === 'rejected');
    expect(rejected).toMatchObject({
      status: 'rejected',
      reason: expect.objectContaining({ code: 'INSUFFICIENT_POINTS' }),
    });

    const [student, paymentCount] = await Promise.all([
      firstClient!.studentProfile.findUnique({
        where: { id: studentId },
        select: { points: true },
      }),
      firstClient!.payment.count({ where: { studentId } }),
    ]);

    expect(student?.points).toBe(0);
    expect(paymentCount).toBe(1);
  });

  it('estorna apenas uma vez mesmo com chamadas concorrentes e repetidas', async () => {
    const payment = await firstClient!.$transaction(async (tx) => {
      await tx.studentProfile.update({
        where: { id: studentId },
        data: { points: 100 },
      });
      await tx.studentProfile.update({
        where: { id: studentId },
        data: { points: { decrement: 100 } },
      });
      return tx.payment.create({
        data: {
          studentId,
          catalogItemId,
          phoneNumber: '11912345678',
          amountBRL: 10,
          coinsSpent: 100,
          status: 'PENDING',
        },
        select: { id: true },
      });
    });

    const firstRepository = new PaymentRepository(firstClient!);
    const secondRepository = new PaymentRepository(secondClient!);
    await Promise.all([
      firstRepository.refund(payment.id),
      secondRepository.refund(payment.id),
    ]);
    await firstRepository.refund(payment.id);

    const [student, refundedPayment] = await Promise.all([
      firstClient!.studentProfile.findUnique({
        where: { id: studentId },
        select: { points: true },
      }),
      firstClient!.payment.findUnique({
        where: { id: payment.id },
        select: { status: true },
      }),
    ]);

    expect(student?.points).toBe(100);
    expect(refundedPayment?.status).toBe('REFUNDED');
  });
});
