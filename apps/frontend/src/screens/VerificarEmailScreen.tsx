import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../utils/apiBase';

type VerificarEmailScreenProps = {
  token: string | null;
  onIrParaLogin: () => void;
};

const API_BASE = API_BASE_URL;

type Status = 'verificando' | 'sucesso' | 'erro';

export function VerificarEmailScreen({ token, onIrParaLogin }: VerificarEmailScreenProps) {
  const [status, setStatus] = useState<Status>('verificando');
  const [mensagem, setMensagem] = useState('Confirmando seu email...');
  // Evita chamar o endpoint duas vezes (StrictMode monta o efeito 2x em dev).
  const jaChamou = useRef(false);

  useEffect(() => {
    if (jaChamou.current) return;
    jaChamou.current = true;

    if (!token) {
      setStatus('erro');
      setMensagem('Link inválido: token ausente.');
      return;
    }

    async function confirmar() {
      try {
        const resp = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token as string)}`);
        const data = await resp.json().catch(() => null);
        if (!resp.ok) {
          throw new Error(data?.error ?? 'Não foi possível confirmar seu email.');
        }
        setStatus('sucesso');
        setMensagem(data?.message ?? 'Email confirmado com sucesso!');
      } catch (err: unknown) {
        setStatus('erro');
        setMensagem(err instanceof Error ? err.message : 'Erro inesperado ao confirmar o email.');
      }
    }

    confirmar();
  }, [token]);

  const cor = status === 'sucesso' ? '#166534' : status === 'erro' ? '#b91c1c' : '#3f3f46';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', border: '1px solid #e4e4e7', borderRadius: 12, padding: 32, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>Confirmação de email</h1>
        <p role="status" style={{ color: cor, fontSize: 16, lineHeight: 1.5, fontWeight: status === 'verificando' ? 400 : 600 }}>
          {mensagem}
        </p>

        {status === 'sucesso' && (
          <button
            onClick={onIrParaLogin}
            style={{ marginTop: 20, background: '#2563eb', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Ir para o login
          </button>
        )}

        {status === 'erro' && (
          <button
            onClick={onIrParaLogin}
            style={{ marginTop: 20, background: '#f8fafc', color: '#3f3f46', border: '1px solid #d4d4d8', padding: '12px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Voltar ao login
          </button>
        )}
      </div>
    </div>
  );
}