import { useEffect, useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { ResultPage } from './pages/Simulado/result_simulado.page' 
import { HistoryPage } from './pages/Simulado/historico_simulados.page' 

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'result' | 'history'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  
  const [currentAttemptId, setCurrentAttemptId] = useState<string>("769e855b-4a27-4a5b-a48c-170be35004d2")
  useEffect(() => setCurrentAttemptId("769e855b-4a27-4a5b-a48c-170be35004d2"), [])

  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
  if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')}/>
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />
  if (screen === 'history') return <HistoryPage onBack={() => setScreen('home')} />

  return (
    <HomeScreen 
      onCadastro={() => setScreen('cadastro')} 
      onLogin={() => setScreen('login')} 
    />
  )
}

export default App