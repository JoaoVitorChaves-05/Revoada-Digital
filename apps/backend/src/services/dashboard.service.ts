import { DashboardRepository, DirectorDashboard } from '../repositories/dashboard.repository';

export class DashboardService {
  constructor(private readonly dashboardRepository = new DashboardRepository()) {}

  /**
   * Retorna o dashboard de defasagem do diretor para uma escola.
   * A garantia de que todas as turmas da escola aparecam (inclusive sem dados)
   * e feita no repositorio, que semeia as turmas conhecidas antes de agregar.
   */
  async getDirectorDashboard(schoolId: string): Promise<DirectorDashboard> {
    if (!schoolId || schoolId.trim() === '') {
      throw new Error('schoolId é obrigatório.');
    }
    return this.dashboardRepository.getDirectorDashboard(schoolId);
  }
}

export const dashboardService = new DashboardService();