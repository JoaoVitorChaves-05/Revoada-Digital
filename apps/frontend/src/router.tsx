import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomeRoute } from './routes/HomeRoute';

/**
 * Roteador da aplicação (react-router v7, data router).
 *
 * Substitui a navegação por `useState<Screen>` que existia em App.tsx.
 * As rotas são adicionadas incrementalmente durante a migração; rotas
 * desconhecidas caem na landing pública.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeRoute />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
