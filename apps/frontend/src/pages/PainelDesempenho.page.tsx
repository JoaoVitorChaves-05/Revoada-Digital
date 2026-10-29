import { useEffect, useState } from 'react';
import './PainelDesempenho.css';
import { BarraMateria } from '../components/BarraMateria';
import { MapaDefasagem } from '../components/MapaDefasagem';
import type { RespostaDefasagem } from '../types/desempenho.types';

interface PainelDesempenhoPageProps {
  onBack: () => void;
}

// TODO(CHA-30): extrair a URL base para import.meta.env em iteracao futura.
const URL_BASE_API = 'http://localhost:3000';

export function PainelDesempenhoPage({ onBack }: PainelDesempenhoPageProps) {
  const [dados, setDados] = useState<RespostaDefasagem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function carregarDefasagem() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${URL_BASE_API}/dashboard/me/defasagem`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar seu desempenho.');
      }
      const data: RespostaDefasagem = await response.json();
      setDados(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDefasagem();
  }, []);

  if (loading) {
    return (
      <div className="painel">
        <BotaoVoltar onBack={onBack} />
        <p className="painel__status">Carregando seu desempenho...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="painel">
        <BotaoVoltar onBack={onBack} />
        <p className="painel__erro">Erro: {error}</p>
        <button className="painel__botao" onClick={carregarDefasagem}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dados || dados.materias.length === 0) {
    return (
      <div className="painel">
        <BotaoVoltar onBack={onBack} />
        <h1 className="painel__titulo">Meu desempenho</h1>
        <p className="painel__vazio">
          Você ainda não tem dados de desempenho. Faça seu primeiro simulado para
          começar a acompanhar seu progresso por matéria e descobrir onde reforçar.
        </p>
      </div>
    );
  }

  return (
    <div className="painel">
      <BotaoVoltar onBack={onBack} />
      <h1 className="painel__titulo">Meu desempenho</h1>

      {dados.materias.map((m) => (
        <section className="painel__materia" key={m.materia} aria-label={`Desempenho em ${m.materia}`}>
          <BarraMateria
            nome={m.materia}
            percentualAcerto={m.percentualAcerto}
            acertos={m.acertos}
            totalQuestoes={m.totalQuestoes}
          />
          <h2 className="painel__subtitulo">Mapa de defasagem · {m.materia}</h2>
          <MapaDefasagem materia={m.materia} conteudos={m.mapaDefasagem} />
        </section>
      ))}
    </div>
  );
}

function BotaoVoltar({ onBack }: { onBack: () => void }) {
  return (
    <button className="painel__voltar" onClick={onBack} aria-label="Voltar para a tela anterior">
      ← Voltar
    </button>
  );
}