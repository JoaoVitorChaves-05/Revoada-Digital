import { useState, useEffect } from 'react';
import './FazerSimulado.css';

// Interfaces para tipagem dos dados
interface Alternativa {
  id: string;
  text: string;
}

interface Questao {
  id: string;
  statement: string;
  alternatives: Alternativa[];
}

// Simulando questões que virão do seu endpoint /api/v1/questions no futuro
const mockQuestoes: Questao[] = [
  {
    id: 'q1',
    statement: "O desenvolvimento sustentável envolve o atendimento das necessidades atuais sem comprometer as gerações futuras. Qual alternativa representa uma prática alinhada a esse conceito?",
    alternatives: [
      { id: 'A', text: "O uso intensivo de combustíveis fósseis para acelerar o crescimento." },
      { id: 'B', text: "A implementação de sistemas de reciclagem e reuso na indústria." },
      { id: 'C', text: "O descarte de resíduos em rios para reduzir custos." },
      { id: 'D', text: "O desmatamento de áreas nativas para agricultura." }
    ]
  },
  {
    id: 'q2',
    statement: "Na matemática financeira, os juros compostos são calculados sobre o montante acumulado. Qual é a principal diferença em relação aos juros simples?",
    alternatives: [
      { id: 'A', text: "Juros simples crescem exponencialmente." },
      { id: 'B', text: "Juros compostos são calculados apenas sobre o capital inicial." },
      { id: 'C', text: "Juros compostos geram o efeito de 'juros sobre juros'." },
      { id: 'D', text: "Não há diferença matemática entre os dois." }
    ]
  }
];

export function FazerSimulado() {
  const [indiceQuestaoAtual, setIndiceQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [tempoSegundos, setTempoSegundos] = useState(0);

  // Cronômetro da prova
  useEffect(() => {
    const timer = setInterval(() => setTempoSegundos((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  const questaoAtual = mockQuestoes[indiceQuestaoAtual];
  const totalQuestoes = mockQuestoes.length;
  const isUltimaQuestao = indiceQuestaoAtual === totalQuestoes - 1;

  const handleSelecionarAlternativa = (alternativaId: string) => {
    setRespostas({
      ...respostas,
      [questaoAtual.id]: alternativaId
    });
  };

  const handleProxima = () => {
    if (isUltimaQuestao) {
      alert("Simulado finalizado! Enviando respostas para o servidor...");
      console.log("Respostas do aluno:", respostas);
      // Aqui no futuro chamaremos a rota POST /api/v1/simulations/:id/submit
    } else {
      setIndiceQuestaoAtual((prev) => prev + 1);
    }
  };

  const alternativaMarcada = respostas[questaoAtual.id];

  return (
    <div className="fazer-simulado-container">
      <header className="fazer-simulado-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <div className="cronometro">
          Tempo: {formatarTempo(tempoSegundos)}
        </div>
      </header>

      <main className="fazer-simulado-main">
        <div className="progresso-container">
          <span>Progresso: {indiceQuestaoAtual + 1} de {totalQuestoes}</span>
          <div className="barra-fundo">
            <div 
              className="barra-preenchimento" 
              style={{ width: `${((indiceQuestaoAtual + 1) / totalQuestoes) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="questao-card">
          <h2 className="questao-header">Questão {indiceQuestaoAtual + 1}</h2>
          <p className="questao-enunciado">{questaoAtual.statement}</p>
          
          <div className="alternativas-container">
            {questaoAtual.alternatives.map((alt) => (
              <label 
                key={alt.id} 
                className={`alternativa-item ${alternativaMarcada === alt.id ? 'selecionada' : ''}`}
              >
                <input 
                  type="radio" 
                  name={`questao-${questaoAtual.id}`} 
                  value={alt.id}
                  checked={alternativaMarcada === alt.id}
                  onChange={() => handleSelecionarAlternativa(alt.id)}
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
              disabled={!alternativaMarcada}
            >
              {isUltimaQuestao ? 'Finalizar Simulado' : 'Próxima Questão'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}