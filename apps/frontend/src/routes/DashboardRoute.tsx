import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '../pages/Dashboard.page';

/**
 * Wrapper de rota do Dashboard ("Início"). O cabeçalho e o menu de conta
 * navegam sozinhos (HeaderApp/UserMenu); aqui só ligamos as ações internas da
 * página (ver estatísticas, ver disciplinas) à navegação por URL.
 */
export function DashboardRoute() {
  const navigate = useNavigate();
  return (
    <DashboardPage
      onVerEstatisticas={() => navigate('/desempenho')}
      onVerDisciplinas={() => navigate('/disciplinas')}
    />
  );
}
