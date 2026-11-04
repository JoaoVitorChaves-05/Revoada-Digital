import { useEffect, useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { ResultPage } from './pages/result_simulado.page'
import { PainelDesempenhoPage } from './pages/PainelDesempenho.page'
import { ChatPage } from './pages/Chat/ChatPage'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'result' | 'desempenho' | 'chat'

// Identidade de teste do chat (6=a): usuários fixos para simular as duas pontas
// na demo. Substituir pelo usuário autenticado (JWT) no Bloco B (6=b).
// IMPORTANTE: trocar pelos UUIDs reais de usuários existentes no banco local.
const CHAT_TEST_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', label: 'Usuário de teste 1' },
  { id: '00000000-0000-0000-0000-000000000002', label: 'Usuário de teste 2' },
]

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  const [currentAttemptId, setCurrentAttemptId] = useState<string>("769e855b-4a27-4a5b-a48c-170be35004d2") //ID de teste
  const [chatUserId, setChatUserId] = useState<string>(CHAT_TEST_USERS[0].id)

  useEffect(() => setCurrentAttemptId("769e855b-4a27-4a5b-a48c-170be35004d2"), [])

  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')}/>
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />

  if (screen === 'desempenho') {
    return <PainelDesempenhoPage onBack={() => setScreen('home')} />
  }

  if (screen === 'chat') {
    return (
      <ChatPage
        onBack={() => setScreen('home')}
        currentUserId={chatUserId}
        testUsers={CHAT_TEST_USERS}
        onSwitchUser={setChatUserId}
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
