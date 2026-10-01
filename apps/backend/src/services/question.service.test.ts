import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuestionRepository } from '../repositories/question.repository';
import { QuestionService } from './question.service';

vi.mock('../repositories/question.repository', () => ({
    QuestionRepository: class {},
}));

function createRepositoryMock() {
    return {
        findById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
}

describe('QuestionService', () => {
    let repository: ReturnType<typeof createRepositoryMock>;
    let service: QuestionService;

    beforeEach(() => {
        repository = createRepositoryMock();
        service = new QuestionService(repository as unknown as QuestionRepository);
    });

    it('atualiza questão existente', async () => {
        const existingQuestion = { id: 'q-1', text: 'Texto antigo', difficulty: 1 };
        const updateData = { text: 'Texto novo' };
        
        repository.findById.mockResolvedValue(existingQuestion);
        repository.update.mockResolvedValue({ ...existingQuestion, ...updateData });

        const result = await service.updateQuestion('q-1', updateData);

        expect(result).toEqual({ ...existingQuestion, ...updateData });
        expect(repository.update).toHaveBeenCalledWith('q-1', updateData);
    });

    it('impede atualização de questão inexistente', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(service.updateQuestion('missing-id', { text: 'Novo texto' })).rejects.toThrow(
            'Questão não encontrada',
        );
        expect(repository.update).not.toHaveBeenCalled();
    });

    it('remove questão existente', async () => {
        repository.findById.mockResolvedValue({ id: 'q-1' });
        repository.delete.mockResolvedValue({ id: 'q-1' });

        await service.deleteQuestion('q-1');

        expect(repository.delete).toHaveBeenCalledWith('q-1');
    });

    it('impede remoção de questão inexistente', async () => {
        repository.findById.mockResolvedValue(null);

        await expect(service.deleteQuestion('missing-id')).rejects.toThrow(
            'Questão não encontrada',
        );
        expect(repository.delete).not.toHaveBeenCalled();
    });
});