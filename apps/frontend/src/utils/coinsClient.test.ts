import { buscarSaldoCoins } from './coinsClient';

const MENSAGEM_ERRO = 'Não foi possível carregar seu saldo de pontos.';

function respostaFalsa(options: {
  ok: boolean;
  json?: () => Promise<unknown>;
}): Response {
  return {
    ok: options.ok,
    json: options.json ?? (async () => ({})),
  } as unknown as Response;
}

function criarFetchMock(impl: () => Promise<Response>) {
  return vi.fn<typeof fetch>(impl);
}

describe('buscarSaldoCoins', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('retorna o saldo numerico quando a resposta e ok', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => ({ coins: 220 }) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarSaldoCoins('user-1')).resolves.toBe(220);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requisita GET /dashboard/me/coins?userId= na URL esperada', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => ({ coins: 0 }) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await buscarSaldoCoins('user 42');

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      'http://localhost:3000/dashboard/me/coins?userId=user%2042',
    );
  });

  it('envia Authorization: Bearer quando ha token', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => ({ coins: 10 }) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await buscarSaldoCoins('user-1', 'token-abc');

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-abc');
  });

  it('lanca erro quando a resposta nao e ok', async () => {
    const fetchMock = criarFetchMock(async () => respostaFalsa({ ok: false }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarSaldoCoins('user-1')).rejects.toThrow(MENSAGEM_ERRO);
  });

  it('lanca erro quando o corpo nao tem coins numerico', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => ({ coins: 'x' }) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(buscarSaldoCoins('user-1')).rejects.toThrow(MENSAGEM_ERRO);
  });
});