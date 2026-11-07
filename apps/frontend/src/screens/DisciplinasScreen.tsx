import iconContainer from './icons/icon-container.png'
import type { ReactNode } from 'react'

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
const IconSino = (
  <svg {...stroke}>
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)
const IconSeta = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const disciplinas: Disciplina[] = [
  {
    id: 'matematica',
    nome: 'Matemática',
    descricao: 'Matemática e suas Tecnologias',
    resolvidas: 340,
    acerto: 74,
    icone: IconCalculadora,
    niveis: [
      { label: 'Fáceis', valor: 92 },
      { label: 'Médias', valor: 78 },
      { label: 'Difíceis', valor: 64 },
    ],
  },
  {
    id: 'natureza',
    nome: 'Ciências da Natureza',
    descricao: 'Biologia, Química e Física',
    resolvidas: 290,
    acerto: 70,
    icone: IconAtomo,
    niveis: [
      { label: 'Fáceis', valor: 84 },
      { label: 'Médias', valor: 68 },
      { label: 'Difíceis', valor: 56 },
    ],
  },
  {
    id: 'humanas',
    nome: 'Ciências Humanas',
    descricao: 'História, Geografia, Filosofia e Sociologia',
    resolvidas: 302,
    acerto: 82,
    icone: IconGlobo,
    niveis: [
      { label: 'Fáceis', valor: 90 },
      { label: 'Médias', valor: 72 },
      { label: 'Difíceis', valor: 60 },
    ],
  },
  {
    id: 'linguagens',
    nome: 'Linguagens',
    descricao: 'Português, Literatura e línguas estrangeiras',
    resolvidas: 316,
    acerto: 86,
    icone: IconLivro,
    niveis: [
      { label: 'Fáceis', valor: 94 },
      { label: 'Médias', valor: 82 },
      { label: 'Difíceis', valor: 66 },
    ],
  },
]

const links = [
  { id: 'inicio', label: 'Início' },
  { id: 'disciplinas', label: 'Disciplinas' },
  { id: 'simulados', label: 'Simulados' },
  { id: 'comunidade', label: 'Comunidade' },
  { id: 'faq', label: 'FAQ' },
]

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

export function DisciplinasScreen({ onNavigate, onEstudar, onPraticarRedacao }: DisciplinasScreenProps) {
  return (
    <div className="site-shell disciplinas-page">
      <style>{css}</style>
      <header className="topbar topbar-logged">
        <div className="logo-wrap" aria-label="Revoada Digital">
          <div className="logo-mark"><img src={iconContainer} alt="Revoada Digital" /></div>
          <div className="logo-text">
            <span className="text-orange">Revoada</span>
            <span className="text-blue">Digital</span>
          </div>
        </div>

        <nav className="main-nav">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={link.id === 'disciplinas' ? 'active' : undefined}
              aria-current={link.id === 'disciplinas' ? 'page' : undefined}
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault()
                  onNavigate(link.id)
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-btn" aria-label="Notificações">{IconSino}</button>
          <span className="divider-v" />
          <button type="button" className="user-menu">
            <span className="avatar">JL</span>
            <span className="user-name">Júlia</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </header>

      <main className="disciplinas-main">
        <h1>Disciplinas</h1>
        <p className="disciplinas-sub">
          Acompanhe seu desempenho por área e veja onde você já está forte e onde ainda pode avançar.
        </p>

        <div className="disciplinas-grid">
          {disciplinas.map((d) => (
            <section key={d.id} className="disc-card" aria-labelledby={`disc-${d.id}`}>
              <div className="disc-head">
                <div className="disc-icon">{d.icone}</div>
                <div className="disc-title">
                  <h2 id={`disc-${d.id}`}>{d.nome}</h2>
                  <p>{d.descricao}</p>
                </div>
                <span className="badge">Exemplo</span>
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
