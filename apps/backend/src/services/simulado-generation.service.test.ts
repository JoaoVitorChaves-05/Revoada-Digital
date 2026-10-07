import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SimuladoGenerationRepository } from '../repositories/simulado-generation.repository';
import { SimuladoGenerationService } from './simulado-generation.service';

vi.mock('../repositories/simulado-generation.repository', () => ({
    SimuladoGenerationRepository: class { },
}));

function createRepositoryMock() {
    return {
        findRandomQuestionIds: vi.fn(),
        createWithQuestions: vi.fn(),
    };
}

describe('SimuladoGenerationService', () => {
    let repository: ReturnType<typeof createRepositoryMock>;
    let service: SimuladoGenerationService;

    beforeEach(() => {
        repository = createRepositoryMock();
        service = new SimuladoGenerationService(
            repository as unknown as SimuladoGenerationRepository,
        );
    });

    it('gera um simulado quando existem questões suficientes', async () => {
        const questionIds = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
        const createdSimulado = { id: 'simulado-1', name: 'Matemática - Função Afim' };

        repository.findRandomQuestionIds.mockResolvedValue(questionIds);
        repository.createWithQuestions.mockResolvedValue(createdSimulado);

        const result = await service.generate({
            studentId: 'aluno-1',
            subject: 'Matemática',
            concept: 'Função Afim',
        });

        expect(result).toEqual(createdSimulado);
        expect(repository.findRandomQuestionIds).toHaveBeenCalledWith(
            'Matemática',
            'Função Afim',
            8,
        );
        expect(repository.createWithQuestions).toHaveBeenCalledWith(
            'aluno-1',
            'Matemática - Função Afim',
            questionIds,
        );
    });

    it('rejeita a geração quando há menos de 8 questões disponíveis', async () => {
        const questionIds = ['q1', 'q2', 'q3']; // só 3, menos que o mínimo

        repository.findRandomQuestionIds.mockResolvedValue(questionIds);

        await expect(
            service.generate({
                studentId: 'aluno-1',
                subject: 'Matemática',
                concept: 'Função Afim',
            }),
        ).rejects.toThrow('Questões insuficientes para gerar o simulado');

        expect(repository.createWithQuestions).not.toHaveBeenCalled();
    });
});