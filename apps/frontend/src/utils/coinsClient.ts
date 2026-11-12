import { API_BASE_URL } from './apiBase';

const URL_BASE_API = API_BASE_URL;

const MENSAGEM_ERRO = 'Não foi possível carregar seu saldo de pontos.';

/**
 * Cliente do saldo de coins (Learn-to-Earn).
 *
 * Requisita `GET /dashboard/me/coins?userId=<id>` e devolve o saldo numerico.
 * Aceita um `token` opcional (enviado como `Authorization: Bearer`) para a
 * futura fase com JWT, espelhando o contrato dos demais clientes do Dashboard.
 *
 * Em caso de resposta nao-`ok`, falha de rede ou corpo invalido, lanca
 * `Error(MENSAGEM_ERRO)` para a UI decidir o fallback.
 */
export async function buscarSaldoCoins(
  userId: string,
  token?: string | null,
): Promise<number> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(
      `${URL_BASE_API}/dashboard/me/coins?userId=${encodeURIComponent(userId)}`,
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

  const coins = (data as { coins?: unknown } | null)?.coins;
  if (typeof coins !== 'number' || !Number.isFinite(coins)) {
    throw new Error(MENSAGEM_ERRO);
  }

  return coins;
}