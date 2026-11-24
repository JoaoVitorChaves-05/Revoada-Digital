import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../pages/dashboard/Dashboard';

/**
 * Wrapper de rota do Dashboard ("Início"). O cabeçalho e o menu de conta
 * navegam sozinhos (HeaderApp/UserMenu); aqui só ligamos as ações internas da
 * página (ver estatísticas, ver disciplinas) à navegação por URL.
 */
export function DashboardRoute() {
  const navigate = useNavigate();
  return (
    <Dashboard
      onVerEstatisticas={() => navigate('/desempenho')}
      onVerDisciplinas={() => navigate('/disciplinas')}
    />
  );
}
