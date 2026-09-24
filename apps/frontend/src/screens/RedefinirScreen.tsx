import { useState } from 'react'

type RedefinirScreenProps = {
  onBack: () => void
}

export function RedefinirScreen({ onBack }: RedefinirScreenProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="reset-page">
      <div className="reset-card">
        <header className="reset-header">
          <button className="reset-back" type="button" onClick={onBack} aria-label="Voltar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
          </button>

          <div className="reset-brand">
            <div className="reset-brand-mark">🎓</div>
            <div className="reset-brand-name">
              <span className="brand-orange">Revoada</span>
              <span className="brand-blue">Digital</span>
            </div>
          </div>
        </header>

        <main className="reset-body">
          {!submitted ? (
            <div className="reset-box">
              <h1>Redefinição de Senha</h1>
              <p>Digite um email para recuperação de senha</p>

              <form className="reset-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
                <div className="field">
                  <label htmlFor="reset-email">Email</label>
                  <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" />
                </div>

                <button type="submit" className="reset-submit">Redefinir Senha</button>
              </form>
            </div>
          ) : (
            <div className="success-box">
              <div className="success-icon">✓</div>
              <h2>E-mail Enviado!</h2>
              <p>
                Enviamos as instruções de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada.
              </p>
              <button type="button" className="link-button reset-link" onClick={() => setSubmitted(false)}>Tentar outro e-mail</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
