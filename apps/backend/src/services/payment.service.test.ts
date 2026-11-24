import { createHmac } from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaymentRepository } from '../repositories/payment.repository';
import type { CreatePaymentInput } from '../schemas/payment.schema';
import { prisma } from '../lib/prisma';
import {
  PaymentService,
  RechargeProviderError,
  type RechargeProvider,
} from './payment.service';

vi.mock('../lib/prisma', () => ({
  prisma: {
    paymentEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    payment: {
      upsert: vi.fn(),
    },
  },
}));

function createRepositoryMock() {
  return {
    findStudentByUserId: vi.fn(),
    findAvailableCatalogItems: vi.fn(),
    findAvailableCatalogItem: vi.fn(),
    reserveCoins: vi.fn(),
    markCompleted: vi.fn(),
    refund: vi.fn(),
  };
}

const input: CreatePaymentInput = {
  catalogItemId: 'item-1',
  phoneNumber: '11912345678',
};

const payment = {
  id: 'payment-1',
  amountBRL: 20,
  coinsSpent: 200,
  status: 'PENDING',
};

describe('PaymentService - recargas', () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let provider: RechargeProvider;
  let service: PaymentService;

  beforeEach(() => {
    repository = createRepositoryMock();
    provider = { createRecharge: vi.fn() };
    service = new PaymentService(
      repository as unknown as PaymentRepository,
      provider,
    );
    repository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 500,
    });
    repository.findAvailableCatalogItem.mockResolvedValue({
      id: 'item-1',
      amountBRL: 20,
      coinsCost: 200,
    });
    repository.reserveCoins.mockResolvedValue(payment);
    repository.markCompleted.mockResolvedValue({
      ...payment,
      status: 'COMPLETED',
      externalId: 'provider-1',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reserva coins, solicita a recarga e conclui o pagamento', async () => {
    vi.mocked(provider.createRecharge).mockResolvedValue({
      externalId: 'provider-1',
    });

    await expect(
      service.createRecharge('user-1', input),
    ).resolves.toMatchObject({
      id: 'payment-1',
      status: 'COMPLETED',
    });

    expect(repository.reserveCoins).toHaveBeenCalledWith({
      studentId: 'student-1',
      catalogItemId: 'item-1',
      phoneNumber: input.phoneNumber,
    });
  });

  it('estorna quando o provedor declara uma falha definitiva', async () => {
    vi.mocked(provider.createRecharge).mockRejectedValue(
      new RechargeProviderError('DEFINITIVE', 'Recarga rejeitada'),
    );

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'PROVIDER_FAILURE',
    });

    expect(repository.refund).toHaveBeenCalledWith('payment-1');
  });

  it('mantém a reserva pendente em falha incerta', async () => {
    vi.mocked(provider.createRecharge).mockRejectedValue(
      new RechargeProviderError('UNCERTAIN', 'Timeout'),
    );

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'PROVIDER_FAILURE',
    });

    expect(repository.refund).not.toHaveBeenCalled();
  });
});

describe('PaymentService - Mercado Pago webhook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'test-secret';
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'test-token';
  });

  function signature(paymentId: string, requestId: string, timestamp: string) {
    const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
    const v1 = createHmac('sha256', 'test-secret').update(manifest).digest('hex');
    return `ts=${timestamp},v1=${v1}`;
  }

  it('consulta e confirma um pagamento aprovado', async () => {
    vi.mocked(prisma.paymentEvent.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.payment.upsert).mockResolvedValue({
      id: 'payment-db-1',
    } as never);
    vi.mocked(prisma.paymentEvent.create).mockResolvedValue({
      id: 'event-1',
    } as never);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 123,
        status: 'approved',
        transaction_amount: 49.9,
        currency_id: 'BRL',
        external_reference: 'redemption-1',
      }),
    }));

    const timestamp = '1700000000';
    const requestId = 'request-1';
    const result = await new PaymentService().processMercadoPagoWebhook(
      { action: 'payment.updated', data: { id: 123 } },
      requestId,
      signature('123', requestId, timestamp),
    );

    expect(result).toEqual({ processed: true, status: 'APPROVED' });
  });

  it('rejeita uma assinatura inválida', async () => {
    await expect(new PaymentService().processMercadoPagoWebhook(
      { action: 'payment.updated', data: { id: '123' } },
      'request-1',
      'ts=1700000000,v1=assinatura-invalida',
    )).rejects.toThrow('Assinatura inválida');
  });
});
