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
    const school = await schoolService.createSchool(id);
    return res.status(200).json(school);
  }catch (error: any) {
    return res.status(400).json({ error: 'Erro ao buscar escola', details: error.message});
  }
}
