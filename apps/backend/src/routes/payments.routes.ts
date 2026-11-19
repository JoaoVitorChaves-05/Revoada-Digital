import { Router } from 'express';
import {
  createRecharge,
  getRechargeCatalog,
} from '../controllers/payment.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate.middleware';
import { createPaymentSchema } from '../schemas/payment.schema';

const paymentsRouter = Router();

paymentsRouter.get('/catalog', ensureAuthenticated, getRechargeCatalog);
paymentsRouter.post(
  '/recharge',
  ensureAuthenticated,
  validateSchema(createPaymentSchema),
  createRecharge,
);

export default paymentsRouter;
