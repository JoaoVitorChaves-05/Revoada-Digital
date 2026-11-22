import { useNavigate, useParams } from 'react-router-dom';
import { FazerSimulado } from '../pages/Simulado/FazerSimulado';

/**
 * Rota de execução de um simulado (/simulado/fazer/:attemptId). Lê o attemptId
 * da URL; ao finalizar, navega para a tela de resultado.
 */
export function FazerSimuladoRoute() {
  const navigate = useNavigate();
  const { attemptId = '' } = useParams<{ attemptId: string }>();
  return (
    <FazerSimulado
      attemptId={attemptId}
      onFinalizar={(id) => navigate(`/simulado/resultado/${id}`)}
    />
  );
}
