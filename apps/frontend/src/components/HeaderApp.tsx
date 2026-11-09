import { useEffect, useState } from 'react';
import { Menu, X, Home, BookOpen, FileText, Users, MessageCircle, Gift } from 'lucide-react';
import iconContainer from '../screens/icons/icon-container.png';
import { UserMenu } from './UserMenu';

/**
 * Cabecalho padrao das telas logadas.
 * - Navegacao: painel lateral (drawer) a esquerda, aberto por um botao.
 * - Conta: menu dropdown no avatar, a direita (UserMenu).
 * `ativo` marca a aba atual no drawer.
 */
type Aba = 'Início' | 'Disciplinas' | 'Simulados' | 'Comunidade' | 'Chat' | 'Recompensas';

type HeaderAppProps = {
  ativo?: Aba;
  userName?: string;
  isLoggedIn?: boolean;
  onInicio?: () => void;
  onDisciplinas?: () => void;
  onSimulados?: () => void;
  onComunidade?: () => void;
  onChat?: () => void;
  onRecompensas?: () => void;
  onMeusResgates?: () => void;
  onPerfil?: () => void;
  onConfiguracoes?: () => void;
  onLogout?: () => void;
};

type ItemMenu = {
  rotulo: string;
  icone: React.ReactNode;
  onClick?: () => void;
  somenteLogado?: boolean;
};

export function HeaderApp({
  ativo,
  userName,
  isLoggedIn = true,
  onInicio,
  onDisciplinas,
  onSimulados,
  onComunidade,
  onChat,
  onRecompensas,
  onMeusResgates,
  onPerfil,
  onConfiguracoes,
  onLogout,
}: HeaderAppProps) {
  const [aberto, setAberto] = useState(false);

  // Fecha o drawer com a tecla Esc (acessibilidade).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setAberto(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Navega e fecha o drawer.
  function ir(fn?: () => void) {
    return () => { setAberto(false); fn?.(); };
  }

  const navItens: ItemMenu[] = [
    { rotulo: 'Início', icone: <Home size={18} />, onClick: onInicio },
    { rotulo: 'Disciplinas', icone: <BookOpen size={18} />, onClick: onDisciplinas },
    { rotulo: 'Simulados', icone: <FileText size={18} />, onClick: onSimulados },
    { rotulo: 'Comunidade', icone: <Users size={18} />, onClick: onComunidade },
    { rotulo: 'Chat', icone: <MessageCircle size={18} />, onClick: onChat, somenteLogado: true },
    { rotulo: 'Recompensas', icone: <Gift size={18} />, onClick: onRecompensas },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        {/* Esquerda: botao do menu lateral + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={aberto}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-indigo-900 transition hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 text-sm">
              <img src={iconContainer} alt="Revoada Digital" />
            </div>
            <span className="font-[Sora] text-base font-extrabold">
              <span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span>
            </span>
          </div>
        </div>

        {/* Direita: menu de conta no avatar (dropdown) */}
        <UserMenu
          userName={userName}
          onPerfil={onPerfil}
          onMeusResgates={onMeusResgates}
          onConfiguracoes={onConfiguracoes}
          onLogout={onLogout}
        />
      </header>

      {/* Overlay */}
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40"
          onClick={() => setAberto(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer lateral esquerdo: apenas navegacao */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-200 ${
          aberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Menu de navegação"
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <span className="font-[Sora] text-base font-extrabold">
            <span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span>
          </span>
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Navegação</p>
          {navItens.map((item) => {
            if (item.somenteLogado && !isLoggedIn) return null;
            const ativoCls = item.rotulo === ativo ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50';
            return (
              <button
                key={item.rotulo}
                type="button"
                onClick={ir(item.onClick)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${ativoCls}`}
              >
                {item.icone}
                {item.rotulo}
                {item.rotulo === ativo && <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" />}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}