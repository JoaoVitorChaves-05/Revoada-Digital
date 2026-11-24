import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './authStore';

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
