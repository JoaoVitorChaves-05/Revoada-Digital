import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { Recarga, StatusRecarga } from '../types/recargas.types';
import { acumularRecargas } from './formatoRecarga';

/**
 * Gerador de `Recarga` com `id` tirado de um pool pequeno para forçar colisões
 * entre o acumulado e a próxima página (e dentro da própria página), exercitando
 * o dedupe por `id` do reducer (R6.3). Os demais campos recebem valores
 * plausíveis apenas para satisfazer o tipo; `acumularRecargas` depende somente
 * de `id`.
 */
const statusArb: fc.Arbitrary<StatusRecarga> = fc.constantFrom(
  'PENDING',
  'COMPLETED',
  'REFUNDED',
);

// Pool pequeno de ids => colisões frequentes entre páginas e dentro da página.
const idArb: fc.Arbitrary<string> = fc.constantFrom(
  'r1',
  'r2',
  'r3',
  'r4',
  'r5',
);

const recargaArb: fc.Arbitrary<Recarga> = fc.record({
  id: idArb,
  catalogItemName: fc.string(),
  amountBRL: fc.double({ min: 0.01, max: 999999999.99, noNaN: true }),
  coinsSpent: fc.nat(),
  status: statusArb,
  phoneNumber: fc.string(),
  createdAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
});

// minLength 0 inclui as listas vazias (casos-limite: acumulado vazio, página vazia).
const recargasArb = fc.array(recargaArb, { minLength: 0, maxLength: 12 });

/**
 * Reimplementação independente da semântica documentada de `acumularRecargas`:
 * concatena a próxima página após o acumulado, descartando `id` já vistos
 * (inclusive repetições internas), preservando a ordem de recebimento.
 */
function acumularEsperado(
  acumuladas: readonly Recarga[],
  proximaPagina: readonly Recarga[],
): Recarga[] {
  const vistos = new Set<string>();
  const saida: Recarga[] = [];
  for (const recarga of [...acumuladas, ...proximaPagina]) {
    if (vistos.has(recarga.id)) continue;
    vistos.add(recarga.id);
    saida.push(recarga);
  }
  return saida;
}

describe('acumularRecargas', () => {
  // Feature: cha-196-historico-recargas, Property 1: Acumulação de páginas preserva ordem e não duplica. Para qualquer Recarga[] acumulado e qualquer próxima página Recarga[], o resultado começa pelos itens já acumulados (dedup por id, na ordem), anexa os itens novos (ids ainda não vistos) preservando a ordem de recebimento, nenhum id aparece duas vezes e itens já presentes não são re-adicionados.
  // Validates: Requirements 1.3, 6.3
  it('Property 1: preserva ordem de recebimento, anexa apenas ids novos e não duplica', () => {
    fc.assert(
      fc.property(recargasArb, recargasArb, (acumuladas, proximaPagina) => {
        const resultado = acumularRecargas(acumuladas, proximaPagina);

        // Ids do acumulado já deduplicados (primeira ocorrência), em ordem.
        const idsAcumuladoUnicos: string[] = [];
        const vistosAcumulado = new Set<string>();
        for (const recarga of acumuladas) {
          if (vistosAcumulado.has(recarga.id)) continue;
          vistosAcumulado.add(recarga.id);
          idsAcumuladoUnicos.push(recarga.id);
        }

        const idsResultado = resultado.map((r) => r.id);

        // (a) Começa pelos itens acumulados únicos, na mesma ordem.
        expect(idsResultado.slice(0, idsAcumuladoUnicos.length)).toEqual(
          idsAcumuladoUnicos,
        );

        // (b) Nenhum id aparece duas vezes no resultado.
        expect(new Set(idsResultado).size).toBe(idsResultado.length);

        // (c) Itens já presentes no acumulado não foram re-adicionados: a cauda
        //     (itens novos da página) não contém nenhum id do acumulado.
        const cauda = idsResultado.slice(idsAcumuladoUnicos.length);
        for (const id of cauda) {
          expect(vistosAcumulado.has(id)).toBe(false);
        }

        // (d) Os itens novos aparecem na ordem em que chegaram na página.
        const novosNaOrdemDeChegada: string[] = [];
        const vistosNovos = new Set<string>(vistosAcumulado);
        for (const recarga of proximaPagina) {
          if (vistosNovos.has(recarga.id)) continue;
          vistosNovos.add(recarga.id);
          novosNaOrdemDeChegada.push(recarga.id);
        }
        expect(cauda).toEqual(novosNaOrdemDeChegada);

        // (e) Coincide com a semântica documentada, preservando as referências.
        expect(resultado).toEqual(acumularEsperado(acumuladas, proximaPagina));

        // Função pura: não muta as entradas.
        expect(acumuladas.length).toBe(acumuladas.length);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 1 (caso-limite): acumulado vazio devolve os itens novos sem duplicar', () => {
    const pagina: Recarga[] = [
      criar('a1'),
      criar('a2'),
      criar('a1'), // duplicata interna deve ser descartada
    ];
    const resultado = acumularRecargas([], pagina);
    expect(resultado.map((r) => r.id)).toEqual(['a1', 'a2']);
  });

  it('Property 1 (caso-limite): próxima página vazia preserva exatamente o acumulado', () => {
    const acumuladas: Recarga[] = [criar('a1'), criar('a2'), criar('a3')];
    const resultado = acumularRecargas(acumuladas, []);
    expect(resultado).toEqual(acumuladas);
  });

  it('Property 1 (caso-limite): página totalmente sobreposta não adiciona nada', () => {
    const acumuladas: Recarga[] = [criar('a1'), criar('a2')];
    const paginaRepetida: Recarga[] = [criar('a2'), criar('a1')];
    const resultado = acumularRecargas(acumuladas, paginaRepetida);
    expect(resultado.map((r) => r.id)).toEqual(['a1', 'a2']);
  });
});

/** Fábrica mínima de `Recarga` para os casos-limite determinísticos. */
function criar(id: string): Recarga {
  return {
    id,
    catalogItemName: `Item ${id}`,
    amountBRL: 10,
    coinsSpent: 100,
    status: 'COMPLETED',
    phoneNumber: '11999998888',
    createdAt: new Date().toISOString(),
  };
}
