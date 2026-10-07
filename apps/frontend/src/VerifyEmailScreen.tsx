import { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function VerifyEmailScreen({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [msg, setMsg] = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) { setState('error'); setMsg('Link inválido.'); return }

    fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data.details ?? data.error ?? 'Erro')
        setState('ok'); setMsg(data.message)
      })
      .catch((e) => { setState('error'); setMsg(e.message) })
  }, [])

  return (
    <div className="reset-page">
      <div className="success-box">
        <h2>{state === 'loading' ? 'Confirmando...' : state === 'ok' ? 'E-mail confirmado!' : 'Não foi possível confirmar'}</h2>
        {state !== 'loading' && <p>{msg}</p>}
        <button type="button" className="cadastro-submit" onClick={onBack}>Voltar ao início</button>
      </div>
    </div>
  )
}