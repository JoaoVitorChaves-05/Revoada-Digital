import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import { Placeholder } from './Placeholder';

// Bloco "No seu radar" (R14). Componente de apresentacao puro, sem `fetch`
// (R18.1). Os dois itens — "Revisao recomendada de questoes erradas" (R14.1) e
// "Seu proximo simulado ENEM" (R14.2) — ainda nao tem dado derivavel nesta
// fase, por isso sao marcados como Placeholder "em breve". O controle "Montar
// meu simulado" (R14.3) e um botao real, operavel por teclado e com rotulo
// textual (R17.1, R17.3); como ainda nao ha destino nesta fase, aciona um
// callback opcional recebido por prop quando presente.

export interface BlocoRadarProps {
  /**
   * Handler opcional do controle "Montar meu simulado". Quando ausente, o botao
   * permanece funcional/acessivel (foco e teclado) sem efeito colateral — segue
   * o padrao dos demais blocos desta fase.
   */
  onMontarSimulado?: () => void;
}

const secaoStyle: CSSProperties = {
  backgroundColor: theme.background.card,
  border: `1px solid ${theme.border.card}`,
  borderRadius: 8,
  boxShadow: theme.shadow.card,
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const tituloStyle: CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.text.title,
};

const itensStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const itemTituloStyle: CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.text.subtitle,
};

const itemDescricaoStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  color: theme.placeholder.text,
};

const botaoStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: '0.5rem 1rem',
  borderRadius: 6,
  border: `1px solid ${theme.accent.primary}`,
  backgroundColor: theme.accent.primary,
  color: theme.background.card,
  fontWeight: 600,
  cursor: 'pointer',
};

export function BlocoRadar({ onMontarSimulado }: BlocoRadarProps) {
  return (
    <section className="bloco-radar" aria-label="No seu radar" style={secaoStyle}>
      <h2 style={tituloStyle}>No seu radar</h2>

      <div className="bloco-radar__itens" style={itensStyle}>
        <Placeholder descricaoAcessivel="Revisao recomendada de questoes erradas estara disponivel em breve.">
          <div className="bloco-radar__item">
            <h3 style={itemTituloStyle}>Revisão recomendada de questões erradas</h3>
            <p style={itemDescricaoStyle}>
              Revise as questões que você errou para reforçar os pontos fracos.
            </p>
          </div>
        </Placeholder>

        <Placeholder descricaoAcessivel="Seu proximo simulado ENEM estara disponivel em breve.">
          <div className="bloco-radar__item">
            <h3 style={itemTituloStyle}>Seu próximo simulado ENEM</h3>
            <p style={itemDescricaoStyle}>
              Acompanhe aqui a data do seu próximo simulado completo no formato ENEM.
            </p>
          </div>
        </Placeholder>
      </div>

      <button
        type="button"
        className="bloco-radar__montar-simulado"
        style={botaoStyle}
        onClick={onMontarSimulado}
      >
        Montar meu simulado
      </button>
    </section>
  );
}
