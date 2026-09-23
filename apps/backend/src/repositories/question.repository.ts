import { prisma } from '../lib/prisma';
import { CreateQuestionInput, UpdateQuestionInput } from '../schemas/question.schema';

export class QuestionRepository {
  async create(data: CreateQuestionInput) {
    return prisma.question.create({
      data: {
        QStem: data.text,
        Level: data.difficulty,
        alternatives: {
          create: data.alternatives.map((alternative) => ({
            text: alternative.text,
            Correct: alternative.isCorrect,
          })),
        },
      },
      include: { alternatives: true },
    });
  }

  async findAll(skip: number, take: number, difficulty?: number) {
    return prisma.question.findMany({
      where: difficulty === undefined ? undefined : { Level: difficulty },
      skip,
      take,
      include: { alternatives: true },
    });
  }

  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: { alternatives: true },
    });
  }

  async update(id: string, data: UpdateQuestionInput) {
    return prisma.question.update({
      where: { id },
      data: {
        ...(data.text === undefined ? {} : { QStem: data.text }),
        ...(data.difficulty === undefined ? {} : { Level: data.difficulty }),
        ...(data.alternatives === undefined ? {} : {
          alternatives: {
            deleteMany: {},
            create: data.alternatives.map((alternative) => ({
              text: alternative.text,
              Correct: alternative.isCorrect,
            })),
          },
        }),
      },
      include: { alternatives: true },
    });
  }

  async delete(id: string) {
    return prisma.question.delete({ where: { id } });
  }
}
