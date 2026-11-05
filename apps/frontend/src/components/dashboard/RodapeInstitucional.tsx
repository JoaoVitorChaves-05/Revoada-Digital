import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';

// Rodape institucional (R15). Componente de apresentacao puro (sem fetch,
// R18.1): exibe os links "Central de ajuda", "Termos de uso" e "Privacidade"
// (R15.1) como elementos <a> semanticos, naturalmente operaveis por teclado
// (R15.2 / R17.3). Os destinos reais ainda nao existem nesta fase, portanto
// usamos href="#" para manter os links focaveis e acessiveis sem navegar para
// uma rota inexistente.

interface LinkInstitucional {
  rotulo: string;
  href: string;
}

const LINKS: LinkInstitucional[] = [
  { rotulo: 'Central de ajuda', href: '#' },
  { rotulo: 'Termos de uso', href: '#' },
  { rotulo: 'Privacidade', href: '#' },
];

const rodapeStyle: CSSProperties = {
  marginTop: '1rem',
  padding: '1rem',
  borderTop: `1px solid ${theme.border.card}`,
  color: theme.text.body,
};

const navStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  alignItems: 'center',
  justifyContent: 'center',
};

const linkStyle: CSSProperties = {
  color: theme.accent.primary,
  textDecoration: 'none',
  fontWeight: 500,
};

export function RodapeInstitucional() {
  return (
    <footer className="rodape-institucional" style={rodapeStyle}>
      <nav className="rodape-institucional__nav" aria-label="Links institucionais" style={navStyle}>
        {LINKS.map(({ rotulo, href }) => (
          <a key={rotulo} className="rodape-institucional__link" href={href} style={linkStyle}>
            {rotulo}
          </a>
        ))}
      </nav>
    </footer>
  );
}
