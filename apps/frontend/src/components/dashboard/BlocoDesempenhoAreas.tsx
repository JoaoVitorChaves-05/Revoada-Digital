import { useEffect, useState, type CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import { Placeholder } from './Placeholder';
import { sessao } from '../../utils/sessao';
import { buscarDesempenhoAreas } from '../../utils/desempenhoAreasClient';
import type { DesempenhoArea } from '../../types/desempenhoAreas.types';

// Bloco "Seu desempenho" por area (R12). Liga-se ao endpoint
// GET /dashboard/me/desempenho-areas, que retorna as 4 areas do ENEM com a
// taxa de acerto geral. Enquanto carrega ou em caso de erro, cai no
// Placeholder "em breve" preservando o layout das 4 barras.

export interface BlocoDesempenhoAreasProps {
  /** Acionado ao usar o controle "Ver estatisticas" (R12.4). */
  onVerEstatisticas: () => void;
}

// Ordem fixa de exibicao das areas (espelha a ordem retornada pelo backend).
const ORDEM_AREAS = [
  'Linguagens',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Matemática',
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
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.875rem',
  color: theme.text.subtitle,
};

const rotuloAreaPlaceholderStyle: CSSProperties = {
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

function ListaPlaceholder() {
  return (
    <Placeholder descricaoAcessivel="Desempenho por área do conhecimento estará disponível em breve.">
      <ul className="bloco-desempenho-areas__lista" style={listaStyle}>
        {ORDEM_AREAS.map((area) => (
          <li key={area} style={itemStyle}>
            <span style={rotuloAreaPlaceholderStyle}>{area}</span>
            <div
              className="bloco-desempenho-areas__barra"
              role="presentation"
              style={trilhaBarraStyle}
            />
          </li>
        ))}
      </ul>
    </Placeholder>
  );
}

export function BlocoDesempenhoAreas({ onVerEstatisticas }: BlocoDesempenhoAreasProps) {
  const [areas, setAreas] = useState<DesempenhoArea[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarDesempenhoAreas(sessao.getUserId(), sessao.getAuthToken())
      .then((dados) => {
        if (ativo) setAreas(dados);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Ordena as areas recebidas na ordem fixa de exibicao.
  const areasOrdenadas =
    areas === null
      ? null
      : ORDEM_AREAS.flatMap((nome) => {
          const dado = areas.find((a) => a.area === nome);
          return dado ? [dado] : [];
        });

  return (
    <section className="bloco-desempenho-areas" aria-label="Seu desempenho por área">
      <h2 style={tituloStyle}>Seu desempenho</h2>
      <div style={secaoStyle}>
        <div style={corpoStyle}>
          {erro || areasOrdenadas === null ? (
            <ListaPlaceholder />
          ) : (
            <ul className="bloco-desempenho-areas__lista" style={listaStyle}>
              {areasOrdenadas.map((a) => (
                <li key={a.area} style={itemStyle}>
                  <span style={rotuloAreaStyle}>
                    <span>{a.area}</span>
                    <span>
                      {a.questoesResolvidas > 0
                        ? `${a.taxaAcerto}%`
                        : 'Sem dados'}
                    </span>
                  </span>
                  <div
                    className="bloco-desempenho-areas__barra"
                    role="img"
                    aria-label={`${a.area}: ${a.taxaAcerto}% de acerto em ${a.questoesResolvidas} questões`}
                    style={trilhaBarraStyle}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${a.taxaAcerto}%`,
                        backgroundColor: theme.accent.primary,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
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