import { prisma } from '../lib/prisma';
import { UpdateQuestionInput } from '../schemas/question.schema';

export class QuestionRepository {
    
    async findById(id: string) {
        return prisma.question.findUnique({
            where: { id }
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