import { useNavigate } from 'react-router-dom';
import { HistoryPage } from '../pages/Simulado/historico_simulados.page';

/** Rota do histórico de simulados (/simulado/historico): "voltar" ao dashboard. */
export function HistoricoSimuladosRoute() {
  const navigate = useNavigate();
  return <HistoryPage onBack={() => navigate('/dashboard')} />;
}
