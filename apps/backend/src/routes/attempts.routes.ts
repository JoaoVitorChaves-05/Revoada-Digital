import { Router, Request, Response, NextFunction } from 'express';
import {
  createAttempt,
  readAttempt,
  deleteAttempt,
  submitAttempt,
  getAttemptsFromUser,
} from '../controllers/attempt.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { creditarCoinsMiddleware } from '../middlewares/creditar-coins.middleware';
import { createAttemptSchema, submitAttemptSchema } from '../schemas/attempt.schema';

const attemptsRouter = Router();

// O creditarCoinsMiddleware lê o attemptId do corpo; copia o :id da URL para lá
function injetarAttemptId(req: Request, _res: Response, next: NextFunction) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (req.body.attemptId === undefined) {
    req.body.attemptId = id;
  }
  return next();
}

attemptsRouter.get('/:id', readAttempt);
attemptsRouter.get('/', getAttemptsFromUser);
attemptsRouter.post('/', validateSchema(createAttemptSchema), createAttempt);
attemptsRouter.post(
  '/:id/submit',
  ensureAuthenticated,
  validateSchema(submitAttemptSchema),
  injetarAttemptId,
  creditarCoinsMiddleware,
  submitAttempt,
);
attemptsRouter.delete('/:id', deleteAttempt);

export default attemptsRouter;