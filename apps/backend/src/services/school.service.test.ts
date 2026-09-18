import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SchoolRepository } from '../repositories/school.repository';
import { SchoolService } from './school.service';

vi.mock('../repositories/school.repository', () => ({
	SchoolRepository: class {},
}));

const schoolInput = {
	school_name: 'Escola Exemplo',
  school_city: 'Cidade Exemplo',
};

function createRepositoryMock() {
	return {
		findByName: vi.fn(),
		findById: vi.fn(),
		createWithProfile: vi.fn(),
	};
}

describe('SchoolService', () => {
  let repository: ReturnType<typeof createRepositoryMock>;
  let service: SchoolService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new SchoolService(repository as unknown as SchoolRepository);
  });

  it('cria escola quando nome ainda não existe', async () => {
    const createdSchool = { id: 'school-1', ...schoolInput };
    repository.findByName.mockResolvedValue(null);
    repository.createWithProfile.mockResolvedValue({ school: createdSchool });

    const result = await service.createSchool(schoolInput);

    expect(result).toEqual({ school: createdSchool});
    expect(repository.createWithProfile).toHaveBeenCalledWith(schoolInput);
  });

  it('impede cadastro de escola com nome já utilizado', async () => {
    repository.findByName.mockResolvedValue({ id: 'existing-school' });

    await expect(service.createSchool(schoolInput)).rejects.toThrow(
      'Escola já cadastrada',
    );

    expect(repository.createWithProfile).not.toHaveBeenCalled();
  });

  it('busca escola existente', async () => {
    const school = { id: 'school-1', ...schoolInput };
    repository.findById.mockResolvedValue(school);

    const result = await service.readSchool('school-1');

    expect(result).toEqual(school);
    expect(repository.findById).toHaveBeenCalledWith('school-1');
  });

  it('impede busca de escola inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.readSchool('missing-school')).rejects.toThrow(
      'Escola não encontrada',
    );
  });

  
})
