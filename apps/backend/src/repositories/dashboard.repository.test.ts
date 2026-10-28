import { describe, expect, it } from 'vitest';
import {
  agregarDefasagem,
  type RespostaBruta,
  type TurmaConhecida,
} from './dashboard.repository';

const turmaA: TurmaConhecida = { classId: 'c1', className: '3A' };

function resposta(parcial: Partial<RespostaBruta> = {}): RespostaBruta {
  return {
    classId: 'c1',
    className: '3A',
    subject: 'MATH',
    concept: 'Funcoes',
    isCorrect: false,
    ...parcial,
  };
}

describe('agregarDefasagem (CHA-49)', () => {
  // Property 1: taxa de defasagem sempre em [0, 1]
  it('gapRate fica sempre no intervalo [0, 1]', () => {
    const respostas: RespostaBruta[] = [
      resposta({ isCorrect: true }),
      resposta({ isCorrect: false }),
      resposta({ isCorrect: false }),
    ];
    const r = agregarDefasagem('s1', respostas, [turmaA]);
    const gap = r.classes[0].breakdown[0].gapRate;
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(1);
    // 2 erros de 3 respondidas
    expect(gap).toBeCloseTo(2 / 3, 5);
  });

  // Property 2: turma sem dados aparece com hasData=false e sem divisao por zero
  it('turma sem respostas aparece com hasData=false e gapRate 0', () => {
    const r = agregarDefasagem('s1', [], [turmaA]);
    expect(r.classes).toHaveLength(1);
    expect(r.classes[0].hasData).toBe(false);
    expect(r.classes[0].breakdown).toHaveLength(0);
    expect(r.classes[0].totalAnswered).toBe(0);
  });

  // Property 3: denominador conta so respostas presentes (o repositorio ja exclui isCorrect null;
  // aqui garantimos que answered = soma de correct + wrong)
  it('answered = correct + wrong em cada breakdown', () => {
    const respostas = [
      resposta({ isCorrect: true }),
      resposta({ isCorrect: false }),
      resposta({ isCorrect: true }),
    ];
    const r = agregarDefasagem('s1', respostas, [turmaA]);
    const b = r.classes[0].breakdown[0];
    expect(b.answered).toBe(3);
    expect(b.correct + b.wrong).toBe(b.answered);
    expect(b.correct).toBe(2);
    expect(b.wrong).toBe(1);
  });

  // Property 4 e grupo sem turma: alunos sem turma viram grupo classId=null
  it('alunos sem turma sao agrupados como classId null', () => {
    const respostas = [
      resposta({ classId: null, className: null, isCorrect: false }),
      resposta({ classId: null, className: null, isCorrect: true }),
    ];
    const r = agregarDefasagem('s1', respostas, []);
    const semTurma = r.classes.find((c) => c.classId === null);
    expect(semTurma).toBeDefined();
    expect(semTurma!.classId).toBeNull();
    expect(semTurma!.breakdown[0].gapRate).toBeCloseTo(0.5, 5);
  });

  it('agrupa por subject e concept separadamente', () => {
    const respostas = [
      resposta({ subject: 'MATH', concept: 'Funcoes', isCorrect: false }),
      resposta({ subject: 'MATH', concept: 'Probabilidade', isCorrect: true }),
    ];
    const r = agregarDefasagem('s1', respostas, [turmaA]);
    expect(r.classes[0].breakdown).toHaveLength(2);
  });
});