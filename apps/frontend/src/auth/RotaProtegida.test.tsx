// Testes da guarda de rota RotaProtegida.
// Sem sessão, redireciona para /login; com sessão, renderiza a rota filha.
// O estado de sessão vem do AuthProvider, que lê o localStorage na init.
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { RotaProtegida } from './RotaProtegida';
import type { UsuarioLogado } from './authStore';

const STORAGE_KEY = 'usuarioLogado';

function seedUser() {
  const user: UsuarioLogado = {
    id: 'user-1',
    email: 'aluno@exemplo.com',
    full_name: 'Aluno Teste',
    profileType: 'STUDENT',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function renderComRota(entrada: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[entrada]}>
        <Routes>
          <Route path="/login" element={<div>Tela de login</div>} />
          <Route element={<RotaProtegida />}>
            <Route path="/protegida" element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('RotaProtegida', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('redireciona para /login quando não há sessão', () => {
    renderComRota('/protegida');
    expect(screen.getByText('Tela de login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).toBeNull();
  });

  it('renderiza a rota filha quando há sessão', () => {
    seedUser();
    renderComRota('/protegida');
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
    expect(screen.queryByText('Tela de login')).toBeNull();
  });
});
