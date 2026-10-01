interface QuestionCardProps {
    dificuldade: string;
    enunciado: string;
    alternativas: string[];
}

// CORES DAS DIFICULDADES
const getDificuldadeColors = (nivel: string) => {
    switch (nivel.toLowerCase()) {
        case 'fácil': return { bg: '#dcfce7', text: '#166534' };
        case 'média': return { bg: '#f5eba2', text: '#996121' };
        case 'difícil': return { bg: '#fee2e2', text: '#b91c1c' };
        default: return { bg: '#f4f4f5', text: '#3f3f46' };
    }
};

export function QuestionCard({ dificuldade, enunciado, alternativas }: QuestionCardProps) {
    const dif_Cores = getDificuldadeColors(dificuldade);
    return (
        <div style={{
            border: '1px solid #e4e4e7',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
            }}>
            {/* CABEÇALHO COM FILTROS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    fontSize: '12px', fontWeight: 'bold',
                    color: dif_Cores.text, backgroundColor: dif_Cores.bg,
                    padding: '4px 8px', borderRadius: '16px'
                }}>
                {dificuldade}
                </span>
            </div>

            {/* ENUNCIADO */}
            <h4 style={{ margin: '8px 0', color: '#3f3f46' }}>
                {enunciado}
            </h4>

            {/* ALTERNATIVAS*/}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {alternativas.map((alternativa, index) => {
                const letra = String.fromCharCode(97 + index); 
                
                return (
                    <span key={index} style={{ fontSize: '14px', color: '#71717a' }}>
                    {letra}) {alternativa}
                    </span>
                );
                })}
            </div>
        </div>
    );
}