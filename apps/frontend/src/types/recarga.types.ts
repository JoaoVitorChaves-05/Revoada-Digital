// Tipos de dominio do modal de confirmacao de recarga (CHA-62).
// O Catalog_Item chega por props no formato real de GET /payments/catalog
// (Q2/P1); o modal nao busca o catalogo. O Recharge_Request e o corpo
// estrito de POST /payments/recharge.

// Item do catalogo no formato real de GET /payments/catalog (R2.4).
export interface CatalogItem {
  id: string; // uuid
  name: string;
  amountBRL: number; // valor em reais
  coinsCost: number; // pontos (inteiro)
}

// Corpo estrito de POST /payments/recharge (R4.5): apenas estes campos.
export interface RechargeRequest {
  catalogItemId: string;
  phoneNumber: string; // telefone normalizado (11 digitos)
}

// Codigo de erro de recarga derivado do status HTTP e do code do corpo.
export type RecargaErroCodigo =
  | 'UNAUTHORIZED' // 401
  | 'NOT_FOUND' // 404
  | 'INSUFFICIENT_POINTS' // 409
  | 'PROVIDER_FAILURE' // 502
  | 'SERVER_ERROR' // 500
  | 'UNKNOWN'; // demais

// Submit_State: uniao discriminada pelo campo `status` (R5.1, R6.1, R7.1).
export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; codigo: RecargaErroCodigo; mensagem: string };

// Acoes do submitReducer (ver tabela de transicoes no design).
export type SubmitAction =
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; codigo: RecargaErroCodigo; mensagem: string }
  | { type: 'RESET' };
