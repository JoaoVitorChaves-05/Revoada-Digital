import { useEffect, useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen, type UsuarioLogado } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { VerificarEmailScreen } from './screens/VerificarEmailScreen'
import ComunidadePostScreen from './screens/comunidadepostscreen'
import Mensagens from './screens/chatscreen'
import PostDetalheScreen from './screens/PostDetalheScreen'
import { ResultPage } from './pages/Simulado/result_simulado.page'
import { HistoryPage } from './pages/Simulado/historico_simulados.page'
import { PainelDesempenhoPage } from './pages/PainelDesempenho.page'
import { DashboardPage } from './pages/Dashboard.page'

type Screen =
  | 'home'
  | 'cadastro'
  | 'login'
  | 'redefinir'
  | 'result'
  | 'desempenho'
  | 'dashboard'
  | 'history'
  | 'verificar-email'
  | 'comunidade'
  | 'chat'
  | 'post-detalhe'

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
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null)
  const [postSelecionado, setPostSelecionado] = useState<string | null>(null)

  const [currentAttemptId, setCurrentAttemptId] = useState<string>("769e855b-4a27-4a5b-a48c-170be35004d2") //ID de teste

  useEffect(() => setCurrentAttemptId("769e855b-4a27-4a5b-a48c-170be35004d2"), [])

  const estaLogado = usuario !== null

  if (screen === 'verificar-email') {
    return (
      <VerificarEmailScreen
        token={emailToken}
        onIrParaLogin={() => {
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/')
          }
          setScreen('login')
        }}
      />
    )
  }

  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') {
    return (
      <LoginScreen
        onBack={() => setScreen('home')}
        onForgot={() => setScreen('redefinir')}
        onLoginSuccess={(user) => {
          setUsuario(user)
          setScreen('comunidade')
        }}
      />
    )
  }
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />
  if (screen === 'history') return <HistoryPage onBack={() => setScreen('home')} />

  // --- Area logada: Comunidade / Chat / Detalhe do post ---
  if (screen === 'comunidade') {
    return (
      <ComunidadePostScreen
        isLoggedIn={estaLogado}
        userName={usuario?.full_name}
        onBack={() => setScreen('home')}
        onChat={() => setScreen('chat')}
        onViewPost={(postId: string) => { setPostSelecionado(postId); setScreen('post-detalhe') }}
      />
    )
  }

  if (screen === 'chat') {
    return <Mensagens userName={usuario?.full_name} onComunidade={() => setScreen('comunidade')} onBack={() => setScreen('comunidade')} />
  }

  if (screen === 'post-detalhe' && postSelecionado) {
    return (
      <PostDetalheScreen
        postId={postSelecionado}
        isLoggedIn={estaLogado}
        userName={usuario?.full_name}
        onBack={() => setScreen('comunidade')}
        onChat={() => setScreen('chat')}
      />
    )
  }

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