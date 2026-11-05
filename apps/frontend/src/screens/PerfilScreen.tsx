import { useEffect, useState } from 'react';
import { api } from '../services/api';

type Props = {
  userId: string;
  onBack: () => void;
};

type PerfilData = {
  full_name: string;
  email: string;
  profileType: 'STUDENT' | 'TEACHER' | 'ADMIN';
  cpf?: string;
  rg?: string | null;
  studentProfile?: { points: number; yearId: number } | null;
};

const PERFIL_LABEL: Record<string, string> = {
  STUDENT: 'Estudante',
  TEACHER: 'Professor',
  ADMIN: 'Administrador',
};

export function PerfilScreen({ userId, onBack }: Props) {
  const [dados, setDados] = useState<PerfilData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    api.get(`/users/${userId}`)
      .then((r) => { if (ativo) setDados(r.data); })
      .catch((e) => { if (ativo) setErro(e?.response?.data?.error || 'Não foi possível carregar o perfil.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [userId]);

  function getInitials(name: string) {
    const p = name.trim().split(' ');
    return (p.length === 1 ? p[0].substring(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-10 lg:px-[8%]">
        <span className="font-[Sora] text-base font-extrabold">
          <span className="text-orange-500">Revoada</span><span className="text-indigo-900">Digital</span>
        </span>
        <button onClick={onBack} className="text-sm font-bold text-indigo-900 hover:text-orange-500">← Voltar</button>
      </header>

      <main className="mx-auto w-full max-w-[640px] px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-extrabold text-indigo-900">Meu Perfil</h1>

        {carregando && <p className="text-slate-500">Carregando...</p>}
        {erro && <p className="font-semibold text-red-600">{erro}</p>}

        {dados && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-xl font-extrabold text-indigo-700">
                {getInitials(dados.full_name)}
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-indigo-900">{dados.full_name}</h2>
                <p className="text-sm text-slate-500">{PERFIL_LABEL[dados.profileType] ?? dados.profileType}</p>
              </div>
            </div>

            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-500">E-mail</dt>
                <dd className="font-semibold text-slate-800">{dados.email}</dd>
              </div>
              {dados.cpf && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">CPF</dt>
                  <dd className="font-semibold text-slate-800">{dados.cpf}</dd>
                </div>
              )}
              {dados.rg && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-500">RG</dt>
                  <dd className="font-semibold text-slate-800">{dados.rg}</dd>
                </div>
              )}
              {dados.studentProfile && (
                <>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">Série</dt>
                    <dd className="font-semibold text-slate-800">{dados.studentProfile.yearId}º ano</dd>
                  </div>
                  <div className="flex justify-between pb-2">
                    <dt className="text-slate-500">Pontos (Learn-to-Earn)</dt>
                    <dd className="font-semibold text-slate-800">{dados.studentProfile.points} pts</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        )}
      </main>
    </div>
  );
}