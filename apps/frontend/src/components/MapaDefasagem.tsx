import { CelulaConteudo } from './CelulaConteudo';
import type { Conteudo } from '../types/desempenho.types';

interface MapaDefasagemProps {
  materia: string;
  conteudos: Conteudo[];
}

export function MapaDefasagem({ materia, conteudos }: MapaDefasagemProps) {
  if (conteudos.length === 0) {
    return (
      <p className="mapa-defasagem__vazio">
        Sem dados de conteúdo para {materia} ainda.
      </p>
    );
  }

  return (
    <ul className="mapa-defasagem" aria-label={`Mapa de defasagem de ${materia}`}>
      {conteudos.map((conteudo) => (
        <CelulaConteudo
          key={conteudo.nome}
          nome={conteudo.nome}
          percentualAcerto={conteudo.percentualAcerto}
          nivel={conteudo.nivel}
        />
      ))}
    </ul>
  );
}