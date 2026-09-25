import { Router } from 'express';
import { createAttempt, readAttempt, deleteAttempt, updateAttempt } from '../controllers/attempt.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createAttemptSchema, updateAttemptSchema } from '../schemas/attempt.schema';

const attemptsRouter = Router();

attemptsRouter.get('/:id', readAttempt);
attemptsRouter.post('/', validateSchema(createAttemptSchema), createAttempt);
attemptsRouter.put('/:id', validateSchema(updateAttemptSchema), updateAttempt);
attemptsRouter.delete('/:id', deleteAttempt);

export default attemptsRouter;