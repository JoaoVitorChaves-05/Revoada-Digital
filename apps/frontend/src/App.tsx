import { useEffect, useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { VerificarEmailScreen } from './screens/VerificarEmailScreen'
import { ResultPage } from './pages/Simulado/result_simulado.page'
import { HistoryPage } from './pages/Simulado/historico_simulados.page'
import { PainelDesempenhoPage } from './pages/PainelDesempenho.page'
import { DashboardPage } from './pages/Dashboard.page'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'result' | 'desempenho' | 'dashboard' | 'history' | 'verificar-email'

// Detecta, no carregamento, se a URL e a de confirmacao de email (sem roteador).
function telaInicial(): Screen {
  if (typeof window !== 'undefined' && window.location.pathname === '/verificar-email') {
    return 'verificar-email'
  }
  return 'home'
}

function tokenDaUrl(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('token')
}

function App() {
  const [screen, setScreen] = useState<Screen>(telaInicial())
  const [emailToken] = useState<string | null>(tokenDaUrl())

  const [currentAttemptId, setCurrentAttemptId] = useState<string>("769e855b-4a27-4a5b-a48c-170be35004d2") //ID de teste

  useEffect(() => setCurrentAttemptId("769e855b-4a27-4a5b-a48c-170be35004d2"), [])

  if (screen === 'verificar-email') {
    return (
      <VerificarEmailScreen
        token={emailToken}
        onIrParaLogin={() => {
          // Limpa a URL de confirmacao e leva ao login.
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/')
          }
          setScreen('login')
        }}
      />
    )
  }

  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')}/>
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />
  if (screen === 'history') return <HistoryPage onBack={() => setScreen('home')} />

  if (screen === 'desempenho') {
    return <PainelDesempenhoPage onBack={() => setScreen('home')} />
  }

  if (screen === 'dashboard') {
    return (
      <DashboardPage
        onBack={() => setScreen('home')}
        onVerEstatisticas={() => setScreen('desempenho')}
      />
    )
  }

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