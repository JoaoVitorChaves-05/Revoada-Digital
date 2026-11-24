import { describe, expect, it } from 'vitest';
import { PaymentError } from '../errors/payment.error';
import { authorizeRechargePhone } from './payment-authorization.service';

describe('authorizeRechargePhone', () => {
  it.each([
    ['11912345678', '11912345678'],
    ['(11) 91234-5678', '11912345678'],
    ['11912345678', ' (11) 91234-5678 '],
  ])('autoriza cadastro %s e destino %s', (registered, requested) => {
    expect(() => authorizeRechargePhone(registered, requested)).not.toThrow();
  });

  it.each([
    [null, '11912345678', 'PHONE_NOT_REGISTERED'],
    [undefined, '11912345678', 'PHONE_NOT_REGISTERED'],
    ['', '11912345678', 'PHONE_NOT_REGISTERED'],
    ['   ', '11912345678', 'PHONE_NOT_REGISTERED'],
    ['11912345678', '11912345679', 'PHONE_NOT_ALLOWED'],
    ['11912345678', '21912345678', 'PHONE_NOT_ALLOWED'],
    ['11912345678', '', 'INVALID_PHONE'],
    ['11912345678', '912345678', 'INVALID_PHONE'],
    ['11912345678', '1134567890', 'INVALID_PHONE'],
    ['11912345678', '+55 11 91234-5678', 'INVALID_PHONE'],
    ['inválido', '11912345678', 'INVALID_PHONE'],
  ] as const)('nega cadastro %s e destino %s: %s', (registered, requested, code) => {
    expect(() => authorizeRechargePhone(registered, requested)).toThrow(
      expect.objectContaining({ name: 'PaymentError', code }),
    );
  });

  it('lança o erro de domínio usado pelo módulo de pagamentos', () => {
    expect(() => authorizeRechargePhone(null, '11912345678')).toThrow(PaymentError);
  });
});
