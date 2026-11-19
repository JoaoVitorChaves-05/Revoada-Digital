import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import {
  DADO_INDISPONIVEL,
  formatarBRL,
  formatarDataHora,
  formatarTelefone,
  rotuloStatus,
} from './formatoRecarga';

/**
 * Property tests das funções puras de formatação pt-BR da Tela_Historico
 * (CHA-196). Seguem a convenção de `derivadorMetricas.property.test.ts`:
 * `fast-check` com `{ numRuns: 100 }`, tag `// Feature: ..., Property N: ...`
 * e linha `// Validates: Requirements ...`.
 */

const STATUS_CONHECIDOS: Record<string, string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluída',
  REFUNDED: 'Estornada',
};
const STATUS_DESCONHECIDO = 'Status desconhecido';

describe('rotuloStatus', () => {
  // Feature: cha-196-historico-recargas, Property 5: Para qualquer valor de status, rotuloStatus retorna um rótulo pt-BR não vazio; os três status conhecidos mapeiam para o rótulo correspondente e qualquer outro valor retorna exatamente "Status desconhecido".
  // Validates: Requirements 2.4, 2.7
  it('Property 5: totalidade — sempre retorna um rótulo conhecido ou "Status desconhecido"', () => {
    const rotulosConhecidos = new Set(Object.values(STATUS_CONHECIDOS));

    fc.assert(
      fc.property(
        // Inclui os três status conhecidos e strings arbitrárias (R2.7).
        fc.oneof(
          fc.constantFrom('PENDING', 'COMPLETED', 'REFUNDED'),
          fc.string(),
        ),
        (status) => {
          const resultado = rotuloStatus(status);

          expect(typeof resultado).toBe('string');
          expect(resultado.length).toBeGreaterThan(0);

          if (Object.prototype.hasOwnProperty.call(STATUS_CONHECIDOS, status)) {
            expect(resultado).toBe(STATUS_CONHECIDOS[status]);
          } else {
            expect(resultado).toBe(STATUS_DESCONHECIDO);
          }

          expect(
            rotulosConhecidos.has(resultado) || resultado === STATUS_DESCONHECIDO,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Property 5 (caso-limite): os três status conhecidos mapeiam corretamente', () => {
    expect(rotuloStatus('PENDING')).toBe('Pendente');
    expect(rotuloStatus('COMPLETED')).toBe('Concluída');
    expect(rotuloStatus('REFUNDED')).toBe('Estornada');
  });

  it('Property 5 (caso-limite): ausente/nulo retorna "Status desconhecido"', () => {
    expect(rotuloStatus(null)).toBe(STATUS_DESCONHECIDO);
    expect(rotuloStatus(undefined)).toBe(STATUS_DESCONHECIDO);
  });
});

describe('formatarDataHora', () => {
  // Feature: cha-196-historico-recargas, Property 6: Para qualquer data/hora ISO 8601 válida, formatarDataHora produz uma string no padrão DD/MM/AAAA HH:MM (24h, pt-BR).
  // Validates: Requirements 2.1
  it('Property 6: produz o padrão DD/MM/AAAA HH:MM (24h) para datas ISO 8601 válidas', () => {
    const PADRAO = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

    // Datas com ano de 4 dígitos (1000..9999), coerentes com o padrão
    // DD/MM/AAAA de R2.1. Anos fora dessa faixa (ex.: 5+ dígitos) não fazem
    // parte do contrato de exibição de recargas.
    const dataArb = fc
      .date({
        // Margem de 2 dias nas bordas para que deslocamentos de fuso local
        // não empurrem a data para um ano de 3 ou 5 dígitos.
        min: new Date('1000-01-03T00:00:00.000Z'),
        max: new Date('9999-12-29T23:59:59.999Z'),
        noInvalidDate: true,
      })
      .map((d) => d.toISOString());

    fc.assert(
      fc.property(
        dataArb,
        (iso) => {
          const resultado = formatarDataHora(iso);
          const correspondencia = PADRAO.exec(resultado);

          expect(correspondencia).not.toBeNull();
          const [, dia, mes, , hora, minuto] = correspondencia as RegExpExecArray;

          // 24h e componentes dentro dos limites de calendário/relógio.
          const diaN = Number(dia);
          const mesN = Number(mes);
          const horaN = Number(hora);
          const minutoN = Number(minuto);
          expect(diaN).toBeGreaterThanOrEqual(1);
          expect(diaN).toBeLessThanOrEqual(31);
          expect(mesN).toBeGreaterThanOrEqual(1);
          expect(mesN).toBeLessThanOrEqual(12);
          expect(horaN).toBeGreaterThanOrEqual(0);
          expect(horaN).toBeLessThanOrEqual(23);
          expect(minutoN).toBeGreaterThanOrEqual(0);
          expect(minutoN).toBeLessThanOrEqual(59);

          // A formatação usa os getters locais de Date; derivamos o esperado da
          // mesma fonte para não depender do fuso em que o teste roda.
          const data = new Date(iso);
          const esperado =
            `${String(data.getDate()).padStart(2, '0')}/` +
            `${String(data.getMonth() + 1).padStart(2, '0')}/` +
            `${String(data.getFullYear()).padStart(4, '0')} ` +
            `${String(data.getHours()).padStart(2, '0')}:` +
            `${String(data.getMinutes()).padStart(2, '0')}`;
          expect(resultado).toBe(esperado);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('Property 6 (caso-limite): ausente/inválida retorna DADO_INDISPONIVEL', () => {
    expect(formatarDataHora(null)).toBe(DADO_INDISPONIVEL);
    expect(formatarDataHora(undefined)).toBe(DADO_INDISPONIVEL);
    expect(formatarDataHora('')).toBe(DADO_INDISPONIVEL);
    expect(formatarDataHora('não é uma data')).toBe(DADO_INDISPONIVEL);
  });
});

describe('formatarBRL', () => {
  // Feature: cha-196-historico-recargas, Property 7: Para qualquer valor decimal em 0,01..999999999,99, formatarBRL produz uma string iniciada por "R$", com exatamente duas casas decimais, vírgula como separador decimal e ponto como separador de milhar (pt-BR).
  // Validates: Requirements 2.2
  it('Property 7: prefixo R$, duas casas decimais, vírgula decimal e ponto de milhar', () => {
    // Gera centavos inteiros em [1, 99_999_999_999] para cobrir 0,01..999.999.999,99
    // com exatamente duas casas decimais, evitando ruído de ponto flutuante.
    const centavosArb = fc.integer({ min: 1, max: 99_999_999_999 });

    fc.assert(
      fc.property(centavosArb, (centavos) => {
        const valor = centavos / 100;
        const resultado = formatarBRL(valor);

        // Prefixo "R$" (o Intl pt-BR usa espaço não separável entre R$ e número).
        expect(resultado.startsWith('R$')).toBe(true);

        // Parte numérica após o prefixo e qualquer espaço.
        const numerico = resultado.replace(/^R\$\s*/u, '');

        // Exatamente duas casas decimais com vírgula como separador decimal.
        expect(/,\d{2}$/u.test(numerico)).toBe(true);

        const [inteiro, decimal] = numerico.split(',');
        expect(decimal).toHaveLength(2);

        // Ponto como separador de milhar: grupos de 3 dígitos após o primeiro grupo.
        expect(/^\d{1,3}(\.\d{3})*$/u.test(inteiro)).toBe(true);

        // Separador de milhar aparece se e somente se há mais de 3 dígitos inteiros.
        const soDigitosInteiros = inteiro.replace(/\./gu, '');
        expect(inteiro.includes('.')).toBe(soDigitosInteiros.length > 3);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 7 (caso-limite): valores específicos de milhar e centavo', () => {
    expect(formatarBRL(1234.56)).toBe('R$\u00a01.234,56');
    expect(formatarBRL(0.01)).toBe('R$\u00a00,01');
  });

  it('Property 7 (caso-limite): valor ausente/inválido retorna DADO_INDISPONIVEL', () => {
    expect(formatarBRL(null)).toBe(DADO_INDISPONIVEL);
    expect(formatarBRL(undefined)).toBe(DADO_INDISPONIVEL);
    expect(formatarBRL(Number.NaN)).toBe(DADO_INDISPONIVEL);
  });
});

describe('formatarTelefone', () => {
  // Feature: cha-196-historico-recargas, Property 8: Para qualquer sequência de 11 dígitos, formatarTelefone produz uma string no padrão (DD) NNNNN-NNNN; entradas que não casam o padrão de 11 dígitos preservam o valor cru.
  // Validates: Requirements 2.5
  it('Property 8: sequências de 11 dígitos viram (DD) NNNNN-NNNN', () => {
    const onzeDigitosArb = fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 11, maxLength: 11 })
      .map((digitos) => digitos.join(''));

    fc.assert(
      fc.property(onzeDigitosArb, (numero) => {
        const resultado = formatarTelefone(numero);

        expect(/^\(\d{2}\) \d{5}-\d{4}$/u.test(resultado)).toBe(true);

        const esperado = `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
        expect(resultado).toBe(esperado);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: cha-196-historico-recargas, Property 8: entradas que não casam o padrão de 11 dígitos preservam o valor cru (R2.5); ausente/nulo retorna DADO_INDISPONIVEL (R2.6).
  // Validates: Requirements 2.5
  it('Property 8: entradas fora do padrão de 11 dígitos preservam o valor cru', () => {
    const naoOnzeDigitosArb = fc
      .string()
      .filter((s) => s !== '' && !/^\d{11}$/u.test(s));

    fc.assert(
      fc.property(naoOnzeDigitosArb, (numero) => {
        expect(formatarTelefone(numero)).toBe(numero);
      }),
      { numRuns: 100 },
    );
  });

  it('Property 8 (caso-limite): ausente/nulo retorna DADO_INDISPONIVEL', () => {
    expect(formatarTelefone(null)).toBe(DADO_INDISPONIVEL);
    expect(formatarTelefone(undefined)).toBe(DADO_INDISPONIVEL);
    expect(formatarTelefone('')).toBe(DADO_INDISPONIVEL);
  });
});
