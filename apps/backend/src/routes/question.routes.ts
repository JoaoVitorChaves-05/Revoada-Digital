import { Router } from 'express';
import { updateQuestion, deleteQuestion } from '../controllers/question.controller'
import { validateSchema } from '../middlewares/validate.middleware';
import { updateQuestionSchema } from '../schemas/question.schema';

const questionRoutes = Router();
questionRoutes.put('/:id', validateSchema(updateQuestionSchema), updateQuestion);
questionRoutes.delete('/:id', deleteQuestion);

export { questionRoutes };