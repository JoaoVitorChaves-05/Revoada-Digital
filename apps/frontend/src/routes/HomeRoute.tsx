import { useNavigate } from 'react-router-dom';
import { HomeScreen } from '../screens/HomeScreen';

/**
 * Wrapper de rota da landing pública.
 * Liga os callbacks da HomeScreen à navegação por URL (react-router).
 */
export function HomeRoute() {
  const navigate = useNavigate();
  return (
    <HomeScreen
      onCadastro={() => navigate('/cadastro')}
      onLogin={() => navigate('/login')}
    />
  );
}
