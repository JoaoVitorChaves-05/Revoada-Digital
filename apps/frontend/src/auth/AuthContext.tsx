import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Perfil de acesso do usuário (espelha o backend).
 */
export type ProfileType = 'STUDENT' | 'TEACHER' | 'ADMIN';

/**
 * Usuário autenticado persistido no localStorage pela camada de login.
 * Esta é a fonte canônica do tipo; `LoginScreen` reexporta por compatibilidade.
 */
export type UsuarioLogado = {
  id: string;
  email: string;
  full_name: string;
  profileType: ProfileType;
};

const STORAGE_KEY = 'usuarioLogado';

/**
 * Lê o usuário logado do localStorage. Nunca lança: retorna null se ausente,
 * inválido ou fora do browser. Mesma lógica defensiva de utils/sessao.ts.
 */
function lerUsuarioPersistido(): UsuarioLogado | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const dados = JSON.parse(raw) as UsuarioLogado;
    return dados && typeof dados.id === 'string' && dados.id ? dados : null;
  } catch {
    return null;
  }
}

export interface AuthContextValue {
  /** Usuário autenticado atual, ou null se deslogado. */
  usuario: UsuarioLogado | null;
  /** Conveniência: `usuario !== null`. */
  estaLogado: boolean;
  /** Registra o login: grava no localStorage e no estado. */
  login: (usuario: UsuarioLogado) => void;
  /** Encerra a sessão: limpa o localStorage e o estado. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializa a partir do localStorage para que a sessão sobreviva ao reload.
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => lerUsuarioPersistido());

  const login = useCallback((proximo: UsuarioLogado) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proximo));
    } catch {
      // Ignora falhas de storage (ex.: modo privado); mantém o estado em memória.
    }
    setUsuario(proximo);
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora falhas de storage.
    }
    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, estaLogado: usuario !== null, login, logout }),
    [usuario, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Acessa o contexto de autenticação. Lança se usado fora do AuthProvider,
 * para evitar estados de sessão silenciosamente incorretos.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>.');
  }
  return ctx;
}
