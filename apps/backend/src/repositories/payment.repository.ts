import type { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { PaymentError } from '../errors/payment.error';

export class PaymentRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  findStudentByUserId(userId: string) {
    return this.client.studentProfile.findUnique({
      where: { userId },
      select: { id: true, points: true },
    });
  }

  findAvailableCatalogItems() {
    return this.client.rechargeCatalogItem.findMany({
      where: { isAvailable: true },
      select: {
        id: true,
        name: true,
        amountBRL: true,
        coinsCost: true,
      },
      orderBy: { amountBRL: 'asc' },
    });
  }

  findAvailableCatalogItem(id: string) {
    return this.client.rechargeCatalogItem.findFirst({
      where: { id, isAvailable: true },
      select: {
        id: true,
        name: true,
        amountBRL: true,
        coinsCost: true,
      },
    });
  }

  reserveCoins(data: {
    studentId: string;
    catalogItemId: string;
    phoneNumber: string;
  }) {
    return this.client.$transaction(async (tx) => {
      const item = await tx.rechargeCatalogItem.findFirst({
        where: { id: data.catalogItemId, isAvailable: true },
        select: { amountBRL: true, coinsCost: true },
      });

      if (!item) {
        throw new PaymentError(
          'CATALOG_ITEM_NOT_FOUND',
          'Item de recarga não encontrado',
        );
      }

      const debit = await tx.studentProfile.updateMany({
        where: {
          id: data.studentId,
          points: { gte: item.coinsCost },
        },
        data: {
          points: { decrement: item.coinsCost },
        },
      });

      if (debit.count === 0) {
        throw new PaymentError(
          'INSUFFICIENT_POINTS',
          'Saldo de pontos insuficiente',
        );
      }

      return tx.payment.create({
        data: {
          studentId: data.studentId,
          catalogItemId: data.catalogItemId,
          phoneNumber: data.phoneNumber,
          amountBRL: item.amountBRL,
          coinsSpent: item.coinsCost,
          status: 'PENDING',
        },
        select: {
          id: true,
          amountBRL: true,
          coinsSpent: true,
          status: true,
        },
      });
    });
  }

  async markCompleted(paymentId: string, externalId: string) {
    const updated = await this.client.payment.updateMany({
      where: { id: paymentId, status: 'PENDING' },
      data: { status: 'COMPLETED', externalId },
    });

    if (updated.count === 0) {
      throw new PaymentError(
        'INVALID_PAYMENT_STATUS',
        'O pagamento não está pendente',
      );
    }

    return this.client.payment.findUniqueOrThrow({
      where: { id: paymentId },
      select: {
        id: true,
        amountBRL: true,
        coinsSpent: true,
        status: true,
        externalId: true,
      },
    });
  }

  refund(paymentId: string) {
    return this.client.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        select: {
          studentId: true,
          coinsSpent: true,
          status: true,
        },
      });

      if (!payment) {
        throw new PaymentError('PAYMENT_NOT_FOUND', 'Pagamento não encontrado');
      }

      if (payment.status === 'REFUNDED') {
        return;
      }

      if (payment.status !== 'PENDING') {
        throw new PaymentError(
          'INVALID_PAYMENT_STATUS',
          'Somente pagamentos pendentes podem ser estornados',
        );
      }

      const updated = await tx.payment.updateMany({
        where: { id: paymentId, status: 'PENDING' },
        data: { status: 'REFUNDED' },
      });

      if (updated.count === 0) {
        const latestPayment = await tx.payment.findUnique({
          where: { id: paymentId },
          select: { status: true },
        });

        if (latestPayment?.status === 'REFUNDED') {
          return;
        }

        throw new PaymentError(
          'INVALID_PAYMENT_STATUS',
          'O pagamento não está mais pendente',
        );
      }

      await tx.studentProfile.update({
        where: { id: payment.studentId },
        data: { points: { increment: payment.coinsSpent } },
      });
    });
  }
}
