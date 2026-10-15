import { QuestionCard } from './QuestionCard';
import { theme } from '../utils/colors';

interface QuestionGridProps {
  filtrosAtivos: string[];
}

export function QuestionGrid({ filtrosAtivos }: QuestionGridProps) {
  const bancoDeQuestoes = [
    {
      id: 1,
      dificuldade: 'Fácil',
      enunciado: 'Quanto é 2 + 2?',
      alternativas: ['1', '2', '3', '4']
    },
    {
      id: 2,
      dificuldade: 'Média',
      enunciado: 'Em que ano o Brasil foi descoberto?',
      alternativas: ['1492', '1500', '1822', '1889']
    },
    {
      id: 3,
      dificuldade: 'Difícil',
      enunciado: 'O que significa a sigla HTML?',
      alternativas: [
        'Hyper Text Markup Language', 
        'High Tech Modern Language', 
        'Hyperlink and Text Markup Language', 
        'Home Tool Markup Language'
      ]
    }
  ];

  const questoesFiltradas = bancoDeQuestoes.filter(questao => {
    if (filtrosAtivos.length === 0) return true;
    return filtrosAtivos.includes(questao.dificuldade);
  });

  return (
    <div style={{ padding: '1rem', background: theme.background.grid, borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0, color: theme.text.title }}>Questões Cadastradas</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
        
        {questoesFiltradas.length > 0 ? (
          questoesFiltradas.map(questao => (
            <QuestionCard 
              key={questao.id}
              dificuldade={questao.dificuldade} 
              enunciado={questao.enunciado} 
              alternativas={questao.alternativas} 
            />
          ))
        ) : (
          <p style={{ color: theme.text.body, fontStyle: 'italic' }}>
            Nenhuma questão encontrada para este filtro.
          </p>
        )}

      </div>
    </div>
  );
}