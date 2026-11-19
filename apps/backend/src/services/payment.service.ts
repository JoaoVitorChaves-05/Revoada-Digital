import { PaymentError } from '../errors/payment.error';
import { PaymentRepository } from '../repositories/payment.repository';
import type { CreatePaymentInput } from '../schemas/payment.schema';

export interface RechargeProvider {
  createRecharge(input: {
    phone: string;
    amountBRL: number;
    reference: string;
  }): Promise<{ externalId: string }>;
}

class UnconfiguredRechargeProvider implements RechargeProvider {
  async createRecharge(): Promise<{ externalId: string }> {
    throw new Error('Provedor de recarga ainda não configurado');
  }
}

export class PaymentService {
  constructor(
    private readonly paymentRepository = new PaymentRepository(),
    private readonly rechargeProvider: RechargeProvider =
      new UnconfiguredRechargeProvider(),
  ) {}

  async findAvailableCatalogItems() {
    const items = await this.paymentRepository.findAvailableCatalogItems();
    return items.map((item) => ({
      ...item,
      amountBRL: Number(item.amountBRL),
    }));
  }

  async createRecharge(userId: string, input: CreatePaymentInput) {
    const student =
      await this.paymentRepository.findStudentByUserId(userId);

    if (!student) {
      throw new PaymentError(
        'STUDENT_NOT_FOUND',
        'Perfil de aluno não encontrado',
      );
    }

    const item = await this.paymentRepository.findAvailableCatalogItem(
      input.catalogItemId,
    );

    if (!item) {
      throw new PaymentError(
        'CATALOG_ITEM_NOT_FOUND',
        'Item de recarga não encontrado',
      );
    }

    if (student.points < item.coinsCost) {
      throw new PaymentError(
        'INSUFFICIENT_POINTS',
        'Saldo de pontos insuficiente',
      );
    }

    const payment = await this.paymentRepository.reserveCoins({
      studentId: student.id,
      catalogItemId: item.id,
      phoneNumber: input.phoneNumber,
    });

    let providerResult: { externalId: string };
    try {
      providerResult = await this.rechargeProvider.createRecharge({
        phone: input.phoneNumber,
        amountBRL: Number(payment.amountBRL),
        reference: payment.id,
      });
    } catch {
      try {
        await this.paymentRepository.refund(payment.id);
      } catch {
        throw new PaymentError(
          'REFUND_FAILURE',
          'A recarga falhou e não foi possível estornar os pontos',
        );
      }

      throw new PaymentError(
        'PROVIDER_FAILURE',
        'Não foi possível solicitar a recarga ao provedor',
      );
    }

    const completedPayment = await this.paymentRepository.markCompleted(
      payment.id,
      providerResult.externalId,
    );
    return {
      ...completedPayment,
      amountBRL: Number(completedPayment.amountBRL),
    };
  }
}

export const paymentService = new PaymentService();
