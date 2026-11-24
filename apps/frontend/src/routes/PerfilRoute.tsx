import { useNavigate } from 'react-router-dom';
import { Perfil } from '../pages/conta/Perfil';
import { useAuth } from '../auth/useAuth';

/**
 * Rota do perfil (/perfil). O userId vem do AuthContext; "voltar" retorna à
 * tela anterior.
 */
export function PerfilRoute() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  return <Perfil userId={usuario?.id ?? ''} onBack={() => navigate(-1)} />;
}
