import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { QuestionService } from '../services/question.service';
import { QuestionRepository } from '../repositories/question.repository';

const questionRoutes = Router();

const repository = new QuestionRepository();
const service = new QuestionService(repository);
const controller = new QuestionController(service);

questionRoutes.post('/', (req, res) => controller.create(req, res));
questionRoutes.get('/', (req, res) => controller.list(req, res));
questionRoutes.get('/:id', (req, res) => controller.getById(req, res));

export { questionRoutes };