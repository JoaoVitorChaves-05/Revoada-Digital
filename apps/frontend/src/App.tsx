import { useState } from 'react'
import './App.css'
import { HomeScreen } from './screens/HomeScreen'
import { CadastroScreen } from './screens/CadastroScreen'
import { LoginScreen, type UsuarioLogado } from './screens/LoginScreen'
import { RedefinirScreen } from './screens/RedefinirScreen'
import { VerificarEmailScreen } from './screens/VerificarEmailScreen'
import ComunidadePostScreen from './screens/comunidadepostscreen'
import PostDetalheScreen from './screens/PostDetalheScreen'
import { ResultPage } from './pages/Simulado/result_simulado.page'
import { HistoryPage } from './pages/Simulado/historico_simulados.page'
import { PainelDesempenhoPage } from './pages/PainelDesempenho.page'
import { ChatPage } from './pages/Chat/ChatPage'
import { DashboardPage } from './pages/Dashboard.page'
import { GerarSimulado } from './pages/Simulado/GerarSimulado'
import { FazerSimulado } from './pages/Simulado/FazerSimulado'
import { PerfilScreen } from './screens/PerfilScreen'
import { ConfiguracoesScreen } from './screens/ConfiguracoesScreen'
import { AprovacaoUsuarios } from './pages/Admin/AprovacaoUsuarios'

// Identidade de teste do chat (6=a): usuários fixos para simular as duas pontas
// na demo. Substituir pelo usuário autenticado (JWT) no Bloco B (6=b).
// IMPORTANTE: trocar pelos UUIDs reais de usuários existentes no banco local.
const CHAT_TEST_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', label: 'Usuário de teste 1' },
  { id: '00000000-0000-0000-0000-000000000002', label: 'Usuário de teste 2' },
]

type Screen =
  | 'home'
  | 'cadastro'
  | 'login'
  | 'redefinir'
  | 'result'
  | 'desempenho'
  | 'dashboard'
  | 'verificar-email'
  | 'comunidade'
  | 'chat'
  | 'post-detalhe'
  | 'gerar-simulado'
  | 'fazer-simulado'
  | 'historico'
  | 'perfil'
  | 'configuracoes'
  | 'aprovacao'

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
  const [attemptAtivo, setAttemptAtivo] = useState<string | null>(null)
  const [chatUserId, setChatUserId] = useState<string>(CHAT_TEST_USERS[0].id)

  const estaLogado = usuario !== null

  function logout() {
    localStorage.removeItem('usuarioLogado')
    setUsuario(null)
    setScreen('home')
  }

  const menuProps = {
    onPerfil: () => setScreen('perfil'),
    onConfiguracoes: () => setScreen('configuracoes'),
    onLogout: logout,
  }

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
          const perfil = (user as { profileType?: string }).profileType
          setScreen(perfil === 'ADMIN' ? 'aprovacao' : 'dashboard')
        }}
      />
    )
  }
  if (screen === 'redefinir') return <RedefinirScreen onBack={() => setScreen('login')} />

  if (screen === 'aprovacao') {
    return (
      <AprovacaoUsuarios
        onBack={() => setScreen(estaLogado ? 'dashboard' : 'home')}
      />
    )
  }

  // --- Area logada: Comunidade / Chat / Detalhe do post ---
  if (screen === 'comunidade') {
    return (
      <div>
        <div style={{ backgroundColor: '#1E3A8A', padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setScreen('aprovacao')}
            style={{
              backgroundColor: '#F97316',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Área Admin: Aprovação de Usuários
          </button>
        </div>
        <ComunidadePostScreen
          isLoggedIn={estaLogado}
          userName={usuario?.full_name}
          userId={usuario?.id}
          onBack={() => setScreen('home')}
          onInicio={() => setScreen('dashboard')}
          onChat={() => setScreen('chat')}
          onSimulados={() => setScreen('gerar-simulado')}
          onViewPost={(postId: string) => { setPostSelecionado(postId); setScreen('post-detalhe') }}
          onPerfil={menuProps.onPerfil}
          onConfiguracoes={menuProps.onConfiguracoes}
          onLogout={menuProps.onLogout}
        />
      </div>
    )
  }

  if (screen === 'chat') {
    return (
      <ChatPage
        onBack={() => setScreen('comunidade')}
        currentUserId={chatUserId}
        testUsers={CHAT_TEST_USERS}
        onSwitchUser={setChatUserId}
      />
    )
  }

  if (screen === 'post-detalhe' && postSelecionado) {
    return (
      <PostDetalheScreen
        postId={postSelecionado}
        isLoggedIn={estaLogado}
        userName={usuario?.full_name}
        userId={usuario?.id}
        onBack={() => setScreen('comunidade')}
        onInicio={() => setScreen('dashboard')}
        onChat={() => setScreen('chat')}
        onPerfil={menuProps.onPerfil}
        onConfiguracoes={menuProps.onConfiguracoes}
        onLogout={menuProps.onLogout}
      />
    )
  }

  if (screen === 'desempenho') {
    return <PainelDesempenhoPage onBack={() => setScreen('dashboard')} />
  }

  if (screen === 'dashboard') {
    return (
      <div>
        <div style={{ backgroundColor: '#1E3A8A', padding: '0.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setScreen('aprovacao')}
            style={{
              backgroundColor: '#F97316',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Área Admin: Aprovação de Usuários
          </button>
        </div>
        <DashboardPage
          onBack={() => setScreen('comunidade')}
          onVerEstatisticas={() => setScreen('desempenho')}
        />
      </div>
    )
  }

  // --- Fluxo de simulado (apenas aluno logado) ---
  if (screen === 'gerar-simulado') {
    if (!usuario) { setScreen('login'); return null }
    return (
      <GerarSimulado
        userId={usuario.id}
        onBack={() => setScreen('comunidade')}
        onIniciar={(attemptId) => { setAttemptAtivo(attemptId); setScreen('fazer-simulado') }}
      />
    )
  }

  if (screen === 'fazer-simulado' && attemptAtivo) {
    return (
      <FazerSimulado
        attemptId={attemptAtivo}
        onFinalizar={(attemptId) => { setAttemptAtivo(attemptId); setScreen('result') }}
      />
    )
  }

  if (screen === 'historico') {
    if (!usuario) { setScreen('login'); return null }
    return <HistoryPage onBack={() => setScreen('dashboard')} />
  }

  if (screen === 'perfil') {
    if (!usuario) { setScreen('login'); return null }
    return <PerfilScreen userId={usuario.id} onBack={() => setScreen('comunidade')} />
  }

  if (screen === 'configuracoes') {
    return <ConfiguracoesScreen onBack={() => setScreen('comunidade')} />
  }

  if (screen === 'result' && attemptAtivo) {
    return (
      <div>
        <button onClick={() => setScreen(estaLogado ? 'comunidade' : 'home')} style={{ margin: '10px' }}>
          Voltar
        </button>
        {estaLogado && (
          <button onClick={() => setScreen('historico')} style={{ margin: '10px' }}>
            Ver histórico de simulados
          </button>
        )}
        <ResultPage attemptId={attemptAtivo} />
      </div>
    )
  }

  // Tela padrão (Home)
  return (
    <HomeScreen
      onCadastro={() => setScreen('cadastro')}
      onLogin={() => setScreen('login')}
    />
  )
}

export default App