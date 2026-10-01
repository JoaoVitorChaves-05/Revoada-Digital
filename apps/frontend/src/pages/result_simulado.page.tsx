import React, { useEffect, useState } from 'react';
import type { AttemptResult } from '../types/resultado_simulado.types';

interface ResultPageProps {
  attemptId: string;
}

export function ResultPage({ attemptId }: ResultPageProps) {
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect roda assim que a página é aberta na tela
  useEffect(() => {
    async function fetchResult() {
      try {
        // Pede os dados para o backend usando o ID da tentativa
        const response = await fetch(`http://localhost:3000/attempts/${attemptId}`);
        
        if (!response.ok) {
          throw new Error('Não foi possível carregar os resultados do simulado.');
        }

        const data: AttemptResult = await response.json();
        setResult(data); // Guarda os dados recebidos na variável 'result'
      } catch (err: any) {
        setError(err.message); // Se der erro, guarda a mensagem de erro
      } finally {
        setLoading(false); // Terminou o carregamento (com sucesso ou erro)
      }
    }

    fetchResult();
  }, [attemptId]);

  // Enquanto está buscando os dados, mostra isso na tela
   if (loading) return <div style={{ padding: '20px' }}>Carregando resultados...</div>;
  
  // Se deu erro, mostra a mensagem vermelha
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Erro: {error}</div>;
  
  // Se por algum motivo não achou nada
  if (!result) return <div style={{ padding: '20px' }}>Nenhum resultado encontrado.</div>;

  // Se deu tudo certo, desenha a caixinha com os resultados na tela
  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Desempenho no Simulado</h1>
      
      <div style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <p><strong>Status do Simulado:</strong> {result.status}</p>
        <p><strong>Questões Acertadas:</strong> {result.correctAnswers} de {result.totalQuestions}</p>
        <p><strong>Nota Final:</strong> {result.score ?? 0}</p>
        <p><strong>Pontos Conquistados:</strong> +{result.earnedPoints ?? 0} pts</p>
        <p><strong>Enviado em:</strong> {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'Pendente'}</p>
      </div>
    </div>
  );
}