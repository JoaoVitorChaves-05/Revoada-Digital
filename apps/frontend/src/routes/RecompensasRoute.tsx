import { useNavigate } from 'react-router-dom';
import { LojaRecompensas } from '../pages/recompensas/LojaRecompensas';

/** Rota da loja de recompensas (/recompensas). */
export function RecompensasRoute() {
  const navigate = useNavigate();
  return <LojaRecompensas onMeusResgates={() => navigate('/recompensas/meus-resgates')} />;
}
