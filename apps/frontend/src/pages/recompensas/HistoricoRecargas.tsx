import { ArrowLeft, Loader2 } from 'lucide-react';
import { HeaderApp } from '../../components/HeaderApp';
import { useHistoricoRecargas } from '../../hooks/useHistoricoRecargas';
import { RecargaItem } from './RecargaItem';

type Props = {
  onVoltar?: () => void;
};

/**
 * Tela_Historico de recargas resgatadas pelo aluno (CHA-196).
 *
 * Pagina de apresentacao, sem I/O direto: consome `useHistoricoRecargas` e
 * deriva toda a UI a partir de `estado`. Estrutura acessivel com um unico
 * `banner` (HeaderApp), um unico `<main>` e lista semantica `<ul>` de
 * `RecargaItem` (R8.1). Uma regiao `aria-live="polite"` anuncia a entrada em
 * loading/erro (R8.2). Os controles "Carregar mais" e "Tentar novamente" sao
 * `<button type="button">` operaveis por teclado, com foco visivel; o estado
 * desabilitado e exposto programaticamente e remove o controle da ordem de
 * foco via atributo `disabled` (R8.3, R8.5).
 */
export function HistoricoRecargas({
  onVoltar,
}: Props) {
  const { estado, recargas, temMais, carregandoMais, recarregarInicial, carregarMais } =
    useHistoricoRecargas();

  const carregandoInicial = estado === 'carregando-inicial';
  const erroInicial = estado === 'erro-inicial';
  const vazio = estado === 'vazio';
  const erroCarregarMais = estado === 'erro-carregar-mais';
  // Lista visivel sempre que ha itens acumulados (lista/carregando-mais/erro-carregar-mais).
  const exibeLista = recargas.length > 0;

  /**
   * Texto anunciado assistivamente (R8.2). Prioriza loading inicial e, em
   * seguida, o loading incremental; vazio conta como mudanca de estado
   * relevante para o leitor de tela. Erros usam `role="alert"` em regiao
   * dedicada abaixo, para distinguir urgencia.
   */
  const anuncioStatus = carregandoInicial
    ? 'Carregando histórico de recargas.'
    : carregandoMais
      ? 'Carregando mais recargas.'
      : vazio
        ? 'Nenhuma recarga encontrada no histórico.'
        : '';

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-700">
      <HeaderApp />

      <main className="mx-auto max-w-[900px] px-4 py-8 sm:px-10 lg:px-[6%]">
        <button
          type="button"
          onClick={onVoltar}
          className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 outline-none hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Voltar para as recompensas
        </button>

        <h1 className="text-2xl font-extrabold text-indigo-950">Histórico de recargas</h1>
        <p className="text-sm text-slate-500">
          Acompanhe as recargas de celular que você resgatou com seus pontos.
        </p>

        {/* Regiao de status assistivo: anuncia loading/vazio sem exigir acao (R8.2). */}
        <div role="status" aria-live="polite" className="sr-only">
          {anuncioStatus}
        </div>

        {/* Carregamento inicial: unico indicador por vez (R1.2, R3.1, R3.4). */}
        {carregandoInicial && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-slate-500">
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            <span>Carregando histórico…</span>
          </div>
        )}

        {/* Erro ao carregar a primeira pagina: mensagem distinta + retry (R1.5, R5.1, R5.2). */}
        {erroInicial && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <p className="font-semibold text-red-700">
              Não foi possível carregar o histórico de recargas.
            </p>
            <p className="mt-1 text-sm text-red-600">
              Verifique sua conexão e tente novamente.
            </p>
            <button
              type="button"
              onClick={recarregarInicial}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white outline-none hover:bg-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista vazia: mensagem propria, sem itens e sem controle de carregar mais (R1.4, R4.1-R4.3). */}
        {vazio && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">Você ainda não resgatou nenhuma recarga.</p>
            <p className="mt-1 text-sm text-slate-400">
              Acumule pontos e troque por recargas de celular na Loja de Recompensas.
            </p>
          </div>
        )}

        {/* Lista de recargas acumuladas, preservando a ordem recebida (R1.3, R6.3). */}
        {exibeLista && (
          <>
            <ul className="mt-6 space-y-3">
              {recargas.map((recarga) => (
                <RecargaItem key={recarga.id} recarga={recarga} />
              ))}
            </ul>

            {/* Indicador de carregamento incremental (R6.4): unico indicador ativo. */}
            {carregandoMais && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Carregando mais…</span>
              </div>
            )}

            {/* Erro ao carregar mais: mantem os itens e oferece retry da mesma pagina (R6.6). */}
            {erroCarregarMais && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center"
              >
                <p className="text-sm font-semibold text-red-700">
                  Não foi possível carregar mais recargas.
                </p>
                <button
                  type="button"
                  onClick={carregarMais}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white outline-none hover:bg-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* "Carregar mais": visivel so quando ha mais itens; desabilitado durante a
                requisicao, o que tambem o remove da ordem de foco (R6.1, R6.4, R6.5, R8.3, R8.5). */}
            {temMais && !erroCarregarMais && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={carregarMais}
                  disabled={carregandoMais}
                  aria-disabled={carregandoMais}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-5 py-2 text-sm font-bold text-indigo-700 outline-none hover:border-indigo-300 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {carregandoMais ? 'Carregando…' : 'Carregar mais'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
