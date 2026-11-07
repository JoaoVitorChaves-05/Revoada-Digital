import { useState } from 'react';
import iconContainer from './icons/icon-container.png';
import { API_BASE_URL } from '../utils/apiBase';

type CadastroScreenProps = {
  onBack: () => void;
};

const API_BASE = API_BASE_URL;

type Status = 'idle' | 'enviando' | 'sucesso' | 'erro';

export function CadastroScreen({ onBack }: CadastroScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('1');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem(null);

    // Validacoes de cliente (o backend tambem valida)
    if (email !== confirmEmail) {
      setStatus('erro');
      setMensagem('Os emails nao coincidem.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('erro');
      setMensagem('As senhas nao coincidem.');
      return;
    }

    setStatus('enviando');
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          cpf,
          rg,
          password,
          profileType: 'STUDENT',
          school,
          year: Number(year),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detalhe =
          typeof data?.details === 'string'
            ? data.details
            : Array.isArray(data?.details)
              ? data.details.map((d: { message: string }) => d.message).join('; ')
              : data?.error ?? 'Nao foi possivel concluir o cadastro.';
        throw new Error(detalhe);
      }

      setStatus('sucesso');
      setMensagem('Cadastro realizado com sucesso! Aguardando aprovacao.');
    } catch (err: unknown) {
      setStatus('erro');
      setMensagem(err instanceof Error ? err.message : 'Erro inesperado.');
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
            <h1>Faça seu cadastro</h1>
            <p>Faça login ou registre-se para começar a estudar ainda hoje</p>

            <form className="cadastro-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="nome">Nome Completo</label>
                <input id="nome" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="confirm-email">Confirmar email</label>
                <input id="confirm-email" type="email" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="cpf">CPF (apenas números)</label>
                <input id="cpf" type="text" inputMode="numeric" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="rg">RG (apenas números)</label>
                <input id="rg" type="text" inputMode="numeric" value={rg} onChange={(e) => setRg(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="escola">Escola</label>
                <input id="escola" type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Nome da escola cadastrada" required />
              </div>
              <div className="field">
                <label htmlFor="serie">Série</label>
                <select id="serie" value={year} onChange={(e) => setYear(e.target.value)} required>
                  <option value="1">1º ano</option>
                  <option value="2">2º ano</option>
                  <option value="3">3º ano</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="senha">Criar senha</label>
                <input id="senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="confirm-senha">Repetir Senha</label>
                <input id="confirm-senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              {mensagem && (
                <p
                  role="status"
                  style={{ color: status === 'sucesso' ? '#166534' : '#b91c1c', fontWeight: 600 }}
                >
                  {mensagem}
                </p>
              )}

              <button type="submit" className="cadastro-submit" disabled={status === 'enviando'}>
                {status === 'enviando' ? 'Enviando...' : 'Criar Conta'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}