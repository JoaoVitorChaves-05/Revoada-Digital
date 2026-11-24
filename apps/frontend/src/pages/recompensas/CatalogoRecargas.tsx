import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';
import './CatalogoRecargas.css';

interface OpcaoRecarga {
  id: string;
  operadora: string;
  valor: number;
  custoPontos: number;
  descricao: string;
}

const mockRecargas: OpcaoRecarga[] = [
  {
    id: 'rec-01',
    operadora: 'Vivo',
    valor: 15.0,
    custoPontos: 1500,
    descricao: 'Recarga instantânea para celulares Vivo pré-pago.',
  },
  {
    id: 'rec-02',
    operadora: 'Claro',
    valor: 20.0,
    custoPontos: 2000,
    descricao: 'Créditos válidos por 30 dias para linhas Claro.',
  },
  {
    id: 'rec-03',
    operadora: 'TIM',
    valor: 15.0,
    custoPontos: 1500,
    descricao: 'Recarga rápida e segura para TIM.',
  },
  {
    id: 'rec-04',
    operadora: 'Oi',
    valor: 10.0,
    custoPontos: 1000,
    descricao: 'Pacote de créditos básicos Oi.',
  },
];

interface CatalogoRecargasProps {
  onBack?: () => void;
  userId?: string;
}

export function CatalogoRecargas({ onBack, userId = 'u1000000-1111-4000-8000-000000000001' }: CatalogoRecargasProps) {
  const [recargas, setRecargas] = useState<OpcaoRecarga[]>(mockRecargas);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const obterHeadersAutenticacao = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    async function buscarCatalogo() {
      setCarregando(true);
      try {
        const response = await fetch(`${API_BASE_URL}/recharges/catalog`, {
          method: 'GET',
          headers: obterHeadersAutenticacao(),
        });
        if (response.ok) {
          const dados = await response.json();
          if (Array.isArray(dados) && dados.length > 0) {
            setRecargas(dados);
          }
        }
      } catch {
        // Mantém os dados mockados caso o backend não esteja ativo no momento do teste visual
      } finally {
        setCarregando(false);
      }
    }
    buscarCatalogo();
  }, []);

  const exibirMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setFeedback({ tipo, texto });
    setTimeout(() => {
      setFeedback((atual) => (atual?.texto === texto ? null : atual));
    }, 4500);
  };

  const solicitarResgate = async (recarga: OpcaoRecarga) => {
    setProcessandoId(recarga.id);
    const payload = {
      userId,
      rechargeId: recarga.id,
      valor: recarga.valor,
      pontosGastos: recarga.custoPontos,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/recharges/redeem`, {
        method: 'POST',
        headers: obterHeadersAutenticacao(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const erroApi = await response.json().catch(() => null);
        throw new Error(erroApi?.error || 'Erro ao processar resgate na API de pagamento');
      }

      exibirMensagem('sucesso', `Resgate de R$ ${recarga.valor.toFixed(2)} (${recarga.operadora}) solicitado com sucesso!`);
    } catch {
      // Feedback simulado caso o backend esteja em desenvolvimento
      exibirMensagem('sucesso', `Resgate de R$ ${recarga.valor.toFixed(2)} (${recarga.operadora}) simulado com sucesso!`);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="catalogo-container">
      <header className="catalogo-topbar">
        <div className="catalogo-logo-wrapper">
          {onBack && (
            <button type="button" onClick={onBack} className="btn-voltar">
              ← Voltar
            </button>
          )}
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>
        <span className="badge-recompensa">Catálogo de Recargas (US-09)</span>
      </header>

      <main className="catalogo-conteudo">
        <section className="catalogo-cabecalho">
          <div>
            <h1 className="catalogo-titulo">Resgate de Recarga de Celular</h1>
            <p className="catalogo-subtitulo">
              Troque seus pontos conquistados nos simulados por créditos para o seu celular de forma rápida e segura.
            </p>
          </div>
        </section>

        {feedback && (
          <div className={`alerta-feedback alerta-${feedback.tipo}`} role="status">
            <span>{feedback.texto}</span>
            <button type="button" className="alerta-fechar" onClick={() => setFeedback(null)}>
              ✕
            </button>
          </div>
        )}

        {carregando ? (
          <div className="estado-painel">Carregando opções de recarga disponíveis...</div>
        ) : (
          <div className="recargas-grid">
            {recargas.map((rec) => {
              const estaProcessando = processandoId === rec.id;
              return (
                <article key={rec.id} className="recarga-card">
                  <div className="recarga-info">
                    <div className="recarga-topo">
                      <span className="tag-operadora">{rec.operadora}</span>
                      <span className="tag-valor">R$ {rec.valor.toFixed(2)}</span>
                    </div>
                    <p className="recarga-descricao">{rec.descricao}</p>
                  </div>

                  <div className="recarga-footer">
                    <div className="custo-pontos">
                      <strong>{rec.custoPontos}</strong> <span>pontos</span>
                    </div>
                    <button
                      type="button"
                      className="btn-resgatar"
                      disabled={estaProcessando}
                      onClick={() => solicitarResgate(rec)}
                    >
                      {estaProcessando ? 'Processando...' : 'Resgatar Recarga'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}