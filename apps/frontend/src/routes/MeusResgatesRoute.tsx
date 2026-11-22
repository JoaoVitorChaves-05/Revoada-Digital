import { useNavigate } from 'react-router-dom';
import { MeusResgates } from '../pages/Recompensas/MeusResgates';

/** Rota de "meus resgates" (/recompensas/meus-resgates): "voltar" leva à loja. */
export function MeusResgatesRoute() {
  const navigate = useNavigate();
  return <MeusResgates onVoltar={() => navigate('/recompensas')} />;
}
