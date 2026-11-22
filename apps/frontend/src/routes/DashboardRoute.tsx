import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '../pages/Dashboard.page';
import { useAuth } from '../auth/useAuth';

/**
 * Wrapper de rota do Dashboard ("Início").
 *
 * Nesta fase (Task 4) ainda alimenta as props de navegação da DashboardPage
 * via useNavigate; a Task 6 remove essas props da própria página, quando o
 * HeaderApp passar a navegar sozinho. `userName` vem do AuthContext.
 */
export function DashboardRoute() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  return (
    <DashboardPage
      onBack={() => navigate('/comunidade')}
      onVerEstatisticas={() => navigate('/desempenho')}
      userName={usuario?.full_name}
      onSimulados={() => navigate('/simulado/gerar')}
      onComunidade={() => navigate('/comunidade')}
      onChat={() => navigate('/chat')}
      onDisciplinas={() => navigate('/disciplinas')}
      onRecompensas={() => navigate('/recompensas')}
      onMeusResgates={() => navigate('/recompensas/meus-resgates')}
      onPerfil={() => navigate('/perfil')}
      onConfiguracoes={() => navigate('/configuracoes')}
      onLogout={() => {}}
      onNavigate={(destino) => {
        const rotas: Record<string, string> = {
          inicio: '/dashboard',
          disciplinas: '/disciplinas',
          simulados: '/simulado/gerar',
          comunidade: '/comunidade',
          chat: '/chat',
          recompensas: '/recompensas',
        };
        const proxima = rotas[destino];
        if (proxima) navigate(proxima);
      }}
    />
  );
}
