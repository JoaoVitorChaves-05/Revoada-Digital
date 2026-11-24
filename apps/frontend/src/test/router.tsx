import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import type { UsuarioLogado } from '../auth/authStore';

const STORAGE_KEY = 'usuarioLogado';

/**
 * Usuário de teste padrão. Use `seedUsuario()` antes de renderizar quando a
 * tela/HeaderApp precisar de uma sessão ativa (useAuth).
 */
export function usuarioDeTeste(overrides: Partial<UsuarioLogado> = {}): UsuarioLogado {
  return {
    id: 'user-test',
    email: 'teste@exemplo.com',
    full_name: 'Aluno Teste',
    profileType: 'STUDENT',
    ...overrides,
  };
}

/** Grava um usuário no localStorage para que o AuthProvider inicie logado. */
export function seedUsuario(overrides: Partial<UsuarioLogado> = {}): UsuarioLogado {
  const user = usuarioDeTeste(overrides);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Renderiza uma UI dentro de MemoryRouter + AuthProvider, o contexto mínimo que
 * componentes que usam useNavigate/useLocation/useAuth (ex.: HeaderApp) exigem.
 */
export function renderComProviders(
  ui: ReactElement,
  options: { rota?: string } = {},
) {
  const { rota = '/' } = options;
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider>
        <MemoryRouter initialEntries={[rota]}>{children}</MemoryRouter>
      </AuthProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}
