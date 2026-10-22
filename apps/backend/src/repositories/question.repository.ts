import { prisma } from '../lib/prisma';
import { CreateQuestionInput, UpdateQuestionInput } from '../schemas/question.schema';

// Criamos um tipo estendido para permitir o imageUrl opcional junto com os dados da questão
export interface CreateQuestionWithImageInput extends CreateQuestionInput {
    imageUrl?: string | null;
}

export class QuestionRepository {
    async create(data: CreateQuestionWithImageInput) {
        return prisma.question.create({
            data: {
                text: data.text,
                difficulty: data.difficulty,
                image: data.imageUrl, // <-- Salva a URL gerada pelo Supabase Storage
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

    async update(id: string, data: UpdateQuestionInput & { imageUrl?: string | null }) {
        const { alternatives, ...questionData } = data;

        const updatePayload: any = {
            ...questionData
        };

        if (alternatives) {
            updatePayload.alternatives = {
                deleteMany: {},
                create: alternatives.map(alt => ({
                    text: alt.text,
                    isCorrect: alt.isCorrect
                }))
            };
        }

        return prisma.question.update({
            where: { id },
            data: updatePayload,
            include: { alternatives: true }
        });
    }

    async delete(id: string) {
        return prisma.question.delete({
            where: { id }
        });
    }
}