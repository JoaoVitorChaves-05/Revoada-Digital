import { useNavigate } from 'react-router-dom';
import { Home } from '../pages/home/Home';

/**
 * Wrapper de rota da landing pública.
 * Liga os callbacks da HomeScreen à navegação por URL (react-router).
 */
export function HomeRoute() {
  const navigate = useNavigate();
  return (
    <Home
      onCadastro={() => navigate('/cadastro')}
      onLogin={() => navigate('/login')}
    />
  );
}
