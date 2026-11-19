import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardRepository } from '../repositories/dashboard.repository';
import type { SchoolRepository } from '../repositories/school.repository';
import { DashboardService, StudentNotFoundError } from './dashboard.service';

vi.mock('../repositories/dashboard.repository', () => ({
  DashboardRepository: class {},
}));

vi.mock('../repositories/school.repository', () => ({
  SchoolRepository: class {},
}));

describe('DashboardService.getCoins', () => {
  let dashboardRepository: { findStudentByUserId: ReturnType<typeof vi.fn> };
  let service: DashboardService;

  beforeEach(() => {
    dashboardRepository = { findStudentByUserId: vi.fn() };
    service = new DashboardService(
      dashboardRepository as unknown as DashboardRepository,
      {} as unknown as SchoolRepository,
    );
  });

  it('retorna o saldo de pontos do aluno', async () => {
    dashboardRepository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 220,
      schoolId: 'school-1',
    });

    await expect(service.getCoins('user-1')).resolves.toEqual({ coins: 220 });
    expect(dashboardRepository.findStudentByUserId).toHaveBeenCalledWith('user-1');
  });

  it('retorna saldo zero quando o aluno ainda nao pontuou', async () => {
    dashboardRepository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 0,
      schoolId: 'school-1',
    });

    await expect(service.getCoins('user-1')).resolves.toEqual({ coins: 0 });
  });

  it('lanca StudentNotFoundError quando o aluno nao existe', async () => {
    dashboardRepository.findStudentByUserId.mockResolvedValue(null);

    await expect(service.getCoins('user-1')).rejects.toBeInstanceOf(
      StudentNotFoundError,
    );
  });
});