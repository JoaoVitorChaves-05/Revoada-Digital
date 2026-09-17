import { prisma } from '../lib/prisma';

export class QuestionRepository {
    
    async findById(id: string) {
        return prisma.question.findUnique({
            where: { id }
        });
    }

    async update(id: string, data: any) {
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