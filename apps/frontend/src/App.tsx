import { useEffect, useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { VerifyEmailScreen } from './VerifyEmailScreen'
import ComunidadePostScreen from './screens/comunidadepostscreen'
import PostDetalheScreen from './screens/PostDetalheScreen'
import Mensagens from './screens/chatscreen'
import TesteForum from './screens/TesteForum'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'Comunidade' | 'postDetalhe' | 'mensagens' | 'testeForum'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('revoada-authenticated') === 'true')
  
  const login = () => {
    localStorage.setItem('revoada-authenticated', 'true')
    setIsLoggedIn(true)
    setScreen('home')
  }

  const handleViewPost = (postId: string) => {
    setCurrentPostId(postId)
    setScreen('postDetalhe')
  }

  if (window.location.pathname === '/verificar-email') {
    return <VerifyEmailScreen onBack={() => { window.location.href = '/' }} />
  }
  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')} onLogin={login} />
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />
  if (screen === 'Comunidade') { 
    return (
      <ComunidadePostScreen 
        onBack={() => setScreen('home')} 
        isLoggedIn={isLoggedIn} 
        onChat={() => setScreen('mensagens')}
        onViewPost={handleViewPost}
      />
    )
  }
  if (screen === 'postDetalhe' && currentPostId) {
    return (
      <PostDetalheScreen 
        postId={currentPostId}
        onBack={() => setScreen('Comunidade')}
      />
    )
  }
  if (screen === 'testeForum') { return <TesteForum /> }
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