import { useState, useEffect } from 'react';
import { forumService } from '../services/forum.service';
import type { Subjects } from '../types/forum.types';
import { SUBJECT_LABELS } from '../types/forum.types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId?: string;
  onCreated?: () => void;
}

const MATERIAS: Subjects[] = ['MATH', 'PORTUGUESE', 'PHYSICS', 'CHEMICAL', 'HISTORY', 'GEOGRAPHY', 'ENGLISH'];

export function CreatePostModal({ isOpen, onClose, authorId, onCreated }: CreatePostModalProps) {
  const [titulo, setTitulo] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [materia, setMateria] = useState<Subjects | ''>('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitulo('');
      setDetalhes('');
      setMateria('');
      setErro(null);
      setEnviando(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!authorId) {
      setErro('Você precisa estar logado para publicar.');
      return;
    }
    if (!materia) {
      setErro('Selecione a matéria.');
      return;
    }
    setEnviando(true);
    try {
      await forumService.createPost({
        authorId,
        title: titulo.trim(),
        content: detalhes.trim(),
        subject: materia,
      });
      onCreated?.();
      onClose();
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Não foi possível publicar o post.');
      setEnviando(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(128, 128, 128, 0.8)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      fontFamily: 'sans-serif', padding: 16
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '640px', maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            backgroundColor: '#112288', padding: '8px 24px', borderRadius: '16px',
            color: '#FF8C42', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>Novo Post</div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', backgroundColor: 'white', border: 'none',
            borderRadius: '8px', color: '#112288', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>X</button>
        </div>

        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white', borderRadius: '12px', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: 0, color: '#112288', fontSize: '20px' }}>Título da dúvida</h2>
          <input
            type="text"
            placeholder="Ex: Gente, como faz logaritmo?"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#F0F0F0', fontSize: '15px', color: '#333' }}
          />

          <textarea
            placeholder="Detalhe sua dúvida..."
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            required
            rows={5}
            style={{ padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#F0F0F0', fontSize: '15px', color: '#333', resize: 'vertical' }}
          />

          <div>
            <label style={{ display: 'block', color: '#112288', fontWeight: 'bold', marginBottom: 6 }}>Matéria</label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value as Subjects)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', color: '#333' }}
            >
              <option value="" disabled>Selecione a matéria...</option>
              {MATERIAS.map((m) => (
                <option key={m} value={m}>{SUBJECT_LABELS[m]}</option>
              ))}
            </select>
          </div>

          {erro && <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0 }}>{erro}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={enviando} style={{
              padding: '10px 24px', backgroundColor: '#FF8C42', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: enviando ? 0.7 : 1
            }}>{enviando ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}