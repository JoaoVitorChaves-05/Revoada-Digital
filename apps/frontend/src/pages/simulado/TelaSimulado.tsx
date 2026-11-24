import { useState, useEffect } from 'react';
import './TelaSimulado.css';

interface Alternativa {
  id: string;
  text: string;
}

interface Questao {
  id: number;
  statement: string;
  alternatives: Alternativa[];
}

const mockQuestao: Questao = {
  id: 1,
  statement: "O desenvolvimento sustentável é um conceito que envolve o atendimento das necessidades atuais sem comprometer a capacidade das gerações futuras. Qual das alternativas abaixo melhor representa uma prática alinhada a esse conceito?",
  alternatives: [
    { id: 'A', text: "O uso intensivo de combustíveis fósseis para acelerar o crescimento econômico." },
    { id: 'B', text: "A substituição de fontes de energia renováveis por usinas termelétricas." },
    { id: 'C', text: "O descarte de resíduos industriais em rios para reduzir custos de produção." },
    { id: 'D', text: "A implementação de sistemas de reciclagem e reuso de materiais na indústria." },
    { id: 'E', text: "O desmatamento de áreas nativas para expansão exclusiva da agricultura." }
  ]
};

export function TelaSimulado() {
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTempoSegundos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const handleProxima = () => {
    if (!alternativaSelecionada) return;
    alert("Lógica de avançar questão entrará aqui!");
  };

  return (
    <div className="simulado-container">
      <header className="simulado-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <div className="cronometro">
          {formatarTempo(tempoSegundos)}
        </div>
      </header>

      <main className="simulado-main">
        <div className="questao-card">
          <h2 className="questao-header">Questão 1 de 90</h2>
          <p className="questao-enunciado">{mockQuestao.statement}</p>
          
          <div className="alternativas-container">
            {mockQuestao.alternatives.map((alt) => (
              <label 
                key={alt.id} 
                className={`alternativa-item ${alternativaSelecionada === alt.id ? 'selecionada' : ''}`}
              >
                <input 
                  type="radio" 
                  name="alternativa" 
                  value={alt.id}
                  checked={alternativaSelecionada === alt.id}
                  onChange={() => setAlternativaSelecionada(alt.id)}
                />
                <span className="alternativa-letra">{alt.id})</span>
                <span className="alternativa-texto">{alt.text}</span>
              </label>
            ))}
          </div>

          <div className="acoes-container">
            <button 
              className="btn-proxima" 
              onClick={handleProxima}
              disabled={!alternativaSelecionada}
            >
              Próxima
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}