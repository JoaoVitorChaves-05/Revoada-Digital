import type { ForumPost, ProfileType } from '../types/forum.types';

/**
 * Decide se o usuário logado pode excluir um post do fórum.
 *
 * Regra: é o autor (`post.authorId === userId`) OU é professor/admin
 * (`profileType === 'TEACHER'` ou `'ADMIN'`). Sem usuário logado retorna `false`.
 *
 * Função pura: o retorno depende somente dos três argumentos, nenhum argumento
 * é mutado e nenhuma chamada de rede é realizada.
 */
export function canDeletePost(
  post: Pick<ForumPost, 'authorId'>,
  userId: string | undefined,
  profileType: ProfileType | undefined,
): boolean {
  if (userId === undefined) return false;
  if (post.authorId === userId) return true;
  if (profileType === 'TEACHER') return true;
  if (profileType === 'ADMIN') return true;
  return false;
}
