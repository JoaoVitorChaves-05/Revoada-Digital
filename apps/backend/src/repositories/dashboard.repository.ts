import { prisma } from '../lib/prisma';
import { AttemptStatus } from '@prisma/client';

// Contrato de saida agregado (CHA-49). Alimenta o endpoint da CHA-48.
export type SubjectGap = {
  subject: string;
  concept: string | null;
  answered: number;
  correct: number;
  wrong: number;
  gapRate: number; // erros / respondidas, em [0, 1]; 0 quando answered = 0
};

export type ClassDashboard = {
  classId: string | null; // null = alunos sem turma
  className: string | null;
  totalAnswered: number;
  hasData: boolean;
  breakdown: SubjectGap[];
};

export type DirectorDashboard = {
  schoolId: string;
  classes: ClassDashboard[];
};

// Linha bruta de resposta usada na agregacao (uma por AttemptAnswer valida).
export type RespostaBruta = {
  classId: string | null;
  className: string | null;
  subject: string;
  concept: string | null;
  isCorrect: boolean;
};

// Turma conhecida da escola (para listar turmas inclusive sem dados).
export type TurmaConhecida = {
  classId: string | null;
  className: string | null;
};

/**
 * Agregacao PURA (sem I/O): dado o conjunto de respostas brutas e a lista de
 * turmas conhecidas, produz o DirectorDashboard. Isolada para ser testavel
 * sem banco e para concentrar a logica das Correctness Properties.
 */
export function agregarDefasagem(
  schoolId: string,
  respostas: RespostaBruta[],
  turmasConhecidas: TurmaConhecida[]
): DirectorDashboard {
  // chave composta classId|subject|concept
  const mapaGaps = new Map<string, SubjectGap & { classId: string | null; className: string | null }>();
  const turmas = new Map<string, { classId: string | null; className: string | null }>();

  // Semear todas as turmas conhecidas (inclusive sem dados).
  for (const t of turmasConhecidas) {
    turmas.set(chaveTurma(t.classId), { classId: t.classId, className: t.className });
  }

  for (const r of respostas) {
    turmas.set(chaveTurma(r.classId), { classId: r.classId, className: r.className });

    const chave = `${chaveTurma(r.classId)}::${r.subject}::${r.concept ?? ''}`;
    let g = mapaGaps.get(chave);
    if (!g) {
      g = {
        classId: r.classId,
        className: r.className,
        subject: r.subject,
        concept: r.concept,
        answered: 0,
        correct: 0,
        wrong: 0,
        gapRate: 0,
      };
      mapaGaps.set(chave, g);
    }
    g.answered += 1;
    if (r.isCorrect) g.correct += 1;
    else g.wrong += 1;
  }

  // Montar as turmas com seus breakdowns.
  const classes: ClassDashboard[] = [];
  for (const [chaveT, info] of turmas) {
    const breakdown = Array.from(mapaGaps.values())
      .filter((g) => chaveTurma(g.classId) === chaveT)
      .map<SubjectGap>((g) => ({
        subject: g.subject,
        concept: g.concept,
        answered: g.answered,
        correct: g.correct,
        wrong: g.wrong,
        gapRate: g.answered === 0 ? 0 : g.wrong / g.answered,
      }));

    const totalAnswered = breakdown.reduce((acc, b) => acc + b.answered, 0);

    classes.push({
      classId: info.classId,
      className: info.className,
      totalAnswered,
      hasData: totalAnswered > 0,
      breakdown,
    });
  }

  return { schoolId, classes };
}

function chaveTurma(classId: string | null): string {
  return classId ?? '__sem_turma__';
}

export class DashboardRepository {
  /**
   * Busca as respostas submetidas dos alunos de uma escola e as turmas da escola,
   * e devolve o dashboard agregado por turma e materia/conceito.
   * Prisma e usado SOMENTE aqui (fronteira de camada).
   */
  async getDirectorDashboard(schoolId: string): Promise<DirectorDashboard> {
    // 1) Respostas validas: tentativas SUBMITTED, isCorrect nao nulo, alunos da escola.
    const answers = await prisma.attemptAnswer.findMany({
      where: {
        isCorrect: { not: null },
        attempt: {
          status: AttemptStatus.SUBMITTED,
          mockExam: { student: { schoolId } },
        },
      },
      select: {
        isCorrect: true,
        question: { select: { subject: true, concept: true } },
        attempt: {
          select: {
            mockExam: {
              select: {
                student: {
                  select: {
                    classId: true,
                    class: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const respostas: RespostaBruta[] = answers.map((a) => {
      const student = a.attempt.mockExam.student;
      return {
        classId: student.classId ?? null,
        className: student.class?.name ?? null,
        subject: a.question.subject,
        concept: a.question.concept ?? null,
        isCorrect: a.isCorrect === true,
      };
    });

    // 2) Todas as turmas da escola (para aparecerem inclusive sem dados).
    const turmas = await prisma.schoolClass.findMany({
      where: { schoolId },
      select: { id: true, name: true },
    });

    const turmasConhecidas: TurmaConhecida[] = turmas.map((t) => ({
      classId: t.id,
      className: t.name,
    }));

    return agregarDefasagem(schoolId, respostas, turmasConhecidas);
  }
}

export const dashboardRepository = new DashboardRepository();