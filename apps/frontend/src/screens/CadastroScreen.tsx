import { useState } from 'react';
import iconContainer from './icons/icon-container.png';

type CadastroScreenProps = {
  onBack: () => void
  onSuccess: () => void
  onHome: () => void
}

export function CadastroScreen({ onBack, onSuccess, onHome }: CadastroScreenProps) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    cpf: '',
    password: '',
    profileType: 'ADMIN'
  });


  function HandleChange (e){
    const { name, value} = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function HandleForm (e) {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      console.log('Response status',response.status);
      if (!response.ok){
        const errorBody = await response.text().catch(() => null);
        console.error('Backend error details', errorBody);
        throw new Error('Submission failed');
      }
      const result = await response.json();
      console.log('Success:', result);
      alert('Usuário Cadastrado');
      onHome();
    }catch (error){
      console.error('Error:', error);
    }
  };

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

            <button className="return-home" type="button" onClick={onHome} aria-label="Home">
              <div className="cadastro-brand" aria-label="Revoada Digital">
                <div className="cadastro-brand-mark"><img src={iconContainer} alt="Revoada Digital" /></div>
                  <div className="cadastro-brand-name">
                      <span className="text-orange">Revoada</span>
                      <span className="text-blue">Digital</span>
                  </div>
              </div>
            </button>
          </header>

          <div className="cadastro-form-wrap">
            <h1>Faça seu cadastro</h1>
            <p>Faça login ou registre-se para começar a estudar ainda hoje</p>

            <form className="cadastro-form" onSubmit={HandleForm}>
              <div className="field">
                <label htmlFor="nome">Nome Completo</label>
                <input id="nome" name="full_name" value={formData.full_name} onChange={HandleChange} type="text" />
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
                <input id="confirm-email" name="email" value={formData.email} onChange={HandleChange} type="email" />
              </div>
              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" name="cpf" value={formData.cpf} onChange={HandleChange} type="text" />
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
                <input id="confirm-senha" name="password" value={formData.password} onChange={HandleChange} type="password" />
              </div>

              <button type="submit" className="cadastro-submit" >Criar Conta</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
