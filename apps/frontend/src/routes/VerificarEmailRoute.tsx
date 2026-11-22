import { useNavigate, useSearchParams } from 'react-router-dom';
import { VerificarEmailScreen } from '../screens/VerificarEmailScreen';

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
    <VerificarEmailScreen
      token={token}
      onIrParaLogin={() => navigate('/login')}
    />
  );
}
