import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';

type UserMenuProps = {
  userName?: string;
  onPerfil?: () => void;
  onConfiguracoes?: () => void;
  onLogout?: () => void;
};

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu({ userName, onPerfil, onConfiguracoes, onLogout }: UserMenuProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  const nome = userName ?? 'Visitante';

  return (
    <div className="relative flex items-center gap-2 text-xs font-bold text-indigo-900" ref={ref}>
      <Bell size={14} />
      <span className="h-5 w-px bg-slate-200" />
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-1 py-1 transition hover:bg-slate-50"
        aria-haspopup="menu"
        aria-expanded={aberto}
      >
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-extrabold text-indigo-700">
          {userName ? getInitials(userName) : 'JL'}
        </span>
        <span className="hidden sm:inline">{nome}</span>
        <ChevronDown size={12} className="text-slate-400" />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            role="menuitem"
            onClick={() => { setAberto(false); onPerfil?.(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <User size={16} /> Perfil
          </button>
          <button
            role="menuitem"
            onClick={() => { setAberto(false); onConfiguracoes?.(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Settings size={16} /> Configurações
          </button>
          <div className="my-1 h-px bg-slate-100" />
          <button
            role="menuitem"
            onClick={() => { setAberto(false); onLogout?.(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  );
}