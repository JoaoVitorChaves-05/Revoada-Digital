export function QuestionFilters() {
  return (
    <div style={{
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e4e4e7',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        
        {/* RÓTULO */}
        <label htmlFor="dificuldade-select" style={{ fontSize: '19px', fontWeight: 'bold', color: '#3f3f46' }}>
          Filtros
        </label>
        
        {/* MENU DE SELEÇÃOO*/}
        <select 
          id="dificuldade-select"
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #d4d4d8',
            backgroundColor: '#fff',
            color: '#3f3f46',
            fontSize: '14px',
            minWidth: '200px',
            cursor: 'pointer'
          }}
        >
          <option value="todas"> DIFICULDADE </option>
          <option value="Fácil">Fácil</option>
          <option value="Média">Média</option>
          <option value="Difícil">Difícil</option>
        </select>

      </div>
    </div>
  );
}