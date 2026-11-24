import { useNavigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { useAuth } from '../auth/useAuth';

/**
 * Wrapper de rota do login. Liga os callbacks da LoginScreen à navegação por
 * URL e registra a sessão via AuthContext (fonte única). A gravação no
 * localStorage é responsabilidade do `auth.login`, não mais da tela.
 */
export function LoginRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();
  return (
    <Login
      onBack={() => navigate('/')}
      onForgot={() => navigate('/redefinir')}
      onLoginSuccess={(user) => {
        login(user);
        navigate('/dashboard');
      }}
    />
  );
}
