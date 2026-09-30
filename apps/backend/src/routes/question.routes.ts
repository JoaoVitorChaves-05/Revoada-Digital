import { Router } from 'express';
import { createQuestion, listQuestions, readQuestion, updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { createQuestionSchema, updateQuestionSchema } from '../schemas/question.schema';
import {
	uploadQuestionImage,
	parseQuestionFields,
} from '../middlewares/question-upload.middleware';

const questionRoutes = Router();

questionRoutes.post(
	'/',
	uploadQuestionImage,
	parseQuestionFields,
	validateSchema(createQuestionSchema),
	createQuestion,
);
questionRoutes.get('/', listQuestions);
questionRoutes.get('/:id', readQuestion);
questionRoutes.put('/:id', validateSchema(updateQuestionSchema), updateQuestion);
questionRoutes.delete('/:id', deleteQuestion);

export { questionRoutes };