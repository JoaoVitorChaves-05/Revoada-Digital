import { prisma } from '../lib/prisma';

export class SimuladoGenerationRepository {
    //é query de questoes -> repo diferente só para n atrapalhar fluxo dev
    async findRandomQuestionIds(
        subject: string,
        concept: string,
        count: number,
    ): Promise<string[]> {
        const matches = await prisma.question.findMany({
            where: { subject, concept }, //n def ainda 
            select: { id: true },
        }); //embaralha e pega 8

        const ids = matches.map((q) => q.id);
        return this.shuffle(ids).slice(0, count);
        //retorna só id
    }

    private shuffle(items: string[]): string[] {
        const result = [...items];
        // Fisher-Yates: percorre de trás pra frente trocando cada posição
        // com uma posição aleatória anterior (ou ela mesma).
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    async createWithQuestions(studentId: string, name: string, questionIds: string[]) {
        return prisma.mockExam.create({
            data: {
                studentId,
                name,
                questions: {
                    create: questionIds.map((questionId, index) => ({
                        questionId,
                        position: index + 1,
                    })),
                },
            },
            include: {
                questions: { include: { question: true } },
            },
        });
    }
}