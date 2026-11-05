import iconContainer from './icons/icon-container.png';
import { useState } from 'react'

export type UsuarioLogado = {
  id: string
  email: string
  full_name: string
  profileType: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

type LoginScreenProps = {
  onBack: () => void
  onForgot: () => void
  onLoginSuccess: (user: UsuarioLogado) => void
}

// Usa VITE_API_URL (ex.: http://localhost:3000 em dev). Remove barra final
// para evitar '//auth/login'. Fallback para o backend local.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')

export function LoginScreen({ onBack, onForgot, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false)
  const [reenvioMsg, setReenvioMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    setReenvioMsg(null)
    setEmailNaoVerificado(false)
    setEnviando(true)
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await resp.json().catch(() => null)
      if (!resp.ok) {
        if (resp.status === 403 && data?.code === 'EMAIL_NOT_VERIFIED') {
          setEmailNaoVerificado(true)
          throw new Error(data?.message ?? 'Confirme seu email antes de entrar.')
        }
        throw new Error(data?.message ?? 'Email ou senha inválidos.')
      }
      // Login sem JWT: guarda o usuario logado localmente.
      localStorage.setItem('usuarioLogado', JSON.stringify(data.user))
      onLoginSuccess(data.user)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleReenviar() {
    setReenvioMsg('Enviando...')
    try {
      await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setReenvioMsg('Se houver uma conta pendente para este email, um novo link foi enviado.')
    } catch {
      setReenvioMsg('Não foi possível reenviar agora.')
    }
  }

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
              <div className="login-brand-mark"><img src={iconContainer} alt="Revoada Digital" /></div>
              <div className="login-brand-name">
                <span className="text-orange">Revoada</span>
                <span className="text-blue">Digital</span>
              </div>
            </div>
          </header>

          <div className="login-box">
            <h1>Acesse a plataforma</h1>
            <p>Faça login ou registre-se para começar a estudar ainda hoje</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" required />
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
                    required
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

              {erro && (
                <p role="alert" style={{ color: '#b91c1c', fontWeight: 600 }}>{erro}</p>
              )}
              {emailNaoVerificado && (
                <p style={{ fontSize: 14 }}>
                  <button type="button" className="link-button" onClick={handleReenviar}>
                    Reenviar email de confirmação
                  </button>
                </p>
              )}
              {reenvioMsg && <p style={{ color: '#166534', fontSize: 13 }}>{reenvioMsg}</p>}

              <button type="submit" className="login-submit" disabled={enviando}>
                {enviando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}