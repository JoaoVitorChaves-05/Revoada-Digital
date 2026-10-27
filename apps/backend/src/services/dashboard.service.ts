import { DashboardRepository } from '../repositories/dashboard.repository';
import { SchoolRepository } from '../repositories/school.repository';


type ClassPerformance = {
    subject: string;
    students: number;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
};

export class SchoolNotFoundError extends Error {
    constructor() {
        super('Escola não encontrada');
        this.name = 'SchoolNotFoundError';
    }
}

export class DashboardService {
    constructor(
        private readonly dashboardRepository = new DashboardRepository(),
        private readonly schoolRepository = new SchoolRepository(),
    ) { }

    async getClassPerformance(schoolId: string): Promise<ClassPerformance[]> {
        const school = await this.schoolRepository.findById(schoolId);
        if (!school) {
            throw new SchoolNotFoundError();
        }

        const answers = await this.dashboardRepository.findSubmittedAnswersBySchoolId(schoolId);
        const performanceBySubject = new Map<
            string,
            Omit<ClassPerformance, 'students' | 'accuracy'> & { studentIds: Set<string> }
        >();

        for (const answer of answers) {
            const studentId = answer.attempt.mockExam.studentId;
            const subject = answer.question.subject;
            const performance = performanceBySubject.get(subject) ?? {
                subject,
                totalAnswers: 0,
                correctAnswers: 0,
                studentIds: new Set<string>(),
            };

            performance.totalAnswers += 1;
            if (answer.isCorrect) {
                performance.correctAnswers += 1;
            }
            performance.studentIds.add(studentId);

            performanceBySubject.set(subject, performance);
        }

        return Array.from(performanceBySubject.values())
            .map(({ studentIds, ...performance }) => ({
                ...performance,
                students: studentIds.size,
                accuracy: Math.round(
                    (performance.correctAnswers / performance.totalAnswers) * 10000,
                ) / 100,
            }))
            .sort((a, b) => a.subject.localeCompare(b.subject, 'pt-BR'));
    }
}

export const dashboardService = new DashboardService();