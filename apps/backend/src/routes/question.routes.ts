// src/routes/question.routes.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createQuestionSchema } from '../schemas/question.schema';

const questionRoutes = Router();
const prisma = new PrismaClient();

// ENDPOINT 1: POST /questions (Criar Questão)
questionRoutes.post('/', async (req: Request, res: Response) => {
  try {
    // primeiro, valida os dados enviados (erro 400 se falhar)
    const data = createQuestionSchema.parse(req.body);

    // depois salva no banco (Questão e Alternativas usando nested writes do Prisma)
    const newQuestion = await prisma.questao.create({
      data: {
        enunciado: data.statement,
        dificuldade: data.difficulty,
        alternativas: {
          create: data.alternatives.map((alt) => ({
            texto_alternativa: alt.text,
            correto: alt.isCorrect
          }))
        }
      },
      include: {
        alternativas: true // retorna as alternativas embutidas na resposta
      }
    });

    // 3. retorna 201 created
    return res.status(201).json(newQuestion);
    
  } catch (error: any) {
    return res.status(400).json({ error: error.errors || error.message });
  }
});

// ENDPOINT 2: GET /questions (Listar Questões com Paginação e Filtro)
questionRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const difficulty = req.query.difficulty as string;

    const skip = (page - 1) * limit;

    // constroi os filtros
    const whereClause = difficulty ? { dificuldade: difficulty } : {};

    const questions = await prisma.questao.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      include: { alternativas: true } // join/include das alternativas
    });

    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ENDPOINT 3: GET /questions/:id (que são os detalhes de uma questão)
questionRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.id);

    const question = await prisma.questao.findUnique({
      where: { id_questao: questionId },
      include: { alternativas: true }
    });

    if (!question) {
      return res.status(404).json({ error: "Questão não encontrada" });
    }

    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

export { questionRoutes };