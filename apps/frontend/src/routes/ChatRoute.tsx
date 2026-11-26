import { useNavigate } from 'react-router-dom';
import { Chat } from '../pages/chat/Chat';
import { useAuth } from '../auth/useAuth';

/**
 * Rota do chat (/chat). A identidade do chat é o usuário autenticado: fica
 * dentro de RotaProtegida, então sempre há sessão aqui. Se, por segurança, não
 * houver usuário, não renderiza o chat (evita conectar o socket sem identidade).
 */
export function ChatRoute() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  if (!usuario) return null;

  return <Chat onBack={() => navigate('/comunidade')} currentUserId={usuario.id} />;
}
