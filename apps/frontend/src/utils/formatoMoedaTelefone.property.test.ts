import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { formatarBRL, telefoneValido } from './formatoMoedaTelefone';

/**
 * Oracle da Phone_Rule, independente da implementacao sob teste: aplica a mesma
 * normalizacao (remover nao digitos) e a regex `^\d{2}9\d{8}$` diretamente,
 * servindo de modelo de referencia para a Property 2.
 */
const casaPhoneRule = (p: string): boolean => /^\d{2}9\d{8}$/.test(p.replace(/\D/g, ''));

/**
 * Gerador que cobre deliberadamente os casos-limite de R3.4: strings
 * arbitrarias (texto qualquer), strings so de digitos com comprimento variavel
 * (inclusive 11), strings com espacos em branco e a string vazia.
 */
const telefoneEntradaArb: fc.Arbitrary<string> = fc.oneof(
  // Strings arbitrarias (qualquer unicode).
  fc.string(),
  // Apenas digitos, comprimento variavel (0..15) para exercitar fronteiras de 11.
  fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 15 }).map((ds) => ds.join('')),
  // Digitos com mascara/espacos e outros separadores comuns.
  fc
    .tuple(
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 9 }),
      fc.integer({ min: 0, max: 99999999 }),
    )
    .map(([ddd, nono, resto]) => `(${ddd}) ${nono} ${resto}`),
  // Strings compostas apenas de whitespace.
  fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 0, maxLength: 8 }).map((ws) => ws.join('')),
  // A string vazia (edge case explicito de R3.4).
  fc.constant(''),
);

describe('telefoneValido', () => {
  // Feature: cha-62-modal-confirmacao-recarga, Property 2: Validação de telefone casa exatamente a Phone_Rule
  // Validates: Requirements 3.3, 3.4, 3.5
  it('Property 2: telefoneValido(p) === regex ^\\d{2}9\\d{8}$ sobre o normalizado', () => {
    fc.assert(
      fc.property(telefoneEntradaArb, (p) => {
        expect(telefoneValido(p)).toBe(casaPhoneRule(p));
      }),
      { numRuns: 100 },
    );
  });

  it('Property 2 (caso-limite): vazio e whitespace-only resultam em false', () => {
    expect(telefoneValido('')).toBe(false);
    expect(telefoneValido('   ')).toBe(false);
    expect(telefoneValido('\t\n  \r')).toBe(false);
  });

  it('Property 2 (caso-limite): um telefone valido canonico retorna true', () => {
    // 11 digitos no formato DDD + 9 + 8 digitos.
    expect(telefoneValido('11987654321')).toBe(true);
    expect(telefoneValido('(11) 98765-4321')).toBe(true);
  });
});

/**
 * Gera valores monetarios nao negativos finitos como centavos inteiros
 * divididos por 100, evitando ruido de ponto flutuante (padrao CHA-196).
 */
const valorBRLArb: fc.Arbitrary<number> = fc
  .integer({ min: 0, max: 100_000_000 })
  .map((cents) => cents / 100);

describe('formatarBRL', () => {
  // Feature: cha-62-modal-confirmacao-recarga, Property 4: Formatação BRL em pt-BR
  // Validates: Requirements 2.2
  it('Property 4: formatarBRL(v) equivale ao Intl.NumberFormat pt-BR currency BRL', () => {
    const oracle = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    fc.assert(
      fc.property(valorBRLArb, (v) => {
        const resultado = formatarBRL(v);

        // Model-based: identico ao oracle Intl pt-BR.
        expect(resultado).toBe(oracle.format(v));

        // Contem o simbolo R$.
        expect(resultado).toContain('R$');

        // Virgula como separador decimal, com exatamente duas casas decimais.
        expect(resultado).toMatch(/,\d{2}$/);
      }),
      { numRuns: 100 },
    );
  });
});
