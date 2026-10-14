import { useState, useEffect, useRef } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [titulo, setTitulo] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [materia, setMateria] = useState('');
  const [buscaMateria, setBuscaMateria] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materiasLista = [
    '...', 'Matemática', 'Física', 'Gramática', 'História', 'Geografia', 'Biologia', 'Química'
  ];

  useEffect(() => {
    if (isOpen) {
      setTitulo('');
      setDetalhes('');
      setActiveDropdown(null);
      setMateria('');
      setBuscaMateria('');
      setArquivo(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleSelectMateria = (selecionada: string) => {
    setMateria(selecionada === '...' ? '' : selecionada);
    setActiveDropdown(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArquivo(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ titulo, detalhes, materia, arquivo });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(128, 128, 128, 0.8)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      fontFamily: 'sans-serif'
    }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #112288;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFFFFF;
          border-radius: 10px;
          border: 3px solid #112288;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '800px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: '#112288', padding: '8px 24px', borderRadius: '16px',
            color: '#FF8C42', fontWeight: 'bold', fontSize: '18px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            Novo Post
          </div>
          <button 
            onClick={onClose}
            style={{ 
              width: '32px', height: '32px', backgroundColor: 'white', border: 'none', 
              borderRadius: '8px', color: '#112288', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
            X
          </button>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: '16px' }}>
          
          <form onSubmit={handleSubmit} style={{ 
            flex: 2.5, backgroundColor: 'white', borderRadius: '12px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '16px', height: '400px', boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: 0, color: '#112288', fontSize: '20px' }}>Título da dúvida:</h2>
            <input 
              type="text" 
              placeholder="Ex: Gente, como faz logaritmo?"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ 
                padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#F0F0F0',
                fontSize: '15px', color: '#333'
              }}
            />

            <textarea 
              placeholder="Detalhe sua dúvida..."
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              style={{ 
                padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#F0F0F0',
                fontSize: '15px', color: '#333', resize: 'none', flexGrow: 1
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  padding: '8px 16px', backgroundColor: '#D9D9D9', color: '#112288', 
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                {arquivo ? arquivo.name : 'Anexar Arquivo'}
              </button>
              
              <button 
                type="submit" 
                style={{ 
                  padding: '10px 24px', backgroundColor: '#FF8C42', color: 'white', 
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                Publicar
              </button>
            </div>
          </form>

          <div style={{ 
            flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '12px', height: '400px', boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: 0, color: '#112288', fontSize: '20px', marginBottom: '8px' }}>Tags:</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => toggleDropdown('materia')}
                style={{
                  padding: '10px', 
                  backgroundColor: activeDropdown === 'materia' ? '#FF8C42' : '#F0F0F0', 
                  color: activeDropdown === 'materia' ? 'white' : '#112288',
                  border: materia && activeDropdown !== 'materia' ? '2px solid #112288' : '2px solid transparent', 
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                  fontWeight: (materia || activeDropdown === 'materia') ? 'bold' : 'normal',
                  fontSize: '15px', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {materia || 'Matéria'}
              </button>

              <button type="button" style={{
                  padding: '10px', backgroundColor: '#F0F0F0', color: '#112288',
                  border: '2px solid transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                  fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                Disciplina
              </button>

              <button type="button" style={{
                  padding: '10px', backgroundColor: '#F0F0F0', color: '#112288',
                  border: '2px solid transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                  fontSize: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                Conteúdo
              </button>
            </div>
          </div>

          {activeDropdown === 'materia' && (
            <div style={{ 
              position: 'absolute', top: 0, left: 'calc(100% + 16px)',
              width: '240px', backgroundColor: 'white', borderRadius: '12px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px', height: '400px', boxSizing: 'border-box',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 10
            }}>
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={buscaMateria}
                onChange={(e) => setBuscaMateria(e.target.value)}
                style={{ 
                  padding: '8px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#D9D9D9',
                  fontSize: '14px'
                }}
              />
              <div className="custom-scrollbar" style={{ 
                flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '8px'
              }}>
                {materiasLista.filter(m => m.toLowerCase().startsWith(buscaMateria.toLowerCase())).map((item) => (
                  <div 
                    key={item}
                    onClick={() => handleSelectMateria(item)}
                    onMouseEnter={(e) => {
                      if (item !== materia) e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      if (item !== materia) e.currentTarget.style.backgroundColor = 'white';
                    }}
                    style={{
                      padding: '10px', color: item === materia ? 'white' : '#112288',
                      backgroundColor: item === materia ? '#FF8C42' : 'white',
                      borderRadius: '6px', textAlign: 'center', cursor: 'pointer',
                      fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}