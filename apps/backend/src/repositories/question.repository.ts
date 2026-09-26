import { prisma } from '../lib/prisma';
import { CreateQuestionInput, UpdateQuestionInput } from '../schemas/question.schema';

export class QuestionRepository {
    async create(data: CreateQuestionInput) {
        return prisma.question.create({
            data: {
                text: data.text,
                difficulty: data.difficulty,
                alternatives: {
                    create: data.alternatives.map(alt => ({
                        text: alt.text,
                        isCorrect: alt.isCorrect
                    }))
                }
            },
            include: { alternatives: true }
        });
    }

    async findAll(skip: number, take: number, difficulty?: number) {
        const where = difficulty ? { difficulty } : {};
        return prisma.question.findMany({
            where,
            skip,
            take,
            include: { alternatives: true }
        });
    }

    async findById(id: string) {
        return prisma.question.findUnique({
            where: { id },
            include: { alternatives: true }
        });
    }

    async update(id: string, data: UpdateQuestionInput) {
        return prisma.question.update({
            where: { id },
            data: data
        });
    }

    async delete(id: string) {
        return prisma.question.delete({
            where: { id }
        });
    }
}