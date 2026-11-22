import { useNavigate, useSearchParams } from 'react-router-dom';
import { VerificarEmail } from '../pages/auth/VerificarEmail';

/**
 * Wrapper de rota da verificação de email. Lê o token da query (?token=) e
 * leva ao login após a confirmação. Substitui o telaInicial()/tokenDaUrl() e o
 * history.replaceState manual que existiam em App.tsx.
 */
export function VerificarEmailRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  return (
    <VerificarEmail
      token={token}
      onIrParaLogin={() => navigate('/login')}
    />
  );
}
