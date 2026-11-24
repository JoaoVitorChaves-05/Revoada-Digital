import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { RecargaErroCodigo } from '../types/recarga.types';
import { mapearErroRecarga } from './recargaClient';

/**
 * Dominio fechado de RecargaErroCodigo (enumerado explicitamente a partir do
 * union em ../types/recarga.types). Property 5 varre todos os codigos.
 */
const codigoArb: fc.Arbitrary<RecargaErroCodigo> = fc.constantFrom(
  'UNAUTHORIZED',
  'NOT_FOUND',
  'INSUFFICIENT_POINTS',
  'PROVIDER_FAILURE',
  'SERVER_ERROR',
  'UNKNOWN',
);

describe('mapearErroRecarga', () => {
  // Feature: cha-62-modal-confirmacao-recarga, Property 5: Mensagem de erro nunca é vazia
  // Validates: Requirements 7.3, 7.7
  it('Property 5: para todo codigo a mensagem e nao vazia (apos trim) e nunca afirma sucesso', () => {
    fc.assert(
      fc.property(codigoArb, (codigo) => {
        const mensagem = mapearErroRecarga(codigo);

        // Nao vazia depois de remover espacos (R7.3).
        expect(typeof mensagem).toBe('string');
        expect(mensagem.trim().length).toBeGreaterThan(0);

        // Nunca afirma sucesso nem menciona "simulado" (R7.7). A deteccao mira
        // AFIRMACOES de sucesso: "sucesso", a forma de PARTICIPIO "concluida"
        // (recarga concluida/finalizada) e "simulad". Nao usamos a raiz
        // "conclu" crua porque as mensagens de erro usam o INFINITIVO negado
        // ("Não foi possível concluir a recarga"), que afirma FALHA, nao
        // sucesso, e geraria falso positivo.
        expect(mensagem).not.toMatch(/sucesso|conclu[ií]d|finaliz|simulad/i);
      }),
      { numRuns: 100 },
    );
  });
});
