import { Request, Response } from 'express';
import { QuestionService } from '../services/question.service';
import { createQuestionSchema } from '../schemas/question.schema';

export class QuestionController {
  constructor(private questionService: QuestionService) {}

  async create(req: Request, res: Response) {
    try {
      const data = createQuestionSchema.parse(req.body);
      
      const newQuestion = await this.questionService.createQuestion(data);
      
      return res.status(201).json(newQuestion);
    } catch (error: any) {
      return res.status(400).json({ error: error.errors || error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const difficulty = req.query.difficulty as string;

      const questions = await this.questionService.listQuestions(page, limit, difficulty);
      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const questionId = parseInt(req.params.id);
      const question = await this.questionService.getQuestionById(questionId);

      if (!question) {
        return res.status(404).json({ error: "Questão não encontrada" });
      }

      return res.status(200).json(question);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}