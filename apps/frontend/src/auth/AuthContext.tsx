import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AuthContext,
  STORAGE_KEY,
  type AuthContextValue,
  type UsuarioLogado,
} from './authStore';

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
