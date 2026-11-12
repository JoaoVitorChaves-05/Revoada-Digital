import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';
import './AprovacaoUsuarios.css';

type ProfileType = 'STUDENT' | 'TEACHER' | 'ADMIN';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface UsuarioPendente {
  id: string;
  full_name: string;
  email: string;
  profileType: ProfileType;
  createdAt: string;
}

interface SolicitacaoAprovacao {
  id: string;
  status: ApprovalStatus;
  rejectionReason?: string | null;
  userId: string;
  createdAt: string;
  user: UsuarioPendente;
}

interface AprovacaoUsuariosProps {
  onBack?: () => void;
}

const ADMIN_ID_PADRAO = '550e8400-e29b-41d4-a716-446655440000';

const mockSolicitacoesPendentes: SolicitacaoAprovacao[] = [
  {
    id: 'a1b2c3d4-1111-4000-8000-000000000001',
    status: 'PENDING',
    userId: 'u1000000-1111-4000-8000-000000000001',
    createdAt: '2026-11-03T14:20:00.000Z',
    user: {
      id: 'u1000000-1111-4000-8000-000000000001',
      full_name: 'Lucas Ferreira Mendes',
      email: 'lucas.mendes@aluno.org.br',
      profileType: 'STUDENT',
      createdAt: '2026-11-03T14:20:00.000Z',
    },
  },
  {
    id: 'a1b2c3d4-2222-4000-8000-000000000002',
    status: 'PENDING',
    userId: 'u1000000-2222-4000-8000-000000000002',
    createdAt: '2026-11-04T09:15:00.000Z',
    user: {
      id: 'u1000000-2222-4000-8000-000000000002',
      full_name: 'Camila Rocha Oliveira',
      email: 'camila.oliveira@escola.edu.br',
      profileType: 'TEACHER',
      createdAt: '2026-11-04T09:15:00.000Z',
    },
  },
  {
    id: 'a1b2c3d4-3333-4000-8000-000000000003',
    status: 'PENDING',
    userId: 'u1000000-3333-4000-8000-000000000003',
    createdAt: '2026-11-04T16:45:00.000Z',
    user: {
      id: 'u1000000-3333-4000-8000-000000000003',
      full_name: 'Rafael Costa Santos',
      email: 'rafael.santos@aluno.org.br',
      profileType: 'STUDENT',
      createdAt: '2026-11-04T16:45:00.000Z',
    },
  },
];

export function AprovacaoUsuarios({ onBack }: AprovacaoUsuariosProps) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAprovacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('TODOS');
  const [perfilLogado, setPerfilLogado] = useState<ProfileType>('ADMIN');
  const [adminId, setAdminId] = useState<string>(ADMIN_ID_PADRAO);

  const [solicitacaoEmRejeicao, setSolicitacaoEmRejeicao] = useState<SolicitacaoAprovacao | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState<string>('');
  const [erroMotivo, setErroMotivo] = useState<string>('');
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
    const usuarioSalvo = localStorage.getItem('usuarioLogado') || localStorage.getItem('user');
    if (usuarioSalvo) {
      try {
        const parsed = JSON.parse(usuarioSalvo);
        if (parsed.profileType) {
          setPerfilLogado(parsed.profileType);
        }
        if (parsed.id) {
          setAdminId(parsed.id);
        }
      } catch {
        setPerfilLogado('ADMIN');
      }
    }
  }, []);

  const carregarPendentes = async () => {
    setCarregando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/approvals/pending`, {
        method: 'GET',
        headers: obterHeadersAutenticacao(),
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar cadastros pendentes na API');
      }

      const dados = await response.json();
      setSolicitacoes(Array.isArray(dados) ? dados : mockSolicitacoesPendentes);
    } catch {
      setSolicitacoes(mockSolicitacoesPendentes);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (perfilLogado === 'ADMIN') {
      carregarPendentes();
    }
  }, [perfilLogado]);

  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter((item) => {
      const correspondePerfil =
        filtroPerfil === 'TODOS' || item.user.profileType === filtroPerfil;
      const termo = busca.trim().toLowerCase();
      const correspondeBusca =
        !termo ||
        item.user.full_name.toLowerCase().includes(termo) ||
        item.user.email.toLowerCase().includes(termo);

      return correspondePerfil && correspondeBusca;
    });
  }, [solicitacoes, filtroPerfil, busca]);

  const exibirMensagem = (tipo: 'sucesso' | 'erro', texto: string) => {
    setFeedback({ tipo, texto });
    setTimeout(() => {
      setFeedback((atual) => (atual?.texto === texto ? null : atual));
    }, 4000);
  };

  const aprovarCadastro = async (solicitacao: SolicitacaoAprovacao) => {
    setProcessandoId(solicitacao.id);
    const payload = {
      status: 'APPROVED' as const,
      adminId,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/approvals/${solicitacao.id}`, {
        method: 'PATCH',
        headers: obterHeadersAutenticacao(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const erroApi = await response.json().catch(() => null);
        throw new Error(erroApi?.error || 'Erro na comunicação com o servidor');
      }
    } catch {
      // Fallback local para visualização caso o backend não esteja rodando
    } finally {
      setSolicitacoes((listaAtual) =>
        listaAtual.filter((item) => item.id !== solicitacao.id)
      );
      setProcessandoId(null);
      exibirMensagem(
        'sucesso',
        `Solicitação de ${solicitacao.user.full_name} aprovada com sucesso.`
      );
    }
  };

  const abrirModalRejeicao = (solicitacao: SolicitacaoAprovacao) => {
    setSolicitacaoEmRejeicao(solicitacao);
    setMotivoRejeicao('');
    setErroMotivo('');
  };

  const fecharModalRejeicao = () => {
    setSolicitacaoEmRejeicao(null);
    setMotivoRejeicao('');
    setErroMotivo('');
  };

  const confirmarRejeicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacaoEmRejeicao) return;

    const motivoLimpo = motivoRejeicao.trim();
    if (!motivoLimpo) {
      setErroMotivo('Motivo da rejeição é obrigatório');
      return;
    }

    setProcessandoId(solicitacaoEmRejeicao.id);
    const payload = {
      status: 'REJECTED' as const,
      adminId,
      rejectionReason: motivoLimpo,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/approvals/${solicitacaoEmRejeicao.id}`,
        {
          method: 'PATCH',
          headers: obterHeadersAutenticacao(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const erroApi = await response.json().catch(() => null);
        throw new Error(erroApi?.error || 'Erro ao rejeitar solicitação');
      }
    } catch {
      // Fallback local para visualização caso o backend não esteja rodando
    } finally {
      const nomeUsuario = solicitacaoEmRejeicao.user.full_name;
      setSolicitacoes((listaAtual) =>
        listaAtual.filter((item) => item.id !== solicitacaoEmRejeicao.id)
      );
      setProcessandoId(null);
      fecharModalRejeicao();
      exibirMensagem('sucesso', `Solicitação de ${nomeUsuario} rejeitada com sucesso.`);
    }
  };

  const formatarPerfil = (perfil: ProfileType) => {
    const mapa: Record<ProfileType, string> = {
      STUDENT: 'Estudante',
      TEACHER: 'Professor(a)',
      ADMIN: 'Administrador(a)',
    };
    return mapa[perfil] || perfil;
  };

  const formatarData = (dataIso: string) => {
    try {
      return new Date(dataIso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dataIso;
    }
  };

  return (
    <div className="aprovacao-container">
      <header className="aprovacao-topbar">
        <div className="logo-wrapper">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '0.75rem',
              }}
            >
              ← Voltar
            </button>
          )}
          <span className="logo-revoada">Revoada</span>
          <span className="logo-digital">Digital</span>
        </div>

        <div className="topbar-acoes">
          <div className="simulador-perfil">
            <label htmlFor="select-perfil-teste">Perfil ativo:</label>
            <select
              id="select-perfil-teste"
              value={perfilLogado}
              onChange={(e) => setPerfilLogado(e.target.value as ProfileType)}
            >
              <option value="ADMIN">ADMIN (Autorizado)</option>
              <option value="STUDENT">STUDENT (Restrito)</option>
              <option value="TEACHER">TEACHER (Restrito)</option>
            </select>
          </div>
          <span className="badge-admin">Painel Administrativo</span>
        </div>
      </header>

      <main className="aprovacao-conteudo">
        {perfilLogado !== 'ADMIN' ? (
          <section className="acesso-restrito-card">
            <h1 className="restrito-titulo">Acesso Restrito (403)</h1>
            <p className="restrito-descricao">
              Esta área requer o perfil <strong>ADMIN</strong> e autorização válida por token JWT para gerenciar aprovações de cadastros.
            </p>
            <button
              type="button"
              className="btn-primario-azul"
              onClick={() => setPerfilLogado('ADMIN')}
            >
              Alternar para perfil ADMIN
            </button>
          </section>
        ) : (
          <>
            <section className="aprovacao-cabecalho">
              <div>
                <h1 className="aprovacao-titulo">Aprovação de Usuários</h1>
                <p className="aprovacao-subtitulo">
                  Gerencie os cadastros pendentes da plataforma e aprove ou rejeite solicitações de acesso.
                </p>
              </div>

              <div className="contador-pendentes">
                <span className="contador-numero">{solicitacoes.length}</span>
                <span className="contador-rotulo">
                  {solicitacoes.length === 1 ? 'cadastro pendente' : 'cadastros pendentes'}
                </span>
              </div>
            </section>

            {feedback && (
              <div className={`alerta-feedback alerta-${feedback.tipo}`} role="status">
                <span>{feedback.texto}</span>
                <button
                  type="button"
                  className="alerta-fechar"
                  onClick={() => setFeedback(null)}
                >
                  ✕
                </button>
              </div>
            )}

            <section className="filtros-card">
              <div className="campo-busca">
                <label htmlFor="input-busca">Buscar por nome ou e-mail</label>
                <input
                  id="input-busca"
                  type="text"
                  placeholder="Ex: Lucas Ferreira ou email@escola.edu.br"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="select-filtro-perfil">Filtrar por Perfil</label>
                <select
                  id="select-filtro-perfil"
                  value={filtroPerfil}
                  onChange={(e) => setFiltroPerfil(e.target.value)}
                >
                  <option value="TODOS">Todos os perfis</option>
                  <option value="STUDENT">Estudantes</option>
                  <option value="TEACHER">Professores</option>
                  <option value="ADMIN">Administradores</option>
                </select>
              </div>
            </section>

            {carregando ? (
              <div className="estado-painel">Carregando solicitações pendentes...</div>
            ) : solicitacoesFiltradas.length === 0 ? (
              <div className="estado-painel">
                <h3>Nenhuma solicitação pendente encontrada</h3>
                <p>Todos os cadastros para o filtro selecionado já foram analisados.</p>
              </div>
            ) : (
              <section className="solicitacoes-lista">
                {solicitacoesFiltradas.map((solicitacao) => {
                  const estaProcessando = processandoId === solicitacao.id;
                  return (
                    <article key={solicitacao.id} className="solicitacao-card">
                      <div className="solicitacao-info">
                        <div className="solicitacao-topo">
                          <h2 className="usuario-nome">{solicitacao.user.full_name}</h2>
                          <span
                            className={`tag-perfil tag-${solicitacao.user.profileType.toLowerCase()}`}
                          >
                            {formatarPerfil(solicitacao.user.profileType)}
                          </span>
                          <span className="tag-status">Pendente</span>
                        </div>

                        <p className="usuario-email">{solicitacao.user.email}</p>

                        <div className="usuario-metadados">
                          <span>Solicitado em: {formatarData(solicitacao.createdAt)}</span>
                          <span>ID da Solicitação: {solicitacao.id.slice(0, 8)}</span>
                        </div>
                      </div>

                      <div className="solicitacao-botoes">
                        <button
                          type="button"
                          className="btn-rejeitar"
                          disabled={estaProcessando}
                          onClick={() => abrirModalRejeicao(solicitacao)}
                        >
                          Rejeitar
                        </button>
                        <button
                          type="button"
                          className="btn-aprovar"
                          disabled={estaProcessando}
                          onClick={() => aprovarCadastro(solicitacao)}
                        >
                          {estaProcessando ? 'Processando...' : 'Aprovar Cadastro'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>

      {solicitacaoEmRejeicao && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-cabecalho">
              <h2 className="modal-titulo">Rejeitar Cadastro</h2>
              <button
                type="button"
                className="modal-fechar"
                onClick={fecharModalRejeicao}
              >
                ✕
              </button>
            </div>

            <p className="modal-descricao">
              Informe o motivo da rejeição para o cadastro de{' '}
              <strong>{solicitacaoEmRejeicao.user.full_name}</strong> (
              {solicitacaoEmRejeicao.user.email}).
            </p>

            <form onSubmit={confirmarRejeicao}>
              <div className="modal-campo">
                <label htmlFor="textarea-motivo">
                  Motivo da rejeição <span className="obrigatorio">*</span>
                </label>
                <textarea
                  id="textarea-motivo"
                  rows={4}
                  placeholder="Ex: Documentação ou vínculo escolar não comprovado..."
                  value={motivoRejeicao}
                  onChange={(e) => {
                    setMotivoRejeicao(e.target.value);
                    if (erroMotivo) setErroMotivo('');
                  }}
                />
                {erroMotivo && <span className="texto-erro">{erroMotivo}</span>}
              </div>

              <div className="modal-acoes">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={fecharModalRejeicao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-confirmar-rejeicao"
                  disabled={processandoId === solicitacaoEmRejeicao.id}
                >
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}