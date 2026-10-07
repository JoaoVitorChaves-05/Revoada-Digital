import { useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { VerifyEmailScreen } from './VerifyEmailScreen'
import ComunidadePostScreen from './screens/comunidadepostscreen'
import Mensagens from './screens/chatscreen'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'Comunidade' | 'mensagens'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('revoada-authenticated') === 'true')
  const login = () => {
    localStorage.setItem('revoada-authenticated', 'true')
    setIsLoggedIn(true)
    setScreen('home')
  }

  if (window.location.pathname === '/verificar-email') {
    return <VerifyEmailScreen onBack={() => { window.location.href = '/' }} />
  }
  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')} onLogin={login} />
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />
  if (screen === 'Comunidade') {
    return <ComunidadePostScreen onBack={() => setScreen('home')} isLoggedIn={isLoggedIn} onChat={() => setScreen('mensagens')} />
  }
  if (screen === 'mensagens') {
    if (!isLoggedIn) {
      return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')} onLogin={login} />
    }
    return <Mensagens onBack={() => setScreen('Comunidade')} />
  }

  return (
    <HomeScreen
      onCadastro={() => setScreen('cadastro')}
      onLogin={() => setScreen('login')}
      onComunidade={() => setScreen('Comunidade')}
      isLoggedIn={isLoggedIn}
      onChat={() => setScreen('mensagens')}
    />
  )
}

export default App
