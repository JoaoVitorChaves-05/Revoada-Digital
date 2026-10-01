interface QuestionCardProps {
    materia: string;
    dificuldade: string;
    enunciado: string;
    alternativas: string[];
}

export function QuestionCard({ materia, dificuldade, enunciado, alternativas }: QuestionCardProps) {
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
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '16px' }}>
                {materia}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '16px' }}>
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
                // String.fromCharCode(97 + index) transforma 0 em 'a', 1 em 'b', etc.
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