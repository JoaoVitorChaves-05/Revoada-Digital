import { useState, useMemo } from 'react';
import './DashboardDiretor.css';

interface CelulaHeatmap {
  materia: string;
  topico: string;
  percentualAcerto: number;
  alunosEmAlerta: number;
}

interface RegistroTurma {
  id: string;
  turma: string;
  periodo: string;
  totalAlunos: number;
  indicadores: CelulaHeatmap[];
}

const mockDadosDiretoria: RegistroTurma[] = [
  {
    id: 't1-out',
    turma: '3º Ano A - Ensino Médio',
    periodo: 'Outubro / 2026',
    totalAlunos: 35,
    indicadores: [
      { materia: 'Matemática', topico: 'Funções e Logaritmos', percentualAcerto: 36, alunosEmAlerta: 19 },
      { materia: 'Ciências da Natureza', topico: 'Eletrodinâmica', percentualAcerto: 54, alunosEmAlerta: 11 },
      { materia: 'Ciências Humanas', topico: 'Geopolítica Contemporânea', percentualAcerto: 68, alunosEmAlerta: 6 },
      { materia: 'Linguagens', topico: 'Interpretação e Variação Linguística', percentualAcerto: 78, alunosEmAlerta: 3 }
    ]
  },
  {
    id: 't2-out',
    turma: '3º Ano B - Ensino Médio',
    periodo: 'Outubro / 2026',
    totalAlunos: 32,
    indicadores: [
      { materia: 'Matemática', topico: 'Geometria Espacial', percentualAcerto: 48, alunosEmAlerta: 13 },
      { materia: 'Ciências da Natureza', topico: 'Estequiometria e Termoquímica', percentualAcerto: 39, alunosEmAlerta: 17 },
      { materia: 'Ciências Humanas', topico: 'Brasil República', percentualAcerto: 72, alunosEmAlerta: 4 },
      { materia: 'Linguagens', topico: 'Gêneros Textuais', percentualAcerto: 75, alunosEmAlerta: 4 }
    ]
  },
  {
    id: 't3-out',
    turma: '3º Ano C - Ensino Médio',
    periodo: 'Outubro / 2026',
    totalAlunos: 34,
    indicadores: [
      { materia: 'Matemática', topico: 'Análise Combinatória', percentualAcerto: 64, alunosEmAlerta: 8 },
      { materia: 'Ciências da Natureza', topico: 'Citologia e Genética', percentualAcerto: 71, alunosEmAlerta: 5 },
      { materia: 'Ciências Humanas', topico: 'Filosofia Moderna', percentualAcerto: 81, alunosEmAlerta: 2 },
      { materia: 'Linguagens', topico: 'Literatura Modernista', percentualAcerto: 74, alunosEmAlerta: 4 }
    ]
  },
  {
    id: 't4-out',
    turma: '2º Ano A - Ensino Médio',
    periodo: 'Outubro / 2026',
    totalAlunos: 36,
    indicadores: [
      { materia: 'Matemática', topico: 'Trigonometria', percentualAcerto: 41, alunosEmAlerta: 16 },
      { materia: 'Ciências da Natureza', topico: 'Termologia e Óptica', percentualAcerto: 58, alunosEmAlerta: 10 },
      { materia: 'Ciências Humanas', topico: 'Globalização e Urbanização', percentualAcerto: 44, alunosEmAlerta: 15 },
      { materia: 'Linguagens', topico: 'Funções da Linguagem', percentualAcerto: 69, alunosEmAlerta: 7 }
    ]
  },
  {
    id: 't1-set',
    turma: '3º Ano A - Ensino Médio',
    periodo: 'Setembro / 2026',
    totalAlunos: 35,
    indicadores: [
      { materia: 'Matemática', topico: 'Funções e Logaritmos', percentualAcerto: 32, alunosEmAlerta: 21 },
      { materia: 'Ciências da Natureza', topico: 'Eletrodinâmica', percentualAcerto: 49, alunosEmAlerta: 13 },
      { materia: 'Ciências Humanas', topico: 'Geopolítica Contemporânea', percentualAcerto: 63, alunosEmAlerta: 8 },
      { materia: 'Linguagens', topico: 'Interpretação e Variação Linguística', percentualAcerto: 74, alunosEmAlerta: 5 }
    ]
  },
  {
    id: 't2-set',
    turma: '3º Ano B - Ensino Médio',
    periodo: 'Setembro / 2026',
    totalAlunos: 32,
    indicadores: [
      { materia: 'Matemática', topico: 'Geometria Espacial', percentualAcerto: 44, alunosEmAlerta: 15 },
      { materia: 'Ciências da Natureza', topico: 'Estequiometria e Termoquímica', percentualAcerto: 35, alunosEmAlerta: 19 },
      { materia: 'Ciências Humanas', topico: 'Brasil República', percentualAcerto: 67, alunosEmAlerta: 6 },
      { materia: 'Linguagens', topico: 'Gêneros Textuais', percentualAcerto: 70, alunosEmAlerta: 6 }
    ]
  }
];

const MATERIAS_PADRAO = [
  'Matemática',
  'Ciências da Natureza',
  'Ciências Humanas',
  'Linguagens'
];

export function DashboardDiretor() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('Outubro / 2026');
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('Todas');

  const periodosDisponiveis = ['Outubro / 2026', 'Setembro / 2026'];
  const turmasDisponiveis = [
    'Todas',
    '3º Ano A - Ensino Médio',
    '3º Ano B - Ensino Médio',
    '3º Ano C - Ensino Médio',
    '2º Ano A - Ensino Médio'
  ];

  const registrosFiltrados = useMemo(() => {
    return mockDadosDiretoria.filter((registro) => {
      const correspondePeriodo = registro.periodo === periodoSelecionado;
      const correspondeTurma =
        turmaSelecionada === 'Todas' || registro.turma === turmaSelecionada;
      return correspondePeriodo && correspondeTurma;
    });
  }, [periodoSelecionado, turmaSelecionada]);

  const resumoIndicadores = useMemo(() => {
    const todasCelulas = registrosFiltrados.flatMap((r) => r.indicadores);
    if (todasCelulas.length === 0) {
      return { mediaGeral: 0, totalAlertas: 0, materiaMaisCritica: '-' };
    }

    const somaAcertos = todasCelulas.reduce((acc, item) => acc + item.percentualAcerto, 0);
    const mediaGeral = Math.round(somaAcertos / todasCelulas.length);

    const totalAlertas = todasCelulas.reduce((acc, item) => acc + item.alunosEmAlerta, 0);

    const piorIndicador = [...todasCelulas].sort(
      (a, b) => a.percentualAcerto - b.percentualAcerto
    )[0];

    return {
      mediaGeral,
      totalAlertas,
      materiaMaisCritica: `${piorIndicador.materia} (${piorIndicador.percentualAcerto}%)`
    };
  }, [registrosFiltrados]);

  const obterClasseNivelCalor = (percentualAcerto: number) => {
    if (percentualAcerto < 50) return 'calor-critico';
    if (percentualAcerto < 70) return 'calor-atencao';
    return 'calor-adequado';
  };

  const obterRotuloDefasagem = (percentualAcerto: number) => {
    if (percentualAcerto < 50) return 'Defasagem Alta';
    if (percentualAcerto < 70) return 'Defasagem Média';
    return 'Defasagem Baixa';
  };

  return (
    <div className="dashboard-diretor-container">
      <header className="dashboard-topbar">
        <div className="logo-wrapper">
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <span className="perfil-badge">Visão da Diretoria</span>
      </header>

      <main className="dashboard-conteudo">
        <section className="dashboard-cabecalho-secao">
          <div>
            <h1 className="dashboard-titulo">Dashboard de Defasagem por Turma</h1>
            <p className="dashboard-subtitulo">
              Acompanhe o mapa de calor de desempenho e identifique conteúdos críticos por período.
            </p>
          </div>

          <div className="filtros-barra">
            <div className="filtro-grupo">
              <label htmlFor="select-turma" className="filtro-label">
                Turma
              </label>
              <select
                id="select-turma"
                className="filtro-select"
                value={turmaSelecionada}
                onChange={(e) => setTurmaSelecionada(e.target.value)}
              >
                {turmasDisponiveis.map((turma) => (
                  <option key={turma} value={turma}>
                    {turma === 'Todas' ? 'Todas as Turmas' : turma}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label htmlFor="select-periodo" className="filtro-label">
                Período
              </label>
              <select
                id="select-periodo"
                className="filtro-select"
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
              >
                {periodosDisponiveis.map((periodo) => (
                  <option key={periodo} value={periodo}>
                    {periodo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="kpis-grid">
          <article className="kpi-card">
            <span className="kpi-rotulo">Média Geral de Acertos</span>
            <strong className="kpi-valor">{resumoIndicadores.mediaGeral}%</strong>
            <span className="kpi-detalhe">Referente a {periodoSelecionado}</span>
          </article>

          <article className="kpi-card">
            <span className="kpi-rotulo">Ocorrências de Alerta</span>
            <strong className="kpi-valor kpi-destaque-laranja">
              {resumoIndicadores.totalAlertas}
            </strong>
            <span className="kpi-detalhe">Alunos abaixo da meta esperada</span>
          </article>

          <article className="kpi-card">
            <span className="kpi-rotulo">Ponto de Maior Atenção</span>
            <strong className="kpi-valor kpi-texto-medio">
              {resumoIndicadores.materiaMaisCritica}
            </strong>
            <span className="kpi-detalhe">Menor índice de aproveitamento</span>
          </article>
        </section>

        <section className="heatmap-secao-card">
          <div className="heatmap-topo">
            <div>
              <h2 className="secao-titulo">Mapa de Calor: Desempenho por Turma e Área</h2>
              <p className="secao-descricao">
                Quanto menor a porcentagem de acertos, maior é o nível de defasagem da turma na disciplina.
              </p>
            </div>

            <div className="heatmap-legenda">
              <span className="legenda-item">
                <i className="legenda-cor calor-critico" /> Alta Defasagem (&lt;50%)
              </span>
              <span className="legenda-item">
                <i className="legenda-cor calor-atencao" /> Média Defasagem (50%–69%)
              </span>
              <span className="legenda-item">
                <i className="legenda-cor calor-adequado" /> Baixa Defasagem (≥70%)
              </span>
            </div>
          </div>

          {registrosFiltrados.length === 0 ? (
            <div className="estado-vazio">
              Nenhum registro encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="heatmap-tabela-wrapper">
              <table className="heatmap-tabela">
                <thead>
                  <tr>
                    <th>Turma</th>
                    {MATERIAS_PADRAO.map((materia) => (
                      <th key={materia}>{materia}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((registro) => (
                    <tr key={registro.id}>
                      <td className="coluna-turma">
                        <strong>{registro.turma}</strong>
                        <span>{registro.totalAlunos} alunos</span>
                      </td>
                      {MATERIAS_PADRAO.map((materia) => {
                        const celula = registro.indicadores.find(
                          (ind) => ind.materia === materia
                        );
                        if (!celula) {
                          return <td key={materia}>-</td>;
                        }
                        return (
                          <td key={materia}>
                            <div
                              className={`heatmap-bloco ${obterClasseNivelCalor(
                                celula.percentualAcerto
                              )}`}
                            >
                              <div className="heatmap-bloco-topo">
                                <span className="heatmap-percentual">
                                  {celula.percentualAcerto}%
                                </span>
                                <span className="heatmap-tag">
                                  {obterRotuloDefasagem(celula.percentualAcerto)}
                                </span>
                              </div>
                              <p className="heatmap-topico">{celula.topico}</p>
                              <span className="heatmap-alerta">
                                {celula.alunosEmAlerta} alunos em alerta
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}