import { createContext } from 'react';

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

export interface AuthContextValue {
  /** Usuário autenticado atual, ou null se deslogado. */
  usuario: UsuarioLogado | null;
  /** Token JWT atual, ou null se deslogado. */
  token: string | null;
  /** Conveniência: `usuario !== null`. */
  estaLogado: boolean;
  /** Registra usuário e token no localStorage e no estado. */
  login: (usuario: UsuarioLogado, token: string) => void;
  /** Encerra a sessão: limpa usuário, token, localStorage e estado. */
  logout: () => void;
}

/** Chave do usuário persistido, compartilhada com utils/sessao.ts. */
export const STORAGE_KEY = 'usuarioLogado';
/** Chave única do JWT, também usada pelo interceptor da API. */
export const TOKEN_STORAGE_KEY = 'authToken';

export const AuthContext = createContext<AuthContextValue | null>(null);
