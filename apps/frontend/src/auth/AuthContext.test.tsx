// Testes do AuthContext: fonte única da sessão sobre o localStorage.
// Cobrem o estado inicial lido do storage e as transições login/logout,
// confirmando que estado e localStorage ficam consistentes.
import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import {
  STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  type UsuarioLogado,
} from './authStore';

function makeUser(overrides: Partial<UsuarioLogado> = {}): UsuarioLogado {
  return {
    id: 'user-1',
    email: 'aluno@exemplo.com',
    full_name: 'Aluno Teste',
    profileType: 'STUDENT',
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('inicia deslogado quando o localStorage está vazio', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.usuario).toBeNull();
    expect(result.current.estaLogado).toBe(false);
  });

  it('inicia logado lendo o usuário persistido no localStorage', () => {
    const user = makeUser({ id: 'persistido-1', full_name: 'Maria' });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token-persistido');

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.estaLogado).toBe(true);
    expect(result.current.usuario?.id).toBe('persistido-1');
    expect(result.current.usuario?.full_name).toBe('Maria');
    expect(result.current.token).toBe('token-persistido');
  });

  it('ignora um valor inválido no localStorage e inicia deslogado', () => {
    localStorage.setItem(STORAGE_KEY, '{ json quebrado');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.usuario).toBeNull();
  });

  it('login atualiza o estado e grava no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const user = makeUser({ id: 'novo-1' });

    act(() => result.current.login(user, 'token-novo'));

    expect(result.current.usuario?.id).toBe('novo-1');
    expect(result.current.token).toBe('token-novo');
    expect(result.current.estaLogado).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).id).toBe('novo-1');
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('token-novo');
  });

  it('logout limpa o estado e remove usuário e token do localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeUser()));
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token-persistido');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.estaLogado).toBe(true);

    act(() => result.current.logout());

    expect(result.current.usuario).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.estaLogado).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('expõe o usuário a um componente consumidor via useAuth', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeUser({ full_name: 'João Silva' })));

    function Consumidor() {
      const { usuario } = useAuth();
      return <span>Olá, {usuario?.full_name ?? 'visitante'}</span>;
    }

    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>,
    );

    expect(screen.getByText('Olá, João Silva')).toBeInTheDocument();
  });

  it('useAuth lança quando usado fora do AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
