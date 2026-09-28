import { Request, Response } from 'express';
import { schoolService } from '../services/school.service';

export async function createSchool(req: Request, res: Response) {
  try{
    const result = await schoolService.createSchool(req.body);

    return res.status(201).json({
      message: 'Escola cadastrada com sucesso!',
      data: result,
    });
  }catch (error: any) {
    return res.status(400).json({
      error: 'Erro ao cadastrar escola',
      details: error.message,
    });
  }
}

export async function readSchool(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const school = await schoolService.readSchool(id);
    return res.status(200).json(school);
  }catch (error: any) {
    return res.status(400).json({ error: 'Erro ao buscar escola', details: error.message});
  }
}

export async function updateSchool(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const school = await schoolService.updateSchool(id, req.body);
    return res.status(200).json({
      message: 'Escola atualizada com sucesso!',
      data: school,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: 'Erro ao atualizar escola',
      details: error.message,
    });
  }
}

export async function deleteSchool(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    await schoolService.deleteSchool(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({
      error: 'Erro ao remover escola',
      details: error.message,
    });
  }
}