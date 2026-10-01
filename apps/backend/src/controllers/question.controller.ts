import { Request, Response } from 'express';
import { questionService } from '../services/question.service';

export async function createQuestion(req: Request, res: Response) {
    try {
        const question = await questionService.createQuestion(req.body);
        return res.status(201).json({ message: 'Questão criada com sucesso', data: question });
    } catch (error: any) {
        return res.status(400).json({ error: 'Erro ao criar questão', details: error.message });
    }
}

export async function listQuestions(req: Request, res: Response) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const difficulty = req.query.difficulty ? Number(req.query.difficulty) : undefined;

        const questions = await questionService.listQuestions(page, limit, difficulty);
        return res.status(200).json({ data: questions });
    } catch (error: any) {
        return res.status(400).json({ error: 'Erro ao listar questões', details: error.message });
    }
}

export async function readQuestion(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const question = await questionService.readQuestion(id);
        return res.status(200).json({ data: question });
    } catch (error: any) {
        return res.status(404).json({ error: 'Erro ao buscar questão', details: error.message });
    }
}

export async function updateQuestion(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const question = await questionService.updateQuestion(id, req.body);
        return res.status(200).json({ message: 'Questão atualizada com sucesso', data: question });
    } catch (error: any) {
        return res.status(400).json({ error: 'Erro ao atualizar questão', details: error.message });
    }
}

export async function deleteQuestion(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        await questionService.deleteQuestion(id);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(400).json({ error: 'Erro ao deletar questão', details: error.message });
    }
}