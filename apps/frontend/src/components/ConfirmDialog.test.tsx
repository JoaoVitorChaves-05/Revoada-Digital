import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

// Props base reutilizadas pelos casos; cada teste sobrescreve o necessario.
function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const utils = render(
    <ConfirmDialog
      isOpen
      title="Excluir post"
      message="Tem certeza que deseja excluir este post?"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { ...utils, onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('nao renderiza nada quando isOpen e false', () => {
    const { container } = renderDialog({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('renderiza titulo, mensagem e botoes quando aberto', () => {
    renderDialog();
    expect(screen.getByText('Excluir post')).toBeInTheDocument();
    expect(
      screen.getByText('Tem certeza que deseja excluir este post?'),
    ).toBeInTheDocument();
    // Rotulos padrao: "Excluir" (confirmar) e "Cancelar".
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('usa os rotulos customizados de confirmar e cancelar', () => {
    renderDialog({ confirmLabel: 'Apagar', cancelLabel: 'Voltar' });
    expect(screen.getByRole('button', { name: 'Apagar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
  });

  it('em loading: desabilita ambos os botoes e mostra "Excluindo..."', () => {
    renderDialog({ loading: true });

    const confirmBtn = screen.getByRole('button', { name: 'Excluindo...' });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });

    expect(confirmBtn).toBeDisabled();
    expect(cancelBtn).toBeDisabled();
    // O rotulo de confirmacao foi substituido pelo rotulo de progresso.
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });

  it('em loading: clique repetido no confirmar NAO dispara onConfirm novamente', () => {
    const { onConfirm } = renderDialog({ loading: true });
    const confirmBtn = screen.getByRole('button', { name: 'Excluindo...' });

    // Dispara varios cliques enquanto carrega; nenhum deve chamar onConfirm.
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('em loading: clique no cancelar NAO dispara onCancel', () => {
    const { onCancel } = renderDialog({ loading: true });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });

    fireEvent.click(cancelBtn);

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('exibe errorMessage mantendo o dialog aberto', () => {
    renderDialog({ errorMessage: 'Falha ao excluir o post.' });

    expect(screen.getByText('Falha ao excluir o post.')).toBeInTheDocument();
    // O dialog permanece aberto: botoes continuam presentes e habilitados.
    const confirmBtn = screen.getByRole('button', { name: 'Excluir' });
    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    expect(confirmBtn).toBeEnabled();
    expect(cancelBtn).toBeEnabled();
  });

  it('dispara onConfirm ao ativar o controle de confirmacao', () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('dispara onCancel ao ativar o controle de cancelamento', () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
