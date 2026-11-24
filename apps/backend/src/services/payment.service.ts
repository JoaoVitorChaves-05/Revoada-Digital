import { createHmac, timingSafeEqual } from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { PaymentError } from '../errors/payment.error';
import { PaymentRepository } from '../repositories/payment.repository';
import type { CreatePaymentInput } from '../schemas/payment.schema';

type MercadoPagoWebhook = {
	action?: string;
	type?: string;
	id?: string | number;
	data?: { id?: string | number };
};

type MercadoPagoPayment = {
	id?: number | string;
	status?: string;
	status_detail?: string;
	transaction_amount?: number;
	currency_id?: string;
	external_reference?: string;
};

export interface RechargeProvider {
	createRecharge(input: {
		phone: string;
		amountBRL: number;
		reference: string;
	}): Promise<{ externalId: string }>;
}

export type ProviderFailureCertainty = 'DEFINITIVE' | 'UNCERTAIN';

export class RechargeProviderError extends Error {
	constructor(
		readonly certainty: ProviderFailureCertainty,
		message: string,
	) {
		super(message);
		this.name = 'RechargeProviderError';
	}
}

class UnconfiguredRechargeProvider implements RechargeProvider {
	async createRecharge(): Promise<{ externalId: string }> {
		throw new RechargeProviderError(
			'DEFINITIVE',
			'Provedor de recarga ainda não configurado',
		);
	}
}

function parseHeader(header: string | undefined, name: 'ts' | 'v1') {
	if (!header) return undefined;
	const item = header
		.split(',')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${name}=`));
	return item?.slice(name.length + 1);
}

function verifySignature(
	signatureHeader: string | undefined,
	requestId: string | undefined,
	dataId: string,
	secret: string,
) {
	const timestamp = parseHeader(signatureHeader, 'ts');
	const signature = parseHeader(signatureHeader, 'v1');
	if (!timestamp || !signature || !requestId) return false;

	const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
	const expected = createHmac('sha256', secret).update(manifest).digest('hex');
	const expectedBuffer = Buffer.from(expected);
	const signatureBuffer = Buffer.from(signature);

	return (
		expectedBuffer.length === signatureBuffer.length &&
		timingSafeEqual(expectedBuffer, signatureBuffer)
	);
}

function mapStatus(status?: string): PaymentStatus {
	switch (status) {
		case 'approved':
			return PaymentStatus.APPROVED;
		case 'refunded':
		case 'charged_back':
			return PaymentStatus.REFUNDED;
		case 'rejected':
		case 'cancelled':
			return PaymentStatus.FAILED;
		default:
			return PaymentStatus.PENDING;
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
		} catch (error) {
			const providerError =
				error instanceof RechargeProviderError
					? error
					: new RechargeProviderError(
							'UNCERTAIN',
							'Falha não classificada ao solicitar recarga',
						);

			console.error('[payments] recharge provider failed', {
				paymentId: payment.id,
				certainty: providerError.certainty,
				error:
					error instanceof Error
						? `${error.name}: ${error.message}`
						: String(error),
			});

			if (providerError.certainty === 'DEFINITIVE') {
				try {
					await this.paymentRepository.refund(payment.id);
				} catch (refundError) {
					console.error('[payments] point refund failed', {
						paymentId: payment.id,
						providerError: `${providerError.name}: ${providerError.message}`,
						refundError:
							refundError instanceof Error
								? `${refundError.name}: ${refundError.message}`
								: String(refundError),
					});
					throw new PaymentError(
						'REFUND_FAILURE',
						'A recarga falhou e não foi possível estornar os pontos',
					);
				}
			}

			throw new PaymentError(
				'PROVIDER_FAILURE',
				'Não foi possível solicitar a recarga ao provedor',
			);
		}

		const completedPayment = await this.paymentRepository
			.markCompleted(payment.id, providerResult.externalId)
			.catch((error: unknown) => {
				console.error('[payments] failed to persist provider acceptance', {
					paymentId: payment.id,
					externalId: providerResult.externalId,
					error:
						error instanceof Error
							? `${error.name}: ${error.message}`
							: String(error),
				});
				throw error;
			});

		return {
			...completedPayment,
			amountBRL: Number(completedPayment.amountBRL),
		};
	}

	async processMercadoPagoWebhook(
		body: MercadoPagoWebhook,
		requestId?: string,
		signatureHeader?: string,
	) {
		const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
		if (!secret) throw new Error('Webhook não configurado');

		if (body?.data?.id === undefined || body.data.id === null) return { ignored: true };
		const dataId = String(body.data.id).trim();
		if (!/^\d+$/.test(dataId)) return { ignored: true };

		if (!verifySignature(signatureHeader, requestId, dataId, secret)) {
			throw new Error('Assinatura inválida');
		}

		const notificationId = body.id === undefined || body.id === null
			? `${body.action ?? body.type ?? 'notification'}:${dataId}`
			: String(body.id);
		const providerEventId = `mercado-pago:${notificationId}`;
		const existingEvent = await prisma.paymentEvent.findUnique({
			where: { providerEventId },
		});
		if (existingEvent) return { ignored: true, reason: 'Evento já processado' };

		const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
		if (!accessToken) throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');

		const response = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
			headers: { Authorization: 'Bearer ' + accessToken },
		});
		if (!response.ok) throw new Error(`Mercado Pago retornou ${response.status}`);

		const payment = await response.json() as MercadoPagoPayment;
		const status = mapStatus(payment.status);

		const savedPayment = await prisma.payment.upsert({
			where: { externalId: dataId },
			create: {
				externalId: dataId,
				status,
				providerStatus: payment.status,
				amount: payment.transaction_amount,
				currency: payment.currency_id ?? 'BRL',
				externalReference: payment.external_reference,
			},
			update: {
				status,
				providerStatus: payment.status,
				amount: payment.transaction_amount,
				currency: payment.currency_id ?? 'BRL',
				externalReference: payment.external_reference,
			},
		});

		await prisma.paymentEvent.create({
			data: {
				paymentId: savedPayment.id,
				providerEventId,
				action: body.action ?? body.type,
				payload: body as object,
			},
		});

		return { processed: true, status };
	}
}

export const paymentService = new PaymentService();
