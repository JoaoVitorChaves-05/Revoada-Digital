import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
// CSS específico da página (layout/espaçamento/responsividade e anéis de foco).
// As cores continuam vindo de `theme` (colors.ts) via estilos inline.
import './Dashboard.css';
import { theme } from '../utils/colors';
import { sessao } from '../utils/sessao';
import { buscarAttempts } from '../utils/attemptsClient';
import { derivarMetricas } from '../utils/derivadorMetricas';
import type { MetricasDashboard } from '../types/dashboard.types';
import { Saudacao } from '../components/dashboard/Saudacao';
import { CardMetrica } from '../components/dashboard/CardMetrica';
import { GraficoFrequencia } from '../components/dashboard/GraficoFrequencia';
import { ContinueDeOndeParou } from '../components/dashboard/ContinueDeOndeParou';
import { BlocoDesempenhoAreas } from '../components/dashboard/BlocoDesempenhoAreas';
import { BlocoDisciplinas } from '../components/dashboard/BlocoDisciplinas';
import { BlocoRadar } from '../components/dashboard/BlocoRadar';
import { RodapeInstitucional } from '../components/dashboard/RodapeInstitucional';
import { Placeholder } from '../components/dashboard/Placeholder';

/**
 * Dashboard do Aluno ("Início"), página rica com `fetch` espelhando o padrão de
 * `PainelDesempenho.page.tsx` (R3). A página é a única orquestradora: obtém o
 * `userId` pelo Serviço_Sessão, delega o fetch ao Cliente_Attempts (único ponto
 * de I/O, R18.1) e deriva as métricas com funções puras do Derivador_Metricas.
 * Ela escolhe entre os estados de UI carregamento/erro/vazio/sucesso (R3.2–R3.5)
 * e distribui as `MetricasDashboard` aos componentes de bloco de apresentação.
 */

export interface DashboardPageProps {
  /** Volta para a tela anterior (padrão de navegação por `useState` de App.tsx). */
  onBack: () => void;
  /** Aciona a navegação para o painel de estatísticas/desempenho (R12.4). */
  onVerEstatisticas: () => void;
}

const containerStyle: CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '24px',
  fontFamily: 'sans-serif',
  color: theme.text.title,
};

const voltarStyle: CSSProperties = {
  background: theme.button.bgDefault,
  border: `1px solid ${theme.button.border}`,
  color: theme.button.text,
  padding: '8px 14px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
  marginBottom: 20,
};

const statusStyle: CSSProperties = {
  color: theme.text.subtitle,
  fontSize: 16,
  lineHeight: 1.5,
};

const erroStyle: CSSProperties = {
  color: '#b91c1c',
  fontWeight: 600,
};

const botaoStyle: CSSProperties = {
  marginTop: 12,
  background: theme.accent.primary,
  color: theme.background.card,
  border: 'none',
  padding: '10px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
};

const vazioStyle: CSSProperties = {
  color: theme.text.subtitle,
  fontSize: 16,
  lineHeight: 1.5,
  margin: '0 0 1rem',
};

const metricasGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
};

const colunasStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

function BotaoVoltar({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      className="dashboard__voltar"
      style={voltarStyle}
      onClick={onBack}
      aria-label="Voltar para a tela anterior"
    >
      ← Voltar
    </button>
  );
}

export function DashboardPage({ onBack, onVerEstatisticas }: DashboardPageProps) {
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [totalTentativas, setTotalTentativas] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    setError(null);
    try {
      const userId = sessao.getUserId();
      const attempts = await buscarAttempts(userId, sessao.getAuthToken());
      setTotalTentativas(attempts.length);
      setMetricas(derivarMetricas(attempts, new Date()));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return (
      <div className="dashboard" style={containerStyle}>
        <BotaoVoltar onBack={onBack} />
        <p className="dashboard__status" style={statusStyle} role="status" aria-live="polite">
          Carregando seu painel...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard" style={containerStyle}>
        <BotaoVoltar onBack={onBack} />
        <p className="dashboard__erro" style={erroStyle} role="alert">
          Erro: {error}
        </p>
        <button type="button" className="dashboard__botao" style={botaoStyle} onClick={carregar}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // A partir daqui `metricas` está sempre definido (sem erro e sem loading).
  const m = metricas as MetricasDashboard;
  const estadoVazio = totalTentativas === 0;

  // Valor da taxa de acerto: null => Estado_Vazio (R6.3) representado por Placeholder.
  const valorTaxaAcerto =
    m.taxaAcerto === null ? (
      <Placeholder descricaoAcessivel="Taxa de acerto estará disponível após o primeiro simulado." />
    ) : (
      `${Math.round(m.taxaAcerto)}%`
    );

  return (
    <div className="dashboard" style={containerStyle}>
      <BotaoVoltar onBack={onBack} />

      <Saudacao nome={sessao.getNomeAluno()} agora={new Date()} />

      {estadoVazio ? (
        <section className="dashboard__vazio" aria-label="Comece seu primeiro simulado">
          <p className="dashboard__vazio-texto" style={vazioStyle}>
            Você ainda não tem tentativas registradas. Faça seu primeiro simulado
            para começar a acompanhar suas métricas de estudo. Enquanto isso, seus
            números aparecem zerados aqui.
          </p>
        </section>
      ) : null}

      <section className="dashboard__metricas" aria-label="Métricas de estudo" style={{ marginTop: '1.5rem' }}>
        <div style={metricasGridStyle}>
          <CardMetrica titulo="Questões resolvidas" valor={m.questoesResolvidas} />
          <CardMetrica titulo="Taxa de acerto" valor={valorTaxaAcerto} />
          <CardMetrica
            titulo="Tempo de estudo"
            valor={
              <Placeholder descricaoAcessivel="Tempo de estudo estará disponível em breve." />
            }
          />
          <CardMetrica
            titulo="Sequência atual"
            valor={`${m.streakDias} ${m.streakDias === 1 ? 'dia' : 'dias'}`}
            variacao={
              <Placeholder
                rotulo="aproximada"
                descricaoAcessivel="Medida aproximada; o recorde de sequência estará disponível em breve."
              />
            }
          />
        </div>
      </section>

      <section
        className="dashboard__frequencia"
        aria-label="Frequência de estudos dos últimos 7 dias"
        style={{ marginTop: '1.5rem' }}
      >
        <GraficoFrequencia dias={m.frequencia7Dias} diasComEstudo={m.diasComEstudo} />
      </section>

      <div className="dashboard__blocos" style={{ ...colunasStyle, marginTop: '1.5rem' }}>
        <ContinueDeOndeParou />
        <BlocoDesempenhoAreas onVerEstatisticas={onVerEstatisticas} />
        <BlocoDisciplinas />
        <BlocoRadar />
      </div>

      <RodapeInstitucional />
    </div>
  );
}
