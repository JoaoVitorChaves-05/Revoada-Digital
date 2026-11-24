import { api } from '../services/api';
import type {
  RespostaHistoricoRecargas,
  ParametrosPaginacao,
} from '../types/recargas.types';
// CÓDIGO TEMPORÁRIO DE DESENVOLVIMENTO — importado apenas aqui e acionado
// somente pela flag de dev abaixo. Remover junto do branch na integração
// com a API_Historico_Recargas real.
import { buscarHistoricoRecargasMock } from './recargasHistoricoMock';

/** Tempo limite por requisição (R1.2, R5.1, R6.6): 10 segundos. */
export const TIMEOUT_HISTORICO_MS = 10_000;

/**
 * Busca uma Pagina_Recargas da API_Historico_Recargas via Cliente_API.
 * O 401 e tratado globalmente pelo interceptor de `api` (R5.5, R7) — este
 * cliente nao o intercepta. Rejeita em timeout/erros !== 401.
 */
export async function buscarHistoricoRecargas(
  params: ParametrosPaginacao,
): Promise<RespostaHistoricoRecargas> {
  // Branch TEMPORÁRIO de desenvolvimento (flag desligada por padrão).
  if (import.meta.env.VITE_RECARGAS_HISTORICO_MOCK === 'true') {
    return buscarHistoricoRecargasMock(params);
  }
  const { data } = await api.get<RespostaHistoricoRecargas>('/payments/history', {
    params, // { page, pageSize }
    timeout: TIMEOUT_HISTORICO_MS,
  });
  return data;
}
