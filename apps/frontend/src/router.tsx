import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomeRoute } from './routes/HomeRoute';
import { LoginRoute } from './routes/LoginRoute';
import { CadastroRoute } from './routes/CadastroRoute';
import { RedefinirRoute } from './routes/RedefinirRoute';
import { VerificarEmailRoute } from './routes/VerificarEmailRoute';
import { DashboardRoute } from './routes/DashboardRoute';
import { PainelDesempenhoRoute } from './routes/PainelDesempenhoRoute';
import { DisciplinasRoute } from './routes/DisciplinasRoute';
import { ConfiguracoesRoute } from './routes/ConfiguracoesRoute';
import { ComunidadeRoute } from './routes/ComunidadeRoute';
import { PostDetalheRoute } from './routes/PostDetalheRoute';
import { RotaProtegida } from './auth/RotaProtegida';

/**
 * Roteador da aplicação (react-router v7, data router).
 *
 * Substitui a navegação por `useState<Screen>` que existia em App.tsx.
 * As rotas são adicionadas incrementalmente durante a migração; rotas
 * desconhecidas caem na landing pública.
 */
export const router = createBrowserRouter([
  // Rotas públicas
  { path: '/', element: <HomeRoute /> },
  { path: '/login', element: <LoginRoute /> },
  { path: '/cadastro', element: <CadastroRoute /> },
  { path: '/redefinir', element: <RedefinirRoute /> },
  { path: '/verificar-email', element: <VerificarEmailRoute /> },

  // Rotas protegidas (exigem sessão; sem ela, redireciona para /login)
  {
    element: <RotaProtegida />,
    children: [
      { path: '/dashboard', element: <DashboardRoute /> },
      { path: '/desempenho', element: <PainelDesempenhoRoute /> },
      { path: '/disciplinas', element: <DisciplinasRoute /> },
      { path: '/configuracoes', element: <ConfiguracoesRoute /> },
      { path: '/comunidade', element: <ComunidadeRoute /> },
      { path: '/comunidade/:postId', element: <PostDetalheRoute /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
