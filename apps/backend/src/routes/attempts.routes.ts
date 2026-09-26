import { Router } from 'express';
import {
  createAttempt,
  readAttempt,
  deleteAttempt,
  submitAttempt,
} from '../controllers/attempt.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createAttemptSchema, submitAttemptSchema } from '../schemas/attempt.schema';

const attemptsRouter = Router();

attemptsRouter.get('/:id', readAttempt);
attemptsRouter.post('/', validateSchema(createAttemptSchema), createAttempt);
attemptsRouter.post('/:id/submit', validateSchema(submitAttemptSchema), submitAttempt);
attemptsRouter.delete('/:id', deleteAttempt);

export default attemptsRouter;