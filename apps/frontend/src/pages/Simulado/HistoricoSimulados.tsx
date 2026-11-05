import { useEffect, useState } from 'react';
import { simuladoService, type HistoricoItem } from '../../services/simulado.service';

type Props = {
  userId: string;
  onBack: () => void;
  onVerResultado: (attemptId: string) => void;
};

export function HistoricoSimulados({ userId, onBack, onVerResultado }: Props) {
  const [itens, setItens] = useState<HistoricoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    simuladoService
      .listarHistorico(userId)
      .then((lista) => { if (ativo) setItens(lista); })
      .catch((e) => { if (ativo) setErro(e?.response?.data?.error || 'Não foi possível carregar o histórico.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [userId]);

  const formatarData = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  const statusLabel: Record<string, string> = {
    SUBMITTED: 'Concluído',
    IN_PROGRESS: 'Em andamento',
    ABANDONED: 'Abandonado',
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-10 lg:px-[8%]">
        <span className="font-[Sora] text-base font-extrabold">
          <span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span>
        </span>
        <button onClick={onBack} className="text-sm font-bold text-indigo-900 hover:text-orange-500">← Voltar</button>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-extrabold text-indigo-900">Histórico de Simulados</h1>
        <p className="mb-6 text-sm text-slate-500">Acompanhe seus simulados e revise seus resultados.</p>

        {carregando && <p className="text-slate-500">Carregando histórico...</p>}
        {erro && <p className="font-semibold text-red-600">{erro}</p>}

        {!carregando && !erro && itens.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Você ainda não fez nenhum simulado. Que tal começar agora?
          </div>
        )}

        <div className="flex flex-col gap-3">
          {itens.map((item) => {
            const acertos = item.correctAnswers ?? 0;
            const total = item.totalQuestions ?? 0;
            const nota = item.score ?? 0;
            return (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <h3 className="font-bold text-indigo-900">{item.mockExam?.name ?? 'Simulado'}</h3>
                  <p className="text-xs text-slate-500">
                    {statusLabel[item.status] ?? item.status} · {formatarData(item.submittedAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Nota <strong>{nota}</strong> · {acertos}/{total} acertos · +{item.earnedPoints ?? 0} pts
                  </p>
                </div>
                {item.status === 'SUBMITTED' && (
                  <button
                    onClick={() => onVerResultado(item.id)}
                    className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-800"
                  >
                    Ver resultado
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}