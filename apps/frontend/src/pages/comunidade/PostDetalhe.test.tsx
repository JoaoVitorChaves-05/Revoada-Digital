import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PostDetalhe } from './PostDetalhe';
import { AuthProvider } from '../../auth/AuthContext';
import type { ForumPost, ProfileType } from '../../types/forum.types';
import type { UsuarioLogado } from '../../auth/authStore';

// Mocka os hooks de forum usados pela tela de detalhe e pelo DeletePostButton.
//  - useForumPost: fornece o post exibido.
//  - useCreateReply: usado pelo formulario de resposta (nao exercitado aqui).
//  - useDeletePost: usado pelo DeletePostButton; deletePost(id): Promise<boolean>.
const deletePostMock = vi.fn<(id: string) => Promise<boolean>>();
const refetchMock = vi.fn();
const createReplyMock = vi.fn();
let deleteState: { loading: boolean; error: string | null };
let postState: ForumPost | null;

vi.mock('../../hooks/useForum', () => ({
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

const STORAGE_KEY = 'usuarioLogado';

function seedSessao(user: Partial<UsuarioLogado> & Pick<UsuarioLogado, 'id' | 'profileType'>) {
  const completo: UsuarioLogado = {
    email: 'teste@exemplo.com',
    full_name: 'Usuario Teste',
    ...user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completo));
}

function makePost(overrides: Partial<ForumPost> = {}): ForumPost {
  return {
    id: 'post-1',
    authorId: 'author-1',
    title: 'Titulo de teste',
    content: 'Conteudo de teste',
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

/**
 * Renderiza a tela de detalhe em /comunidade/:postId dentro de um roteador real.
 * A rota /comunidade mostra um sentinela para verificar a navegacao de "voltar"
 * (onDeleted/onBack agora usam useNavigate, nao mais props).
 */
function renderDetalhe(postId = 'post-1') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/comunidade/${postId}`]}>
        <Routes>
          <Route path="/comunidade" element={<div>LISTA DA COMUNIDADE</div>} />
          <Route path="/comunidade/:postId" element={<PostDetalhe />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

const deleteControl = () => screen.queryByRole('button', { name: 'Excluir post' });
const confirmButton = () => screen.getByRole('button', { name: 'Excluir' });

describe('PostDetalhe - exclusao de post', () => {
  beforeEach(() => {
    deletePostMock.mockReset();
    refetchMock.mockReset();
    createReplyMock.mockReset();
    deleteState = { loading: false, error: null };
    postState = makePost();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // Requirements: 2.4 - o botao de exclusao aparece quando o usuario e o autor.
  it('exibe o botao de exclusao quando o usuario logado e o autor', () => {
    postState = makePost({ authorId: 'author-1' });
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    renderDetalhe();
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 2.4 - professor ve o botao mesmo nao sendo o autor.
  it('exibe o botao de exclusao para TEACHER que nao e autor', () => {
    postState = makePost({ authorId: 'author-1' });
    seedSessao({ id: 'prof-1', profileType: 'TEACHER' });
    renderDetalhe();
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 2.4 - admin ve o botao mesmo nao sendo o autor.
  it('exibe o botao de exclusao para ADMIN que nao e autor', () => {
    postState = makePost({ authorId: 'author-1' });
    seedSessao({ id: 'admin-1', profileType: 'ADMIN' });
    renderDetalhe();
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 2.4 - STUDENT que nao e autor nao ve o botao.
  it('nao exibe o botao para STUDENT que nao e o autor', () => {
    postState = makePost({ authorId: 'author-1' });
    seedSessao({ id: 'outro-usuario', profileType: 'STUDENT' });
    renderDetalhe();
    expect(deleteControl()).toBeNull();
  });

  // Requirements: 2.4 - sem usuario logado o botao nao aparece.
  it('nao exibe o botao quando nao ha usuario logado', () => {
    postState = makePost({ authorId: 'author-1' });
    renderDetalhe();
    expect(deleteControl()).toBeNull();
  });

  // Requirements: 6.5 - confirmar a exclusao com sucesso volta para a lista.
  it('confirma a exclusao e navega de volta para a comunidade', async () => {
    deletePostMock.mockResolvedValue(true);
    postState = makePost({ id: 'post-42', authorId: 'author-1' });
    seedSessao({ id: 'author-1', profileType: 'STUDENT' });
    renderDetalhe('post-42');

    fireEvent.click(deleteControl()!);
    expect(deletePostMock).not.toHaveBeenCalled();

    fireEvent.click(confirmButton());

    await waitFor(() => expect(screen.getByText('LISTA DA COMUNIDADE')).toBeInTheDocument());
    expect(deletePostMock).toHaveBeenCalledTimes(1);
    expect(deletePostMock).toHaveBeenCalledWith('post-42');
  });

  // Property 8: Pos-sucesso correto (detalhe)
  // Em qualquer exclusao bem-sucedida feita por um usuario permitido, a tela
  // navega de volta para a lista da comunidade.
  // **Validates: Requirements 6.5**
  it('Property 8 (Pos-sucesso correto, detalhe): volta para a comunidade em sucesso', async () => {
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

    await fc.assert(
      fc.asyncProperty(permittedUser, async ({ id, profileType }) => {
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        refetchMock.mockReset();
        deleteState = { loading: false, error: null };
        postState = makePost({ authorId: 'author-1' });
        localStorage.clear();
        seedSessao({ id, profileType });

        const { unmount, getByRole, findByText } = renderDetalhe();

        fireEvent.click(getByRole('button', { name: 'Excluir post' }));
        fireEvent.click(getByRole('button', { name: 'Excluir' }));

        await findByText('LISTA DA COMUNIDADE');
        unmount();
      }),
      { numRuns: 25 },
    );
  });
});
