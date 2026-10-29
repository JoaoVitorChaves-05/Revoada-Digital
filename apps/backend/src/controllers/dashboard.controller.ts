import type { Request, Response } from 'express';
import {
  dashboardService,
  SchoolNotFoundError,
} from '../services/dashboard.service';

export async function getDashboard(req: Request, res: Response) {
  // TODO: exigir autenticação/autorização quando o login emitir JWT compatível.
  const schoolId = req.query.school_id;
  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    return res.status(400).json({ error: 'school_id é obrigatório' });
  }

  try {
    const performance = await dashboardService.getClassPerformance(
      schoolId.trim(),
    );
    return res.status(200).json(performance);
  } catch (error) {
    if (error instanceof SchoolNotFoundError) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao buscar dados do dashboard',
    });
  }
}

export async function getMyDashboard(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
    });
  }

  try {
    const dashboard = await dashboardService.getMyDashboard(userId);

    return res.status(200).json(dashboard);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Perfil de aluno não encontrado'
    ) {
      return res.status(404).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: 'Erro ao consultar dashboard',
    });
  }
}
