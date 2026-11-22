import { useNavigate } from 'react-router-dom';
import { RedefinirScreen } from '../screens/RedefinirScreen';

/** Wrapper de rota da redefinição de senha: "voltar" leva ao login. */
export function RedefinirRoute() {
  const navigate = useNavigate();
  return <RedefinirScreen onBack={() => navigate('/login')} />;
}
