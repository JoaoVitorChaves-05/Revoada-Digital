import { Request, Response } from 'express';
import { createQuestionSchema, updateQuestionSchema } from '../schemas/question.schema';
import { questionService } from '../services/question.service';

function getQuestionId(req: Request) {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function parsePositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function createQuestion(req: Request, res: Response) {
  const result = createQuestionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.issues });
  }

  try {
    const question = await questionService.createQuestion(result.data);
    return res.status(201).json(question);
  } catch (error: any) {
    return res.status(400).json({ error: 'Erro ao criar questão', details: error.message });
  }
}

export async function listQuestions(req: Request, res: Response) {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);
    const difficulty = req.query.difficulty === undefined
      ? undefined
      : parsePositiveInteger(req.query.difficulty, 1);

    const questions = await questionService.listQuestions(page, limit, difficulty);
    return res.status(200).json(questions);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}

export async function getQuestionById(req: Request, res: Response) {
  try {
    const question = await questionService.getQuestionById(getQuestionId(req));
    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }
    return res.status(200).json(question);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  const result = updateQuestionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Dados inválidos', details: result.error.issues });
  }

  try {
    const question = await questionService.updateQuestion(getQuestionId(req), result.data);
    return res.status(200).json({ message: 'Questão atualizada com sucesso', data: question });
  } catch (error: any) {
    const status = error.message === 'Questão não encontrada' ? 404 : 400;
    return res.status(status).json({ error: 'Erro ao atualizar questão', details: error.message });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    await questionService.deleteQuestion(getQuestionId(req));
    return res.status(204).send();
  } catch (error: any) {
    const status = error.message === 'Questão não encontrada' ? 404 : 400;
    return res.status(status).json({ error: 'Erro ao deletar questão', details: error.message });
  }
}
