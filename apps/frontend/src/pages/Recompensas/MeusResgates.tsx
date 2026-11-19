import { ArrowLeft, Gift } from 'lucide-react';
import { HeaderApp } from '../../components/HeaderApp';
import { RESGATES_MOCK } from './recompensasMock';

type Props = {
  userName?: string;
  onVoltar?: () => void;
  onInicio?: () => void;
  onDisciplinas?: () => void;
  onSimulados?: () => void;
  onComunidade?: () => void;
  onChat?: () => void;
  onPerfil?: () => void;
  onConfiguracoes?: () => void;
  onLogout?: () => void;
};

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function MeusResgates({
  userName,
  onVoltar,
  onInicio,
  onDisciplinas,
  onSimulados,
  onComunidade,
  onChat,
  onPerfil,
  onConfiguracoes,
  onLogout,
}: Props) {
  const resgates = RESGATES_MOCK;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      <HeaderApp
        ativo="Recompensas"
        userName={userName}
        onInicio={onInicio}
        onDisciplinas={onDisciplinas}
        onSimulados={onSimulados}
        onComunidade={onComunidade}
        onChat={onChat}
        onPerfil={onPerfil}
        onConfiguracoes={onConfiguracoes}
        onLogout={onLogout}
      />

      <main className="mx-auto max-w-[900px] px-4 py-8 sm:px-10 lg:px-[6%]">
        <button
          type="button"
          onClick={onVoltar}
          className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-orange-500"
        >
          <ArrowLeft size={14} /> Voltar para as recompensas
        </button>

        <h1 className="text-2xl font-extrabold text-indigo-950">Meus resgates</h1>
        <p className="text-sm text-slate-500">Acompanhe as recompensas que você trocou pelos seus pontos.</p>

        {resgates.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">Você ainda não resgatou nenhuma recompensa.</p>
            <p className="mt-1 text-sm text-slate-400">Acumule pontos e troque por conquistas na Loja de Recompensas.</p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {resgates.map((rg) => (
              <li key={rg.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                  <Gift size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-indigo-950">{rg.recompensaNome}</p>
                  <p className="text-[11px] text-slate-500">{rg.categoria} · {formatarData(rg.data)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-indigo-700">-{rg.pontosGastos.toLocaleString('pt-BR')} pts</p>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      rg.status === 'Entregue'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {rg.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}