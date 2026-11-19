import axios from 'axios';
import { api } from '../services/api';
import type { RechargeRequest, RecargaErroCodigo } from '../types/recarga.types';

// Recharge_Service fino sobre o Shared_Api_Client (services/api.ts).
// Envia a recarga por POST /payments/recharge e traduz falhas do backend em
// um RecargaErroCodigo de dominio + mensagem exibivel. Nao monta headers nem
// le token/accessToken: o interceptor de request injeta `authToken` e o
// interceptor de response trata 401 globalmente (redirect /login).

// Codigos de erro de dominio do backend (corpo `{ code, error }`).
const CODIGO_INSUFFICIENT_POINTS = 'INSUFFICIENT_POINTS';
const CODIGO_PROVIDER_FAILURE = 'PROVIDER_FAILURE';

/**
 * Erro de recarga com o codigo de dominio derivado da resposta do backend.
 * A `message` e tecnica; a mensagem exibivel ao usuario vem de
 * `mapearErroRecarga(codigo)`.
 */
export class RecargaError extends Error {
  constructor(
    public codigo: RecargaErroCodigo,
    message: string,
  ) {
    super(message);
    this.name = 'RecargaError';
  }
}

/**
 * Deriva o RecargaErroCodigo a partir do status HTTP e do `code` do corpo.
 *
 * Mapa status -> codigo:
 * - 401 -> UNAUTHORIZED (o interceptor global ja remove o token e redireciona)
 * - 404 (STUDENT_NOT_FOUND | CATALOG_ITEM_NOT_FOUND | PAYMENT_NOT_FOUND) -> NOT_FOUND
 * - 409: INSUFFICIENT_POINTS -> INSUFFICIENT_POINTS; INVALID_PAYMENT_STATUS -> UNKNOWN
 * - 502 (PROVIDER_FAILURE) -> PROVIDER_FAILURE
 * - 500 -> SERVER_ERROR
 * - demais / rede / sem response -> UNKNOWN
 */
function derivarCodigo(
  status: number | undefined,
  codeDoCorpo: string | undefined,
): RecargaErroCodigo {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return codeDoCorpo === CODIGO_INSUFFICIENT_POINTS
        ? 'INSUFFICIENT_POINTS'
        : 'UNKNOWN';
    case 502:
      return 'PROVIDER_FAILURE';
    case 500:
      return 'SERVER_ERROR';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Envia a recarga via POST /payments/recharge usando o api compartilhado.
 * Resolve quando o backend responde sucesso (HTTP 201). Em qualquer falha
 * (erro HTTP, rede ou ausencia de response) lanca `RecargaError(codigo, msg)`.
 */
export async function criarRecarga(request: RechargeRequest): Promise<void> {
  try {
    await api.post('/payments/recharge', request);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const codeDoCorpo = (error.response?.data as { code?: string } | undefined)?.code;
      const codigo = derivarCodigo(status, codeDoCorpo);
      throw new RecargaError(
        codigo,
        error.message || `Falha ao criar recarga (${codigo}).`,
      );
    }
    throw new RecargaError(
      'UNKNOWN',
      error instanceof Error ? error.message : 'Falha desconhecida ao criar recarga.',
    );
  }
}

/**
 * Mapeia um RecargaErroCodigo para a mensagem exibivel ao usuario.
 * A mensagem NUNCA e vazia, nunca afirma sucesso e nunca menciona UNCERTAIN.
 * Especifica para INSUFFICIENT_POINTS e PROVIDER_FAILURE; generica no resto.
 */
export function mapearErroRecarga(codigo: RecargaErroCodigo): string {
  switch (codigo) {
    case 'INSUFFICIENT_POINTS':
      return 'Saldo de pontos insuficiente para esta recarga.';
    case 'PROVIDER_FAILURE':
      return 'Não foi possível solicitar a recarga ao provedor. Tente novamente.';
    default:
      return 'Não foi possível concluir a recarga. Tente novamente.';
  }
}
