import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import ComunidadePostScreen from './comunidadepostscreen';
import type { ForumPost, ProfileType } from '../types/forum.types';

// --- Mocks dos hooks de fórum ---------------------------------------------
// A tela usa `useForumPosts()` para obter `{ posts, loading, error, refetch }`
// e a exclusão passa por `useDeletePost()` (`deletePost(id): Promise<boolean>`).
// Mockamos ambos para isolar a tela da camada de serviço/rede.

// `posts` servidos pelo mock de useForumPosts. `refetch` simula o recarregamento
// pós-exclusão removendo da lista os posts já excluídos e forçando novo render.
let currentPosts: ForumPost[] = [];
const refetchMock = vi.fn(() => {
  currentPosts = currentPosts.filter((p) => !deletedIds.has(p.id));
});
const deletedIds = new Set<string>();

// Mock de useDeletePost: registra o id excluído e resolve sucesso/falha.
const deletePostMock = vi.fn<(id: string) => Promise<boolean>>();
let deleteHookState: { loading: boolean; error: string | null };

vi.mock('../hooks/useForum', () => ({
  useForumPosts: () => ({
    posts: currentPosts,
    loading: false,
    error: null,
    refetch: refetchMock,
  }),
  useDeletePost: () => ({
    deletePost: deletePostMock,
    loading: deleteHookState.loading,
    error: deleteHookState.error,
  }),
}));

// CreatePostModal é irrelevante para estes testes; renderiza nada.
vi.mock('./CreatePostModal', () => ({
  CreatePostModal: () => null,
}));

// Fixture mínima válida de ForumPost.
function makePost(overrides: Partial<ForumPost> = {}): ForumPost {
  const id = overrides.id ?? 'post-1';
  return {
    id,
    authorId: 'author-1',
    title: `Título ${id}`,
    content: `Conteúdo ${id}`,
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

// Localiza o <article> (card) que contém um dado título.
function cardForTitle(title: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: title });
  const card = heading.closest('article');
  if (!card) throw new Error(`Card não encontrado para o título: ${title}`);
  return card as HTMLElement;
}

const deleteControls = () => screen.queryAllByRole('button', { name: 'Excluir post' });
const confirmButton = () => screen.getByRole('button', { name: 'Excluir' });

describe('ComunidadePostScreen — exclusão na lista', () => {
  beforeEach(() => {
    refetchMock.mockClear();
    deletePostMock.mockReset();
    deletedIds.clear();
    deleteHookState = { loading: false, error: null };
    currentPosts = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Requirements: 2.3, 6.2 — o botão aparece só nos posts permitidos.
  it('renderiza o botão de exclusão apenas nos posts permitidos', () => {
    currentPosts = [
      makePost({ id: 'meu-post', authorId: 'author-1' }),
      makePost({ id: 'post-alheio', authorId: 'outro-autor' }),
    ];

    render(
      <ComunidadePostScreen userId="author-1" userProfileType="STUDENT" />,
    );

    // STUDENT autor vê o botão apenas no próprio post; no post alheio, nenhum.
    const meuCard = cardForTitle('Título meu-post');
    const alheioCard = cardForTitle('Título post-alheio');
    expect(
      within(meuCard).getByRole('button', { name: 'Excluir post' }),
    ).toBeInTheDocument();
    expect(
      within(alheioCard).queryByRole('button', { name: 'Excluir post' }),
    ).toBeNull();
  });

  // Requirements: 6.2 — TEACHER vê o botão em qualquer post.
  it('professor vê o botão de exclusão em todos os posts', () => {
    currentPosts = [
      makePost({ id: 'p1', authorId: 'a1' }),
      makePost({ id: 'p2', authorId: 'a2' }),
    ];

    render(
      <ComunidadePostScreen userId="prof-1" userProfileType="TEACHER" />,
    );

    expect(deleteControls()).toHaveLength(2);
  });

  // Requirements: 6.2 — sem usuário logado, nenhum botão aparece.
  it('não renderiza nenhum botão quando não há usuário logado', () => {
    currentPosts = [makePost({ id: 'p1', authorId: 'a1' })];

    render(<ComunidadePostScreen />);

    expect(deleteControls()).toHaveLength(0);
  });

  // Requirements: 6.2, 6.3 — confirmar chama refetch uma vez e remove o post da lista.
  it('ao confirmar a exclusão, chama refetch uma vez e remove o post da visão', async () => {
    deletePostMock.mockResolvedValue(true);
    currentPosts = [
      makePost({ id: 'post-apagar', authorId: 'author-1' }),
      makePost({ id: 'post-manter', authorId: 'author-1' }),
    ];
    // refetch remove o post excluído da lista servida pelo mock.
    refetchMock.mockImplementation(() => {
      deletedIds.add('post-apagar');
      currentPosts = currentPosts.filter((p) => !deletedIds.has(p.id));
    });

    const { rerender } = render(
      <ComunidadePostScreen userId="author-1" userProfileType="STUDENT" />,
    );

    const card = cardForTitle('Título post-apagar');
    fireEvent.click(within(card).getByRole('button', { name: 'Excluir post' }));
    fireEvent.click(confirmButton());

    await waitFor(() => expect(deletePostMock).toHaveBeenCalledWith('post-apagar'));
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1));

    // Re-render para refletir a lista atualizada pelo refetch.
    rerender(<ComunidadePostScreen userId="author-1" userProfileType="STUDENT" />);

    expect(screen.queryByRole('heading', { name: 'Título post-apagar' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Título post-manter' })).toBeInTheDocument();
  });

  // Requirements: 7.2, 7.3 — clicar no controle de exclusão não navega pelo card.
  it('clicar no controle de exclusão não dispara a navegação do card', () => {
    deletePostMock.mockResolvedValue(true);
    currentPosts = [makePost({ id: 'post-nav', authorId: 'author-1' })];
    const onViewPost = vi.fn();

    render(
      <ComunidadePostScreen
        userId="author-1"
        userProfileType="STUDENT"
        onViewPost={onViewPost}
      />,
    );

    const card = cardForTitle('Título post-nav');
    fireEvent.click(within(card).getByRole('button', { name: 'Excluir post' }));

    // Abriu o dialog de confirmação, mas não navegou.
    expect(confirmButton()).toBeInTheDocument();
    expect(onViewPost).not.toHaveBeenCalled();
  });

  // Requirements: 7.2 — clicar nos botões do dialog de confirmação não navega pelo card.
  it('clicar em "Excluir" dentro do dialog não dispara a navegação do card', async () => {
    deletePostMock.mockResolvedValue(true);
    currentPosts = [makePost({ id: 'post-dialog', authorId: 'author-1' })];
    const onViewPost = vi.fn();

    render(
      <ComunidadePostScreen
        userId="author-1"
        userProfileType="STUDENT"
        onViewPost={onViewPost}
      />,
    );

    const card = cardForTitle('Título post-dialog');
    fireEvent.click(within(card).getByRole('button', { name: 'Excluir post' }));
    // Clique no botão de confirmação, que vive dentro do overlay do dialog.
    fireEvent.click(confirmButton());

    await waitFor(() => expect(deletePostMock).toHaveBeenCalledWith('post-dialog'));
    // O clique no dialog não deve escapar para o onClick do card.
    expect(onViewPost).not.toHaveBeenCalled();
  });

  // Requirements: 7.3 — clicar fora do controle de exclusão navega normalmente.
  it('clicar na área do card (fora do controle) dispara a navegação', () => {
    currentPosts = [makePost({ id: 'post-nav', authorId: 'author-1' })];
    const onViewPost = vi.fn();

    render(
      <ComunidadePostScreen
        userId="author-1"
        userProfileType="STUDENT"
        onViewPost={onViewPost}
      />,
    );

    fireEvent.click(screen.getByRole('heading', { name: 'Título post-nav' }));

    expect(onViewPost).toHaveBeenCalledTimes(1);
    expect(onViewPost).toHaveBeenCalledWith('post-nav');
  });

  // Property 7: Clique isolado na lista
  // Ativar o controle de exclusão nunca dispara a navegação do card, para
  // qualquer usuário permitido.
  // **Validates: Requirements 7.2, 7.3**
  it('Property 7 (Clique isolado na lista): ativar o controle de exclusão nunca navega pelo card', () => {
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

    fc.assert(
      fc.property(permittedUser, ({ userId, userProfileType }) => {
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        deleteHookState = { loading: false, error: null };
        currentPosts = [makePost({ id: 'prop7', authorId: 'author-1' })];
        const onViewPost = vi.fn();

        const { unmount, getByRole } = render(
          <ComunidadePostScreen
            userId={userId}
            userProfileType={userProfileType}
            onViewPost={onViewPost}
          />,
        );

        // Ativa o controle de exclusão; nunca deve navegar.
        fireEvent.click(getByRole('button', { name: 'Excluir post' }));
        expect(onViewPost).not.toHaveBeenCalled();

        unmount();
      }),
      { numRuns: 25 },
    );
  });

  // Property 8: Pós-sucesso correto (lista)
  // Numa exclusão bem-sucedida, refetch dispara exatamente uma vez.
  // **Validates: Requirements 6.2**
  it('Property 8 (Pós-sucesso correto, lista): exclusão bem-sucedida chama refetch exatamente uma vez', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('p-a', 'p-b', 'p-c'), async (postId) => {
        refetchMock.mockClear();
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        deleteHookState = { loading: false, error: null };
        currentPosts = [makePost({ id: postId, authorId: 'author-1' })];

        const { unmount, getByRole } = render(
          <ComunidadePostScreen userId="author-1" userProfileType="STUDENT" />,
        );

        fireEvent.click(getByRole('button', { name: 'Excluir post' }));
        fireEvent.click(getByRole('button', { name: 'Excluir' }));

        await waitFor(() => expect(deletePostMock).toHaveBeenCalledWith(postId));
        await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1));

        unmount();
      }),
      { numRuns: 15 },
    );
  });
});
