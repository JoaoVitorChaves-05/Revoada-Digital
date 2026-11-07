import { useState, useEffect } from 'react';
import './GerarSimulado.css';
import { simuladoService } from '../../services/simulado.service';

type GerarSimuladoProps = {
  userId: string;
  onIniciar: (attemptId: string) => void;
  onBack?: () => void;
};

// O value precisa bater com o nome da materia gravado nas questoes (por extenso,
// em portugues) — e esse valor que vai para /questions e /simulados/generate.
const MATERIAS = [
  { value: 'Matemática', label: 'Matemática' },
  { value: 'Língua Portuguesa', label: 'Língua Portuguesa' },
  { value: 'Literatura', label: 'Literatura' },
  { value: 'Física', label: 'Física' },
  { value: 'Química', label: 'Química' },
  { value: 'Biologia', label: 'Biologia' },
  { value: 'História', label: 'História' },
  { value: 'Geografia', label: 'Geografia' },
  { value: 'Filosofia', label: 'Filosofia' },
  { value: 'Sociologia', label: 'Sociologia' },
  { value: 'Artes', label: 'Artes' },
  { value: 'Educação Física', label: 'Educação Física' },
  { value: 'Inglês', label: 'Inglês' },
  { value: 'Espanhol', label: 'Espanhol' },
];

export function GerarSimulado({ userId, onIniciar, onBack }: GerarSimuladoProps) {
  const [materia, setMateria] = useState('');
  const [concept, setConcept] = useState('');
  const [conceitos, setConceitos] = useState<string[]>([]);
  const [carregandoConceitos, setCarregandoConceitos] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ao trocar a materia, carrega os conceitos disponiveis daquela materia.
  useEffect(() => {
    if (!materia) {
      setConceitos([]);
      setConcept('');
      return;
    }
    let ativo = true;
    setCarregandoConceitos(true);
    setConcept('');
    simuladoService
      .listarConceitos(materia)
      .then((lista) => { if (ativo) setConceitos(lista); })
      .catch(() => { if (ativo) setConceitos([]); })
      .finally(() => { if (ativo) setCarregandoConceitos(false); });
    return () => { ativo = false; };
  }, [materia]);

  async function handleGerar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const studentId = await simuladoService.getStudentId(userId);
      if (!studentId) {
        throw new Error('Apenas alunos podem gerar simulados.');
      }
      const simulado = await simuladoService.gerar(studentId, materia, concept);
      const tentativa = await simuladoService.criarTentativa(simulado.id);
      onIniciar(tentativa.id);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Não foi possível gerar o simulado.';
      setErro(
        msg.includes('insuficientes') || msg.includes('Questões')
          ? 'Não há questões suficientes para esse conceito (são necessárias 8). Tente outro.'
          : msg
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="gerar-simulado-container">
      <header className="gerar-simulado-header">
        <div className="logo-container">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <nav className="header-nav">
          {onBack && <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Voltar</a>}
          <a href="#simulados" className="ativo">Simulados</a>
        </nav>
      </header>

      <main className="gerar-simulado-main">
        <div className="apresentacao">
          <h1>A sua aprovação no ENEM começa praticando.</h1>
          <p>Escolha a matéria e o conceito para gerar um treino personalizado com 8 questões.</p>
        </div>

        <div className="configuracao-card">
          <h2>Gerar Novo Simulado</h2>
          <form onSubmit={handleGerar}>
            <div className="form-group">
              <label htmlFor="materia">Matéria</label>
              <select id="materia" value={materia} onChange={(e) => setMateria(e.target.value)} required>
                <option value="" disabled>Selecione uma matéria...</option>
                {MATERIAS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="concept">Conceito</label>
              <select
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                required
                disabled={!materia || carregandoConceitos}
              >
                <option value="" disabled>
                  {!materia
                    ? 'Escolha a matéria primeiro...'
                    : carregandoConceitos
                      ? 'Carregando conceitos...'
                      : conceitos.length === 0
                        ? 'Nenhum conceito disponível'
                        : 'Selecione um conceito...'}
                </option>
                {conceitos.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {erro && <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 12 }}>{erro}</p>}

            <button type="submit" className="btn-gerar" disabled={carregando || !concept}>
              {carregando ? 'Gerando...' : 'Começar a Praticar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
