import { screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import PostDetalheScreen from './PostDetalheScreen';
import { renderComProviders, seedUsuario } from '../test/router';
import type { ForumPost, ProfileType } from '../types/forum.types';

// Mocka os hooks de fórum usados pela tela de detalhe e pelo DeletePostButton
// (que é renderizado dentro da tela). Isola a tela da camada de serviço/rede.
//  - useForumPost: fornece o post exibido.
//  - useCreateReply: usado pelo formulário de resposta (não exercitado aqui).
//  - useDeletePost: usado pelo DeletePostButton; deletePost(id): Promise<boolean>.
const deletePostMock = vi.fn<(id: string) => Promise<boolean>>();
const refetchMock = vi.fn();
const createReplyMock = vi.fn();
let deleteState: { loading: boolean; error: string | null };
let postState: ForumPost | null;

vi.mock('../hooks/useForum', () => ({
  useForumPost: () => ({
    post: postState,
    loading: false,
    error: null,
    refetch: refetchMock,
  }),
  useCreateReply: () => ({
    createReply: createReplyMock,
    loading: false,
    error: null,
  }),
  useDeletePost: () => ({
    deletePost: deletePostMock,
    loading: deleteState.loading,
    error: deleteState.error,
  }),
}));

// Fixture mínima válida de ForumPost.
function makePost(overrides: Partial<ForumPost> = {}): ForumPost {
  return {
    id: 'post-1',
    authorId: 'author-1',
    title: 'Título de teste',
    content: 'Conteúdo de teste',
    subject: 'MATH',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    author: {
      id: 'author-1',
      full_name: 'Autor Teste',
      profileType: 'STUDENT',
    },
    replies: [],
    ...overrides,
  };
}

const deleteControl = () => screen.queryByRole('button', { name: 'Excluir post' });
const confirmButton = () => screen.getByRole('button', { name: 'Excluir' });

describe('PostDetalheScreen - exclusão de post', () => {
  beforeEach(() => {
    deletePostMock.mockReset();
    refetchMock.mockReset();
    createReplyMock.mockReset();
    deleteState = { loading: false, error: null };
    postState = makePost();
    // HeaderApp usa useAuth/useNavigate; semeia sessão e render com providers.
    seedUsuario();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // Requirements: 2.4 — o botão de exclusão aparece quando o usuário é o autor.
  it('exibe o botão de exclusão quando o usuário logado é o autor', () => {
    postState = makePost({ authorId: 'author-1' });
    renderComProviders(
      <PostDetalheScreen
        postId="post-1"
        onBack={vi.fn()}
        userId="author-1"
        userProfileType="STUDENT"
      />,
    );
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 2.4 — professor vê o botão mesmo não sendo o autor.
  it('exibe o botão de exclusão para TEACHER que não é autor', () => {
    postState = makePost({ authorId: 'author-1' });
    renderComProviders(
      <PostDetalheScreen
        postId="post-1"
        onBack={vi.fn()}
        userId="prof-1"
        userProfileType="TEACHER"
      />,
    );
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 2.4 — admin vê o botão mesmo não sendo o autor.
  it('exibe o botão de exclusão para ADMIN que não é autor', () => {
    postState = makePost({ authorId: 'author-1' });
    renderComProviders(
      <PostDetalheScreen
        postId="post-1"
        onBack={vi.fn()}
        userId="admin-1"
        userProfileType="ADMIN"
      />,
    );
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 2.4 — STUDENT que não é autor não vê o botão.
  it('não exibe o botão para STUDENT que não é o autor', () => {
    postState = makePost({ authorId: 'author-1' });
    renderComProviders(
      <PostDetalheScreen
        postId="post-1"
        onBack={vi.fn()}
        userId="outro-usuario"
        userProfileType="STUDENT"
      />,
    );
    expect(deleteControl()).toBeNull();
  });

  // Requirements: 2.4 — sem usuário logado (userId indefinido) o botão não aparece.
  it('não exibe o botão quando não há usuário logado', () => {
    postState = makePost({ authorId: 'author-1' });
    renderComProviders(<PostDetalheScreen postId="post-1" onBack={vi.fn()} />);
    expect(deleteControl()).toBeNull();
  });

  // Requirements: 6.5 — confirmar a exclusão com sucesso chama onBack exatamente uma vez.
  it('confirma a exclusão e chama onBack exatamente uma vez', async () => {
    deletePostMock.mockResolvedValue(true);
    const onBack = vi.fn();
    postState = makePost({ id: 'post-42', authorId: 'author-1' });
    renderComProviders(
      <PostDetalheScreen
        postId="post-42"
        onBack={onBack}
        userId="author-1"
      />,
    );

    fireEvent.click(deleteControl()!);
    expect(deletePostMock).not.toHaveBeenCalled();

    fireEvent.click(confirmButton());

    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
    expect(deletePostMock).toHaveBeenCalledTimes(1);
    expect(deletePostMock).toHaveBeenCalledWith('post-42');
  });

  // Property 8: Pós-sucesso correto (detalhe)
  // Em qualquer exclusão bem-sucedida feita por um usuário permitido, o callback
  // de pós-sucesso da tela de detalhe (onBack) dispara exatamente uma vez.
  // **Validates: Requirements 6.5**
  it('Property 8 (Pós-sucesso correto, detalhe): onBack dispara exatamente uma vez em sucesso', async () => {
    const permittedUser = fc.oneof(
      fc.record({
        userId: fc.constant('author-1'),
        userProfileType: fc.constantFrom<ProfileType>('STUDENT', 'TEACHER', 'ADMIN'),
      }),
      fc.record({
        userId: fc.constantFrom('author-1', 'prof-1'),
        userProfileType: fc.constantFrom<ProfileType>('TEACHER', 'ADMIN'),
      }),
    );

    await fc.assert(
      fc.asyncProperty(permittedUser, async ({ userId, userProfileType }) => {
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        refetchMock.mockReset();
        deleteState = { loading: false, error: null };
        postState = makePost({ authorId: 'author-1' });

        const onBack = vi.fn();
        const { unmount, getByRole } = renderComProviders(
          <PostDetalheScreen
            postId="post-1"
            onBack={onBack}
            userId={userId}
            userProfileType={userProfileType}
          />,
        );

        fireEvent.click(getByRole('button', { name: 'Excluir post' }));
        fireEvent.click(getByRole('button', { name: 'Excluir' }));

        await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
        unmount();
      }),
      { numRuns: 25 },
    );
  });
});
