import { useState } from 'react';
import iconContainer from './icons/icon-container.png';

type CadastroScreenProps = {
  onBack: () => void
}

type ProfileType = 'STUDENT' | 'TEACHER'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const onlyDigits = (v: string) => v.replace(/\D/g, '')

const maskCpf = (v: string) =>
  onlyDigits(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const maskRg = (v: string) =>
  onlyDigits(v).slice(0, 9)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2')

const maskPhone = (v: string) =>
  onlyDigits(v).slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')

// O formato de erro do back pode variar (details como texto ou lista de issues do Zod)
function extractError(data: any): string {
  if (typeof data?.details === 'string') return data.details
  if (Array.isArray(data?.details)) return data.details.map((d: any) => d.message).join(' ')
  if (Array.isArray(data?.issues)) return data.issues.map((d: any) => d.message).join(' ')
  return data?.message ?? data?.error ?? 'Não foi possível concluir o cadastro.'
}

const initialForm = {
  profileType: 'STUDENT' as ProfileType,
  full_name: '',
  school: '',
  desiredCollege: '', // TODO: o back ainda não guarda
  email: '',
  confirmEmail: '',
  rg: '',
  cpf: '',
  phone: '', // TODO: o back ainda não guarda
  password: '', // TODO: o back ainda não guarda
  confirmPassword: '',
}

export function CadastroScreen({ onBack }: CadastroScreenProps) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set =
    (key: keyof typeof initialForm, mask?: (v: string) => string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: mask ? mask(e.target.value) : e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const email = form.email.trim().toLowerCase()

    if (email !== form.confirmEmail.trim().toLowerCase()) return setError('Os e-mails não coincidem.')
    if (form.password !== form.confirmPassword) return setError('As senhas não coincidem.')
    if (onlyDigits(form.cpf).length !== 11) return setError('CPF deve ter 11 dígitos.')
    if (onlyDigits(form.rg).length !== 9) return setError('RG deve ter 9 dígitos.')

    setLoading(true)
    try {
      // Envia apenas o que o POST /users aceita hoje.
      // TODO: quando o back aceitar, enviar também password, phone e desiredCollege.
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email,
          rg: onlyDigits(form.rg),
          cpf: onlyDigits(form.cpf),
          profileType: form.profileType,
          ...(form.school.trim() ? { school: form.school.trim() } : {}),
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(extractError(data))
      
      // Dispara o e-mail de confirmação; se falhar, o cadastro já foi feito
      await fetch(`${API_URL}/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      }).catch(() => {})

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <div className="cadastro-page">
      <div className="cadastro-card">
        <aside className="cadastro-illustration">
          <div className="cadastro-quote-wrap">
            <p className="cadastro-quote">“A educação é a arma mais poderosa que você pode usar para mudar o mundo.”</p>
            <p className="cadastro-author">— Nelson Mandela</p>
          </div>
        </aside>

        <main className="cadastro-panel">
          <header className="cadastro-header">
            <button className="cadastro-back" type="button" onClick={onBack} aria-label="Voltar">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 17L6 12L11 7" />
                <path d="M6 12H19" />
              </svg>
            </button>

            <div className="cadastro-brand" aria-label="Revoada Digital">
              <div className="cadastro-brand-mark"><img src={iconContainer} alt="Revoada Digital" /></div>
              <div className="cadastro-brand-name">
                <span className="text-orange">Revoada</span>
                <span className="text-blue">Digital</span>
              </div>
            </div>
          </header>

          <div className="cadastro-form-wrap">
            {success ? (
              <div className="success-box">
                <div className="success-icon">✓</div>
                <h2>Cadastro enviado!</h2>
                <p>Seu cadastro foi recebido e está aguardando aprovação.</p>
                <button type="button" className="cadastro-submit" onClick={onBack}>
                  Voltar
                </button>
              </div>
            ) : (
              <>
                <h1>Faça seu cadastro</h1>
                <p>Faça login ou registre-se para começar a estudar ainda hoje</p>

                <form className="cadastro-form" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="perfil">Eu sou</label>
                    <select id="perfil" value={form.profileType} onChange={set('profileType')} required>
                      <option value="STUDENT">Aluno</option>
                      <option value="TEACHER">Professor</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="nome">Nome Completo</label>
                    <input id="nome" type="text" autoComplete="name" value={form.full_name} onChange={set('full_name')} required />
                  </div>
                  <div className="field">
                    <label htmlFor="escola">Escola</label>
                    <input id="escola" type="text" value={form.school} onChange={set('school')} />
                  </div>
                  <div className="field">
                    <label htmlFor="faculdade">Faculdade desejada</label>
                    <input id="faculdade" type="text" value={form.desiredCollege} onChange={set('desiredCollege')} />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="field">
                    <label htmlFor="confirm-email">Confirmar email</label>
                    <input id="confirm-email" type="email" value={form.confirmEmail} onChange={set('confirmEmail')} required />
                  </div>
                  <div className="field">
                    <label htmlFor="rg">RG</label>
                    <input id="rg" type="text" inputMode="numeric" value={form.rg} onChange={set('rg', maskRg)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" type="text" inputMode="numeric" value={form.cpf} onChange={set('cpf', maskCpf)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="telefone">Telefone</label>
                    <input id="telefone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone', maskPhone)} />
                  </div>
                  <div className="field">
                    <label htmlFor="senha">Criar senha</label>
                    <input id="senha" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={set('password')} required />
                  </div>
                  <div className="field">
                    <label htmlFor="confirm-senha">Repetir Senha</label>
                    <input id="confirm-senha" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                  </div>

                  {error && <p className="form-error" role="alert">{error}</p>}

                  <button type="submit" className="cadastro-submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Criar Conta'}
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}