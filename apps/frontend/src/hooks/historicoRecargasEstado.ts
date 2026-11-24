/**
 * Logica pura da maquina de estados da UI da Tela_Historico (CHA-196).
 *
 * Este modulo isola, em funcoes puras, as derivacoes de estado que o hook
 * `useHistoricoRecargas` aplica ao receber (ou falhar ao receber) uma
 * `Pagina_Recargas`. Manter essas transicoes puras permite testa-las sem
 * renderizar a arvore React (property tests) e garante que o hook e os testes
 * compartilhem EXATAMENTE a mesma logica.
 *
 * Invariantes modeladas (ver design.md, Properties 2/3/4):
 * - No maximo um entre `vazio`, `erro-inicial` e `lista` vale por vez; e
 *   `vazio`/`erro-inicial` implicam lista exibida vazia (sem dados parciais).
 * - A visibilidade de "carregar mais" (`temMais`) deriva de `hasMore`, sendo
 *   sempre oculta em lista vazia / proxima pagina vazia / erro inicial.
 * - Uma falha ao carregar mais preserva intacta a lista ja exibida.
 */

import { acumularRecargas } from '../utils/formatoRecarga';
import type { Recarga, RespostaHistoricoRecargas } from '../types/recargas.types';

/**
 * Estados da maquina de UI da Tela_Historico (CHA-196). No maximo um estado
 * vale por vez; `vazio` e `erro-inicial` implicam lista vazia (sem dados
 * parciais).
 */
export type EstadoUIHistorico =
  | 'carregando-inicial' // R1.2, R3.1
  | 'lista' // R1.3
  | 'vazio' // R1.4, R4
  | 'erro-inicial' // R1.5, R5
  | 'carregando-mais' // R6.4
  | 'erro-carregar-mais'; // R6.6

/**
 * Snapshot do estado observavel da UI derivado pelas transicoes puras abaixo.
 * `recargas` sao os itens acumulados exibidos; `temMais` controla a
 * visibilidade do controle "carregar mais" (R6.1, R6.5).
 */
export interface EstadoHistorico {
  estado: EstadoUIHistorico;
  recargas: Recarga[];
  temMais: boolean;
}

/**
 * Deriva o estado apos uma resposta de SUCESSO da PRIMEIRA pagina (R1.3, R1.4).
 *
 * - Pagina vazia => `vazio`, lista vazia, controle oculto (R1.4, R4).
 * - Pagina com itens => `lista`, itens acumulados a partir do vazio e
 *   `temMais = hasMore` (R1.3, R6.1, R6.5).
 *
 * Funcao pura: nao muta a resposta recebida; sempre retorna um novo snapshot.
 */
export function reduzirCargaInicialSucesso(
  resposta: RespostaHistoricoRecargas,
): EstadoHistorico {
  const itens = resposta.items ?? [];
  if (itens.length === 0) {
    return { estado: 'vazio', recargas: [], temMais: false };
  }
  return {
    estado: 'lista',
    recargas: acumularRecargas([], itens),
    temMais: resposta.hasMore,
  };
}

/**
 * Deriva o estado apos uma FALHA (!= 401 / timeout) da PRIMEIRA pagina (R5.1).
 * Entra em `erro-inicial` sem exibir dados parciais: lista vazia e controle
 * oculto. Funcao pura.
 */
export function reduzirCargaInicialErro(): EstadoHistorico {
  return { estado: 'erro-inicial', recargas: [], temMais: false };
}

/**
 * Deriva o estado apos uma resposta de SUCESSO de "carregar mais" (R6.3, R6.7),
 * a partir da lista ja exibida (`recargasAtuais`).
 *
 * - Proxima pagina vazia => mantem os itens e oculta o controle (R6.7).
 * - Proxima pagina com itens => acumula com dedupe preservando a ordem e
 *   `temMais = hasMore` (R6.3, R6.5).
 *
 * Em ambos os casos o estado resultante e `lista`. Funcao pura: nao muta
 * `recargasAtuais` nem a resposta.
 */
export function reduzirCarregarMaisSucesso(
  recargasAtuais: readonly Recarga[],
  resposta: RespostaHistoricoRecargas,
): EstadoHistorico {
  const itens = resposta.items ?? [];
  if (itens.length === 0) {
    // Proxima pagina vazia: preserva os itens e oculta o controle (R6.7).
    return { estado: 'lista', recargas: [...recargasAtuais], temMais: false };
  }
  return {
    estado: 'lista',
    recargas: acumularRecargas(recargasAtuais, itens),
    temMais: resposta.hasMore,
  };
}

/**
 * Deriva o estado apos uma FALHA (!= 401 / timeout) de "carregar mais" (R6.6).
 * Mantem INALTERADAS as recargas ja exibidas e a visibilidade de "carregar
 * mais"; apenas transita para `erro-carregar-mais`. Funcao pura.
 */
export function reduzirCarregarMaisErro(
  recargasAtuais: readonly Recarga[],
  temMaisAtual: boolean,
): EstadoHistorico {
  return {
    estado: 'erro-carregar-mais',
    recargas: [...recargasAtuais],
    temMais: temMaisAtual,
  };
}
