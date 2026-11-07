import { coresDoNivelDefasagem } from '../utils/colors';
import type { NivelDefasagem } from '../types/desempenho.types';

interface CelulaConteudoProps {
  nome: string;
  percentualAcerto: number; // 0..100
  nivel: NivelDefasagem;
}

const rotuloNivel: Record<NivelDefasagem, string> = {
  baixa: 'Defasagem baixa',
  'média': 'Defasagem média',
  alta: 'Defasagem alta',
};

export function CelulaConteudo({ nome, percentualAcerto, nivel }: CelulaConteudoProps) {
  const cor = coresDoNivelDefasagem(nivel);

  return (
    <li className="celula-conteudo" style={{ backgroundColor: cor.bg, color: cor.text }}>
      <span className="celula-conteudo__nome">{nome}</span>
      <span className="celula-conteudo__dados">
        {percentualAcerto}% de acerto · {rotuloNivel[nivel]}
      </span>
    </li>
  );
}