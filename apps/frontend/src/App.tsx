import { useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir'

function App() {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')} />
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />

  return <HomeScreen onCadastro={() => setScreen('cadastro')} onLogin={() => setScreen('login')} />
}

export default App
