import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ComunidadePostScreen from './comunidadepostscreen';
import { AuthProvider } from '../auth/AuthContext';
import type { ForumPost, ProfileType } from '../types/forum.types';
import type { UsuarioLogado } from '../auth/authStore';

// --- Mocks dos hooks de forum ---------------------------------------------
// A tela usa `useForumPosts()` para obter `{ posts, loading, error, refetch }`
// e a exclusao passa por `useDeletePost()` (`deletePost(id): Promise<boolean>`).
// Mockamos ambos para isolar a tela da camada de servico/rede.

let currentPosts: ForumPost[] = [];
const refetchMock = vi.fn(() => {
  currentPosts = currentPosts.filter((p) => !deletedIds.has(p.id));
});
const deletedIds = new Set<string>();

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

// CreatePostModal e irrelevante para estes testes; renderiza nada.
vi.mock('./CreatePostModal', () => ({
  CreatePostModal: () => null,
}));

const STORAGE_KEY = 'usuarioLogado';

/** Grava uma sessao no localStorage para o AuthProvider iniciar logado. */
function seedSessao(user: Partial<UsuarioLogado> & Pick<UsuarioLogado, 'id' | 'profileType'>) {
  const completo: UsuarioLogado = {
    email: 'teste@exemplo.com',
    full_name: 'Usuario Teste',
    ...user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completo));
}

/**
 * Renderiza a tela de comunidade dentro de um roteador real: a rota de detalhe
 * (/comunidade/:postId) mostra um sentinela, permitindo verificar a navegacao
 * por clique no card (que agora usa useNavigate, nao mais onViewPost).
 */
function renderComunidade() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/comunidade']}>
        <Routes>
          <Route path="/comunidade" element={<ComunidadePostScreen />} />
          <Route path="/comunidade/:postId" element={<div>DETALHE DO POST</div>} />
          <Route path="/dashboard" element={<div>DASHBOARD</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

function makePost(overrides: Partial<ForumPost> = {}): ForumPost {
  const id = overrides.id ?? 'post-1';
  return {
    id,
    authorId: 'author-1',
    title: `Titulo ${id}`,
    content: `Conteudo ${id}`,
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

function cardForTitle(title: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: title });
  const card = heading.closest('article');
  if (!card) throw new Error(`Card nao encontrado para o titulo: ${title}`);
  return card as HTMLElement;
}

const deleteControls = () => screen.queryAllByRole('button', { name: 'Excluir post' });
const confirmButton = () => screen.getByRole('button', { name: 'Excluir' });

describe('ComunidadePostScreen - exclusao e navegacao na lista', () => {
  beforeEach(() => {
    refetchMock.mockClear();
    deletePostMock.mockReset();
    deletedIds.clear();
    deleteHookState = { loading: false, error: null };
    currentPosts = [];
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // Requirements: 2.3, 6.2 - o botao aparece so nos posts permitidos.
  it('renderiza o botao de exclusao apenas nos posts permitidos', () => {
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    currentPosts = [
      makePost({ id: 'meu-post', authorId: 'author-1' }),
      makePost({ id: 'post-alheio', authorId: 'outro-autor' }),
    ];

    renderComunidade();

    const meuCard = cardForTitle('Titulo meu-post');
    const alheioCard = cardForTitle('Titulo post-alheio');
    expect(
      within(meuCard).getByRole('button', { name: 'Excluir post' }),
    ).toBeInTheDocument();
    expect(
      within(alheioCard).queryByRole('button', { name: 'Excluir post' }),
    ).toBeNull();
  });

  // Requirements: 6.2 - TEACHER ve o botao em qualquer post.
  it('professor ve o botao de exclusao em todos os posts', () => {
    seedSessao({ id: 'prof-1', profileType: 'TEACHER' });
    currentPosts = [
      makePost({ id: 'p1', authorId: 'a1' }),
      makePost({ id: 'p2', authorId: 'a2' }),
    ];

    renderComunidade();

    expect(deleteControls()).toHaveLength(2);
  });

  // Requirements: 6.2 - sem usuario logado, nenhum botao aparece.
  it('nao renderiza nenhum botao quando nao ha usuario logado', () => {
    currentPosts = [makePost({ id: 'p1', authorId: 'a1' })];

    renderComunidade();

    expect(deleteControls()).toHaveLength(0);
  });

  // Requirements: 6.2, 6.3 - confirmar chama refetch uma vez e remove o post da lista.
  it('ao confirmar a exclusao, chama refetch uma vez e remove o post da visao', async () => {
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    deletePostMock.mockResolvedValue(true);
    currentPosts = [
      makePost({ id: 'post-apagar', authorId: 'author-1' }),
      makePost({ id: 'post-manter', authorId: 'author-1' }),
    ];
    refetchMock.mockImplementation(() => {
      deletedIds.add('post-apagar');
      currentPosts = currentPosts.filter((p) => !deletedIds.has(p.id));
    });

    const { rerender } = renderComunidade();

    const card = cardForTitle('Titulo post-apagar');
    fireEvent.click(within(card).getByRole('button', { name: 'Excluir post' }));
    fireEvent.click(confirmButton());

    await waitFor(() => expect(deletePostMock).toHaveBeenCalledWith('post-apagar'));
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1));

    rerender(
      <AuthProvider>
        <MemoryRouter initialEntries={['/comunidade']}>
          <Routes>
            <Route path="/comunidade" element={<ComunidadePostScreen />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.queryByRole('heading', { name: 'Titulo post-apagar' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Titulo post-manter' })).toBeInTheDocument();
  });

  // Requirements: 7.2, 7.3 - clicar no controle de exclusao nao navega pelo card.
  it('clicar no controle de exclusao nao dispara a navegacao do card', () => {
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    deletePostMock.mockResolvedValue(true);
    currentPosts = [makePost({ id: 'post-nav', authorId: 'author-1' })];

    renderComunidade();

    const card = cardForTitle('Titulo post-nav');
    fireEvent.click(within(card).getByRole('button', { name: 'Excluir post' }));

    // Abriu o dialog de confirmacao, mas nao navegou para o detalhe.
    expect(confirmButton()).toBeInTheDocument();
    expect(screen.queryByText('DETALHE DO POST')).toBeNull();
  });

  // Requirements: 7.2 - clicar nos botoes do dialog nao navega pelo card.
  it('clicar em "Excluir" dentro do dialog nao dispara a navegacao do card', async () => {
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    deletePostMock.mockResolvedValue(true);
    currentPosts = [makePost({ id: 'post-dialog', authorId: 'author-1' })];

    renderComunidade();

    const card = cardForTitle('Titulo post-dialog');
    fireEvent.click(within(card).getByRole('button', { name: 'Excluir post' }));
    fireEvent.click(confirmButton());

    await waitFor(() => expect(deletePostMock).toHaveBeenCalledWith('post-dialog'));
    expect(screen.queryByText('DETALHE DO POST')).toBeNull();
  });

  // Requirements: 7.3 - clicar fora do controle navega para o detalhe (/:postId).
  it('clicar na area do card (fora do controle) navega para o detalhe do post', () => {
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    currentPosts = [makePost({ id: 'post-nav', authorId: 'author-1' })];

    renderComunidade();

    fireEvent.click(screen.getByRole('heading', { name: 'Titulo post-nav' }));

    expect(screen.getByText('DETALHE DO POST')).toBeInTheDocument();
  });

  // Property 7: Clique isolado na lista
  // Ativar o controle de exclusao nunca dispara a navegacao do card, para
  // qualquer usuario permitido.
  // **Validates: Requirements 7.2, 7.3**
  it('Property 7 (Clique isolado na lista): ativar o controle de exclusao nunca navega pelo card', () => {
    const permittedUser = fc.oneof(
      fc.record({
        id: fc.constant('author-1'),
        profileType: fc.constantFrom<ProfileType>('STUDENT', 'TEACHER', 'ADMIN'),
      }),
      fc.record({
        id: fc.constantFrom('author-1', 'prof-1'),
        profileType: fc.constantFrom<ProfileType>('TEACHER', 'ADMIN'),
      }),
    );

    fc.assert(
      fc.property(permittedUser, ({ id, profileType }) => {
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        deleteHookState = { loading: false, error: null };
        currentPosts = [makePost({ id: 'prop7', authorId: 'author-1' })];
        localStorage.clear();
        seedSessao({ id, profileType });

        const { unmount, getByRole, queryByText } = renderComunidade();

        fireEvent.click(getByRole('button', { name: 'Excluir post' }));
        expect(queryByText('DETALHE DO POST')).toBeNull();

        unmount();
      }),
      { numRuns: 25 },
    );
  });

  // Property 8: Pos-sucesso correto (lista)
  // Numa exclusao bem-sucedida, refetch dispara exatamente uma vez.
  // **Validates: Requirements 6.2**
  it('Property 8 (Pos-sucesso correto, lista): exclusao bem-sucedida chama refetch exatamente uma vez', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('p-a', 'p-b', 'p-c'), async (postId) => {
        refetchMock.mockClear();
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        deleteHookState = { loading: false, error: null };
        currentPosts = [makePost({ id: postId, authorId: 'author-1' })];
        localStorage.clear();
        seedSessao({ id: 'author-1', profileType: 'STUDENT' });

        const { unmount, getByRole } = renderComunidade();

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
