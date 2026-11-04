import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import { Placeholder } from './Placeholder';

// Bloco "Seu desempenho" por area (R12). Nesta fase e apresentacao pura (sem
// fetch, R18.1): como GET /attempts?userId= nao retorna Question.subject, o
// desempenho por area nao e derivavel e o bloco e marcado como Placeholder
// "em breve" (R12.1). Lista as 4 areas como barras de progresso em placeholder
// (R12.2) e oferece o controle "Ver estatisticas" (R12.3) que aciona o handler
// recebido por prop (R12.4), operavel por teclado e com rotulo textual (R17.3).

export interface BlocoDesempenhoAreasProps {
  /** Acionado ao usar o controle "Ver estatisticas" (R12.4). */
  onVerEstatisticas: () => void;
}

// Areas do conhecimento do ENEM listadas no bloco (R12.2).
const AREAS = [
  'Linguagens',
  'Ciências Humanas',
  'Matemática',
  'Ciências da Natureza',
] as const;

const secaoStyle: CSSProperties = {
  backgroundColor: theme.background.card,
  border: `1px solid ${theme.border.card}`,
  borderRadius: 8,
  boxShadow: theme.shadow.card,
  padding: '1rem',
};

const tituloStyle: CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.text.title,
};

const corpoStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const listaStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const itemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const rotuloAreaStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: theme.placeholder.text,
};

const trilhaBarraStyle: CSSProperties = {
  height: 8,
  borderRadius: 999,
  backgroundColor: theme.placeholder.bg,
  border: `1px solid ${theme.placeholder.border}`,
  overflow: 'hidden',
};

const linkStyle: CSSProperties = {
  alignSelf: 'flex-start',
  background: 'none',
  border: 'none',
  padding: 0,
  color: theme.accent.primary,
  fontWeight: 600,
  textDecoration: 'underline',
  cursor: 'pointer',
};

export function BlocoDesempenhoAreas({ onVerEstatisticas }: BlocoDesempenhoAreasProps) {
  return (
    <section className="bloco-desempenho-areas" aria-label="Seu desempenho por área">
      <h2 style={tituloStyle}>Seu desempenho</h2>
      <div style={secaoStyle}>
        <div style={corpoStyle}>
          <Placeholder descricaoAcessivel="Desempenho por área do conhecimento estará disponível em breve.">
            <ul className="bloco-desempenho-areas__lista" style={listaStyle}>
              {AREAS.map((area) => (
                <li key={area} style={itemStyle}>
                  <span style={rotuloAreaStyle}>{area}</span>
                  <div
                    className="bloco-desempenho-areas__barra"
                    role="presentation"
                    style={trilhaBarraStyle}
                  />
                </li>
              ))}
            </ul>
          </Placeholder>
          <button
            type="button"
            className="bloco-desempenho-areas__ver-estatisticas"
            style={linkStyle}
            onClick={onVerEstatisticas}
          >
            Ver estatísticas
          </button>
        </div>
      </div>
    </section>
  );
}
