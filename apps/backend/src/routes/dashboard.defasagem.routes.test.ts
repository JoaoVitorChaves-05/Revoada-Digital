import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import dashboardRouter from './dashboard.routes';

const db = vi.hoisted(() => ({ student: vi.fn(), attempts: vi.fn() }));
vi.mock('../lib/prisma', () => ({ prisma: {
  studentProfile: { findUnique: db.student },
  attempt: { findMany: db.attempts },
} }));

const app = express();
app.use('/dashboard', dashboardRouter);
const url = '/dashboard/me/defasagem?userId=user-1';
const question = (id: string, subject = ['Matemática'], concept = ['Álgebra']) => (
  { question: { id, subject, concept } }
);

describe('Defasagem: rota, cálculo e consulta', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.student.mockResolvedValue({ id: 'student-1' });
    db.attempts.mockResolvedValue([]);
  });

  it.each(['', '?userId=', '?userId=%20', '?userId=a&userId=b'])('rejeita userId inválido (%s)', async (query) => {
    expect((await request(app).get(`/dashboard/me/defasagem${query}`)).status).toBe(400);
    expect(db.student).not.toHaveBeenCalled();
  });

  it('retorna vazio sem histórico e filtra apenas tentativas finalizadas do aluno', async () => {
    const response = await request(app).get(url);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ materias: [] });
    expect(db.student).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-1' } }));
    expect(db.attempts).toHaveBeenCalledWith({
      where: { status: 'SUBMITTED', mockExam: { studentId: 'student-1' } },
      select: {
        answers: { select: { questionId: true, isCorrect: true } },
        mockExam: { select: { questions: { select: {
          question: { select: { id: true, subject: true, concept: true } },
        } } } },
      },
    });
  });

  it('agrega matérias e conceitos, incluindo erros, nulos e omissões sem duplicar rótulos', async () => {
    db.attempts.mockResolvedValue([{
      answers: [
        { questionId: 'q1', isCorrect: true },
        { questionId: 'q2', isCorrect: false },
        { questionId: 'q3', isCorrect: null },
      ],
      mockExam: { questions: [
        question('q1', ['Matemática', 'Física', 'Matemática'], ['Álgebra', 'Álgebra']),
        question('q2', ['Matemática'], ['Geometria']),
        question('q3', ['Matemática'], ['Álgebra', 'Geometria']),
        question('q4', ['Matemática'], []),
      ] },
    }]);
    const response = await request(app).get(url);
    expect(response.status).toBe(200);
    expect(response.body.materias).toEqual([
      { materia: 'Física', totalQuestoes: 1, acertos: 1, percentualAcerto: 100,
        mapaDefasagem: [{ nome: 'Álgebra', percentualAcerto: 100, nivel: 'baixa' }] },
      { materia: 'Matemática', totalQuestoes: 4, acertos: 1, percentualAcerto: 25,
        mapaDefasagem: [
          { nome: 'Álgebra', percentualAcerto: 50, nivel: 'média' },
          { nome: 'Geometria', percentualAcerto: 0, nivel: 'alta' },
        ] },
    ]);
  });

  it('conta tentativas repetidas separadamente', async () => {
    const mockExam = { questions: [question('q1')] };
    db.attempts.mockResolvedValue([
      { mockExam, answers: [{ questionId: 'q1', isCorrect: true }] },
      { mockExam, answers: [] },
    ]);
    const response = await request(app).get(url);
    expect(response.body.materias[0]).toMatchObject({ totalQuestoes: 2, acertos: 1, percentualAcerto: 50 });
  });

  it.each([
    [0, 10, 0, 'alta'], [39, 100, 39, 'alta'], [40, 100, 40, 'média'],
    [69, 100, 69, 'média'], [70, 100, 70, 'baixa'], [10, 10, 100, 'baixa'],
    [2, 3, 67, 'média'], [139, 200, 70, 'média'],
  ])('classifica %i acertos em %i questões: %i%%, %s', async (acertos, total, percentual, nivel) => {
    db.attempts.mockResolvedValue([{
      answers: Array.from({ length: total }, (_, i) => ({ questionId: `q${i}`, isCorrect: i < acertos })),
      mockExam: { questions: Array.from({ length: total }, (_, i) => question(`q${i}`)) },
    }]);
    const response = await request(app).get(url);
    expect(response.body.materias[0].mapaDefasagem[0]).toEqual({ nome: 'Álgebra', percentualAcerto: percentual, nivel });
  });

  it('retorna 404 sem perfil de aluno', async () => {
    db.student.mockResolvedValue(null);
    expect((await request(app).get(url)).status).toBe(404);
    expect(db.attempts).not.toHaveBeenCalled();
  });

  it('não expõe detalhes internos em falhas', async () => {
    db.attempts.mockRejectedValue(new Error('detalhe interno'));
    const response = await request(app).get(url);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Erro ao consultar desempenho' });
  });
});