import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export async function getMyDashboard(
  req: Request,
  res: Response,
) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: 'Usuário não autenticado',
    });
  }

  try {
    const dashboard =
      await dashboardService.getMyDashboard(userId);

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