import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaymentRepository } from '../repositories/payment.repository';
import type { CreatePaymentInput } from '../schemas/payment.schema';
import {
  PaymentService,
  RechargeProviderError,
  type RechargeProvider,
} from './payment.service';

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

describe('PaymentService', () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let provider: RechargeProvider;
  let service: PaymentService;

  beforeEach(() => {
    repository = createRepositoryMock();
    provider = {
      createRecharge: vi.fn(),
    };
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
    expect(provider.createRecharge).toHaveBeenCalledWith({
      phone: input.phoneNumber,
      amountBRL: 20,
      reference: 'payment-1',
    });
    expect(repository.markCompleted).toHaveBeenCalledWith(
      'payment-1',
      'provider-1',
    );
    expect(repository.refund).not.toHaveBeenCalled();
  });

  it('estorna quando o provedor declara uma falha definitiva', async () => {
    const providerError = new RechargeProviderError(
      'DEFINITIVE',
      'Recarga rejeitada',
    );
    vi.mocked(provider.createRecharge).mockRejectedValue(
      providerError,
    );
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'PROVIDER_FAILURE',
    });

    expect(repository.refund).toHaveBeenCalledWith('payment-1');
    expect(repository.markCompleted).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      '[payments] recharge provider failed',
      expect.objectContaining({
        paymentId: 'payment-1',
        certainty: 'DEFINITIVE',
        error: 'RechargeProviderError: Recarga rejeitada',
      }),
    );
  });

  it('mantém a reserva pendente quando a falha do provedor é incerta', async () => {
    vi.mocked(provider.createRecharge).mockRejectedValue(
      new RechargeProviderError('UNCERTAIN', 'Timeout'),
    );
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'PROVIDER_FAILURE',
    });

    expect(repository.refund).not.toHaveBeenCalled();
    expect(repository.markCompleted).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      '[payments] recharge provider failed',
      expect.objectContaining({
        paymentId: 'payment-1',
        certainty: 'UNCERTAIN',
      }),
    );
  });

  it('trata erros não tipados do provedor como incertos', async () => {
    vi.mocked(provider.createRecharge).mockRejectedValue(
      new Error('network timeout'),
    );
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'PROVIDER_FAILURE',
    });

    expect(repository.refund).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      '[payments] recharge provider failed',
      expect.objectContaining({
        paymentId: 'payment-1',
        certainty: 'UNCERTAIN',
      }),
    );
  });

  it('registra falha ao persistir a aceitação do provedor', async () => {
    vi.mocked(provider.createRecharge).mockResolvedValue({
      externalId: 'provider-1',
    });
    const persistenceError = new Error('database unavailable');
    repository.markCompleted.mockRejectedValue(persistenceError);
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toBe(persistenceError);

    expect(logError).toHaveBeenCalledWith(
      '[payments] failed to persist provider acceptance',
      expect.objectContaining({
        paymentId: 'payment-1',
        externalId: 'provider-1',
        error: 'Error: database unavailable',
      }),
    );
  });

  it('não reserva coins quando o saldo é insuficiente', async () => {
    repository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 100,
    });

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_POINTS',
    });

    expect(repository.reserveCoins).not.toHaveBeenCalled();
    expect(provider.createRecharge).not.toHaveBeenCalled();
  });

  it('informa falha explícita se não conseguir estornar os pontos', async () => {
    vi.mocked(provider.createRecharge).mockRejectedValue(
      new RechargeProviderError('DEFINITIVE', 'Recarga rejeitada'),
    );
    repository.refund.mockRejectedValue(new Error('database unavailable'));
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      service.createRecharge('user-1', input),
    ).rejects.toMatchObject({
      code: 'REFUND_FAILURE',
    });

    expect(repository.refund).toHaveBeenCalledWith('payment-1');
    expect(repository.markCompleted).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith(
      '[payments] point refund failed',
      expect.objectContaining({ paymentId: 'payment-1' }),
    );
  });
});
