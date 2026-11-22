import { useNavigate } from 'react-router-dom';
import { Configuracoes } from '../pages/conta/Configuracoes';

/** Wrapper de rota das configurações: "voltar" volta à tela anterior. */
export function ConfiguracoesRoute() {
  const navigate = useNavigate();
  return <Configuracoes onBack={() => navigate(-1)} />;
}
