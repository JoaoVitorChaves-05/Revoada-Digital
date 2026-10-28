import { useEffect, useState } from 'react';
import type { AttemptResult } from '../types/resultado_simulado.types';
import { ResultQuestionCard } from './ResultQuestionCard';

interface ResultPageProps {
  attemptId: string;
}

export function ResultPage({ attemptId }: ResultPageProps) {
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`http://localhost:3000/attempts/${attemptId}`);
        
        if (!response.ok) {
          throw new Error('Não foi possível carregar os resultados do simulado.');
        }

        const data: AttemptResult = await response.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [attemptId]);

  if (loading) return <div className="p-5">Carregando resultados...</div>;
  if (error) return <div className="p-5 text-red-600">Erro: {error}</div>;
  if (!result) return <div className="p-5">Nenhum resultado encontrado.</div>;

  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-8 font-sans max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Desempenho no Simulado</h1>
      
      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-8">
        <p><strong>Status:</strong> {result.status}</p>
        <p><strong>Tempo gasto:</strong> {formatTime(result.timeSpentSeconds)}</p>
        <p><strong>Acertos:</strong> {result.correctAnswers} de {result.totalQuestions}</p>
        <p><strong>Nota Final:</strong> {result.score ?? 0}</p>
        <p><strong>Pontos Conquistados:</strong> +{result.earnedPoints ?? 0} pts</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Gabarito</h2>
      <div className="flex flex-col">
        {result.questions?.map((q) => (
          <ResultQuestionCard key={q.questionId} question={q} />
        ))}
      </div>
    </div>
  );
}