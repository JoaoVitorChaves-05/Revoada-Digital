import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RewardRepository } from '../repositories/reward.repository';
import { RewardService } from './reward.service';

vi.mock('../repositories/reward.repository', () => ({
  RewardRepository: class {},
}));

describe('RewardService.findAvailable', () => {
  let rewardRepository: {
    findAvailable: ReturnType<typeof vi.fn>;
    findStudentByUserId: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    redeemTransaction: ReturnType<typeof vi.fn>;
  };
  let service: RewardService;

  beforeEach(() => {
    rewardRepository = {
      findAvailable: vi.fn(),
      findStudentByUserId: vi.fn(),
      findById: vi.fn(),
      redeemTransaction: vi.fn(),
    };
    service = new RewardService(
      rewardRepository as unknown as RewardRepository,
    );
  });

  it('mapeia as recompensas disponíveis para o formato público', async () => {
    rewardRepository.findAvailable.mockResolvedValue([
      {
        id: 'reward-1',
        name: 'Caderno',
        description: 'Caderno de estudos',
        cost: 150,
      },
    ]);

    await expect(service.findAvailable()).resolves.toEqual([
      {
        id: 'reward-1',
        name: 'Caderno',
        description: 'Caderno de estudos',
        pointsCost: 150,
      },
    ]);
    expect(rewardRepository.findAvailable).toHaveBeenCalledOnce();
  });

  it('resgata com o perfil identificado pelo usuário e o custo do catálogo', async () => {
    rewardRepository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 200,
    });
    rewardRepository.findById.mockResolvedValue({
      id: 'reward-1',
      cost: 150,
      isAvailable: true,
      stock: 3,
    });
    const redemption = {
      redemption: {
        id: 'redemption-1',
        rewardId: 'reward-1',
        pointsSpent: 150,
        createdAt: new Date('2026-11-08T12:00:00Z'),
      },
      balance: 50,
    };
    rewardRepository.redeemTransaction.mockResolvedValue(redemption);

    await expect(
      service.redeem('user-1', { rewardId: 'reward-1' }),
    ).resolves.toEqual(redemption);

    expect(rewardRepository.findStudentByUserId).toHaveBeenCalledWith(
      'user-1',
    );
    expect(rewardRepository.redeemTransaction).toHaveBeenCalledWith({
      studentId: 'student-1',
      rewardId: 'reward-1',
      cost: 150,
    });
  });

  it('não inicia transação quando o saldo lido é insuficiente', async () => {
    rewardRepository.findStudentByUserId.mockResolvedValue({
      id: 'student-1',
      points: 20,
    });
    rewardRepository.findById.mockResolvedValue({
      id: 'reward-1',
      cost: 150,
      isAvailable: true,
      stock: null,
    });

    await expect(
      service.redeem('user-1', { rewardId: 'reward-1' }),
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_POINTS',
    });
    expect(rewardRepository.redeemTransaction).not.toHaveBeenCalled();
  });
});
