import { useNavigate } from 'react-router-dom';
import { ConfiguracoesScreen } from '../screens/ConfiguracoesScreen';

/** Wrapper de rota das configurações: "voltar" volta à tela anterior. */
export function ConfiguracoesRoute() {
  const navigate = useNavigate();
  return <ConfiguracoesScreen onBack={() => navigate(-1)} />;
}
