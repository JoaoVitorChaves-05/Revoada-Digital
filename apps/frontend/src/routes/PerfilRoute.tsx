import { useNavigate } from 'react-router-dom';
import { PerfilScreen } from '../screens/PerfilScreen';
import { useAuth } from '../auth/useAuth';

/**
 * Rota do perfil (/perfil). O userId vem do AuthContext; "voltar" retorna à
 * tela anterior.
 */
export function PerfilRoute() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  return <PerfilScreen userId={usuario?.id ?? ''} onBack={() => navigate(-1)} />;
}
