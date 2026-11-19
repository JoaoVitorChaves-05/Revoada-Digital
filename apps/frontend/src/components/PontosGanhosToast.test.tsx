import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PontosGanhosToast } from './PontosGanhosToast';

// Por padrao, simula usuario SEM preferencia por menos movimento.
function mockMatchMedia(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }));
}

describe('PontosGanhosToast', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('nao renderiza quando pontos <= 0', () => {
    const { container } = render(<PontosGanhosToast pontos={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('anuncia o ganho com role=status e aria-live', () => {
    render(<PontosGanhosToast pontos={50} />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveTextContent(/pontos/i);
  });

  it('mostra o valor final imediatamente quando prefere menos movimento', () => {
    mockMatchMedia(true);
    render(<PontosGanhosToast pontos={120} />);
    expect(screen.getByRole('status')).toHaveTextContent('+120');
  });
});