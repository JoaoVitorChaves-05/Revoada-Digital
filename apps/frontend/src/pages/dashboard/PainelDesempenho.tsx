import { useEffect, useState } from 'react';
import './PainelDesempenho.css';
import { BarraMateria } from '../../components/BarraMateria';
import { MapaDefasagem } from '../../components/MapaDefasagem';
import type { RespostaDefasagem } from '../../types/desempenho.types';
import { API_BASE_URL } from '../../utils/apiBase';
import { sessao } from '../../utils/sessao';

interface PainelDesempenhoPageProps {
  onBack: () => void;
}

export function PainelDesempenho({ onBack }: PainelDesempenhoPageProps) {
  const [dados, setDados] = useState<RespostaDefasagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    const controller = new AbortController();

    async function carregar() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboard/me/defasagem?userId=${encodeURIComponent(sessao.getUserId())}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error();
        const data: RespostaDefasagem = await response.json();
        if (!data || !Array.isArray(data.materias)) throw new Error();
        if (ativo) setDados(data);
      } catch {
        if (ativo) setError('Não foi possível carregar seu desempenho.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
      controller.abort();
    };
  }, [tentativa]);

  if (loading || error || !dados || dados.materias.length === 0) {
    return (
      <div className="painel">
        <BotaoVoltar onBack={onBack} />
        <h1 className="painel__titulo">Meu desempenho</h1>
        {loading ? (
          <p className="painel__status" role="status">Carregando seu desempenho...</p>
        ) : error ? (
          <>
            <p className="painel__erro" role="alert">{error}</p>
            <button className="painel__botao" onClick={() => setTentativa((valor) => valor + 1)}>
              Tentar novamente
            </button>
          </>
        ) : (
          <p className="painel__vazio">
            Finalize um simulado para acompanhar seu desempenho por matéria e conteúdo.
          </p>
        )}
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
