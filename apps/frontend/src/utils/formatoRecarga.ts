/**
 * Formatadores pt-BR puros para a Tela_Historico (CHA-196).
 *
 * Todas as funções são puras: o retorno depende somente do argumento recebido,
 * nenhum argumento é mutado e nenhuma chamada de rede/efeito colateral ocorre.
 * São defensivas contra `null`/`undefined`/valores inválidos (R2.6, R2.7), de
 * modo que um campo ausente nunca derruba a renderização do item.
 */

import type { Recarga } from '../types/recargas.types';

/** Indicador textual de dado indisponível (R2.6). */
export const DADO_INDISPONIVEL = 'Indisponível';

/** Rótulo pt-BR para um Status_Recarga não mapeado (R2.7). */
const STATUS_DESCONHECIDO = 'Status desconhecido';

/**
 * Mapa de rótulos pt-BR de Status_Recarga (R2.4). Construído sem protótipo
 * (`Object.create(null)`) para que a busca por chaves herdadas de
 * `Object.prototype` (ex.: `"toString"`, `"valueOf"`, `"constructor"`) devolva
 * `undefined` — e não a função herdada —, garantindo que o fallback `??` para
 * `STATUS_DESCONHECIDO` funcione para qualquer status fora do mapa (R2.7).
 */
const ROTULOS_STATUS: Record<string, string> = Object.assign(Object.create(null), {
  PENDING: 'Pendente',
  COMPLETED: 'Concluída',
  REFUNDED: 'Estornada',
});

/**
 * Formata uma data/hora ISO 8601 no padrão `DD/MM/AAAA HH:MM` (24h, pt-BR) (R2.1).
 * Retorna `DADO_INDISPONIVEL` quando o valor está ausente ou é inválido (R2.6).
 */
export function formatarDataHora(iso: string | null | undefined): string {
  if (iso === null || iso === undefined || iso === '') return DADO_INDISPONIVEL;

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return DADO_INDISPONIVEL;

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear()).padStart(4, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

/** Formatador pt-BR de moeda BRL, reutilizado entre chamadas. */
const FORMATADOR_BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Formata um valor numérico como moeda BRL, ex.: `R$ 1.234,56` (R2.2).
 * Retorna `DADO_INDISPONIVEL` quando o valor está ausente ou não é um número
 * finito (R2.6).
 */
export function formatarBRL(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return DADO_INDISPONIVEL;
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return DADO_INDISPONIVEL;

  return FORMATADOR_BRL.format(valor);
}

/**
 * Formata um telefone de 11 dígitos no padrão `(DD) NNNNN-NNNN` (R2.5).
 * Mantém o valor cru (sem alteração) quando não casar o padrão esperado;
 * retorna `DADO_INDISPONIVEL` quando ausente ou nulo (R2.6).
 */
export function formatarTelefone(numero: string | null | undefined): string {
  if (numero === null || numero === undefined || numero === '') return DADO_INDISPONIVEL;

  const correspondencia = /^(\d{2})(\d{5})(\d{4})$/.exec(numero);
  if (correspondencia === null) return numero;

  const [, ddd, prefixo, sufixo] = correspondencia;
  return `(${ddd}) ${prefixo}-${sufixo}`;
}

/**
 * Retorna o rótulo pt-BR de um Status_Recarga (R2.4). Para qualquer valor fora
 * de {PENDING, COMPLETED, REFUNDED} — incluindo ausente/nulo — retorna
 * `"Status desconhecido"` (R2.7).
 */
export function rotuloStatus(status: string | null | undefined): string {
  if (status === null || status === undefined) return STATUS_DESCONHECIDO;

  return ROTULOS_STATUS[status] ?? STATUS_DESCONHECIDO;
}

/**
 * Reduz (acumula) uma próxima `Pagina_Recargas` sobre as recargas já exibidas
 * (R1.3, R6.3). Concatena os itens de `proximaPagina` após `acumuladas`,
 * descartando as recargas cujo `id` já esteja presente no acumulado ou que se
 * repitam dentro da própria página recebida, e preserva a ordem de recebimento
 * (ordem decrescente por `createdAt` entregue pela API_Historico_Recargas).
 *
 * Função pura: não muta os arrays de entrada; sempre retorna um novo array.
 */
export function acumularRecargas(
  acumuladas: readonly Recarga[],
  proximaPagina: readonly Recarga[],
): Recarga[] {
  const idsVistos = new Set<string>();
  const resultado: Recarga[] = [];

  for (const recarga of acumuladas) {
    if (idsVistos.has(recarga.id)) continue;
    idsVistos.add(recarga.id);
    resultado.push(recarga);
  }

  for (const recarga of proximaPagina) {
    if (idsVistos.has(recarga.id)) continue;
    idsVistos.add(recarga.id);
    resultado.push(recarga);
  }

  return resultado;
}
