import { createHmac, timingSafeEqual } from 'crypto';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

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
	async processMercadoPagoWebhook(
		body: MercadoPagoWebhook,
		requestId?: string,
		signatureHeader?: string,
	) {
		const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
		if (!secret) throw new Error('Webhook não configurado');

		if (body?.data?.id === undefined || body.data.id === null) return { ignored: true };
		const dataId = String(body.data.id).trim();
		if (!dataId) return { ignored: true };

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
			headers: { Authorization: `Bearer ${accessToken}` },
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
