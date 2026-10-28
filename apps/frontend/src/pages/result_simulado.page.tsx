import { useEffect, useState } from 'react';
import type { AttemptResult } from '../types/resultado_simulado.types';
import { ResultQuestionCard } from '../components/ResultQuestionCard';

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
    <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '672px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e3a8a' }}>Desempenho no Simulado</h1>
      
      <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '8px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p><strong>Status:</strong> {result.status}</p>
        <p><strong>Tempo gasto:</strong> {formatTime(result.timeSpentSeconds)}</p>
        <p><strong>Acertos:</strong> {result.correctAnswers} de {result.totalQuestions}</p>
        <p><strong>Nota Final:</strong> {result.score ?? 0}</p>
        <p><strong>Pontos Conquistados:</strong> +{result.earnedPoints ?? 0} pts</p>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1e3a8a' }}>Gabarito</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {result.questions?.map((q) => (
          <ResultQuestionCard key={q.questionId} question={q} />
        ))}
      </div>
    </div>
  );
}