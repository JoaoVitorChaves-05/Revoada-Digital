import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../../utils/colors';

export interface CardMetricaProps {
  /** Título curto do card (ex.: "Questões resolvidas"). */
  titulo: string;
  /**
   * Valor apresentado. Pode ser string/número quando derivável ou um
   * `Placeholder` "em breve" quando o dado não é derivável nesta fase.
   */
  valor: ReactNode;
  /**
   * Indicador de variação (semanal/mensal). Opcional; nesta fase é tipicamente
   * um `Placeholder` "em breve". O card apenas renderiza o que recebe.
   */
  variacao?: ReactNode;
}

const raizStyle: CSSProperties = {
  border: `1px solid ${theme.border.card}`,
  borderRadius: 8,
  padding: '1rem',
  backgroundColor: theme.background.card,
  boxShadow: theme.shadow.card,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const tituloStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.text.subtitle,
};

const valorStyle: CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  lineHeight: 1.1,
  color: theme.text.title,
};

const variacaoStyle: CSSProperties = {
  fontSize: '0.8125rem',
  color: theme.text.body,
};

/**
 * Card genérico de apresentação de métrica, sem `fetch` (R18.1). Recebe props
 * já calculadas e apenas renderiza o que chega: o valor pode ser um texto/número
 * ou um `Placeholder`, e a variação é opcional. Estrutura semântica acessível —
 * o título é associado ao valor via `aria-labelledby`.
 */
export function CardMetrica({ titulo, valor, variacao }: CardMetricaProps) {
  const tituloId = useId();
  const valorId = useId();

  return (
    <section className="card-metrica" aria-labelledby={tituloId} style={raizStyle}>
      <h3 id={tituloId} className="card-metrica__titulo" style={tituloStyle}>
        {titulo}
      </h3>
      <div
        id={valorId}
        className="card-metrica__valor"
        aria-labelledby={`${tituloId} ${valorId}`}
        style={valorStyle}
      >
        {valor}
      </div>
      {variacao !== undefined ? (
        <div className="card-metrica__variacao" style={variacaoStyle}>
          {variacao}
        </div>
      ) : null}
    </section>
  );
}
