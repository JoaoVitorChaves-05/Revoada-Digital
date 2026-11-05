import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { Attempt, AttemptAnswer } from '../types/attempts.types';
import { calcularTaxaAcerto, contarQuestoesResolvidas } from './derivadorMetricas';

/**
 * Geradores de `Attempt[]` com `answers[]` aleatorios, cobrindo deliberadamente
 * os casos-limite relevantes a Property 1: lista vazia e tentativas sem answers
 * (array de answers com minLength 0). Os demais campos sao preenchidos com
 * valores plausiveis apenas para satisfazer os tipos; `contarQuestoesResolvidas`
 * so depende de `answers.length`.
 */
const answerArb: fc.Arbitrary<AttemptAnswer> = fc.record({
  id: fc.string(),
  attemptId: fc.string(),
  questionId: fc.string(),
  selectedAlternativeId: fc.option(fc.string(), { nil: null }),
  isCorrect: fc.option(fc.boolean(), { nil: null }),
  answeredAt: fc.option(
    fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
    { nil: null },
  ),
});

const attemptArb: fc.Arbitrary<Attempt> = fc.record({
  id: fc.string(),
  mockExamId: fc.string(),
  status: fc.constantFrom('IN_PROGRESS', 'SUBMITTED') as fc.Arbitrary<
    Attempt['status']
  >,
  startedAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
  submittedAt: fc.option(
    fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
    { nil: null },
  ),
  score: fc.option(fc.integer(), { nil: null }),
  correctAnswers: fc.option(fc.nat(), { nil: null }),
  totalQuestions: fc.option(fc.nat(), { nil: null }),
  earnedPoints: fc.option(fc.integer(), { nil: null }),
  // minLength 0 garante a geracao de tentativas sem answers (caso-limite).
  answers: fc.array(answerArb, { minLength: 0, maxLength: 20 }),
  mockExam: fc.record({
    id: fc.string(),
    name: fc.string(),
    studentId: fc.string(),
    createdAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
    updatedAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
  }),
  createdAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
  updatedAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
});

// minLength 0 inclui a lista vazia de tentativas (caso-limite => 0).
const attemptsArb = fc.array(attemptArb, { minLength: 0, maxLength: 15 });

describe('contarQuestoesResolvidas', () => {
  // Feature: dashboard-aluno, Property 1: Para toda lista de tentativas attempts, contarQuestoesResolvidas(attempts) e igual a soma de attempt.answers.length sobre todas as tentativas; lista vazia => 0.
  // Validates: Requirements 5.1, 5.2, 5.4
  it('Property 1: e a soma consistente de answers.length sobre todas as tentativas', () => {
    fc.assert(
      fc.property(attemptsArb, (attempts) => {
        const esperado = attempts.reduce(
          (total, attempt) => total + attempt.answers.length,
          0,
        );
        expect(contarQuestoesResolvidas(attempts)).toBe(esperado);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 1 (caso-limite): lista vazia resulta em 0', () => {
    expect(contarQuestoesResolvidas([])).toBe(0);
  });
});

describe('calcularTaxaAcerto', () => {
  // Feature: dashboard-aluno, Property 2: Para toda lista de tentativas attempts, se nao houver nenhum answer calcularTaxaAcerto retorna null (Estado_Vazio, sem divisao por zero); caso contrario retorna numero em 0 <= taxa <= 100 igual ao percentual de answers com isCorrect === true sobre o total de answers.
  // Validates: Requirements 6.1, 6.2, 6.3
  it('Property 2: retorna null sem answers, ou percentual em 0..100 igual a acertos/total', () => {
    fc.assert(
      fc.property(attemptsArb, (attempts) => {
        const todasAnswers = attempts.flatMap((attempt) => attempt.answers);
        const total = todasAnswers.length;
        const resultado = calcularTaxaAcerto(attempts);

        if (total === 0) {
          // Estado_Vazio: sem nenhuma answer, retorna null (sem divisao por zero).
          expect(resultado).toBeNull();
          return;
        }

        const acertos = todasAnswers.filter(
          (answer) => answer.isCorrect === true,
        ).length;
        const esperado = (acertos / total) * 100;

        expect(resultado).not.toBeNull();
        const taxa = resultado as number;
        expect(Number.isNaN(taxa)).toBe(false);
        expect(taxa).toBeGreaterThanOrEqual(0);
        expect(taxa).toBeLessThanOrEqual(100);
        expect(taxa).toBeCloseTo(esperado, 10);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 2 (caso-limite): nenhuma answer resulta em null', () => {
    // Lista vazia e tentativa com answers vazio: ambos sem answer => null.
    expect(calcularTaxaAcerto([])).toBeNull();
  });

  // Caso-limite explicito: isCorrect === null conta como nao-acerto no denominador.
  it('Property 2 (caso-limite): isCorrect nulo/false conta como nao-acerto', () => {
    fc.assert(
      fc.property(
        fc.array(fc.option(fc.boolean(), { nil: null }), {
          minLength: 1,
          maxLength: 30,
        }),
        (valoresIsCorrect) => {
          const answers: AttemptAnswer[] = valoresIsCorrect.map((isCorrect, i) => ({
            id: `a${i}`,
            attemptId: 'att-1',
            questionId: `q${i}`,
            selectedAlternativeId: null,
            isCorrect,
            answeredAt: null,
          }));
          const attempt: Attempt = {
            id: 'att-1',
            mockExamId: 'm1',
            status: 'SUBMITTED',
            startedAt: new Date().toISOString(),
            submittedAt: null,
            score: null,
            correctAnswers: null,
            totalQuestions: null,
            earnedPoints: null,
            answers,
            mockExam: {
              id: 'm1',
              name: 'Simulado',
              studentId: 's1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const acertos = valoresIsCorrect.filter((v) => v === true).length;
          const esperado = (acertos / valoresIsCorrect.length) * 100;

          expect(calcularTaxaAcerto([attempt])).toBeCloseTo(esperado, 10);
        },
      ),
      { numRuns: 100 },
    );
  });
});
