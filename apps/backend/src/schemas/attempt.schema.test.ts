import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma';

describe('Testes da entidade Attempt (Tentativa de Simulado)', () => {
  
  
  beforeEach(async () => {
    // Garante que o banco está limpo ou pronto - FIX
  });

  it('deve criar uma tentativa de simulado com sucesso no banco de dados', async () => {
    
    const school = await prisma.school.create({
      data: { 
        school_name: `Escola Teste Vitest ${Date.now()}`, 
        school_city: 'São Paulo' 
      }
    });

    const user = await prisma.user.create({
      data: {
        email: `aluno_${Date.now()}@teste.com`,
        password: 'senha-de-teste',
        full_name: 'Aluno Vitest',
        cpf: `${Math.floor(10000000000 + Math.random() * 90000000000)}`, // CPF aleatório
        profileType: 'STUDENT',
        studentProfile: {
          create: { schoolId: school.id, points: 50 }
        }
      },
      include: { studentProfile: true }
    });

    const mockExam = await prisma.mockExam.create({
      data: {
        name: 'Simulado de Teste Automatizado',
        studentId: user.studentProfile!.id
      }
    });

    const attempt = await prisma.attempt.create({
      data: {
        mockExamId: mockExam.id,
        status: 'SUBMITTED',
        score: 100,
        correctAnswers: 10,
        totalQuestions: 10,
        earnedPoints: 50,
        submittedAt: new Date()
      }
    });

    expect(attempt).toBeDefined();
    expect(attempt.id).toBeTypeOf('string');
    expect(attempt.status).toBe('SUBMITTED');
    expect(attempt.score).toBe(100);
    expect(attempt.correctAnswers).toBe(10);
  });
});