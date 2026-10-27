import { AttemptStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

// retorna as respostas submetidas de uma escola específica, 
// incluindo se a resposta está correta,
//  o assunto da questão e o ID do aluno que respondeu.
export class DashboardRepository {
    async findSubmittedAnswersBySchoolId(schoolId: string) {
        return prisma.attemptAnswer.findMany({
            where: {
                attempt: {
                    status: AttemptStatus.SUBMITTED,
                    mockExam: { student: { schoolId } },
                },
            },
            select: {
                isCorrect: true,
                question: {
                    select: { subject: true },
                },
                attempt: {
                    select: {
                        mockExam: { select: { studentId: true } },
                    },
                },
            },
        });
    }
}