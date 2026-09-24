type HomeScreenProps = {
  onCadastro: () => void
  onLogin: () => void
}

export function HomeScreen({ onCadastro, onLogin }: HomeScreenProps) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="logo-wrap" aria-label="Revoada Digital">
          <div className="logo-mark">🎓</div>
          <div className="logo-text">
            <span className="text-orange">Revoada</span>
            <span className="text-blue">Digital</span>
          </div>
        </div>

        <nav className="main-nav">
          <a href="#inicio">Início</a>
          <a href="#disciplinas">Disciplinas</a>
          <a href="#simulados">Simulados</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="header-actions">
          <button type="button" className="btn btn-link" onClick={onLogin}>Login</button>
          <button type="button" className="btn btn-primary" onClick={onCadastro}>Nova conta</button>
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
