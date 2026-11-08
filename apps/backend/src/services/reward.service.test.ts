import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RewardRepository } from '../repositories/reward.repository';
import { RewardService } from './reward.service';

vi.mock('../repositories/reward.repository', () => ({
  RewardRepository: class {},
}));

describe('RewardService.findAvailable', () => {
  let rewardRepository: { findAvailable: ReturnType<typeof vi.fn> };
  let service: RewardService;

  beforeEach(() => {
    rewardRepository = { findAvailable: vi.fn() };
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
        pointsCost: 150,
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
});
