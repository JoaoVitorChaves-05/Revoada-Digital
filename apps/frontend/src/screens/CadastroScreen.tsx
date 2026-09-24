type CadastroScreenProps = {
  onBack: () => void
}

export function CadastroScreen({ onBack }: CadastroScreenProps) {
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
              <div className="cadastro-brand-mark">🎓</div>
              <div className="cadastro-brand-name">
                <span className="brand-orange">Revoada</span>
                <span className="brand-blue">Digital</span>
              </div>
            </div>
          </header>

          <div className="cadastro-form-wrap">
            <h1>Faça seu cadastro</h1>
            <p>Faça login ou registre-se para começar a estudar ainda hoje</p>

            <form className="cadastro-form">
              <div className="field">
                <label htmlFor="nome">Nome Completo</label>
                <input id="nome" type="text" />
              </div>
              <div className="field">
                <label htmlFor="faculdade">Faculdade desejada</label>
                <input id="faculdade" type="text" />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" />
              </div>
              <div className="field">
                <label htmlFor="confirm-email">Confirmar email</label>
                <input id="confirm-email" type="email" />
              </div>
              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" type="text" />
              </div>
              <div className="field">
                <label htmlFor="telefone">Telefone</label>
                <input id="telefone" type="tel" />
              </div>
              <div className="field">
                <label htmlFor="senha">Criar senha</label>
                <input id="senha" type="password" />
              </div>
              <div className="field">
                <label htmlFor="confirm-senha">Repetir Senha</label>
                <input id="confirm-senha" type="password" />
              </div>

              <button type="submit" className="cadastro-submit">Criar Conta</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
