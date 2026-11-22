import { Router } from 'express';
import { mercadoPagoWebhook } from '../controllers/payments.controller';

const paymentsRouter = Router();

paymentsRouter.post('/webhook/mercado-pago', mercadoPagoWebhook);

export default paymentsRouter;
