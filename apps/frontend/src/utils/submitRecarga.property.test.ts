import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type {
  CatalogItem,
  RecargaErroCodigo,
  SubmitAction,
  SubmitState,
} from '../types/recarga.types';
import { estadoInicial, montarRechargeRequest, submitReducer } from './submitRecarga';
import { normalizarTelefone } from './formatoMoedaTelefone';

/**
 * Codigos de erro de recarga (dominio fechado), usados nas acoes ERROR geradas.
 */
const codigoArb: fc.Arbitrary<RecargaErroCodigo> = fc.constantFrom(
  'UNAUTHORIZED',
  'NOT_FOUND',
  'INSUFFICIENT_POINTS',
  'PROVIDER_FAILURE',
  'SERVER_ERROR',
  'UNKNOWN',
);

/**
 * Gerador de SubmitAction cobrindo os quatro tipos. ERROR carrega codigo e
 * mensagem arbitrarios; os demais nao tem payload.
 */
const acaoArb: fc.Arbitrary<SubmitAction> = fc.oneof(
  fc.constant<SubmitAction>({ type: 'SUBMIT' }),
  fc.constant<SubmitAction>({ type: 'SUCCESS' }),
  fc
    .tuple(codigoArb, fc.string())
    .map<SubmitAction>(([codigo, mensagem]) => ({ type: 'ERROR', codigo, mensagem })),
  fc.constant<SubmitAction>({ type: 'RESET' }),
);

/** Conjunto de status validos para o Submit_State (totalidade). */
const STATUS_VALIDOS: ReadonlySet<SubmitState['status']> = new Set([
  'idle',
  'submitting',
  'success',
  'error',
]);

/**
 * Oracle independente da tabela de transicoes do design, reimplementado aqui a
 * partir da especificacao (nao reusa o switch sob teste) para servir de modelo
 * de referencia das Properties sobre o reducer.
 */
const oraculoReducer = (state: SubmitState, action: SubmitAction): SubmitState => {
  switch (state.status) {
    case 'idle':
      if (action.type === 'SUBMIT') return { status: 'submitting' };
      if (action.type === 'RESET') return { status: 'idle' };
      return state; // SUCCESS/ERROR ignorados
    case 'submitting':
      if (action.type === 'SUBMIT') return state; // guarda contra duplo envio
      if (action.type === 'SUCCESS') return { status: 'success' };
      if (action.type === 'ERROR') {
        return { status: 'error', codigo: action.codigo, mensagem: action.mensagem };
      }
      return { status: 'idle' }; // RESET
    case 'success':
      if (action.type === 'RESET') return { status: 'idle' };
      return state; // SUBMIT/SUCCESS/ERROR ignorados (idempotencia)
    case 'error':
      if (action.type === 'SUBMIT') return { status: 'submitting' }; // limpa a mensagem
      if (action.type === 'ERROR') {
        return { status: 'error', codigo: action.codigo, mensagem: action.mensagem };
      }
      if (action.type === 'RESET') return { status: 'idle' };
      return state; // SUCCESS ignorado
  }
};

/** Aplica uma sequencia de acoes a partir de um estado inicial. */
const aplicarSequencia = (inicial: SubmitState, acoes: readonly SubmitAction[]): SubmitState =>
  acoes.reduce((estado, acao) => submitReducer(estado, acao), inicial);

describe('submitReducer', () => {
  // Feature: cha-62-modal-confirmacao-recarga, Property 1: Reducer de Submit_State é total, determinístico e idempotente onde exigido
  // Validates: Requirements 5.1, 5.4, 6.1, 6.3, 7.1, 7.6
  it('Property 1: totalidade — toda sequencia a partir de estadoInicial produz um SubmitState valido', () => {
    fc.assert(
      fc.property(fc.array(acaoArb, { maxLength: 30 }), (acoes) => {
        const resultado = aplicarSequencia(estadoInicial, acoes);
        expect(STATUS_VALIDOS.has(resultado.status)).toBe(true);
        // Passo a passo cada transicao tambem tem de ser total e casar o oraculo.
        let estado = estadoInicial;
        for (const acao of acoes) {
          const proximo = submitReducer(estado, acao);
          expect(STATUS_VALIDOS.has(proximo.status)).toBe(true);
          expect(proximo).toEqual(oraculoReducer(estado, acao));
          estado = proximo;
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 1: determinismo — aplicar a mesma (sequencia) duas vezes rende resultados deep-equal', () => {
    fc.assert(
      fc.property(fc.array(acaoArb, { maxLength: 30 }), (acoes) => {
        const a = aplicarSequencia(estadoInicial, acoes);
        const b = aplicarSequencia(estadoInicial, acoes);
        expect(a).toEqual(b);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 1: guarda — a partir de submitting, SUBMIT mantem submitting (sem novo envio)', () => {
    fc.assert(
      fc.property(fc.array(acaoArb, { maxLength: 10 }), (extras) => {
        // Alcanca submitting de forma determinista: idle -> SUBMIT.
        const submitting = submitReducer(estadoInicial, { type: 'SUBMIT' });
        expect(submitting.status).toBe('submitting');

        const depois = submitReducer(submitting, { type: 'SUBMIT' });
        expect(depois).toEqual(submitting);
        expect(depois.status).toBe('submitting');

        // Repetir SUBMIT N vezes continua em submitting.
        const soSubmits = extras.map(() => ({ type: 'SUBMIT' }) as SubmitAction);
        const aposVarios = aplicarSequencia(submitting, soSubmits);
        expect(aposVarios.status).toBe('submitting');
      }),
      { numRuns: 100 },
    );
  });

  it('Property 1: idempotencia de success — SUBMIT/SUCCESS/ERROR a partir de success mantem success', () => {
    fc.assert(
      fc.property(codigoArb, fc.string(), (codigo, mensagem) => {
        const success = submitReducer(
          submitReducer(estadoInicial, { type: 'SUBMIT' }),
          { type: 'SUCCESS' },
        );
        expect(success.status).toBe('success');

        for (const acao of [
          { type: 'SUBMIT' } as SubmitAction,
          { type: 'SUCCESS' } as SubmitAction,
          { type: 'ERROR', codigo, mensagem } as SubmitAction,
        ]) {
          const depois = submitReducer(success, acao);
          expect(depois).toEqual(success);
          expect(depois.status).toBe('success');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 1: error -> SUBMIT transita para submitting descartando a mensagem anterior', () => {
    fc.assert(
      fc.property(codigoArb, fc.string(), (codigo, mensagem) => {
        const error = submitReducer(
          submitReducer(estadoInicial, { type: 'SUBMIT' }),
          { type: 'ERROR', codigo, mensagem },
        );
        expect(error).toEqual({ status: 'error', codigo, mensagem });

        const depois = submitReducer(error, { type: 'SUBMIT' });
        expect(depois.status).toBe('submitting');
        // O estado resultante nao carrega mensagem nem codigo de erro.
        expect(depois).toEqual({ status: 'submitting' });
        expect('mensagem' in depois).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Gerador de CatalogItem no formato real (R2.4): id como string arbitraria,
 * name arbitrario, amountBRL finito nao negativo e coinsCost inteiro.
 */
const catalogItemArb: fc.Arbitrary<CatalogItem> = fc.record({
  id: fc.string(),
  name: fc.string(),
  amountBRL: fc.double({ min: 0, max: 100_000, noNaN: true, noDefaultInfinity: true }),
  coinsCost: fc.integer({ min: 0, max: 1_000_000 }),
});

/**
 * Gerador de telefone enviesado para o formato valido `^\d{2}9\d{8}$`, mas sem
 * exigir validade: inclui mascara/separadores e strings arbitrarias.
 */
const telefoneArb: fc.Arbitrary<string> = fc.oneof(
  // Valido canonico: 2 digitos + 9 + 8 digitos, possivelmente mascarado.
  fc
    .tuple(
      fc.integer({ min: 10, max: 99 }),
      fc.integer({ min: 0, max: 99999999 }),
    )
    .map(([ddd, resto]) => `(${ddd}) 9${resto.toString().padStart(8, '0')}`),
  // Apenas digitos arbitrarios.
  fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 15 }).map((ds) => ds.join('')),
  // String arbitraria qualquer.
  fc.string(),
);

describe('montarRechargeRequest', () => {
  // Feature: cha-62-modal-confirmacao-recarga, Property 3: Montagem do Recharge_Request é estrita e usa o telefone normalizado
  // Validates: Requirements 1.3, 3.5, 4.2, 4.5
  it('Property 3: chaves exatas, catalogItemId === item.id e phoneNumber === normalizarTelefone(p)', () => {
    const CAMPOS_LEGADOS = ['userId', 'rechargeId', 'valor', 'pontosGastos'];

    fc.assert(
      fc.property(catalogItemArb, telefoneArb, (item, p) => {
        const request = montarRechargeRequest(item, p);

        // Exatamente as chaves catalogItemId e phoneNumber (nenhuma a mais).
        expect(Object.keys(request).sort()).toEqual(['catalogItemId', 'phoneNumber']);

        // Valores corretos.
        expect(request.catalogItemId).toBe(item.id);
        expect(request.phoneNumber).toBe(normalizarTelefone(p));

        // Nunca inclui campos legados.
        for (const campo of CAMPOS_LEGADOS) {
          expect(Object.prototype.hasOwnProperty.call(request, campo)).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });
});
