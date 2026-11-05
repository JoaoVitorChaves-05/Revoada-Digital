type Props = {
  onBack: () => void;
};

export function ConfiguracoesScreen({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-10 lg:px-[8%]">
        <span className="font-[Sora] text-base font-extrabold">
          <span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span>
        </span>
        <button onClick={onBack} className="text-sm font-bold text-indigo-900 hover:text-orange-500">← Voltar</button>
      </header>

      <main className="mx-auto w-full max-w-[640px] px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-indigo-900">Configurações</h1>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          <p className="text-sm">As configurações da conta estarão disponíveis em breve.</p>
        </div>
      </main>
    </div>
  );
}