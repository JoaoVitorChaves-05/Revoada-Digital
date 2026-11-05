import type { Attempt } from '../types/attempts.types';
import { API_BASE_URL } from './apiBase';

const URL_BASE_API = API_BASE_URL;

const MENSAGEM_ERRO = 'Não foi possível carregar seu painel.';

/**
 * Único ponto de `fetch` da feature Dashboard_Aluno.
 *
 * Requisita `GET /attempts?userId=<id>` contra `URL_BASE_API` e devolve a lista
 * de tentativas tipada (R3.1, R3.6). Opcionalmente recebe um `token` (ponto de
 * extensão da Fase 2) que, quando presente, é enviado no header `Authorization`.
 *
 * Contrato de erro (R3.3, R3.6): resposta não-`ok`, falha de rede ou corpo que
 * não seja um array resultam em `throw new Error('Não foi possível carregar seu painel.')`,
 * capturado pela página para o Estado_Erro.
 */
export async function buscarAttempts(
  userId: string,
  token?: string | null,
): Promise<Attempt[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(
      `${URL_BASE_API}/attempts?userId=${encodeURIComponent(userId)}`,
      { headers },
    );
  } catch {
    // Falha de rede.
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

  if (!Array.isArray(data)) {
    throw new Error(MENSAGEM_ERRO);
  }

  return data as Attempt[];
}
