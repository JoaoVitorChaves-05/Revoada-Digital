import { useNavigate } from 'react-router-dom';
import { HistoricoSimulados } from '../pages/simulado/HistoricoSimulados';

/** Rota do histórico de simulados (/simulado/historico): "voltar" ao dashboard. */
export function HistoricoSimuladosRoute() {
  const navigate = useNavigate();
  return <HistoricoSimulados onBack={() => navigate('/dashboard')} />;
}
