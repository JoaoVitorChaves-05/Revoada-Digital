import type { Request, Response } from 'express';
import { PaymentError } from '../errors/payment.error';
import { paymentService } from '../services/payment.service';

export async function getRechargeCatalog(
  _req: Request,
  res: Response,
) {
  try {
    const items = await paymentService.findAvailableCatalogItems();
    return res.status(200).json(items);
  } catch {
    return res.status(500).json({
      error: 'Erro ao consultar catálogo de recargas',
    });
  }
}

export async function createRecharge(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  try {
    const payment = await paymentService.createRecharge(userId, req.body);
    return res.status(201).json(payment);
  } catch (error) {
    if (error instanceof PaymentError) {
      const status =
        error.code === 'STUDENT_NOT_FOUND' ||
        error.code === 'CATALOG_ITEM_NOT_FOUND' ||
        error.code === 'PAYMENT_NOT_FOUND'
          ? 404
          : error.code === 'PROVIDER_FAILURE'
            ? 502
            : error.code === 'INSUFFICIENT_POINTS' ||
                error.code === 'INVALID_PAYMENT_STATUS'
              ? 409
              : 500;

      return res.status(status).json({
        code: error.code,
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Erro ao processar recarga',
    });
  }
}
