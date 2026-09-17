import { Router } from 'express';
import { updateQuestion, deleteQuestion } from '../controllers/question.controller'

const questionRoutes = Router();
questionRoutes.put('/:id', updateQuestion);
questionRoutes.delete('/:id', deleteQuestion);

export { questionRoutes };