import { afterEach, describe, expect, it, vi } from 'vitest';
import { buscarAttempts } from './attemptsClient';
import type { Attempt } from '../types/attempts.types';

const MENSAGEM_ERRO = 'Não foi possível carregar seu painel.';

/**
 * Monta uma `Response`-like minima suficiente para o `Cliente_Attempts`:
 * ele so consome `response.ok` e `response.json()`.
 */
function respostaFalsa(options: {
  ok: boolean;
  json?: () => Promise<unknown>;
}): Response {
  return {
    ok: options.ok,
    json: options.json ?? (async () => []),
  } as unknown as Response;
}

/**
 * Cria um mock de `fetch` com a assinatura de `typeof fetch`, garantindo que
 * `mock.calls[0]` seja tipado como `[input, init?]` (e nao uma tupla vazia).
 */
function criarFetchMock(impl: () => Promise<Response>) {
  return vi.fn<typeof fetch>(impl);
}

function criarAttempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-1',
    mockExamId: 'mock-1',
    status: 'SUBMITTED',
    startedAt: '2024-01-01T10:00:00.000Z',
    submittedAt: '2024-01-01T10:30:00.000Z',
    score: 80,
    correctAnswers: 8,
    totalQuestions: 10,
    earnedPoints: 80,
    answers: [],
    mockExam: {
      id: 'mock-1',
      name: 'Simulado 1',
      studentId: 'user-1',
      createdAt: '2024-01-01T09:00:00.000Z',
      updatedAt: '2024-01-01T09:00:00.000Z',
    },
    createdAt: '2024-01-01T09:00:00.000Z',
    updatedAt: '2024-01-01T10:30:00.000Z',
    ...overrides,
  };
}

describe('buscarAttempts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retorna o array tipado quando a resposta é ok com um array', async () => {
    const attempts: Attempt[] = [
      criarAttempt({ id: 'attempt-1' }),
      criarAttempt({ id: 'attempt-2' }),
    ];
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => attempts }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await buscarAttempts('user-1');

    expect(resultado).toEqual(attempts);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requisita GET /attempts?userId=<id> na URL base esperada sem header Authorization quando não há token', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await buscarAttempts('user 42');

    const [url, init] = fetchMock.mock.calls[0];
    // userId é codificado para a query string.
    expect(url).toBe('http://localhost:3000/attempts?userId=user%2042');
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.Authorization).toBeUndefined();
  });

  it('envia o header Authorization: Bearer <token> quando o token é passado', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await buscarAttempts('user-1', 'token-abc');

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-abc');
  });

  it('lança a mensagem legível quando a resposta não é ok', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({
        ok: false,
        json: async () => {
          throw new Error('não deve ser chamado');
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarAttempts('user-1')).rejects.toThrow(MENSAGEM_ERRO);
  });

  it('lança a mesma mensagem quando o corpo não é um array', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({
        ok: true,
        json: async () => ({ erro: 'formato inesperado' }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarAttempts('user-1')).rejects.toThrow(MENSAGEM_ERRO);
  });

  it('lança a mesma mensagem quando o fetch rejeita (falha de rede)', async () => {
    const fetchMock = criarFetchMock(async () => {
      throw new TypeError('Failed to fetch');
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarAttempts('user-1')).rejects.toThrow(MENSAGEM_ERRO);
  });
});
