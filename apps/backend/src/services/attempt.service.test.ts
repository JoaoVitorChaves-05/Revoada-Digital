import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttemptRepository } from '../repositories/attempt.repository';
import { AttemptService } from './attempt.service';

vi.mock('../repositories/attempt.repository', () => ({
  AttemptRepository: class {},
}));

function createRepositoryMock() {
  return {
    findByUserId: vi.fn(),
  };
}

describe('AttemptService', () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: AttemptService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new AttemptService(repository as unknown as AttemptRepository);
  });

  it('busca todas as tentativas do usuário', async () => {
    const attempts = [
      { id: 'tentativa-1', mockExamId: 'simulado-1' },
      { id: 'tentativa-2', mockExamId: 'simulado-2' },
    ];
    repository.findByUserId.mockResolvedValue(attempts);

    await expect(service.getUserAttempts('usuario-1')).resolves.toEqual(attempts);
    expect(repository.findByUserId).toHaveBeenCalledOnce();
    expect(repository.findByUserId).toHaveBeenCalledWith('usuario-1');
  });
});
