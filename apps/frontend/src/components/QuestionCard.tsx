export function QuestionCard() {
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
      {/* CABEÇALHO COM ETIQUETAS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '16px' }}>
          Matemática
        </span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '16px' }}>
          Difícil
        </span>
      </div>

      {/* ENUNCIADO */}
      <h4 style={{ margin: '8px 0', color: '#3f3f46' }}>
        Qual é o valor de X na equação 2x + 4 = 10?
      </h4>

      {/* ALTERNATIVAS*/}
      <p style={{ margin: 0, fontSize: '14px', color: '#71717a' }}>
        Alternativas: A) 1, B) 2, C) 3, D) 4
      </p>
    </div>
  );
}