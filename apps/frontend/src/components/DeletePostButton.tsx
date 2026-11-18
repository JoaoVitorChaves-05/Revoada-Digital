import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ForumPost, ProfileType } from '../types/forum.types';
import { canDeletePost } from '../utils/forumPermissions';
import { useDeletePost } from '../hooks/useForum';
import { ConfirmDialog } from './ConfirmDialog';

interface DeletePostButtonProps {
  post: ForumPost;
  userId?: string;
  userProfileType?: ProfileType;
  /** lista: refetch(); detalhe: onBack() */
  onDeleted: () => void;
  /** true nos cards, para impedir a navegação do card ao clicar no botão */
  stopPropagation?: boolean;
  className?: string;
  variant?: 'icon' | 'menu-item';
}

/**
 * Botão de exclusão de post que encapsula permissão, confirmação e chamada de
 * exclusão num único componente, usado tanto na lista quanto no detalhe.
 *
 * - Renderiza `null` quando `canDeletePost(...)` não é estritamente `true`.
 * - Ao clicar: se `stopPropagation`, chama `e.stopPropagation()` antes de
 *   qualquer ação; então abre o `ConfirmDialog`.
 * - Ao confirmar: chama `deletePost(post.id)` exatamente uma vez. Em sucesso,
 *   fecha o dialog e chama `onDeleted` exatamente uma vez (guardado contra
 *   relatos de sucesso duplicados). Em falha, mantém o dialog aberto exibindo o
 *   `error` do hook e não chama `onDeleted`.
 */
export function DeletePostButton({
  post,
  userId,
  userProfileType,
  onDeleted,
  stopPropagation,
  className,
  variant = 'icon',
}: DeletePostButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { deletePost, loading, error } = useDeletePost();

  if (canDeletePost(post, userId, userProfileType) !== true) return null;

  function handleClick(e: React.MouseEvent) {
    if (stopPropagation) e.stopPropagation();
    setDialogOpen(true);
  }

  async function handleConfirm() {
    // Evita reentrância e relatos de sucesso duplicados para a mesma exclusão.
    if (loading || deleted) return;

    const ok = await deletePost(post.id);
    if (ok) {
      setDeleted(true);
      setDialogOpen(false);
      onDeleted();
    }
    // Em falha: dialog permanece aberto exibindo o `error` do hook; onDeleted não é chamado.
  }

  function handleCancel() {
    setDialogOpen(false);
  }

  return (
    <>
      <button
        type="button"
        data-post-id={post.id}
        aria-label="Excluir post"
        title="Excluir post"
        onClick={handleClick}
        className={className}
      >
        <Trash2 className={variant === 'icon' ? 'h-full w-full' : undefined} />
        {variant === 'menu-item' && <span>Excluir</span>}
      </button>

      <ConfirmDialog
        isOpen={dialogOpen}
        title="Excluir post"
        message="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={loading}
        errorMessage={error}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
