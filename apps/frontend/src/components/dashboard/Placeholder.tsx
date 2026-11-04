import type { CSSProperties, ReactNode } from 'react';
import { theme } from '../../utils/colors';

export interface PlaceholderProps {
  /** Texto curto; default "em breve". */
  rotulo?: string;
  /** Rótulo acessível do que estará disponível depois. */
  descricaoAcessivel?: string;
  children?: ReactNode; // estrutura "fantasma" (ex: barras cinza)
}

// Estilo atenuado reutilizando a paleta do projeto (sem cores hardcoded).
const raizStyle: CSSProperties = {
  position: 'relative',
  opacity: 0.6,
  backgroundColor: theme.background.grid,
  border: `1px dashed ${theme.border.card}`,
  borderRadius: 8,
  padding: '0.5rem 0.75rem',
  color: theme.text.body,
};

const seloStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.button.text,
  backgroundColor: theme.button.bgActive,
  border: `1px solid ${theme.button.border}`,
  borderRadius: 999,
  padding: '0.1rem 0.5rem',
};

export function Placeholder({ rotulo = 'em breve', descricaoAcessivel, children }: PlaceholderProps) {
  return (
    <div
      className="placeholder"
      data-placeholder="true"
      aria-disabled="true"
      aria-label={descricaoAcessivel}
      style={raizStyle}
    >
      <span className="placeholder__selo" style={seloStyle}>
        {rotulo}
      </span>
      {children ? (
        <div className="placeholder__fantasma" aria-hidden="true">
          {children}
        </div>
      ) : null}
    </div>
  );
}
