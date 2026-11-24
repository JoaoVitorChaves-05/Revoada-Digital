import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Guarda de rota para a área logada. Usada como elemento pai de um grupo de
 * rotas: quando há sessão, renderiza a rota filha (`<Outlet/>`); sem sessão,
 * redireciona para `/login`. Substitui os `if (!usuario) setScreen('login')`
 * espalhados pelo antigo App.tsx.
 */
export function RotaProtegida() {
  const { estaLogado } = useAuth();
  if (!estaLogado) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
