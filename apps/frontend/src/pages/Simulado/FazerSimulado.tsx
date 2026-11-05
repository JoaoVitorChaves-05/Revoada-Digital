import { useState, useEffect } from 'react';
import './FazerSimulado.css';
import { simuladoService, type AttemptApi } from '../../services/simulado.service';

type FazerSimuladoProps = {
  attemptId: string;
  onFinalizar: (attemptId: string) => void;
};

export function FazerSimulado({ attemptId, onFinalizar }: FazerSimuladoProps) {
  const [attempt, setAttempt] = useState<AttemptApi | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [indiceQuestaoAtual, setIndiceQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [tempoSegundos, setTempoSegundos] = useState(0);

  // Carrega a tentativa (questoes reais) ao montar
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await simuladoService.getTentativa(attemptId);
        setAttempt(dados);
      } catch (err: any) {
        setErro(err?.response?.data?.error || 'Não foi possível carregar o simulado.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [attemptId]);

  // Cronometro
  useEffect(() => {
    const timer = setInterval(() => setTempoSegundos((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const seg = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  };

  if (carregando) return <div style={{ padding: 30 }}>Carregando simulado...</div>;
  if (erro) return <div style={{ padding: 30, color: '#b91c1c' }}>Erro: {erro}</div>;
  if (!attempt || attempt.mockExam.questions.length === 0) {
    return <div style={{ padding: 30 }}>Este simulado não possui questões.</div>;
  }

  const questoes = [...attempt.mockExam.questions].sort((a, b) => a.position - b.position);
  const total = questoes.length;
  const atual = questoes[indiceQuestaoAtual].question;
  const isUltima = indiceQuestaoAtual === total - 1;
  const marcada = respostas[atual.id];

  const selecionar = (alternativaId: string) => {
    setRespostas({ ...respostas, [atual.id]: alternativaId });
  };

  async function handleProxima() {
    if (!isUltima) {
      setIndiceQuestaoAtual((p) => p + 1);
      return;
    }
    // Finalizar: envia todas as respostas
    setEnviando(true);
    setErro(null);
    try {
      const answers = questoes.map((mq) => ({
        questionId: mq.question.id,
        selectedAlternativeId: respostas[mq.question.id] ?? null,
      }));
      await simuladoService.submeter(attemptId, answers);
      onFinalizar(attemptId);
    } catch (err: any) {
      setErro(err?.response?.data?.error || 'Não foi possível enviar o simulado.');
      setEnviando(false);
    }
  }

  return (
    <div className="fazer-simulado-container">
      <header className="fazer-simulado-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <div className="cronometro">Tempo: {formatarTempo(tempoSegundos)}</div>
      </header>

      <main className="fazer-simulado-main">
        <div className="progresso-container">
          <span>Progresso: {indiceQuestaoAtual + 1} de {total}</span>
          <div className="barra-fundo">
            <div className="barra-preenchimento" style={{ width: `${((indiceQuestaoAtual + 1) / total) * 100}%` }}></div>
          </div>
        </div>

        <div className="questao-card">
          <h2 className="questao-header">Questão {indiceQuestaoAtual + 1}</h2>
          <p className="questao-enunciado">{atual.text}</p>

          <div className="alternativas-container">
            {atual.alternatives.map((alt, i) => {
              const letra = String.fromCharCode(65 + i);
              return (
                <label key={alt.id} className={`alternativa-item ${marcada === alt.id ? 'selecionada' : ''}`}>
                  <input
                    type="radio"
                    name={`questao-${atual.id}`}
                    value={alt.id}
                    checked={marcada === alt.id}
                    onChange={() => selecionar(alt.id)}
                  />
                  <span className="alternativa-letra">{letra})</span>
                  <span className="alternativa-texto">{alt.text}</span>
                </label>
              );
            })}
          </div>

          {erro && <p style={{ color: '#b91c1c', marginTop: 10 }}>{erro}</p>}

          <div className="acoes-container">
            <button className="btn-proxima" onClick={handleProxima} disabled={!marcada || enviando}>
              {enviando ? 'Enviando...' : isUltima ? 'Finalizar Simulado' : 'Próxima Questão'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}