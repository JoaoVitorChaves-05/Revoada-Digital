import { useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { ResultPage } from './Pages/result_simulado.page' 

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  
  const [currentAttemptId, setCurrentAttemptId] = useState<string>("769e855b-4a27-4a5b-a48c-170be35004d2") //ID de teste

  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')}/>
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />

  if (screen === 'result') {
    return (
      <div>
        <button onClick={() => setScreen('home')} style={{ margin: '10px' }}>
          Voltar para Home
        </button>
        <ResultPage attemptId={currentAttemptId} />
      </div>
    )
  }

  // Tela padrão (Home)
  return <HomeScreen onCadastro={() => setScreen('cadastro')} onLogin={() => setScreen('login')} />
}

export default App