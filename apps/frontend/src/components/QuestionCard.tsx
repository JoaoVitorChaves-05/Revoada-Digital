// Se precisar ajustar o caminho para '../src/utils/colors' igual fez antes, pode mudar!
import { getDificuldadeColors, theme } from '../utils/colors';

interface QuestionCardProps {
    dificuldade: string;
    enunciado: string;
    alternativas: string[];
}

export function QuestionCard({ dificuldade, enunciado, alternativas }: QuestionCardProps) {
    const dif_Cores = getDificuldadeColors(dificuldade);
    
    return (
        <div style={{
            border: `1px solid ${theme.border.card}`,
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: theme.background.card,
            boxShadow: theme.shadow.card,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {/* CABEÇALHO COM FILTROS */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                    fontSize: '12px', fontWeight: 'bold',
                    color: dif_Cores.text, backgroundColor: dif_Cores.bg,
                    padding: '4px 8px', borderRadius: '16px'
                }}>
                    {dificuldade}
                </span>
            </div>

            {/* ENUNCIADO */}
            <h4 style={{ margin: '8px 0', color: theme.text.subtitle }}>
                {enunciado}
            </h4>

            {/* ALTERNATIVAS*/}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {alternativas.map((alternativa, index) => {
                    const letra = String.fromCharCode(97 + index); 
                    
                    return (
                        <span key={index} style={{ fontSize: '14px', color: theme.text.body }}>
                            {letra}) {alternativa}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}