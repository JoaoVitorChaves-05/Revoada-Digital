import { useNavigate } from 'react-router-dom';
import { Redefinir } from '../pages/auth/Redefinir';

/** Wrapper de rota da redefinição de senha: "voltar" leva ao login. */
export function RedefinirRoute() {
  const navigate = useNavigate();
  return <Redefinir onBack={() => navigate('/login')} />;
}
