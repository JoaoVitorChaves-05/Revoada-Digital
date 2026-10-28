import type { QuestionResult } from '../types/resultado_simulado.types';

interface QuestionCardProps {
  question: QuestionResult;
}

export function ResultQuestionCard({ question }: QuestionCardProps) {
  const isCorrect = question.isCorrect;
  const baseClasses = "p-4 border rounded-md mb-3";
  const colorClasses = isCorrect 
    ? "bg-green-50 border-green-200" 
    : "bg-red-50 border-red-200";

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Questão {question.questionNumber}</span>
        <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
          {isCorrect ? 'Correta' : 'Incorreta'}
        </span>
      </div>
      <div className="text-sm text-gray-800">
        <p>Sua resposta: <strong>{question.userAnswer || 'Não respondida'}</strong></p>
        <p>Resposta correta: <strong>{question.correctAnswer}</strong></p>
      </div>
    </div>
  );
}