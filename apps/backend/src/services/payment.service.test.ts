import { createHmac } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../lib/prisma';
import { PaymentService } from './payment.service';

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
		vi.mocked(prisma.paymentEvent.create).mockResolvedValue({ id: 'event-1' } as never);
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
		expect(prisma.payment.upsert).toHaveBeenCalledWith(expect.objectContaining({
			where: { externalId: '123' },
			create: expect.objectContaining({
				status: 'APPROVED',
				providerStatus: 'approved',
				externalReference: 'redemption-1',
			}),
		}));
	});

	it('rejeita uma assinatura inválida', async () => {
		await expect(new PaymentService().processMercadoPagoWebhook(
			{ action: 'payment.updated', data: { id: '123' } },
			'request-1',
			'ts=1700000000,v1=assinatura-invalida',
		)).rejects.toThrow('Assinatura inválida');

		expect(prisma.paymentEvent.findUnique).not.toHaveBeenCalled();
	});

	it('não processa novamente um evento já registrado', async () => {
		vi.mocked(prisma.paymentEvent.findUnique).mockResolvedValue({
			id: 'event-existing',
		} as never);

		const timestamp = '1700000000';
		const requestId = 'request-1';
		const result = await new PaymentService().processMercadoPagoWebhook(
			{ action: 'payment.updated', data: { id: '123' } },
			requestId,
			signature('123', requestId, timestamp),
		);

		expect(result).toEqual({ ignored: true, reason: 'Evento já processado' });
		expect(prisma.payment.upsert).not.toHaveBeenCalled();
	});
});
