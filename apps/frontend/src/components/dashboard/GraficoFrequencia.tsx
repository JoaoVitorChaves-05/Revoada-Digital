import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import type { DiaFrequencia } from '../../types/dashboard.types';

export interface GraficoFrequenciaProps {
  /** Exatamente 7 entradas, do dia (agora-6) ate agora, em ordem cronologica (R11.2). */
  dias: DiaFrequencia[];
  /** Quantidade de dias com estudo na janela de 7 dias, para o resumo "X de 7" (R11.4). */
  diasComEstudo: number;
}

const raizStyle: CSSProperties = {
  border: `1px solid ${theme.border.card}`,
  borderRadius: 8,
  padding: '1rem',
  backgroundColor: theme.background.card,
  boxShadow: theme.shadow.card,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const tituloStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.text.subtitle,
};

const resumoStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  color: theme.text.body,
};

const barrasStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '0.5rem',
  height: 120,
};

const colunaStyle: CSSProperties = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.375rem',
  height: '100%',
};

const trilhoStyle: CSSProperties = {
  display: 'flex',
  flex: 1,
  width: '100%',
  alignItems: 'flex-end',
  justifyContent: 'center',
};

const rotuloStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: theme.text.body,
  textTransform: 'capitalize',
};

/**
 * Grafico de barras dos ultimos 7 dias de frequencia (R11). Componente de
 * apresentacao puro, sem `fetch` (R18.1): recebe os dias ja calculados e o
 * resumo `diasComEstudo`. A barra do dia atual (`ehHoje`) recebe destaque com
 * a cor primaria; dias com estudo sao preenchidos e dias sem estudo ficam
 * atenuados. Todo o grafico expoe um texto alternativo via `role="img"` +
 * `aria-label` descrevendo "X de 7 dias com estudo" (R17.4).
 */
export function GraficoFrequencia({ dias, diasComEstudo }: GraficoFrequenciaProps) {
  const descricao = `${diasComEstudo} de 7 dias com estudo`;

  // Cor de preenchimento por estado da barra:
  // - dia atual (ehHoje): destaque com a cor primaria do tema;
  // - dia com estudo: tom primario suave;
  // - dia sem estudo: tom atenuado de placeholder.
  const corDaBarra = (dia: DiaFrequencia): string => {
    if (dia.ehHoje) return theme.accent.primary;
    if (dia.estudou) return theme.accent.primarySoft;
    return theme.placeholder.bg;
  };

  // Altura relativa da barra: dias com estudo ocupam o trilho inteiro, dias
  // sem estudo exibem um tracinho base para permanecerem visiveis/atenuados.
  const alturaDaBarra = (dia: DiaFrequencia): string => (dia.estudou ? '100%' : '12%');

  return (
    <section className="grafico-frequencia" style={raizStyle}>
      <h3 className="grafico-frequencia__titulo" style={tituloStyle}>
        Frequência de estudos
      </h3>
      <p className="grafico-frequencia__resumo" style={resumoStyle}>
        {descricao}
      </p>
      <div
        className="grafico-frequencia__barras"
        role="img"
        aria-label={descricao}
        style={barrasStyle}
      >
        {dias.map((dia) => (
          <div
            key={dia.data}
            className="grafico-frequencia__coluna"
            data-dia-atual={dia.ehHoje ? 'true' : undefined}
            style={colunaStyle}
          >
            <div className="grafico-frequencia__trilho" style={trilhoStyle}>
              <div
                className="grafico-frequencia__barra"
                style={{
                  width: '100%',
                  height: alturaDaBarra(dia),
                  minHeight: 4,
                  borderRadius: 4,
                  backgroundColor: corDaBarra(dia),
                }}
              />
            </div>
            <span className="grafico-frequencia__rotulo" aria-hidden="true" style={rotuloStyle}>
              {dia.rotulo}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
