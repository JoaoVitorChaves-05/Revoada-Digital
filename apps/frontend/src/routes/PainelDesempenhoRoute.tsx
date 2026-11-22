import { useNavigate } from 'react-router-dom';
import { PainelDesempenhoPage } from '../pages/PainelDesempenho.page';

/** Wrapper de rota do painel de desempenho: "voltar" retorna ao dashboard. */
export function PainelDesempenhoRoute() {
  const navigate = useNavigate();
  return <PainelDesempenhoPage onBack={() => navigate('/dashboard')} />;
}
