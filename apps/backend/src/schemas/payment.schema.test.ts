import { describe, expect, it } from 'vitest';
import { createPaymentSchema } from './payment.schema';

const catalogItemId = '33333333-3333-4333-8333-333333333333';

describe('createPaymentSchema', () => {
  it('normaliza o telefone antes de validar', () => {
    expect(
      createPaymentSchema.parse({
        catalogItemId,
        phoneNumber: '(11) 91234-5678',
      }),
    ).toEqual({
      catalogItemId,
      phoneNumber: '11912345678',
    });
  });

  it('rejeita telefone inválido e propriedades extras', () => {
    expect(
      createPaymentSchema.safeParse({
        catalogItemId,
        phoneNumber: '1191234567',
      }).success,
    ).toBe(false);
    expect(
      createPaymentSchema.safeParse({
        catalogItemId,
        phoneNumber: '11912345678',
        extra: true,
      }).success,
    ).toBe(false);
  });
});
