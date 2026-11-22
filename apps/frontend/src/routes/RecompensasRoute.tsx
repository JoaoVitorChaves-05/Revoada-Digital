import { useNavigate } from 'react-router-dom';
import { LojaRecompensas } from '../pages/Recompensas/LojaRecompensas';

/** Rota da loja de recompensas (/recompensas). */
export function RecompensasRoute() {
  const navigate = useNavigate();
  return <LojaRecompensas onMeusResgates={() => navigate('/recompensas/meus-resgates')} />;
}
