import iconContainer from '../screens/icons/icon-container.png';
import { UserMenu } from './UserMenu';

/**
 * Cabecalho padrao das telas logadas (mesmo visual da Comunidade): logo Revoada,
 * navegacao principal e menu de usuario. `ativo` marca a aba atual em laranja.
 */
type HeaderAppProps = {
  ativo?: 'Início' | 'Disciplinas' | 'Simulados' | 'Comunidade' | 'Chat' | 'FAQ';
  userName?: string;
  isLoggedIn?: boolean;
  onInicio?: () => void;
  onSimulados?: () => void;
  onComunidade?: () => void;
  onChat?: () => void;
  onPerfil?: () => void;
  onConfiguracoes?: () => void;
  onLogout?: () => void;
};

const NAV = ['Início', 'Disciplinas', 'Simulados', 'Comunidade', 'Chat', 'FAQ'] as const;

export function HeaderApp({
  ativo,
  userName,
  isLoggedIn = true,
  onInicio,
  onSimulados,
  onComunidade,
  onChat,
  onPerfil,
  onConfiguracoes,
  onLogout,
}: HeaderAppProps) {
  const handlers: Record<string, (() => void) | undefined> = {
    'Início': onInicio,
    'Simulados': onSimulados,
    'Comunidade': onComunidade,
    'Chat': onChat,
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-10 lg:px-[8%]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 text-sm">
          <img src={iconContainer} alt="Revoada Digital" />
        </div>
        <span className="font-[Sora] text-base font-extrabold">
          <span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span>
        </span>
      </div>

      <nav className="hidden items-stretch gap-7 text-xs font-semibold text-indigo-900 md:flex">
        {NAV.map((item) => {
          if (item === 'Chat' && !isLoggedIn) return null;
          const classe = `flex items-center border-b-2 transition hover:text-orange-500 ${
            item === ativo ? 'border-orange-500 font-extrabold text-orange-500' : 'border-transparent'
          }`;
          const onClick = handlers[item];
          return onClick ? (
            <button key={item} type="button" onClick={onClick} className={classe}>{item}</button>
          ) : (
            <a key={item} href="#" className={classe}>{item}</a>
          );
        })}
      </nav>

      <UserMenu userName={userName} onPerfil={onPerfil} onConfiguracoes={onConfiguracoes} onLogout={onLogout} />
    </header>
  );
}