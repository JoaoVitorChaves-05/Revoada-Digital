import type { QuestionResult } from '../types/resultado_simulado.types';

interface QuestionCardProps {
  question: QuestionResult;
}

export function ResultQuestionCard({ question }: QuestionCardProps) {
  const isCorrect = question.isCorrect;

  return (
    <div style={{
      padding: '16px',
      border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
      borderRadius: '8px',
      marginBottom: '12px',
      backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Questão {question.questionNumber}</span>
        <span style={{ fontWeight: 'bold', color: isCorrect ? '#15803d' : '#b91c1c' }}>
          {isCorrect ? 'Correta' : 'Incorreta'}
        </span>
      </div>
      <div style={{ fontSize: '14px', color: '#374151' }}>
        <p>Sua resposta: <strong>{question.userAnswer || 'Não respondida'}</strong></p>
        <p>Resposta correta: <strong>{question.correctAnswer}</strong></p>
      </div>
    </div>
  );
}