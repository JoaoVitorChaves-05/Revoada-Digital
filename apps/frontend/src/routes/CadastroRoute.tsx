import { useNavigate } from 'react-router-dom';
import { Cadastro } from '../pages/auth/Cadastro';

/** Wrapper de rota do cadastro: liga o "voltar" à navegação por URL. */
export function CadastroRoute() {
  const navigate = useNavigate();
  return <Cadastro onBack={() => navigate('/')} />;
}
