import { useNavigate, useParams } from 'react-router-dom';
import { ResultPage } from '../pages/Simulado/result_simulado.page';

/**
 * Rota do resultado de um simulado (/simulado/resultado/:attemptId). Lê o
 * attemptId da URL e oferece os atalhos de voltar e ver histórico, que antes
 * viviam inline no App.tsx. A rota é protegida (sempre logado).
 */
export function ResultadoSimuladoRoute() {
  const navigate = useNavigate();
  const { attemptId = '' } = useParams<{ attemptId: string }>();
  return (
    <div>
      <button onClick={() => navigate('/comunidade')} style={{ margin: '10px' }}>
        Voltar
      </button>
      <button onClick={() => navigate('/simulado/historico')} style={{ margin: '10px' }}>
        Ver histórico de simulados
      </button>
      <ResultPage attemptId={attemptId} />
    </div>
  );
}
