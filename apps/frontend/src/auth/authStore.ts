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
  /** Conveniência: `usuario !== null`. */
  estaLogado: boolean;
  /** Registra o login: grava no localStorage e no estado. */
  login: (usuario: UsuarioLogado) => void;
  /** Encerra a sessão: limpa o localStorage e o estado. */
  logout: () => void;
}

/** Chave única da sessão no localStorage, compartilhada com utils/sessao.ts. */
export const STORAGE_KEY = 'usuarioLogado';

export const AuthContext = createContext<AuthContextValue | null>(null);
