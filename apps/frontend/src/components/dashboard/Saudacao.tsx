import type { CSSProperties } from 'react';
import { theme } from '../../utils/colors';
import { Placeholder } from './Placeholder';

export interface SaudacaoProps {
  /** Nome do aluno; quando `null`, renderiza o Placeholder "em breve" no lugar do nome (R4.2). */
  nome: string | null;
  /** Data atual do dispositivo, usada para exibir a data local formatada em pt-BR (R4.3). */
  agora: Date;
}

// Formata a data local do dispositivo em pt-BR (ex.: "segunda-feira, 5 de maio de 2025").
function formatarDataPtBR(agora: Date): string {
  return agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const raizStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const tituloStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  flexWrap: 'wrap',
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.text.title,
};

const dataStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  color: theme.text.body,
  textTransform: 'capitalize',
};

export function Saudacao({ nome, agora }: SaudacaoProps) {
  const dataFormatada = formatarDataPtBR(agora);

  return (
    <header className="saudacao" style={raizStyle}>
      <h1 className="saudacao__titulo" style={tituloStyle}>
        {nome === null ? (
          <>
            <span>oi, profff !!,</span>
            <Placeholder descricaoAcessivel="Seu nome estará disponível em breve" />
            <span>!</span>
          </>
        ) : (
          `oi, profff !!, ${nome}!`
        )}
      </h1>
      <p className="saudacao__data" style={dataStyle}>
        {dataFormatada}
      </p>
    </header>
  );
}
