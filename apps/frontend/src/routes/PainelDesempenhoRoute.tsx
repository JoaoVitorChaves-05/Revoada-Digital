import { useNavigate } from 'react-router-dom';
import { PainelDesempenho } from '../pages/dashboard/PainelDesempenho';

/** Wrapper de rota do painel de desempenho: "voltar" retorna ao dashboard. */
export function PainelDesempenhoRoute() {
  const navigate = useNavigate();
  return <PainelDesempenho onBack={() => navigate('/dashboard')} />;
}
