import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fc from 'fast-check';
import { DeletePostButton } from './DeletePostButton';
import type { ForumPost, ProfileType } from '../types/forum.types';

// Mock do hook de exclusão: isola o componente da camada de serviço/rede.
// `useDeletePost` retorna `{ deletePost, loading, error }` onde
// `deletePost(id): Promise<boolean>`.
const deletePostMock = vi.fn<(id: string) => Promise<boolean>>();
let hookState: { loading: boolean; error: string | null };

vi.mock('../hooks/useForum', () => ({
  useDeletePost: () => ({
    deletePost: deletePostMock,
    loading: hookState.loading,
    error: hookState.error,
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

const confirmButton = () => screen.getByRole('button', { name: 'Excluir' });
const deleteControl = () => screen.getByRole('button', { name: 'Excluir post' });

describe('DeletePostButton', () => {
  beforeEach(() => {
    deletePostMock.mockReset();
    hookState = { loading: false, error: null };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Requirements: 2.1, 2.5
  it('renderiza null quando não permitido (userId indefinido)', () => {
    const { container } = render(
      <DeletePostButton post={makePost()} onDeleted={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('button', { name: 'Excluir post' })).toBeNull();
  });

  // Requirements: 2.1, 2.5 — STUDENT que não é autor não vê o botão
  it('renderiza null quando não permitido (STUDENT não autor)', () => {
    const { container } = render(
      <DeletePostButton
        post={makePost()}
        userId="outro-usuario"
        userProfileType="STUDENT"
        onDeleted={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  // Requirements: 2.1 — autor vê o botão
  it('renderiza o controle de exclusão quando permitido (autor)', () => {
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        userProfileType="STUDENT"
        onDeleted={vi.fn()}
      />,
    );
    expect(deleteControl()).toBeInTheDocument();
  });

  // Requirements: 3.1, 3.2 — abre o dialog ao clicar, sem chamar o serviço
  it('abre o ConfirmDialog ao clicar e não chama deletePost antes de confirmar', () => {
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();

    fireEvent.click(deleteControl());

    expect(confirmButton()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(deletePostMock).not.toHaveBeenCalled();
  });

  // Requirements: 3.2, 3.3 — cancelar fecha sem chamar o serviço
  it('não chama deletePost ao cancelar', () => {
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        onDeleted={vi.fn()}
      />,
    );
    fireEvent.click(deleteControl());
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(deletePostMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
  });

  // Requirements: 3.3, 6.1 — confirma, chama deletePost(post.id) uma vez, sucesso fecha e chama onDeleted
  it('chama deletePost(post.id) exatamente uma vez e só após confirmar; em sucesso chama onDeleted e fecha o dialog', async () => {
    deletePostMock.mockResolvedValue(true);
    const onDeleted = vi.fn();
    render(
      <DeletePostButton
        post={makePost({ id: 'post-42' })}
        userId="author-1"
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(deleteControl());
    expect(deletePostMock).not.toHaveBeenCalled();

    fireEvent.click(confirmButton());

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(deletePostMock).toHaveBeenCalledTimes(1);
    expect(deletePostMock).toHaveBeenCalledWith('post-42');
    // Dialog fechado: controle de confirmação não está mais presente.
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
  });

  // Requirements: 5.3, 5.4, 5.5 — falha mantém dialog aberto, exibe erro, não chama onDeleted
  it('em falha: mantém o dialog aberto, exibe o erro e não chama onDeleted', async () => {
    const onDeleted = vi.fn();
    // Hook expõe a mensagem de erro (como o useDeletePost real faz em falha) e
    // deletePost resolve false indicando que a exclusão não ocorreu.
    hookState.error = 'Erro ao deletar post';
    deletePostMock.mockResolvedValue(false);
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(deleteControl());
    fireEvent.click(confirmButton());

    // Aguarda a resolução da promessa de exclusão (false).
    await waitFor(() => expect(deletePostMock).toHaveBeenCalledTimes(1));

    // Dialog permanece aberto exibindo o erro; onDeleted não é chamado.
    expect(screen.getByText('Erro ao deletar post')).toBeInTheDocument();
    expect(confirmButton()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  // Requirements: 7.1 — stopPropagation é chamado quando a prop está ativa
  it('chama e.stopPropagation() quando a prop stopPropagation está ativa', () => {
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        onDeleted={vi.fn()}
        stopPropagation
      />,
    );

    const control = deleteControl();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    fireEvent(control, event);

    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    // Mesmo assim o dialog abre.
    expect(confirmButton()).toBeInTheDocument();
  });

  // Requirements: 7.1 — sem a prop, stopPropagation não é chamado
  it('não chama e.stopPropagation() quando a prop está ausente', () => {
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        onDeleted={vi.fn()}
      />,
    );

    const control = deleteControl();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    fireEvent(control, event);

    expect(stopPropagationSpy).not.toHaveBeenCalled();
  });

  // Requirements: 6.6 — ignora relatos de sucesso duplicados (onDeleted no máximo uma vez)
  it('ignora relatos de sucesso duplicados: onDeleted chamado no máximo uma vez', async () => {
    deletePostMock.mockResolvedValue(true);
    const onDeleted = vi.fn();
    render(
      <DeletePostButton
        post={makePost()}
        userId="author-1"
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(deleteControl());
    fireEvent.click(confirmButton());

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));

    // Reabrir e confirmar novamente não deve disparar onDeleted outra vez
    // (guarda contra sucesso duplicado para a mesma exclusão).
    fireEvent.click(deleteControl());
    const reopenedConfirm = screen.queryByRole('button', { name: 'Excluir' });
    if (reopenedConfirm) {
      fireEvent.click(reopenedConfirm);
    }

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledTimes(1);
    });
    // deletePost não é chamado uma segunda vez após o sucesso.
    expect(deletePostMock).toHaveBeenCalledTimes(1);
  });

  // Property 6: Confirmação obrigatória
  // Nenhuma chamada a deletePost acontece sem confirmar, para qualquer
  // combinação de usuário permitido e prop stopPropagation.
  // **Validates: Requirements 3.2**
  it('Property 6 (Confirmação obrigatória): deletePost nunca é chamado sem confirmar', () => {
    // Combinações que SEMPRE são permitidas por canDeletePost:
    //  - autor (userId === authorId), com qualquer profileType;
    //  - TEACHER ou ADMIN, com qualquer userId definido.
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
      fc.property(permittedUser, fc.boolean(), ({ userId, userProfileType }, stopProp) => {
        deletePostMock.mockReset();
        deletePostMock.mockResolvedValue(true);
        hookState = { loading: false, error: null };

        const { unmount, getByRole } = render(
          <DeletePostButton
            post={makePost({ authorId: 'author-1' })}
            userId={userId}
            userProfileType={userProfileType}
            onDeleted={vi.fn()}
            stopPropagation={stopProp}
          />,
        );

        // Abrir o dialog, mas nunca confirmar. Queries escopadas ao render atual
        // (fast-check executa vários runs sem o cleanup entre eles).
        fireEvent.click(getByRole('button', { name: 'Excluir post' }));
        fireEvent.click(getByRole('button', { name: 'Cancelar' }));

        expect(deletePostMock).not.toHaveBeenCalled();
        unmount();
      }),
      { numRuns: 25 },
    );
  });
});
