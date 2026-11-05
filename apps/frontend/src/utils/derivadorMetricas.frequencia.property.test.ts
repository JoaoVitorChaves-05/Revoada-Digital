import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { Attempt, AttemptAnswer } from '../types/attempts.types';
import { calcularFrequencia7Dias, derivarMetricas } from './derivadorMetricas';

/**
 * Geradores de `Attempt[]` com `answers[]` aleatorios para a Property 4. Todos
 * os geradores de data usam `fc.date({ noInvalidDate: true })` para evitar o
 * `RangeError: Invalid time value` ao chamar `.toISOString()` sobre datas
 * invalidas (flakiness conhecido de `fc.date()` puro). Os campos de data
 * (`answeredAt`, `submittedAt`, `startedAt`) sao os que alimentam
 * `calcularFrequencia7Dias` via `timestampEfetivo`; os demais campos apenas
 * satisfazem os tipos.
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

// minLength 0 inclui a lista vazia de tentativas (caso-limite).
const attemptsArb = fc.array(attemptArb, { minLength: 0, maxLength: 15 });

// `agora` tambem usa `noInvalidDate` para alimentar o calculo sem datas invalidas.
const agoraArb = fc.date({ noInvalidDate: true });

/**
 * Chave do dia local (YYYY-MM-DD) do mesmo jeito que o modulo sob teste a
 * calcula. Reproduzida aqui para derivar a sequencia cronologica esperada a
 * partir de `agora` sem depender da ordenabilidade lexicografica das strings
 * (que nao se sustenta para anos negativos/extremos). NAO comparamos as strings
 * entre si: comparamos cada `data` com a chave esperada do respectivo offset.
 */
function chaveDiaLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

describe('calcularFrequencia7Dias', () => {
  // Feature: dashboard-aluno, Property 4: Para toda lista de tentativas attempts e todo instante agora, calcularFrequencia7Dias(attempts, agora) retorna um array com exatamente 7 elementos em ordem cronologica, no qual exatamente um elemento tem ehHoje === true (o ultimo, correspondente a agora), e a contagem de elementos com estudou === true e igual a diasComEstudo, com 0 <= diasComEstudo <= 7. Para a lista vazia, todos os 7 dias tem estudou === false e diasComEstudo === 0.
  // Validates: Requirements 11.1, 11.2, 11.4, 11.5
  it('Property 4: 7 dias cronologicos, um unico ehHoje (o ultimo) e diasComEstudo consistente em 0..7', () => {
    fc.assert(
      fc.property(attemptsArb, agoraArb, (attempts, agora) => {
        const frequencia = calcularFrequencia7Dias(attempts, agora);

        // Exatamente 7 elementos (R11.2).
        expect(frequencia).toHaveLength(7);

        // Ordem cronologica (R11.1): a sequencia vai do dia (agora-6) ate agora,
        // um dia de calendario por elemento. Derivamos a chave esperada de cada
        // offset a partir de `agora` (meia-noite local) e conferimos contra a
        // `data` retornada. Evita comparar strings entre si, pois a ordenacao
        // lexicografica de YYYY-MM-DD nao vale para anos negativos/extremos.
        for (let i = 0; i < frequencia.length; i += 1) {
          const offset = frequencia.length - 1 - i; // 6..0
          const esperadoDia = new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate(),
          );
          esperadoDia.setDate(esperadoDia.getDate() - offset);
          expect(frequencia[i].data).toBe(chaveDiaLocal(esperadoDia));
        }

        // Exatamente um `ehHoje === true`, e e o ultimo elemento (corresponde a
        // agora - R11.3).
        const indicesHoje = frequencia
          .map((dia, i) => (dia.ehHoje ? i : -1))
          .filter((i) => i >= 0);
        expect(indicesHoje).toEqual([frequencia.length - 1]);

        // Contagem de `estudou === true` em 0..7 e coerente com `diasComEstudo`
        // do agregador (R11.4).
        const diasComEstudo = frequencia.filter((dia) => dia.estudou).length;
        expect(diasComEstudo).toBeGreaterThanOrEqual(0);
        expect(diasComEstudo).toBeLessThanOrEqual(7);
        expect(derivarMetricas(attempts, agora).diasComEstudo).toBe(
          diasComEstudo,
        );
      }),
      { numRuns: 100 },
    );
  });

  // Feature: dashboard-aluno, Property 4 (caso-limite): lista vazia => todos estudou === false e diasComEstudo === 0.
  // Validates: Requirements 11.5
  it('Property 4 (caso-limite): lista vazia resulta em todos estudou === false e diasComEstudo === 0', () => {
    fc.assert(
      fc.property(agoraArb, (agora) => {
        const frequencia = calcularFrequencia7Dias([], agora);

        expect(frequencia).toHaveLength(7);
        expect(frequencia.every((dia) => dia.estudou === false)).toBe(true);
        expect(derivarMetricas([], agora).diasComEstudo).toBe(0);
      }),
      { numRuns: 100 },
    );
  });
});
