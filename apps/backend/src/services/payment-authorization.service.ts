import { PaymentError } from '../errors/payment.error';
import { createPaymentSchema } from '../schemas/payment.schema';

export function authorizeRechargePhone(
  registeredPhone: string | null | undefined,
  requestedPhone: string,
): void {
  if (!registeredPhone?.trim()) {
    throw new PaymentError('PHONE_NOT_REGISTERED', 'Número de celular não cadastrado');
  }

  const registered = createPaymentSchema.shape.phoneNumber.safeParse(registeredPhone);
  const requested = createPaymentSchema.shape.phoneNumber.safeParse(requestedPhone);

  if (!registered.success || !requested.success) {
    throw new PaymentError('INVALID_PHONE', 'Telefone inválido');
  }

  if (registered.data !== requested.data) {
    throw new PaymentError('PHONE_NOT_ALLOWED', 'A recarga deve ser para o número cadastrado');
  }
}
