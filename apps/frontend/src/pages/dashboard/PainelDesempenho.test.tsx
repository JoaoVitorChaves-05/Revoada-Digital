import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PainelDesempenho } from './PainelDesempenho';

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

describe('PainelDesempenho', () => {
  it('busca o aluno da sessão e mostra as barras e os conteúdos recebidos', async () => {
    localStorage.setItem('usuarioLogado', JSON.stringify({ id: 'user 1' }));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ materias: [
      { materia: 'Matemática', totalQuestoes: 4, acertos: 3, percentualAcerto: 75,
        mapaDefasagem: [{ nome: 'Álgebra', percentualAcerto: 75, nivel: 'baixa' }] },
    ] }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<PainelDesempenho onBack={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '75');
    expect(screen.queryByText(/Dados ilustrativos/)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('?userId=user%201'), expect.any(Object));
  });

  it('permite tentar novamente após erro e apresenta ausência de histórico', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ materias: [] }) }));
    const onBack = vi.fn();
    render(<PainelDesempenho onBack={onBack} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar seu desempenho.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText(/Finalize um simulado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para a tela anterior' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it.each(['rede', 'json', 'formato'])('trata falha de %s', async (falha) => {
    const fetchMock = vi.fn();
    if (falha === 'rede') fetchMock.mockRejectedValue(new Error('erro de rede'));
    else fetchMock.mockResolvedValue({ ok: true, json: falha === 'json'
      ? async () => { throw new Error('json inválido'); }
      : async () => ({ areas: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<PainelDesempenho onBack={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar seu desempenho.');
  });

  it('cancela a consulta ao sair da tela', () => {
    const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<PainelDesempenho onBack={vi.fn()} />);
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
  });
});