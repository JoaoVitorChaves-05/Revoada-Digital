import { useState } from 'react';
import { getDificuldadeColors, theme } from '../utils/colors';

interface QuestionFiltersProps {
  filtrosAtivos: string[];
  setFiltrosAtivos: (filtros: string[]) => void;
}

export function QuestionFilters({ filtrosAtivos, setFiltrosAtivos }: QuestionFiltersProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  
  const dificuldades = ['Fácil', 'Média', 'Difícil'];

  const alternarDificuldade = (diff: string) => {
    if (filtrosAtivos.includes(diff)) {
      setFiltrosAtivos(filtrosAtivos.filter(item => item !== diff));
    } else {
      setFiltrosAtivos([...filtrosAtivos, diff]);
    }
  };

  return (
    <div style={{
      padding: '16px',
      background: theme.background.card,
      borderRadius: '8px',
      border: `1px solid ${theme.border.card}`,
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      
      <button 
        onClick={() => setMenuAberto(!menuAberto)}
        style={{
          alignSelf: 'flex-start',
          padding: '8px 16px',
          borderRadius: '6px',
          border: `1px solid ${theme.button.border}`,
          backgroundColor: menuAberto ? theme.button.bgActive : theme.button.bgDefault,
          color: theme.button.text,
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
      >
        Dificuldade
      </button>

      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        overflow: 'hidden',
        maxHeight: menuAberto ? '50px' : '0px',
        opacity: menuAberto ? 1 : 0,
        marginTop: menuAberto ? '8px' : '0px',
        transition: 'all 0.3s ease-in-out' 
      }}>
        {dificuldades.map(diff => {
          const cores = getDificuldadeColors(diff);
          const estaSelecionado = filtrosAtivos.includes(diff);

          return (
            <button
              key={diff}
              onClick={() => alternarDificuldade(diff)}
              style={{
                fontSize: '12px', 
                fontWeight: 'bold', 
                backgroundColor: cores.bg, 
                color: cores.text, 
                padding: '6px 12px', 
                borderRadius: '16px',
                border: estaSelecionado ? `1px solid ${cores.text}` : '1px solid transparent',
                cursor: 'pointer',
                filter: estaSelecionado ? 'brightness(0.9)' : 'brightness(1)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {diff}
            </button>
          );
        })}
      </div>
    </div>
  );
}