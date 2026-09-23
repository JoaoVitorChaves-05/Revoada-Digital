import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); 

export class QuestionRepository {
  async create(data: any) {
    return await prisma.questao.create({
      data: {
        enunciado: data.statement,
        dificuldade: data.difficulty,
        alternativas: {
          create: data.alternatives.map((alt: any) => ({
            texto_alternativa: alt.text,
            correto: alt.isCorrect
          }))
        }
      },
      include: { alternativas: true }
    });
  }

  async findAll(skip: number, take: number, whereClause: any) {
    return await prisma.questao.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      include: { alternativas: true }
    });
  }

  async findById(id: number) {
    return await prisma.questao.findUnique({
      where: { id_questao: id },
      include: { alternativas: true }
    });
  }
}