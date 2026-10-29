import { useEffect, useState } from 'react';

interface AttemptSummary {
  id: string;
  submittedAt: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface HistoryPageProps {
  onBack?: () => void;
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:3000/simulados');
        
        if (!response.ok) throw new Error('Falha ao carregar o histórico.');
        
        const data = await response.json();
        setAttempts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const filteredAttempts = attempts.filter((attempt) => {
    if (!attempt.submittedAt) return false;
    
    const attemptDate = new Date(attempt.submittedAt).getTime();
    const start = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
    const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;

    return attemptDate >= start && attemptDate <= end;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '32px' }}>
      <div style={{ width: '100%', maxWidth: '800px', padding: '0 32px', fontFamily: 'sans-serif' }}>
        
        {onBack && (
          <button 
            onClick={onBack} 
            className="btn-voltar-laranja"
            style={{ marginBottom: '24px' }}
          >
            ← Voltar para Home
          </button>
        )}

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e3a8a' }}>
          Histórico de Simulados
        </h1>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#e5e7eb', borderRadius: '8px', border: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Data Inicial</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#ffffff' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Data Final</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#ffffff' }}
            />
          </div>
        </div>

        {loading && <p>Carregando histórico...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && filteredAttempts.length === 0 && (
          <p>Nenhum simulado encontrado para este período.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAttempts.map((attempt) => (
            <div key={attempt.id} style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', margin: 0 }}>Simulado em {new Date(attempt.submittedAt).toLocaleDateString('pt-BR')}</p>
                <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0 0 0' }}>Acertos: {attempt.correctAnswers} / {attempt.totalQuestions}</p>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d' }}>
                Nota: {attempt.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}