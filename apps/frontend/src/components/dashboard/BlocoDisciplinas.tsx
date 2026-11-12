import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import { Placeholder } from './Placeholder';

// Bloco "O que vamos estudar hoje?" (R13). Apresentacao pura (sem fetch, R18.1):
// a LISTA de disciplinas e estatica/real (R13.1), mas os NUMEROS por disciplina
// (questoes resolvidas e taxa de acerto) sao Placeholder "em breve" (R13.2),
// pois a agregacao por disciplina depende de `Question.subject`, nao retornado
// por `GET /attempts?userId=`. Cada card tem o controle "Estudar" (R13.3) e o
// bloco exibe o link "Ver disciplinas" (R13.4). Controles com rotulo textual e
// operaveis por teclado (R17.1, R17.3); cores de `colors.ts` (R16.2).

// As quatro grandes areas do ENEM — lista real/estatica nesta fase (R13.1).
const DISCIPLINAS = [
  'Linguagens',
  'Ciências Humanas',
  'Matemática',
  'Ciências da Natureza',
] as const;

export interface BlocoDisciplinasProps {
  /** Handler acionado ao estudar uma disciplina; recebe o nome da disciplina. */
  onEstudar?: (disciplina: string) => void;
  /** Handler acionado pelo link "Ver disciplinas". */
  onVerDisciplinas?: () => void;
}

const secaoStyle: CSSProperties = {
  backgroundColor: theme.background.card,
  border: `1px solid ${theme.border.card}`,
  borderRadius: 8,
  boxShadow: theme.shadow.card,
  padding: '1rem',
};

const cabecalhoStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  marginBottom: '0.75rem',
};

const tituloStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.text.title,
};

const listaStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: '0.75rem',
};

const cardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  border: `1px solid ${theme.border.card}`,
  borderRadius: 8,
  padding: '0.75rem',
  backgroundColor: theme.background.grid,
};

const nomeDisciplinaStyle: CSSProperties = {
  margin: '0 0 0.5rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: theme.text.subtitle,
};

const numerosStyle: CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  fontSize: '0.8rem',
  color: theme.placeholder.text,
};

const botaoEstudarStyle: CSSProperties = {
  flexShrink: 0,
  padding: '0.45rem 0.9rem',
  borderRadius: 6,
  border: `1px solid ${theme.accent.primary}`,
  backgroundColor: theme.accent.primary,
  color: theme.background.card,
  fontWeight: 600,
  cursor: 'pointer',
};

const linkStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '0.25rem 0.5rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: theme.accent.primary,
  textDecoration: 'underline',
  cursor: 'pointer',
};

export function BlocoDisciplinas({ onEstudar, onVerDisciplinas }: BlocoDisciplinasProps) {
  return (
    <section className="bloco-disciplinas" aria-label="O que vamos estudar hoje?" style={secaoStyle}>
      <div style={cabecalhoStyle}>
        <h2 style={tituloStyle}>INTER MELHOR TIME VLW!!</h2>
        <button
          type="button"
          className="bloco-disciplinas__ver"
          style={linkStyle}
          onClick={onVerDisciplinas}
        >
          Ver disciplinas
        </button>
      </div>

      <ul className="bloco-disciplinas__lista" style={listaStyle}>
        {DISCIPLINAS.map((disciplina) => (
          <li key={disciplina} className="bloco-disciplinas__item" style={cardStyle}>
            <div>
              <p style={nomeDisciplinaStyle}>{disciplina}</p>
              <Placeholder
                descricaoAcessivel={`Questões resolvidas e taxa de acerto em ${disciplina} estarão disponíveis em breve.`}
              >
                <span style={numerosStyle}>
                  <span>Questões resolvidas</span>
                  <span>Taxa de acerto</span>
                </span>
              </Placeholder>
            </div>
            <button
              type="button"
              className="bloco-disciplinas__estudar"
              style={botaoEstudarStyle}
              onClick={onEstudar ? () => onEstudar(disciplina) : undefined}
              aria-label={`Estudar ${disciplina}`}
            >
              Estudar
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
