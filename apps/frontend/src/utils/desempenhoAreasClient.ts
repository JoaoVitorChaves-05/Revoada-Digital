import type {
  DesempenhoArea,
  RespostaDesempenhoAreas,
} from '../types/desempenhoAreas.types';
import { API_BASE_URL } from './apiBase';

const URL_BASE_API = API_BASE_URL;

const MENSAGEM_ERRO = 'Não foi possível carregar seu desempenho por área.';

/**
 * Cliente da feature Desempenho por área.
 *
 * Requisita `GET /dashboard/me/desempenho-areas?userId=<id>` e devolve a lista
 * de areas tipada. Espelha o contrato de `attemptsClient`: aceita um `token`
 * opcional (enviado como `Authorization: Bearer`) para a futura fase com JWT.
 *
 * Contrato de erro: resposta não-`ok`, falha de rede ou corpo em formato
 * inesperado resultam em `throw new Error(MENSAGEM_ERRO)`, tratado pela tela.
 */
export async function buscarDesempenhoAreas(
  userId: string,
  token?: string | null,
): Promise<DesempenhoArea[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(
      `${URL_BASE_API}/dashboard/me/desempenho-areas?userId=${encodeURIComponent(userId)}`,
      { headers },
    );
  } catch {
    throw new Error(MENSAGEM_ERRO);
  }

  if (!response.ok) {
    throw new Error(MENSAGEM_ERRO);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(MENSAGEM_ERRO);
  }

  const areas = (data as RespostaDesempenhoAreas | undefined)?.areas;
  if (!Array.isArray(areas)) {
    throw new Error(MENSAGEM_ERRO);
  }

  return areas;
}