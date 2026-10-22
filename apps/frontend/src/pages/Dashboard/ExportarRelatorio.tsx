import { useState } from 'react';
import './ExportarRelatorio.css';

export interface DadosDefasagemTurma {
  id: string;
  turma: string;
  materiaCritica: string;
  topicoDefasagem: string;
  mediaAcertos: number;
  alunosEmAlerta: number;
  nivelDefasagem: 'Alto' | 'Médio' | 'Baixo';
}

interface ExportarRelatorioProps {
  dados?: DadosDefasagemTurma[];
  periodo?: string;
}

const mockDadosDefasagem: DadosDefasagemTurma[] = [
  {
    id: '1',
    turma: '3º Ano A - Ensino Médio',
    materiaCritica: 'Matemática e suas Tecnologias',
    topicoDefasagem: 'Funções Quadráticas e Logaritmos',
    mediaAcertos: 38,
    alunosEmAlerta: 18,
    nivelDefasagem: 'Alto'
  },
  {
    id: '2',
    turma: '3º Ano B - Ensino Médio',
    materiaCritica: 'Ciências da Natureza',
    topicoDefasagem: 'Eletrodinâmica e Estequiometria',
    mediaAcertos: 52,
    alunosEmAlerta: 11,
    nivelDefasagem: 'Médio'
  },
  {
    id: '3',
    turma: '3º Ano C - Ensino Médio',
    materiaCritica: 'Linguagens e Códigos',
    topicoDefasagem: 'Interpretação de Textos Literários',
    mediaAcertos: 74,
    alunosEmAlerta: 4,
    nivelDefasagem: 'Baixo'
  },
  {
    id: '4',
    turma: '2º Ano A - Ensino Médio',
    materiaCritica: 'Ciências Humanas',
    topicoDefasagem: 'Geopolítica e Globalização',
    mediaAcertos: 45,
    alunosEmAlerta: 15,
    nivelDefasagem: 'Alto'
  }
];

export function ExportarRelatorio({
  dados = mockDadosDefasagem,
  periodo = 'Outubro / 2026'
}: ExportarRelatorioProps) {
  const [exportando, setExportando] = useState<'csv' | 'pdf' | null>(null);

  const handleExportarCSV = () => {
    setExportando('csv');

    const cabecalho = [
      'Turma',
      'Matéria Crítica',
      'Tópico em Defasagem',
      'Média de Acertos (%)',
      'Alunos em Alerta',
      'Nível de Defasagem'
    ];

    const linhas = dados.map((item) => [
      `"${item.turma}"`,
      `"${item.materiaCritica}"`,
      `"${item.topicoDefasagem}"`,
      item.mediaAcertos,
      item.alunosEmAlerta,
      `"${item.nivelDefasagem}"`
    ]);

    const conteudoCSV = [
      cabecalho.join(';'),
      ...linhas.map((linha) => linha.join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + conteudoCSV], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio-defasagem-turmas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setExportando(null), 500);
  };

  const handleExportarPDF = () => {
    setExportando('pdf');

    const janelaImpressao = window.open('', '_blank', 'width=900,height=700');
    if (!janelaImpressao) {
      alert('Permita pop-ups no navegador para gerar o relatório em PDF.');
      setExportando(null);
      return;
    }

    const dataGeracao = new Date().toLocaleDateString('pt-BR');

    const linhasTabela = dados
      .map(
        (item) => `
        <tr>
          <td>${item.turma}</td>
          <td>${item.materiaCritica}</td>
          <td>${item.topicoDefasagem}</td>
          <td>${item.mediaAcertos}%</td>
          <td>${item.alunosEmAlerta}</td>
          <td><strong>${item.nivelDefasagem}</strong></td>
        </tr>
      `
      )
      .join('');

    const htmlRelatorio = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <title>Relatório de Defasagem por Turma - Revoada Digital</title>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              color: #1F2937;
              margin: 2rem;
            }
            .cabecalho {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #1E3A8A;
              padding-bottom: 1rem;
              margin-bottom: 1.5rem;
            }
            .logo-revoada { color: #F97316; font-weight: 700; font-size: 1.4rem; }
            .logo-digital { color: #1E3A8A; font-weight: 900; font-size: 1.4rem; }
            h1 { color: #1E3A8A; font-size: 1.5rem; margin: 0 0 0.5rem 0; }
            .meta { color: #4B5563; font-size: 0.9rem; margin-bottom: 1.5rem; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1rem;
            }
            th {
              background-color: #1E3A8A;
              color: #FFFFFF;
              text-align: left;
              padding: 0.75rem;
              font-size: 0.85rem;
            }
            td {
              border-bottom: 1px solid #E5E7EB;
              padding: 0.75rem;
              font-size: 0.85rem;
            }
            tr:nth-child(even) { background-color: #F8F9FA; }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <div>
              <span class="logo-revoada">Revoada</span>
              <span class="logo-digital">Digital</span>
            </div>
            <span>Emitido em: ${dataGeracao}</span>
          </div>
          <h1>Relatório de Defasagem por Turma</h1>
          <div class="meta">Período de referência: <strong>${periodo}</strong> | Perfil: Diretoria</div>
          <table>
            <thead>
              <tr>
                <th>Turma</th>
                <th>Matéria Crítica</th>
                <th>Tópico em Defasagem</th>
                <th>Média de Acertos</th>
                <th>Alunos em Alerta</th>
                <th>Nível de Defasagem</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>
        </body>
      </html>
    `;

    janelaImpressao.document.open();
    janelaImpressao.document.write(htmlRelatorio);
    janelaImpressao.document.close();
    janelaImpressao.focus();

    setTimeout(() => {
      janelaImpressao.print();
      setExportando(null);
    }, 300);
  };

  return (
    <section className="exportacao-card">
      <div className="exportacao-info">
        <h2 className="exportacao-titulo">Exportar Relatório de Defasagem</h2>
        <p className="exportacao-descricao">
          Baixe os indicadores consolidados por turma ({periodo}) em formato de planilha ou documento para impressão.
        </p>
      </div>

      <div className="exportacao-botoes">
        <button
          type="button"
          className="btn-exportar btn-csv"
          onClick={handleExportarCSV}
          disabled={exportando !== null || dados.length === 0}
        >
          {exportando === 'csv' ? 'Gerando CSV...' : 'Exportar CSV'}
        </button>

        <button
          type="button"
          className="btn-exportar btn-pdf"
          onClick={handleExportarPDF}
          disabled={exportando !== null || dados.length === 0}
        >
          {exportando === 'pdf' ? 'Gerando PDF...' : 'Exportar PDF'}
        </button>
      </div>
    </section>
  );
}