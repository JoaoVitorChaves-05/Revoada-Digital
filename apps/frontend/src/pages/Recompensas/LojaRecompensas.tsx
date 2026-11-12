import { useMemo, useState } from 'react';
import {
  Search,
  Pencil,
  CalendarDays,
  MessageSquare,
  Gift,
  PlayCircle,
  BookOpen,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { HeaderApp } from '../../components/HeaderApp';
import { RECOMPENSAS_MOCK } from './recompensasMock';
import type { CategoriaRecompensa, Recompensa } from './recompensa.types';
import { useSaldoCoins } from '../../hooks/useSaldoCoins';

type Props = {
  userName?: string;
  saldoPontos?: number;
  pontosNaSemana?: number;
  onMeusResgates?: () => void;
  onInicio?: () => void;
  onDisciplinas?: () => void;
  onSimulados?: () => void;
  onComunidade?: () => void;
  onChat?: () => void;
  onPerfil?: () => void;
  onConfiguracoes?: () => void;
  onLogout?: () => void;
};

const CATEGORIAS: Array<'Todas' | CategoriaRecompensa> = [
  'Todas', 'Estudos', 'Digital', 'Experiências', 'Produtos',
];

// Icone por categoria (apenas decorativo no card).
function iconeCategoria(cat: CategoriaRecompensa) {
  switch (cat) {
    case 'Estudos': return <Pencil size={18} />;
    case 'Digital': return <CalendarDays size={18} />;
    case 'Experiências': return <MessageSquare size={18} />;
    case 'Produtos': return <Gift size={18} />;
    default: return <BookOpen size={18} />;
  }
}

// Icone alternativo para dar variedade visual como na referencia.
function iconePorId(r: Recompensa) {
  if (r.id === 'r5') return <PlayCircle size={18} />;
  if (r.id === 'r6') return <BookOpen size={18} />;
  return iconeCategoria(r.categoria);
}

function textoDisponibilidade(r: Recompensa): string {
  if (r.disponiveis === null) return r.etiqueta ?? 'Ilimitado';
  if (r.disponiveis === 0) return 'Esgotado';
  return `${r.disponiveis} disponíveis`;
}

export function LojaRecompensas({
  userName,
  saldoPontos: saldoPontosProp,
  pontosNaSemana = 250,
  onMeusResgates,
  onInicio,
  onDisciplinas,
  onSimulados,
  onComunidade,
  onChat,
  onPerfil,
  onConfiguracoes,
  onLogout,
}: Props) {
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<'Todas' | CategoriaRecompensa>('Todas');
  const [apenasResgataveis, setApenasResgataveis] = useState(false);

  // Saldo real (Learn-to-Earn). A prop, quando informada, tem prioridade
  // (util para testes/demo); senao busca o saldo do aluno logado.
  const { saldo } = useSaldoCoins();
  const saldoPontos = saldoPontosProp ?? saldo ?? 0;

  const recompensas = useMemo(() => {
    return RECOMPENSAS_MOCK.filter((r) => {
      const casaBusca = r.nome.toLowerCase().includes(busca.trim().toLowerCase());
      const casaCategoria = categoria === 'Todas' || r.categoria === categoria;
      const casaResgatavel = !apenasResgataveis || (saldoPontos >= r.custo && r.disponiveis !== 0);
      return casaBusca && casaCategoria && casaResgatavel;
    });
  }, [busca, categoria, apenasResgataveis, saldoPontos]);

  // Proxima recompensa que o aluno ainda nao alcanca (para a barra de progresso).
  const proxima = useMemo(
    () =>
      [...RECOMPENSAS_MOCK]
        .filter((r) => r.custo > saldoPontos && r.disponiveis !== 0)
        .sort((a, b) => a.custo - b.custo)[0],
    [saldoPontos],
  );
  const faltam = proxima ? proxima.custo - saldoPontos : 0;
  const progresso = proxima ? Math.min(100, Math.round((saldoPontos / proxima.custo) * 100)) : 100;

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

      <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-10 lg:px-[6%]">
        {/* Titulo + Meus resgates */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-indigo-950">Recompensas</h1>
            <p className="text-sm text-slate-500">Seu esforço merece mais. Troque seus pontos por novas conquistas!</p>
          </div>
          <button
            type="button"
            onClick={onMeusResgates}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            Meus resgates
          </button>
        </div>

        {/* Card de saldo */}
        <section className="mt-5 rounded-2xl bg-indigo-900 p-5 text-white sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-indigo-200">
                <Coins size={14} /> Seu saldo disponível
              </p>
              <p className="mt-1 text-4xl font-extrabold">
                {saldoPontos.toLocaleString('pt-BR')} <span className="text-base font-semibold text-indigo-200">pontos</span>
              </p>
              <p className="mt-1 text-[11px] text-emerald-300">+{pontosNaSemana} pontos conquistados nesta semana</p>
            </div>
            <div>
              {proxima ? (
                <>
                  <p className="text-sm font-bold">Você está perto de ir além!</p>
                  <p className="text-[11px] text-indigo-200">
                    Faltam {faltam} pontos para resgatar o {proxima.nome}.
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-indigo-700">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${progresso}%` }} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-indigo-200">
                    <span>{saldoPontos.toLocaleString('pt-BR')} / {proxima.custo.toLocaleString('pt-BR')} pontos</span>
                    <span className="inline-flex items-center gap-1 font-bold text-white">Como ganhar pontos <ArrowRight size={12} /></span>
                  </div>
                </>
              ) : (
                <p className="text-sm font-bold">Você já pode resgatar todas as recompensas disponíveis!</p>
              )}
            </div>
          </div>
        </section>

        {/* Escolha + busca */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-indigo-950">Escolha sua próxima conquista</h2>
            <p className="text-sm text-slate-500">{recompensas.length} recompensas para dar um impulso na sua jornada.</p>
          </div>
          <label className="relative block w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar recompensa"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-300"
            />
          </label>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  categoria === c
                    ? 'border-indigo-900 bg-indigo-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={apenasResgataveis}
              onChange={(e) => setApenasResgataveis(e.target.checked)}
            />
            Apenas as que posso resgatar
          </label>
        </div>

        {/* Grid de cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recompensas.map((r) => {
            const esgotado = r.disponiveis === 0;
            const podeResgatar = !esgotado && saldoPontos >= r.custo;
            const faltamPts = r.custo - saldoPontos;
            const saldoApos = saldoPontos - r.custo;

            return (
              <article key={r.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    {iconePorId(r)}
                  </span>
                  <span className="rounded bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{r.categoria}</span>
                </div>

                <h3 className="mt-3 text-base font-extrabold text-indigo-950">{r.nome}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{r.descricao}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-indigo-700">{r.custo.toLocaleString('pt-BR')} pontos</span>
                  <span className={`text-[10px] font-bold ${esgotado ? 'text-red-500' : 'text-emerald-600'}`}>
                    {textoDisponibilidade(r)}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!podeResgatar}
                  className={`mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                    podeResgatar
                      ? 'bg-indigo-900 text-white hover:bg-indigo-800'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  }`}
                >
                  {esgotado ? 'Indisponível' : podeResgatar ? 'Resgatar recompensa' : `Faltam ${faltamPts} pontos`}
                </button>

                <p className="mt-2 text-[10px] text-slate-400">
                  {esgotado
                    ? 'Aguarde a reposição desta recompensa.'
                    : podeResgatar
                      ? `Após o resgate: ${saldoApos.toLocaleString('pt-BR')} pontos no saldo.`
                      : 'Continue estudando para desbloquear.'}
                </p>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}