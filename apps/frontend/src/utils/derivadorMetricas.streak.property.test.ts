import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { Attempt, AttemptAnswer } from '../types/attempts.types';
import { calcularStreak } from './derivadorMetricas';

/**
 * Oraculo do teste: replica a logica de "timestamp efetivo" e a chave de dia
 * LOCAL (YYYY-MM-DD no fuso do dispositivo) de `derivadorMetricas.ts`, de forma
 * independente da implementacao, para computar N = quantidade de dias de
 * calendario distintos com ao menos uma `answer` datavel.
 *
 * Ordem de fallback (identica a timestampEfetivo):
 *   answer.answeredAt -> attempt.submittedAt -> attempt.startedAt.
 */
function timestampEfetivoOraculo(
  answer: AttemptAnswer,
  attempt: Attempt,
): Date | null {
  const candidatos = [answer.answeredAt, attempt.submittedAt, attempt.startedAt];
  for (const iso of candidatos) {
    if (iso == null) continue;
    const data = new Date(iso);
    if (!Number.isNaN(data.getTime())) return data;
  }
  return null;
}

/** Chave de dia local (YYYY-MM-DD no fuso do dispositivo), identica a chaveDiaLocal. */
function chaveDiaLocalOraculo(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Janela de datas realista e bem dentro da faixa valida de `Date`. `fc.date`
 * (com `noInvalidDate: true`) pode gerar anos extremos (ex.: -271804); somados
 * a aritmetica de dias/horas, o resultado estoura ao chamar `.toISOString()`
 * (o `RangeError: Invalid time value` conhecido). Ancorar `agora` e as datas
 * derivadas nesta janela elimina o overflow mantendo `noInvalidDate: true`.
 */
const LIMITE_INFERIOR = new Date('2000-01-01T00:00:00.000Z');
const LIMITE_SUPERIOR = new Date('2100-12-31T23:59:59.999Z');

/** N = numero de dias de calendario distintos com ao menos uma answer datavel. */
function contarDiasDistintosComEstudo(attempts: Attempt[]): number {
  const dias = new Set<string>();
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const ts = timestampEfetivoOraculo(answer, attempt);
      if (ts != null) dias.add(chaveDiaLocalOraculo(ts));
    }
  }
  return dias.size;
}

/**
 * Gera uma data ISO "proxima" de `agora`, espalhada por alguns dias para frente
 * e para tras, com horario arbitrario dentro do dia. O deslocamento em minutos
 * cobre deliberadamente as fronteiras de dia (00:00 e 23:59) para exercitar a
 * logica de bucket de dia local. Usa SEMPRE `fc.date({ noInvalidDate: true })`
 * como fonte de aleatoriedade (evita o RangeError conhecido de `fc.date()` puro
 * + `.toISOString()`), mas reancorado em torno de `agora`.
 */
function isoProximoDeArb(agora: Date): fc.Arbitrary<string> {
  return fc
    .record({
      // Fonte de datas sempre valida e bounded; usada como entropia extra.
      seed: fc.date({
        noInvalidDate: true,
        min: LIMITE_INFERIOR,
        max: LIMITE_SUPERIOR,
      }),
      // Dias relativos a `agora`, cobrindo passado/futuro imediato (streak olha para tras).
      offsetDias: fc.integer({ min: -9, max: 2 }),
      // Minuto do dia, incluindo as bordas 0 (00:00) e 1439 (23:59).
      minutoDoDia: fc.integer({ min: 0, max: 1439 }),
    })
    .map(({ offsetDias, minutoDoDia }) => {
      const base = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate(),
      );
      base.setDate(base.getDate() + offsetDias);
      base.setHours(Math.floor(minutoDoDia / 60), minutoDoDia % 60, 0, 0);
      return base.toISOString();
    });
}

/**
 * Geradores de `Attempt[]` focados na Property 3: datas espalhadas em torno de
 * `agora` (incluindo fronteiras de dia) e a possibilidade de answers/attempts
 * sem timestamp datavel (todos os candidatos `null`), que devem ser descartados
 * do calculo de dias. Os campos nao relevantes recebem valores plausiveis.
 */
function answerArb(agora: Date): fc.Arbitrary<AttemptAnswer> {
  return fc.record({
    id: fc.string(),
    attemptId: fc.string(),
    questionId: fc.string(),
    selectedAlternativeId: fc.option(fc.string(), { nil: null }),
    isCorrect: fc.option(fc.boolean(), { nil: null }),
    // Pode ser null para exercitar o fallback para datas do attempt.
    answeredAt: fc.option(isoProximoDeArb(agora), { nil: null }),
  });
}

function attemptArb(agora: Date): fc.Arbitrary<Attempt> {
  return fc.record({
    id: fc.string(),
    mockExamId: fc.string(),
    status: fc.constantFrom('IN_PROGRESS', 'SUBMITTED') as fc.Arbitrary<
      Attempt['status']
    >,
    // startedAt e sempre datavel (ultimo fallback), espalhado em torno de agora.
    startedAt: isoProximoDeArb(agora),
    submittedAt: fc.option(isoProximoDeArb(agora), { nil: null }),
    score: fc.option(fc.integer(), { nil: null }),
    correctAnswers: fc.option(fc.nat(), { nil: null }),
    totalQuestions: fc.option(fc.nat(), { nil: null }),
    earnedPoints: fc.option(fc.integer(), { nil: null }),
    // minLength 0 garante tentativas sem answers (nao contribuem para N).
    answers: fc.array(answerArb(agora), { minLength: 0, maxLength: 12 }),
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
}

// Gerador conjunto de (attempts, agora). `agora` usa fc.date valido e bounded
// (ver LIMITE_*), evitando anos extremos que estourariam `.toISOString()`.
const cenarioArb = fc
  .date({ noInvalidDate: true, min: LIMITE_INFERIOR, max: LIMITE_SUPERIOR })
  .chain((agora) =>
    fc.record({
      agora: fc.constant(agora),
      // minLength 0 inclui a lista vazia (caso-limite => streak 0).
      attempts: fc.array(attemptArb(agora), { minLength: 0, maxLength: 10 }),
    }),
  );

describe('calcularStreak', () => {
  // Feature: dashboard-aluno, Property 3: Para toda lista de tentativas attempts e todo instante agora, calcularStreak(attempts, agora) satisfaz 0 <= streak <= N, onde N e a quantidade de dias de calendario distintos que possuem ao menos uma answer com timestamp efetivo. Lista vazia (ou sem answers dataveis) => streak 0.
  // Validates: Requirements 8.1, 8.3, 8.5
  it('Property 3: 0 <= streak <= N (dias distintos com estudo)', () => {
    fc.assert(
      fc.property(cenarioArb, ({ attempts, agora }) => {
        const n = contarDiasDistintosComEstudo(attempts);
        const streak = calcularStreak(attempts, agora);

        expect(Number.isInteger(streak)).toBe(true);
        expect(streak).toBeGreaterThanOrEqual(0);
        expect(streak).toBeLessThanOrEqual(n);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 3 (caso-limite): lista vazia resulta em streak 0', () => {
    expect(calcularStreak([], new Date())).toBe(0);
  });

  // Caso-limite explicito: attempts com answers mas sem nenhum timestamp datavel
  // (answeredAt/submittedAt/startedAt invalidos) nao contam => N = 0 => streak 0.
  it('Property 3 (caso-limite): sem answers dataveis resulta em streak 0', () => {
    const attempt: Attempt = {
      id: 'att-1',
      mockExamId: 'm1',
      status: 'SUBMITTED',
      startedAt: 'data-invalida',
      submittedAt: null,
      score: null,
      correctAnswers: null,
      totalQuestions: null,
      earnedPoints: null,
      answers: [
        {
          id: 'a1',
          attemptId: 'att-1',
          questionId: 'q1',
          selectedAlternativeId: null,
          isCorrect: null,
          answeredAt: null,
        },
      ],
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

    expect(calcularStreak([attempt], new Date())).toBe(0);
  });
});
