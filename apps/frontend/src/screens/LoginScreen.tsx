import { useState } from 'react'

type LoginScreenProps = {
  onBack: () => void
  onForgot: () => void
}

export function LoginScreen({ onBack, onForgot }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="login-page">
      <div className="login-card">
        <aside className="login-visual">
          <div className="login-overlay" />
          <div className="login-content">
            <p className="login-quote">“A educação é a arma mais poderosa que você pode usar para mudar o mundo.”</p>
            <p className="login-author">— Nelson Mandela</p>
          </div>
        </aside>

        <main className="login-panel">
          <header className="login-header">
            <button className="login-back" type="button" onClick={onBack} aria-label="Voltar">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" />
              </svg>
            </button>

            <div className="login-brand">
              <div className="login-brand-mark">🎓</div>
              <div className="login-brand-name">
                <span className="brand-orange">Revoada</span>
                <span className="brand-blue">Digital</span>
              </div>
            </div>
          </header>

          <div className="login-box">
            <h1>Acesse a plataforma</h1>
            <p>Faça login ou registre-se para começar a estudar ainda hoje</p>

            <form className="login-form">
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" />
              </div>

              <div className="field">
                <label htmlFor="login-senha">Senha</label>
                <div className="password-field">
                  <input
                    id="login-senha"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-box">
                  <input type="checkbox" />
                  <span>Lembrar-me</span>
                </label>
                <button type="button" className="link-button" onClick={onForgot}>Esqueci a senha</button>
              </div>

              <button type="submit" className="login-submit">Entrar</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
