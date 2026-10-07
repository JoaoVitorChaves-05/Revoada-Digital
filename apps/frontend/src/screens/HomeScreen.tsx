import { Bell, ChevronDown, GraduationCap } from 'lucide-react'

type HomeScreenProps = {
  onCadastro: () => void
  onLogin: () => void
  onComunidade: () => void
  isLoggedIn: boolean
  onChat: () => void
}

export function HomeScreen({ onCadastro, onLogin, onComunidade, isLoggedIn, onChat }: HomeScreenProps) {
  return (
    <div className="site-shell min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-5 sm:px-10 xl:px-0">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FE7F2D]" aria-label="Revoada Digital">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#183189]">
              <GraduationCap size={20} color="#FE7F2D" strokeWidth={2} />
            </span>
            <span className="font-['Sora'] text-xl font-extrabold leading-[25px]">
              <span className="text-[#FE7F2D]">Revoada</span>
              <span className="text-[#183189]">Digital</span>
            </span>
          </button>

          <nav className="hidden h-20 items-stretch gap-7 md:flex" aria-label="Principal">
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="relative flex items-center text-sm font-extrabold leading-[19px] text-[#183189] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FE7F2D]">
              Início
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-sm bg-[#183189]" />
            </button>
            <a href="#disciplinas" className="flex items-center text-sm font-semibold leading-[19px] text-[#183189] hover:text-[#FE7F2D]">Disciplinas</a>
            <a href="#simulados" className="flex items-center text-sm font-semibold leading-[19px] text-[#183189] hover:text-[#FE7F2D]">Simulados</a>
            <button type="button" onClick={onComunidade} className="flex items-center text-sm font-semibold leading-[19px] text-[#183189] hover:text-[#FE7F2D]">Comunidade</button>
            {isLoggedIn && <button type="button" onClick={onChat} className="flex items-center text-sm font-semibold leading-[19px] text-[#183189] hover:text-[#FE7F2D]">Chat</button>}
            <a href="#faq" className="flex items-center text-sm font-semibold leading-[19px] text-[#183189] hover:text-[#FE7F2D]">FAQ</a>
          </nav>

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Notificações" className="text-[#183189]"><Bell size={18} /></button>
              <span className="h-6 w-px bg-[#E2E8F0]" />
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[11.52px] font-extrabold text-[#183189]">JL</span>
              <span className="hidden text-sm font-bold text-[#183189] sm:inline">Júlia</span>
              <ChevronDown size={14} className="text-[#64748B]" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={onLogin} className="rounded-lg px-3 py-2 text-sm font-bold text-[#183189] hover:text-[#FE7F2D]">Login</button>
              <button type="button" onClick={onCadastro} className="rounded-lg bg-[#FE7F2D] px-4 py-2 text-sm font-bold text-white hover:bg-[#e86d20]">Nova conta</button>
            </div>
          )}
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-copy">
            <h1>A sua aprovação no ENEM começa praticando.</h1>
            <p>
              Milhares de questões reais das provas anteriores organizadas por assuntos.
              Treine com estatísticas detalhadas e conquiste sua vaga na universidade dos sonhos.
            </p>

            <div className="search-box">
              <span>⌕</span>
              <input type="text" placeholder="Busque por assunto (ex: Funções Afins, Revolução Industrial)..." />
              <button type="button" className="btn btn-primary small">Buscar</button>
            </div>

            <div className="cta-row">
              <button type="button" className="btn btn-primary large" onClick={onCadastro}>Começar a Praticar Grátis</button>
              <button type="button" className="btn btn-text">▶ Ver como funciona</button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="metric-card">
              <div className="metric-head">
                <span>Meta Diária de Questões</span>
                <strong>80% Completo</strong>
              </div>
              <div className="progress-bar">
                <span />
              </div>
              <div className="metric-foot">
                <small>16 de 20 resolvidas</small>
                <strong>+150 XP</strong>
              </div>
            </div>

            <div className="mini-grid">
              <div className="mini-card">
                <span>Tempo Praticado</span>
                <strong>12h 45m</strong>
              </div>
              <div className="mini-card">
                <span>Acerto Médio</span>
                <strong>78%</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-strip">
          <div>
            <strong>45.000+</strong>
            <span>Questões Catalogadas</span>
          </div>
          <div>
            <strong>1.500+</strong>
            <span>Materiais de Estudo</span>
          </div>
          <div>
            <strong>98%</strong>
            <span>Satisfação</span>
          </div>
        </section>
      </main>
    </div>
  )
}
