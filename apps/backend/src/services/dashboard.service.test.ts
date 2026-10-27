import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardRepository } from '../repositories/dashboard.repository';
import type { SchoolRepository } from '../repositories/school.repository';
import { DashboardService, SchoolNotFoundError } from './dashboard.service';

vi.mock('../repositories/dashboard.repository', () => ({
    DashboardRepository: class { },
}));

vi.mock('../repositories/school.repository', () => ({
    SchoolRepository: class { },
}));

function createDashboardRepositoryMock() {
    return {
        findSubmittedAnswersBySchoolId: vi.fn(),
    };
}

function createSchoolRepositoryMock() {
    return {
        findById: vi.fn(),
    };
}

describe('DashboardService', () => {
    let dashboardRepository: ReturnType<typeof createDashboardRepositoryMock>;
    let schoolRepository: ReturnType<typeof createSchoolRepositoryMock>;
    let service: DashboardService;

    beforeEach(() => {
        dashboardRepository = createDashboardRepositoryMock();
        schoolRepository = createSchoolRepositoryMock();
        schoolRepository.findById.mockResolvedValue({ id: 'school-1' });
        service = new DashboardService(
            dashboardRepository as unknown as DashboardRepository,
            schoolRepository as unknown as SchoolRepository,
        );
    });

    it('agrega por matéria, conta alunos distintos, ordena e considera nulo como não correto', async () => {
        dashboardRepository.findSubmittedAnswersBySchoolId.mockResolvedValue([
            {
                isCorrect: true,
                question: { subject: 'Matemática' },
                attempt: { mockExam: { studentId: 'student-1' } },
            },
            {
                isCorrect: false,
                question: { subject: 'Biologia' },
                attempt: { mockExam: { studentId: 'student-1' } },
            },
            {
                isCorrect: null,
                question: { subject: 'Matemática' },
                attempt: { mockExam: { studentId: 'student-2' } },
            },
            {
                isCorrect: false,
                question: { subject: 'Matemática' },
                attempt: { mockExam: { studentId: 'student-2' } },
            },
        ]);

        const result = await service.getClassPerformance('school-1');

        expect(result).toEqual([
            {
                subject: 'Biologia',
                students: 1,
                totalAnswers: 1,
                correctAnswers: 0,
                accuracy: 0,
            },
            {
                subject: 'Matemática',
                students: 2,
                totalAnswers: 3,
                correctAnswers: 1,
                accuracy: 33.33,
            },
        ]);
        expect(dashboardRepository.findSubmittedAnswersBySchoolId).toHaveBeenCalledWith('school-1');
        expect(schoolRepository.findById).toHaveBeenCalledWith('school-1');
    });

    it('retorna uma lista vazia quando a escola ainda não tem respostas', async () => {
        dashboardRepository.findSubmittedAnswersBySchoolId.mockResolvedValue([]);

        await expect(service.getClassPerformance('school-1')).resolves.toEqual([]);
    });

    it('rejeita quando a escola não existe', async () => {
        schoolRepository.findById.mockResolvedValue(null);

        await expect(service.getClassPerformance('missing-school')).rejects.toBeInstanceOf(
            SchoolNotFoundError,
        );
        expect(dashboardRepository.findSubmittedAnswersBySchoolId).not.toHaveBeenCalled();
    });
});
