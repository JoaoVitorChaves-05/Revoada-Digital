interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmação reutilizável, seguindo o padrão visual de CreatePostModal
 * (overlay controlado por `isOpen`, estado de erro interno, botões estilizados).
 *
 * - Renderiza `null` quando `isOpen === false`.
 * - Em `loading`: desabilita ambos os botões (ignora clique/teclado) e troca o
 *   rótulo de confirmação por "Excluindo...".
 * - Exibe `errorMessage` quando presente, mantendo o dialog aberto.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Excluir',
  cancelLabel = 'Cancelar',
  loading = false,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  function handleConfirm() {
    if (loading) return;
    onConfirm();
  }

  function handleCancel() {
    if (loading) return;
    onCancel();
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(128, 128, 128, 0.8)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      fontFamily: 'sans-serif', padding: 16
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        width: '440px', maxWidth: '100%'
      }}>
        <h2 style={{ margin: 0, color: '#112288', fontSize: '20px' }}>{title}</h2>
        <p style={{ margin: 0, color: '#333', fontSize: '15px', lineHeight: 1.5 }}>{message}</p>

        {errorMessage && <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0 }}>{errorMessage}</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '10px 24px', backgroundColor: '#F0F0F0', color: '#112288',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: loading ? 0.6 : 1
            }}
          >{cancelLabel}</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '10px 24px', backgroundColor: '#dc2626', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: loading ? 0.7 : 1
            }}
          >{loading ? 'Excluindo...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
