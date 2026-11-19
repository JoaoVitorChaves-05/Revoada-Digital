// Reducer puro do Submit_State e montagem do Recharge_Request (CHA-62).
//
// O reducer e TOTAL (toda combinacao estado x acao tem destino definido) e
// DETERMINISTICO, seguindo exatamente a "Tabela de transicoes do submitReducer"
// do design. A logica fica separada do componente para permitir property tests.

import type {
  CatalogItem,
  RechargeRequest,
  SubmitState,
  SubmitAction,
} from '../types/recarga.types';
import { normalizarTelefone } from './formatoMoedaTelefone';

// Estado inicial do Submit_State (R5.1).
export const estadoInicial: SubmitState = { status: 'idle' };

/**
 * Reducer puro e total do Submit_State.
 *
 * Tabela de transicoes (design):
 * | atual \ acao | SUBMIT                       | SUCCESS            | ERROR              | RESET |
 * | idle         | submitting                   | idle (ignora)      | idle (ignora)      | idle  |
 * | submitting   | submitting (ignora, guarda)  | success            | error(codigo,msg)  | idle  |
 * | success      | success (ignora)             | success (ignora)   | success (ignora)   | idle  |
 * | error        | submitting (limpa a mensagem)| error (ignora)     | error (atualiza)   | idle  |
 */
export function submitReducer(
  state: SubmitState,
  action: SubmitAction,
): SubmitState {
  switch (state.status) {
    case 'idle':
      switch (action.type) {
        case 'SUBMIT':
          return { status: 'submitting' };
        case 'SUCCESS':
          return state; // ignora
        case 'ERROR':
          return state; // ignora
        case 'RESET':
          return estadoInicial;
        default:
          return state;
      }

    case 'submitting':
      switch (action.type) {
        case 'SUBMIT':
          return state; // ignora: guarda contra duplo envio (R5.4)
        case 'SUCCESS':
          return { status: 'success' };
        case 'ERROR':
          return {
            status: 'error',
            codigo: action.codigo,
            mensagem: action.mensagem,
          };
        case 'RESET':
          return estadoInicial;
        default:
          return state;
      }

    case 'success':
      switch (action.type) {
        case 'SUBMIT':
          return state; // ignora (R6.3)
        case 'SUCCESS':
          return state; // ignora (R6.3)
        case 'ERROR':
          return state; // ignora (R6.3)
        case 'RESET':
          return estadoInicial;
        default:
          return state;
      }

    case 'error':
      switch (action.type) {
        case 'SUBMIT':
          return { status: 'submitting' }; // limpa a mensagem de erro (R7.6)
        case 'SUCCESS':
          return state; // ignora
        case 'ERROR':
          return {
            status: 'error',
            codigo: action.codigo,
            mensagem: action.mensagem,
          }; // atualiza codigo/mensagem
        case 'RESET':
          return estadoInicial;
        default:
          return state;
      }

    default:
      return state;
  }
}

/**
 * Monta o corpo estrito { catalogItemId, phoneNumber } a partir do item e do
 * telefone digitado, usando o telefone normalizado (R4.2, R4.5, R3.5). Sem
 * campos legados (userId, rechargeId, valor, pontosGastos).
 */
export function montarRechargeRequest(
  item: CatalogItem,
  phoneValue: string,
): RechargeRequest {
  return {
    catalogItemId: item.id,
    phoneNumber: normalizarTelefone(phoneValue),
  };
}
