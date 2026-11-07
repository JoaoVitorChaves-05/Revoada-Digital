import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import { Placeholder } from './Placeholder';

// Bloco "Continue de onde parou" (R9). Nesta fase e apresentacao pura (sem
// fetch, R18.1): o conteudo e marcado como Placeholder "em breve" (R9.1) e o
// controle "Continuar" fica desabilitado enquanto o bloco e placeholder (R9.2).

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

const descricaoStyle: CSSProperties = {
  margin: 0,
  color: theme.placeholder.text,
};

const botaoStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '0.5rem 1rem',
  borderRadius: 6,
  border: `1px solid ${theme.placeholder.border}`,
  backgroundColor: theme.placeholder.bg,
  color: theme.placeholder.text,
  fontWeight: 600,
  cursor: 'not-allowed',
};

export function ContinueDeOndeParou() {
  return (
    <section className="continue-de-onde-parou" aria-label="Continue de onde parou">
      <h2 style={tituloStyle}>Continue de onde parou</h2>
      <Placeholder descricaoAcessivel="Retomar simulado em andamento estara disponivel em breve.">
        <div style={secaoStyle}>
          <div style={corpoStyle}>
            <p style={descricaoStyle}>Retome um simulado em andamento.</p>
            <button
              type="button"
              className="continue-de-onde-parou__botao"
              style={botaoStyle}
              disabled
              aria-disabled="true"
            >
              Continuar
            </button>
          </div>
        </div>
      </Placeholder>
    </section>
  );
}
