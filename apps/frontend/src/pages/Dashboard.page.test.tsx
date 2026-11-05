// Testes de exemplo da pagina Dashboard (R3.2-R3.5, R12.4).
// Cobrem a ramificacao dos quatro estados de UI (carregamento, erro com retry,
// vazio e sucesso) e a navegacao "Ver estatisticas". O unico ponto de I/O da
// pagina e o `fetch` global (via Cliente_Attempts), por isso ele e substituido
// com `vi.stubGlobal`. Estados assincronos sao aguardados com `findBy*`.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './Dashboard.page';
import type { Attempt, AttemptAnswer } from '../types/attempts.types';

const MENSAGEM_ERRO = 'Não foi possível carregar seu painel.';

/**
 * `Response`-like minima suficiente para o `Cliente_Attempts`, que so consome
 * `response.ok` e `response.json()`.
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

function criarAnswer(overrides: Partial<AttemptAnswer> = {}): AttemptAnswer {
  return {
    id: 'answer-1',
    attemptId: 'attempt-1',
    questionId: 'question-1',
    selectedAlternativeId: 'alt-1',
    isCorrect: true,
    answeredAt: new Date().toISOString(),
    ...overrides,
  };
}

function criarAttempt(overrides: Partial<Attempt> = {}): Attempt {
  const agoraIso = new Date().toISOString();
  return {
    id: 'attempt-1',
    mockExamId: 'mock-1',
    status: 'SUBMITTED',
    startedAt: agoraIso,
    submittedAt: agoraIso,
    score: 80,
    correctAnswers: 2,
    totalQuestions: 3,
    earnedPoints: 80,
    answers: [
      criarAnswer({ id: 'answer-1', isCorrect: true }),
      criarAnswer({ id: 'answer-2', isCorrect: true }),
      criarAnswer({ id: 'answer-3', isCorrect: false }),
    ],
    mockExam: {
      id: 'mock-1',
      name: 'Simulado 1',
      studentId: 'user-1',
      createdAt: agoraIso,
      updatedAt: agoraIso,
    },
    createdAt: agoraIso,
    updatedAt: agoraIso,
    ...overrides,
  };
}

/** `fetch` mock tipado como `typeof fetch`. */
function criarFetchMock(impl: () => Promise<Response>) {
  return vi.fn<typeof fetch>(impl);
}

describe('DashboardPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exibe o indicador de carregamento no estado inicial (R3.2)', () => {
    // fetch pendente: nunca resolve, para manter o estado de carregamento.
    const fetchMock = criarFetchMock(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);

    render(<DashboardPage onBack={vi.fn()} onVerEstatisticas={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando seu painel...');
  });

  it('exibe mensagem de erro e botão "Tentar novamente"; o retry recarrega com sucesso (R3.3)', async () => {
    // Primeira resposta nao-ok (erro); segunda resposta ok vazia (sucesso vazio).
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: false }),
    );
    fetchMock.mockImplementationOnce(async () => respostaFalsa({ ok: false }));
    fetchMock.mockImplementationOnce(async () =>
      respostaFalsa({ ok: true, json: async () => [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<DashboardPage onBack={vi.fn()} onVerEstatisticas={vi.fn()} />);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(`Erro: ${MENSAGEM_ERRO}`);

    const botaoRetry = screen.getByRole('button', { name: 'Tentar novamente' });
    fireEvent.click(botaoRetry);

    // Apos o retry bem-sucedido (lista vazia), o alerta some e surge o estado vazio.
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('region', { name: 'Comece seu primeiro simulado' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('exibe o estado vazio quando a resposta é ok com lista vazia (R3.4)', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<DashboardPage onBack={vi.fn()} onVerEstatisticas={vi.fn()} />);

    const estadoVazio = await screen.findByRole('region', {
      name: 'Comece seu primeiro simulado',
    });
    expect(estadoVazio).toBeInTheDocument();
    expect(estadoVazio).toHaveTextContent(/primeiro simulado/i);
    // As metricas reais aparecem zeradas (R3.4): o card "Questões resolvidas"
    // continua presente (como cabeçalho do card) mesmo sem tentativas.
    expect(
      screen.getByRole('heading', { name: 'Questões resolvidas' }),
    ).toBeInTheDocument();
  });

  it('renderiza as métricas e blocos no estado de sucesso (R3.5)', async () => {
    const attempts = [criarAttempt()];
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => attempts }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<DashboardPage onBack={vi.fn()} onVerEstatisticas={vi.fn()} />);

    // Metrica principal derivada dos answers (3 answers => "3").
    const tituloCard = await screen.findByRole('heading', {
      name: 'Questões resolvidas',
    });
    const card = tituloCard.closest('.card-metrica') as HTMLElement;
    expect(within(card).getByText('3')).toBeInTheDocument();

    // Sem estado vazio quando ha tentativas.
    expect(
      screen.queryByRole('region', { name: 'Comece seu primeiro simulado' }),
    ).not.toBeInTheDocument();

    // Blocos de apresentacao presentes.
    expect(
      screen.getByRole('region', { name: 'Seu desempenho por área' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Métricas de estudo' }),
    ).toBeInTheDocument();
  });

  it('aciona onVerEstatisticas ao clicar em "Ver estatísticas" (R12.4)', async () => {
    const fetchMock = criarFetchMock(async () =>
      respostaFalsa({ ok: true, json: async () => [criarAttempt()] }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const onVerEstatisticas = vi.fn();

    render(
      <DashboardPage onBack={vi.fn()} onVerEstatisticas={onVerEstatisticas} />,
    );

    const botao = await screen.findByRole('button', { name: 'Ver estatísticas' });
    fireEvent.click(botao);

    expect(onVerEstatisticas).toHaveBeenCalledTimes(1);
  });
});
