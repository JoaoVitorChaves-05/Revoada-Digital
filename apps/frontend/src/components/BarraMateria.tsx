import { getDificuldadeColors } from '../utils/colors';

interface BarraMateriaProps {
  nome: string;
  percentualAcerto: number; // 0..100
  acertos: number;
  totalQuestoes: number;
}

const clamp = (valor: number, min: number, max: number) =>
  Math.min(Math.max(valor, min), max);

// Cor da barra macro por faixa de percentual, reutilizando a paleta do servico.
const corDaFaixa = (percentual: number) => {
  if (percentual >= 70) return getDificuldadeColors('fácil');
  if (percentual >= 40) return getDificuldadeColors('média');
  return getDificuldadeColors('difícil');
};

export function BarraMateria({ nome, percentualAcerto, acertos, totalQuestoes }: BarraMateriaProps) {
  const largura = clamp(percentualAcerto, 0, 100);
  const cor = corDaFaixa(largura);
  const rotulo = `${nome}: ${largura}% de acerto, ${acertos} de ${totalQuestoes} questões`;

  return (
    <div className="barra-materia">
      <div className="barra-materia__topo">
        <span className="barra-materia__nome">{nome}</span>
        <span className="barra-materia__valor">
          {largura}% · {acertos}/{totalQuestoes}
        </span>
      </div>
      <div
        className="barra-materia__trilho"
        role="meter"
        aria-valuenow={largura}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={rotulo}
      >
        <div
          className="barra-materia__preenchimento"
          style={{ width: `${largura}%`, backgroundColor: cor.text }}
        />
      </div>
    </div>
  );
}