import { Smartphone } from 'lucide-react';
import type { Recarga } from '../../types/recargas.types';
import {
  DADO_INDISPONIVEL,
  formatarBRL,
  formatarDataHora,
  formatarTelefone,
  rotuloStatus,
} from '../../utils/formatoRecarga';

type Props = {
  recarga: Recarga;
};

/**
 * Exibe os campos de uma `Recarga` (R2) dentro de um `<li>` para compor a lista
 * semântica `<ul>` da Tela_Historico (R8.1).
 *
 * Usa os formatadores puros pt-BR de `formatoRecarga`: data/hora, valor BRL,
 * telefone e rótulo de status. Cada formatador já é defensivo contra
 * ausência/nulidade e devolve `DADO_INDISPONIVEL` (ou "Status desconhecido" para
 * status não mapeado), de modo que um campo inválido não derruba os demais
 * (R2.6, R2.7). O significado do status é transmitido por texto legível
 * adjacente, não apenas por cor/forma/posição (R8.4).
 */
export function RecargaItem({ recarga }: Props) {
  const dataHora = formatarDataHora(recarga?.createdAt);
  const nomeItem =
    recarga?.catalogItemName === null ||
    recarga?.catalogItemName === undefined ||
    recarga?.catalogItemName === ''
      ? DADO_INDISPONIVEL
      : recarga.catalogItemName;
  const valor = formatarBRL(recarga?.amountBRL);
  const telefone = formatarTelefone(recarga?.phoneNumber);
  const status = rotuloStatus(recarga?.status);

  // Pontos gastos: inteiro >= 0 (R2.3). Indisponível quando ausente/nulo ou fora
  // do domínio esperado (R2.6), sem derrubar os demais campos.
  const coins = recarga?.coinsSpent;
  const pontosGastos =
    typeof coins === 'number' && Number.isInteger(coins) && coins >= 0
      ? `${coins.toLocaleString('pt-BR')} pts`
      : DADO_INDISPONIVEL;

  return (
    <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
        <Smartphone size={18} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-indigo-950">{nomeItem}</p>

        <dl className="mt-1 space-y-0.5 text-[11px] text-slate-500">
          <div className="flex gap-1">
            <dt className="font-semibold text-slate-600">Data:</dt>
            <dd>{dataHora}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-semibold text-slate-600">Telefone:</dt>
            <dd>{telefone}</dd>
          </div>
        </dl>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-extrabold text-indigo-700">{valor}</p>
        <p className="text-[11px] text-slate-500">-{pontosGastos}</p>
        <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
          {status}
        </span>
      </div>
    </li>
  );
}
