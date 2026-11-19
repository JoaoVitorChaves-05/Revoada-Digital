export type PaymentErrorCode =
  | 'STUDENT_NOT_FOUND'
  | 'CATALOG_ITEM_NOT_FOUND'
  | 'INSUFFICIENT_POINTS'
  | 'PROVIDER_FAILURE'
  | 'REFUND_FAILURE'
  | 'PAYMENT_NOT_FOUND'
  | 'INVALID_PAYMENT_STATUS';

export class PaymentError extends Error {
  constructor(
    readonly code: PaymentErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}
