import { Request, Response } from 'express';
import { attemptService } from '../services/attempt.service';

export async function createAttempt(req: Request, res: Response) {
  try {
    const result = await attemptService.createAttempt(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: 'Erro ao criar tentativa', details: error.message });
  }
}

export async function readAttempt(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const attempt = await attemptService.readAttempt(id);
    return res.status(200).json(attempt);
  } catch (error: any) {
    return res.status(400).json({ error: 'Erro ao buscar tentativa', details: error.message });
  }
}

export async function submitAttempt(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const result = await attemptService.submitAttempt(id, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: 'Erro ao entregar avaliação', details: error.message });
  }
}

export async function deleteAttempt(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    await attemptService.deleteAttempt(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ error: 'Erro ao remover tentativa', details: error.message });
  }
}