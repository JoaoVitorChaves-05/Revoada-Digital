import type { Request, Response } from 'express';
import {
  dashboardService,
  SchoolNotFoundError,
  StudentNotFoundError,
} from '../services/dashboard.service';

export async function getDashboard(req: Request, res: Response) {
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

// Saldo de coins (Learn-to-Earn) do aluno. Resolve o aluno por ?userId= (sem
// JWT nesta fase), mesmo padrão de GET /attempts. Alimenta o saldo exibido no
// header/home e na loja de recompensas.
export async function getCoins(req: Request, res: Response) {
  const userId = req.query.userId;

  if (typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'Parâmetro userId é obrigatório' });
  }

  try {
    const saldo = await dashboardService.getCoins(userId.trim());
    return res.status(200).json(saldo);
  } catch (error) {
    if (error instanceof StudentNotFoundError) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao consultar saldo de pontos',
    });
  }
}