import { useNavigate } from 'react-router-dom';
import { CadastroScreen } from '../screens/CadastroScreen';

/** Wrapper de rota do cadastro: liga o "voltar" à navegação por URL. */
export function CadastroRoute() {
  const navigate = useNavigate();
  return <CadastroScreen onBack={() => navigate('/')} />;
}
