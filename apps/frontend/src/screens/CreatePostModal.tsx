interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '500px' }}>
        <h2>Criar novo post</h2>
        
        <p>Aqui vai entrar o nosso formulário daqui a pouco...</p>

        <button onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}