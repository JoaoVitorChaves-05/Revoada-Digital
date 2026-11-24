import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { Recarga, RespostaHistoricoRecargas } from '../types/recargas.types';
import {
  type EstadoHistorico,
  reduzirCargaInicialErro,
  reduzirCargaInicialSucesso,
  reduzirCarregarMaisErro,
  reduzirCarregarMaisSucesso,
} from './historicoRecargasEstado';

/**
 * Property tests da maquina de estados pura da Tela_Historico (CHA-196),
 * cobrindo as Properties 2, 3 e 4 do design.md. As transicoes puras em
 * `historicoRecargasEstado.ts` sao exatamente as usadas pelo hook
 * `useHistoricoRecargas`, entao exercita-las aqui valida a logica de estado da
 * UI sem renderizar a arvore React.
 */

/**
 * Gerador de `Recarga`. Os demais formatos/ranges nao importam para a logica de
 * estado (que so depende de `id` para dedupe e de `items.length`); apenas `id`
 * usa um espaco pequeno para forcar colisoes (dedupe) com frequencia.
 */
const recargaArb: fc.Arbitrary<Recarga> = fc.record({
  id: fc.integer({ min: 0, max: 30 }).map((n) => `r${n}`),
  catalogItemName: fc.string(),
  amountBRL: fc.double({ min: 0.01, max: 999_999_999.99, noNaN: true }),
  coinsSpent: fc.nat(),
  status: fc.constantFrom('PENDING', 'COMPLETED', 'REFUNDED') as fc.Arbitrary<
    Recarga['status']
  >,
  phoneNumber: fc.string(),
  createdAt: fc.date({ noInvalidDate: true }).map((d) => d.toISOString()),
});

// minLength 0 inclui a Pagina_Recargas vazia (caso-limite => lista vazia / fim).
const itensArb = fc.array(recargaArb, { minLength: 0, maxLength: 10 });

/** Gerador de uma `RespostaHistoricoRecargas` (page/pageSize irrelevantes aqui). */
const respostaArb: fc.Arbitrary<RespostaHistoricoRecargas> = fc.record({
  items: itensArb,
  page: fc.integer({ min: 1, max: 10 }),
  pageSize: fc.constant(20),
  hasMore: fc.boolean(),
});

/** Lista de recargas ja acumulada/exibida, usada como ponto de partida. */
const recargasAcumuladasArb = fc.array(recargaArb, { minLength: 0, maxLength: 20 });

describe('historicoRecargasEstado — Property 2: visibilidade de "carregar mais"', () => {
  // Feature: cha-196-historico-recargas, Property 2: Para qualquer Pagina_Recargas recebida, o controle de carregar mais deve estar visivel se e somente se a resposta indicar que existem mais Recargas (hasMore verdadeiro); quando nao houver mais itens (inclusive lista vazia ou proxima pagina vazia), o controle deve estar oculto.
  // Validates: Requirements 4.2, 6.1, 6.5
  it('Property 2 (carga inicial): temMais verdadeiro sse ha itens e hasMore; pagina vazia oculta', () => {
    fc.assert(
      fc.property(respostaArb, (resposta) => {
        const proximo = reduzirCargaInicialSucesso(resposta);
        const temItens = (resposta.items ?? []).length > 0;

        // temMais <=> (ha itens E hasMore). Lista vazia => sempre oculto (R4.2).
        expect(proximo.temMais).toBe(temItens && resposta.hasMore);
        if (!temItens) {
          expect(proximo.estado).toBe('vazio');
          expect(proximo.temMais).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 2 (carregar mais): temMais segue hasMore quando ha itens; proxima pagina vazia oculta', () => {
    fc.assert(
      fc.property(recargasAcumuladasArb, respostaArb, (acumuladas, resposta) => {
        const proximo = reduzirCarregarMaisSucesso(acumuladas, resposta);
        const temItens = (resposta.items ?? []).length > 0;

        if (temItens) {
          // Com itens na proxima pagina, a visibilidade segue hasMore (R6.5).
          expect(proximo.temMais).toBe(resposta.hasMore);
        } else {
          // Proxima pagina vazia: controle oculto, mantendo os itens (R6.5, R6.7).
          expect(proximo.temMais).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 2 (erro inicial): controle sempre oculto', () => {
    expect(reduzirCargaInicialErro().temMais).toBe(false);
  });
});

/**
 * Transicoes possiveis a partir de um snapshot, modelando a maquina de estados
 * do hook. Cada passo produz um novo `EstadoHistorico` observavel.
 */
type Passo =
  | { tipo: 'inicial-sucesso'; resposta: RespostaHistoricoRecargas }
  | { tipo: 'inicial-erro' }
  | { tipo: 'mais-sucesso'; resposta: RespostaHistoricoRecargas }
  | { tipo: 'mais-erro' };

const passoArb: fc.Arbitrary<Passo> = fc.oneof(
  respostaArb.map((resposta) => ({ tipo: 'inicial-sucesso', resposta }) as Passo),
  fc.constant({ tipo: 'inicial-erro' } as Passo),
  respostaArb.map((resposta) => ({ tipo: 'mais-sucesso', resposta }) as Passo),
  fc.constant({ tipo: 'mais-erro' } as Passo),
);

/** Snapshot inicial do hook: carregando a primeira pagina, lista vazia. */
const ESTADO_INICIAL: EstadoHistorico = {
  estado: 'carregando-inicial',
  recargas: [],
  temMais: false,
};

/** Aplica um passo a um snapshot usando exatamente as transicoes puras do hook. */
function aplicarPasso(atual: EstadoHistorico, passo: Passo): EstadoHistorico {
  switch (passo.tipo) {
    case 'inicial-sucesso':
      return reduzirCargaInicialSucesso(passo.resposta);
    case 'inicial-erro':
      return reduzirCargaInicialErro();
    case 'mais-sucesso':
      return reduzirCarregarMaisSucesso(atual.recargas, passo.resposta);
    case 'mais-erro':
      return reduzirCarregarMaisErro(atual.recargas, atual.temMais);
  }
}

describe('historicoRecargasEstado — Property 3: exclusividade dos estados de UI', () => {
  // Feature: cha-196-historico-recargas, Property 3: Para qualquer estado da Tela_Historico, no maximo um entre `vazio`, `erro-inicial` e `lista` vale ao mesmo tempo; e sempre que o estado for `vazio` ou `erro-inicial`, a lista de recargas exibidas deve estar vazia (sem dados parciais).
  // Validates: Requirements 4.3, 4.4, 5.1
  it('Property 3: no maximo um entre vazio/erro-inicial/lista; vazio/erro-inicial implicam lista vazia', () => {
    fc.assert(
      fc.property(fc.array(passoArb, { minLength: 1, maxLength: 12 }), (passos) => {
        let atual = ESTADO_INICIAL;
        for (const passo of passos) {
          atual = aplicarPasso(atual, passo);

          // Exclusividade: no maximo um dos tres estados-alvo vale por vez.
          const alvos: ReadonlyArray<EstadoHistorico['estado']> = [
            'vazio',
            'erro-inicial',
            'lista',
          ];
          const ativos = alvos.filter((e) => e === atual.estado).length;
          expect(ativos).toBeLessThanOrEqual(1);

          // vazio/erro-inicial => sem dados parciais (lista exibida vazia).
          if (atual.estado === 'vazio' || atual.estado === 'erro-inicial') {
            expect(atual.recargas).toHaveLength(0);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('historicoRecargasEstado — Property 4: erro ao carregar mais preserva itens', () => {
  // Feature: cha-196-historico-recargas, Property 4: Para qualquer lista de recargas ja acumulada, quando uma requisicao de proxima Pagina_Recargas falha (erro != 401 ou timeout), a lista de recargas exibidas apos o erro deve ser identica a lista exibida imediatamente antes da requisicao.
  // Validates: Requirements 6.6
  it('Property 4: falha em carregar mais mantem a lista exibida identica a anterior', () => {
    fc.assert(
      fc.property(recargasAcumuladasArb, fc.boolean(), (acumuladas, temMaisAntes) => {
        const depois = reduzirCarregarMaisErro(acumuladas, temMaisAntes);

        // Lista exibida inalterada: mesmo tamanho, mesma ordem, mesmos itens.
        expect(depois.recargas).toEqual([...acumuladas]);
        // Transita para o modo de erro de "carregar mais" (R6.6).
        expect(depois.estado).toBe('erro-carregar-mais');
        // temMais preservado (o controle de retry continua coerente).
        expect(depois.temMais).toBe(temMaisAntes);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 4 (caso-limite): lista vazia permanece vazia apos falha', () => {
    const depois = reduzirCarregarMaisErro([], false);
    expect(depois.recargas).toEqual([]);
    expect(depois.estado).toBe('erro-carregar-mais');
  });
});
