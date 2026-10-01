import { useState } from 'react';
import './GerarSimulado.css';

export function GerarSimulado() {
  const [materia, setMateria] = useState('');
  const [dificuldade, setDificuldade] = useState('');
  const [quantidade, setQuantidade] = useState<number | string>(10);

  const handleGerar = (e: React.FormEvent) => {
    e.preventDefault();
    // No futuro, isso vai chamar a API pra gerar as questões e mudar de página
    alert(`Preparando simulado de ${materia} com ${quantidade} questões (${dificuldade})...`);
  };

  return (
    <div className="gerar-simulado-container">
      <header className="gerar-simulado-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <nav className="header-nav">
          <a href="#inicio">Início</a>
          <a href="#disciplinas">Disciplinas</a>
          <a href="#simulados" className="ativo">Simulados</a>
        </nav>
      </header>

      <main className="gerar-simulado-main">
        <div className="apresentacao">
          <h1>A sua aprovação no ENEM começa praticando.</h1>
          <p>Milhares de questões reais das provas anteriores organizadas por assuntos. Escolha a matéria e o nível de dificuldade para gerar um treino personalizado.</p>
        </div>

        <div className="configuracao-card">
          <h2>Gerar Novo Simulado</h2>
          <form onSubmit={handleGerar}>
            <div className="form-group">
              <label htmlFor="materia">Área de Conhecimento</label>
              <select 
                id="materia" 
                value={materia} 
                onChange={(e) => setMateria(e.target.value)} 
                required
              >
                <option value="" disabled>Selecione uma área...</option>
                <option value="matematica">Matemática e suas Tecnologias</option>
                <option value="natureza">Ciências da Natureza</option>
                <option value="humanas">Ciências Humanas</option>
                <option value="linguagens">Linguagens e Códigos</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dificuldade">Nível de Dificuldade</label>
              <select 
                id="dificuldade" 
                value={dificuldade} 
                onChange={(e) => setDificuldade(e.target.value)} 
                required
              >
                <option value="" disabled>Selecione a dificuldade...</option>
                <option value="1">Fácil</option>
                <option value="2">Médio</option>
                <option value="3">Difícil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantidade">Quantidade de Questões (Máx 90)</label>
              <input 
                type="number" 
                id="quantidade" 
                min="1" 
                max="90" 
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn-gerar">
              Começar a Praticar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}