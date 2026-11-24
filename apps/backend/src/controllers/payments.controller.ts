import type { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';

export async function mercadoPagoWebhook(req: Request, res: Response) {
	try {
		await paymentService.processMercadoPagoWebhook(
			req.body,
			req.headers['x-request-id']?.toString(),
			req.headers['x-signature']?.toString(),
		);
		return res.status(200).json({ received: true });
	} catch (error) {
		if (error instanceof Error && error.message === 'Assinatura inválida') {
			return res.status(401).json({ error: 'Assinatura inválida' });
		}
		if (error instanceof Error && error.message === 'Webhook não configurado') {
			return res.status(503).json({ error: 'Webhook não configurado' });
		}
		if (error instanceof Error && error.message === 'MERCADO_PAGO_ACCESS_TOKEN não configurado') {
			return res.status(503).json({ error: 'Access token do Mercado Pago não configurado' });
		}
		if (error instanceof Error && error.message.startsWith('Mercado Pago retornou ')) {
			return res.status(502).json({ error: 'Não foi possível consultar o pagamento no Mercado Pago' });
		}

		console.error('Erro ao processar webhook de pagamento:', error);
		return res.status(500).json({ error: 'Erro ao processar webhook' });
	}
}
