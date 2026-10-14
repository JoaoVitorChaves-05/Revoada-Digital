import { useState } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const disciplinas = ['Matemática', 'Física', 'Química', 'Biologia'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!materia) {
      alert('Selecione uma disciplina');
      return;
    }
    console.log({ titulo, materia, conteudo });
    onClose(); 
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Criar novo post</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Título da dúvida</label>
            <input 
              type="text" 
              placeholder="Ex: Como saber quando usar arranjo ou combinação?"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Disciplina</label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                padding: '8px', borderRadius: '4px', border: '1px solid #ccc', 
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                backgroundColor: 'white'
              }}
            >
              <span style={{ color: materia ? '#000' : '#757575' }}>
                {materia || 'Selecione uma matéria...'}
              </span>
              <span style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                ▼
              </span>
            </div>

            <div style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, 
              backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', 
              marginTop: '4px', zIndex: 10,
              maxHeight: isDropdownOpen ? '200px' : '0px',
              opacity: isDropdownOpen ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: isDropdownOpen ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
            }}>
              {disciplinas.map((disc) => (
                <div 
                  key={disc}
                  onClick={() => {
                    setMateria(disc);
                    setIsDropdownOpen(false);
                  }}
                  style={{ 
                    padding: '10px 8px', cursor: 'pointer', borderBottom: '1px solid #eee' 
                  }}
                >
                  {disc}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Detalhes da dúvida</label>
            <textarea 
              placeholder="Explique sua dúvida com detalhes..."
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={5}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Anexar imagem (opcional)</label>
            <input 
              type="file" 
              accept="image/*"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>
              Cancelar
            </button>
            <button type="submit" style={{ padding: '8px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Publicar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}