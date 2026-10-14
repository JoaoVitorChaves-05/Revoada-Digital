import { useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { CreatePostModal } from './screens/CreatePostModal'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [modalAberto, setModalAberto] = useState(false)
  
  const renderizarTela = () => {
    if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen('home')} />
    if (screen === 'login') return <LoginScreen onBack={() => setScreen('home')} onForgot={() => setScreen('redefinir')} />
    if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />
    
    return <HomeScreen onCadastro={() => setScreen('cadastro')} onLogin={() => setScreen('login')} />
  }
  
  return (
    <>
      <button 
        onClick={() => setModalAberto(true)}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 9999, padding: '8px 16px', cursor: 'pointer' }}
      >
        + Testar Modal
      </button>

      {renderizarTela()}

      <CreatePostModal 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
      />
    </>
  )
}

export default App
