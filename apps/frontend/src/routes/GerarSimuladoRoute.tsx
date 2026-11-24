import { useNavigate } from 'react-router-dom';
import { GerarSimulado } from '../pages/simulado/GerarSimulado';
import { useAuth } from '../auth/useAuth';

/**
 * Rota de geração de simulado (/simulado/gerar). O userId vem do AuthContext;
 * ao iniciar, navega para a tela de execução com o attemptId na URL.
 */
export function GerarSimuladoRoute() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  return (
    <GerarSimulado
      userId={usuario?.id ?? ''}
      onBack={() => navigate('/dashboard')}
      onIniciar={(attemptId) => navigate(`/simulado/fazer/${attemptId}`)}
    />
  );
}
