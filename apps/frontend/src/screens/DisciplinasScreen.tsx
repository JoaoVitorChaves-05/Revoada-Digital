import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { HeaderApp } from '../components/HeaderApp'
import type { DesempenhoArea } from '../types/desempenhoAreas.types'
import { buscarDesempenhoAreas } from '../utils/desempenhoAreasClient'
import { sessao } from '../utils/sessao'

const css = `
/* Tela Disciplinas — ajuste as variáveis para os tokens reais do seu Figma / CSS global */
.disciplinas-page {
  --d-blue: #1b2f8e;
  --d-orange: #f58220;
  --d-bg: #f8f9fc;
  --d-card: #ffffff;
  --d-border: #e3e7f1;
  --d-text: #111936;
  --d-muted: #5b6482;
  --d-track: #e9edf6;
  --d-chip: #eef1fb;
  --d-orange-soft: #fff1e6;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--d-bg);
  color: var(--d-text);
}

/* Header (versão logada) */
.disciplinas-page .topbar-logged {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px clamp(16px, 5vw, 75px);
  background: var(--d-card);
  border-bottom: 1px solid var(--d-border);
}

.disciplinas-page .main-nav {
  display: flex;
  gap: 28px;
}

.disciplinas-page .main-nav a {
  position: relative;
  padding: 18px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--d-blue);
  text-decoration: none;
}

.disciplinas-page .main-nav a.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -13px;
  height: 2px;
  background: var(--d-blue);
}

.disciplinas-page .header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-btn,
.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: none;
  color: var(--d-blue);
  cursor: pointer;
  font: inherit;
}

.divider-v {
  width: 1px;
  height: 24px;
  background: var(--d-border);
}

.avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--d-chip);
  font-size: 11px;
  font-weight: 700;
  color: var(--d-blue);
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--d-text);
}

/* Conteúdo */
.disciplinas-main {
  flex: 1;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 48px;
}

.disciplinas-main h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.disciplinas-sub {
  margin: 6px 0 20px;
  font-size: 13px;
  color: var(--d-muted);
}

.disciplinas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.disc-card,
.redacao-card {
  background: var(--d-card);
  border: 1px solid var(--d-border);
  border-radius: 14px;
}

.disc-card {
  padding: 16px 16px 18px;
}

.disc-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.disc-icon,
.redacao-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--d-chip);
  color: var(--d-blue);
  flex-shrink: 0;
}

.redacao-icon {
  background: var(--d-orange-soft);
  color: var(--d-orange);
}

.disc-title {
  flex: 1;
  min-width: 0;
}

.disc-title h2,
.redacao-info h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.disc-title p,
.redacao-info p {
  margin: 2px 0 0;
  font-size: 10px;
  color: var(--d-muted);
}

.badge {
  align-self: flex-start;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--d-chip);
  font-size: 9px;
  font-weight: 700;
  color: var(--d-blue);
}

.disc-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 12px;
  font-size: 10px;
  color: var(--d-muted);
}

.link-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: none;
  padding: 0;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--d-blue);
  cursor: pointer;
}

.link-action:hover {
  text-decoration: underline;
}

/* Gráficos donut */
.donut-row {
  display: flex;
  justify-content: space-around;
}

.donut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.donut-ring {
  position: relative;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
}

.donut-ring svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.donut-track,
.donut-value {
  fill: none;
  stroke-width: 4.5;
}

.donut-track {
  stroke: var(--d-track);
}

.donut-value {
  stroke: var(--d-blue);
  stroke-linecap: round;
}

.donut-ring strong {
  position: relative;
  font-size: 11px;
  font-weight: 800;
}

.donut-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--d-blue);
}

/* Redação */
.redacao-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 16px 20px;
}

.redacao-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.redacao-info h2 {
  font-size: 15px;
}

.redacao-side {
  display: flex;
  align-items: center;
  gap: 18px;
}

.redacao-media {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  min-width: 140px;
  border-radius: 10px;
  background: var(--d-chip);
}

.redacao-media span {
  font-size: 9px;
  font-weight: 700;
  color: var(--d-blue);
}

.redacao-media strong {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
}

.redacao-media small {
  font-size: 9px;
  color: var(--d-muted);
}

/* Rodapé */
.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px clamp(16px, 5vw, 75px);
  border-top: 1px solid var(--d-border);
  font-size: 10px;
  color: var(--d-muted);
}

.site-footer nav {
  display: flex;
  gap: 18px;
}

.site-footer a {
  color: inherit;
  text-decoration: none;
}

.site-footer a:hover {
  text-decoration: underline;
}

/* Foco visível */
.disciplinas-page a:focus-visible,
.disciplinas-page button:focus-visible {
  outline: 2px solid var(--d-blue);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Responsivo */
@media (max-width: 860px) {
  .disciplinas-grid {
    grid-template-columns: 1fr;
  }

  .disciplinas-page .main-nav {
    display: none; /* troque por um menu hambúrguer, se quiser */
  }

  .redacao-card,
  .redacao-side {
    flex-direction: column;
    align-items: flex-start;
  }
}
`

type Nivel = { label: string; valor: number }

type Disciplina = {
  id: string
  nome: string
  descricao: string
  resolvidas: number
  acerto: number
  niveis: Nivel[]
  icone: ReactNode
}

type DisciplinasScreenProps = {
  userName?: string
  onNavigate?: (destino: string) => void
  onEstudar?: (disciplinaId: string) => void
  onPraticarRedacao?: () => void
  onMeusResgates?: () => void
  onPerfil?: () => void
  onConfiguracoes?: () => void
  onLogout?: () => void
}

const stroke = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const IconCalculadora = (
  <svg {...stroke}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
  </svg>
)
const IconAtomo = (
  <svg {...stroke}>
    <circle cx="12" cy="12" r="1.5" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
  </svg>
)
const IconGlobo = (
  <svg {...stroke}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
)
const IconLivro = (
  <svg {...stroke}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
    <path d="M8 7h7" />
  </svg>
)
const IconLapis = (
  <svg {...stroke}>
    <path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19l-4 1Z" />
  </svg>
)
const IconSeta = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

// Metadados por area (chave = nome da area como retornado pelo backend).
const META_AREAS: Record<string, { id: string; descricao: string; icone: ReactNode }> = {
  Linguagens: {
    id: 'linguagens',
    descricao: 'Português, Literatura e línguas estrangeiras',
    icone: IconLivro,
  },
  'Ciências Humanas': {
    id: 'humanas',
    descricao: 'História, Geografia, Filosofia e Sociologia',
    icone: IconGlobo,
  },
  'Ciências da Natureza': {
    id: 'natureza',
    descricao: 'Biologia, Química e Física',
    icone: IconAtomo,
  },
  Matemática: {
    id: 'matematica',
    descricao: 'Matemática e suas Tecnologias',
    icone: IconCalculadora,
  },
}

const ORDEM_AREAS = [
  'Linguagens',
  'Ciências Humanas',
  'Ciências da Natureza',
  'Matemática',
] as const

function montarDisciplinas(areas: DesempenhoArea[]): Disciplina[] {
  const porNome = new Map(areas.map((area) => [area.area, area]))

  return ORDEM_AREAS.flatMap((nome) => {
    const meta = META_AREAS[nome]
    const dados = porNome.get(nome)
    if (!meta || !dados) {
      return []
    }

    return [{
      id: meta.id,
      nome,
      descricao: meta.descricao,
      resolvidas: dados.questoesResolvidas,
      acerto: dados.taxaAcerto,
      icone: meta.icone,
      niveis: dados.porDificuldade.map((faixa) => ({
        label: faixa.nivel,
        valor: faixa.taxaAcerto,
      })),
    }]
  })
}

function DonutChart({ valor, label }: Nivel) {
  const raio = 20
  const circunferencia = 2 * Math.PI * raio
  const preenchido = (valor / 100) * circunferencia

  return (
    <div className="donut">
      <div className="donut-ring" role="img" aria-label={`${label}: ${valor}% de acerto`}>
        <svg viewBox="0 0 48 48">
          <circle className="donut-track" cx="24" cy="24" r={raio} />
          <circle
            className="donut-value"
            cx="24"
            cy="24"
            r={raio}
            strokeDasharray={`${preenchido} ${circunferencia}`}
            transform="rotate(-90 24 24)"
          />
        </svg>
        <strong>{valor}%</strong>
      </div>
      <span className="donut-label">{label}</span>
    </div>
  )
}

export function DisciplinasScreen({ userName, onNavigate, onEstudar, onPraticarRedacao, onMeusResgates, onPerfil, onConfiguracoes, onLogout }: DisciplinasScreenProps) {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const areas = await buscarDesempenhoAreas(
        sessao.getUserId(),
        sessao.getAuthToken(),
      )
      setDisciplinas(montarDisciplinas(areas))
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : 'Erro inesperado.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregar()
  }, [])

  const semDados =
    !carregando &&
    !erro &&
    disciplinas.length > 0 &&
    disciplinas.every((disciplina) => disciplina.resolvidas === 0)

  return (
    <div className="site-shell disciplinas-page">
      <style>{css}</style>
      <HeaderApp
        ativo="Disciplinas"
        userName={userName}
        onInicio={() => onNavigate?.('inicio')}
        onDisciplinas={() => onNavigate?.('disciplinas')}
        onSimulados={() => onNavigate?.('simulados')}
        onComunidade={() => onNavigate?.('comunidade')}
        onChat={() => onNavigate?.('chat')}
        onRecompensas={() => onNavigate?.('recompensas')}
        onMeusResgates={onMeusResgates}
        onPerfil={onPerfil}
        onConfiguracoes={onConfiguracoes}
        onLogout={onLogout}
      />

      <main className="disciplinas-main">
        <h1>Disciplinas</h1>
        <p className="disciplinas-sub">
          Acompanhe seu desempenho por área e veja onde você já está forte e onde ainda pode avançar.
        </p>

        {carregando ? (
          <p className="disciplinas-sub" role="status" aria-live="polite">
            Carregando seu desempenho...
          </p>
        ) : erro ? (
          <div role="alert">
            <p className="disciplinas-sub" style={{ color: '#b91c1c', fontWeight: 600 }}>
              {erro}
            </p>
            <button type="button" className="link-action" onClick={carregar}>
              Tentar novamente {IconSeta}
            </button>
          </div>
        ) : (
          <>
            {semDados ? (
              <p className="disciplinas-sub">
                Você ainda não respondeu questões. Faça um simulado para começar a
                acompanhar seu desempenho por área. Enquanto isso, os números aparecem
                zerados.
              </p>
            ) : null}

            <div className="disciplinas-grid">
          {disciplinas.map((d) => (
            <section key={d.id} className="disc-card" aria-labelledby={`disc-${d.id}`}>
              <div className="disc-head">
                <div className="disc-icon">{d.icone}</div>
                <div className="disc-title">
                  <h2 id={`disc-${d.id}`}>{d.nome}</h2>
                  <p>{d.descricao}</p>
                </div>
              </div>

              <div className="disc-meta">
                <span>{d.resolvidas} resolvidas · {d.acerto}% de acerto</span>
                <button type="button" className="link-action" onClick={() => onEstudar?.(d.id)}>
                  Estudar {IconSeta}
                </button>
              </div>

              <div className="donut-row">
                {d.niveis.map((n) => (
                  <DonutChart key={n.label} {...n} />
                ))}
              </div>
            </section>
          ))}
            </div>
          </>
        )}

        <section className="redacao-card" aria-labelledby="redacao-titulo">
          <div className="redacao-info">
            <div className="redacao-icon">{IconLapis}</div>
            <div>
              <h2 id="redacao-titulo">Redação Nota 1000</h2>
              <p>Última nota: 860 · 4 redações enviadas</p>
            </div>
          </div>

          <div className="redacao-side">
            <div className="redacao-media">
              <span>Média ilustrativa</span>
              <strong>860</strong>
              <small>Exemplo baseado em 4 textos</small>
            </div>
            <button type="button" className="link-action" onClick={onPraticarRedacao}>
              Praticar {IconSeta}
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 RevoadaDigital. Cada passo conta na sua aprovação.</span>
        <nav>
          <a href="#ajuda">Central de ajuda</a>
          <a href="#termos">Termos de uso</a>
          <a href="#privacidade">Privacidade</a>
        </nav>
      </footer>
    </div>
  )
}
