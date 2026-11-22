import { PostDetalhe } from '../pages/comunidade/PostDetalhe';

/**
 * Rota de detalhe de um post (/comunidade/:postId). A tela lê o :postId via
 * useParams e o usuário via AuthContext; não recebe props.
 */
export function PostDetalheRoute() {
  return <PostDetalhe />;
}
