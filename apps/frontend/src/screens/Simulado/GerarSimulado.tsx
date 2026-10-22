import { useState } from 'react';
import './GerarSimulado.css';

type GerarSimuladoScreenProps = {  
  onHome: () => void;
  onPractice: (config: SimuladoConfig) => void;
}

type SimuladoConfig ={
  subject: string;
  difficulty: number;
  quantidade: number;
};

export function GerarSimulado({ onHome, onPractice }: GerarSimuladoScreenProps) {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [quantidade, setQuantidade] = useState<number | string>(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const config: SimuladoConfig = {
      subject,
      difficulty: Number(difficulty),
      quantidade: Number(quantidade),
    };

    try {
      const res = await fetch('http://localhost:3000/simulados/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(`Falha na requisição: ${res.status}`);
      const data = await res.json();
      console.log(data);        

      onPractice(config);      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gerar-simulado-container">
      <header className="gerar-simulado-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <nav className="header-nav">
          <button type="button" className="btn btn-nav" onClick={onHome}> Início </button>

          <a href="#disciplinas">Disciplinas</a>
          <a href="#simulados" className="ativo">Simulados</a>
        </nav>
      </header>

      <main className="gerar-simulado-main">
        <div className="apresentacao">
          <h1>A sua aprovação no ENEM começa praticando.</h1>
          <p>Milhares de questões reais das provas anteriores organizadas por assuntos. Escolha a matéria e o nível de dificuldade para gerar um treino personalizado.</p>
        </div>

        <div className="configuracao-card">
          <h2>Gerar Novo Simulado</h2>
          <form onSubmit={handleGerar}>
            <div className="form-group">
              <label htmlFor="subject">Área de Conhecimento</label>
              <select 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required
              >
                <option value="" disabled>Selecione uma área...</option>
                <option value="matematica">Matemática e suas Tecnologias</option>
                <option value="natureza">Ciências da Natureza</option>
                <option value="humanas">Ciências Humanas</option>
                <option value="linguagens">Linguagens e Códigos</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Nível de Dificuldade</label>
              <select 
                id="difficulty" 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)} 
                required
              >
                <option value="" disabled>Selecione a dificuldade...</option>
                <option value="1">Fácil</option>
                <option value="2">Médio</option>
                <option value="3">Difícil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade de Questões (Máx 90)</label>
              <input 
                type="number" 
                id="quantidade" 
                min="1" 
                max="90" 
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn-gerar" /**disabled={loading}*/>
              Começar a Praticar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
