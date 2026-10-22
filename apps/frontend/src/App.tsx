import { useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { ResultPage } from './pages/result_simulado.page' 
import { GerarSimulado } from './screens/Simulado/GerarSimulado'
import { FazerSimulado } from './screens/Simulado/FazerSimulado'
import { TelaSimulado } from './screens/Simulado/TelaSimulado'

type Screen = 'home' | 'cadastro' | 'login' | 'redefinir' | 'simulado' | 'practice' | 'tela' | 'result'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [previous, setPrevious] = useState<Screen>('home')
  const [configSimulado, setConfigSimulado] = useState<SimuladoConfig | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string>("769e855b-4a27-4a5b-a48c-170be35004d2") //ID de teste
  useEffect(() => setCurrentAttemptId("769e855b-4a27-4a5b-a48c-170be35004d2"), [])
  const handlePractice = (config: SimuladoConfig) => {
    setConfigSimulado(config);
    setScreen('practice');
  };
  if (screen === 'cadastro') return <CadastroScreen onBack={() => setScreen(previous)} 
                                                    onSuccess={() =>{
                                                                  setScreen('login')
                                                                  setPrevious(screen)
                                                                    }
                                                               }
                                                    onHome={() => setScreen('home')}
                                    />
  if (screen === 'login') return <LoginScreen onBack={() =>setScreen(previous)} 
                                              onForgot={() =>{
                                                            setPrevious(screen)
                                                            setScreen('redefinir')
                                                              }
                                                        }
                                              onHome={() => setScreen('home')}
                                  />
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen(previous)} />
 
  if (screen === 'simulado') return <GerarSimulado onHome={() => setScreen('home')}
                                                   onPractice={handlePractice}
                                  />
  if (screen === 'practice') return <TelaSimulado config= { configSimulado } />
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

  
  return <HomeScreen onCadastro={() => { 
                                      setPrevious(screen)  
                                      setScreen('cadastro')
                                        }
                                 } 
                     onLogin={() => {  
                                  setPrevious(screen)
                                  setScreen('login')
                                     }
                              }
                     onSimulado={() => {
                                  setPrevious(screen)
                                  setScreen('simulado')
                                    }
                              }
          />
}

export default App
