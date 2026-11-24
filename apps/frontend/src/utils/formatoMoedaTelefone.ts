/**
 * Formatação de moeda (BRL) e normalização/validação de telefone.
 *
 * Funções puras usadas pelo Recharge_Modal (CHA-62). A lógica aqui duplica a
 * da CHA-196 (ainda não mergeada); o nome do arquivo foi escolhido para evitar
 * colisão de merge com o `formatoRecarga.ts` daquela branch. Resta a dívida de
 * reconciliar a lógica numa única fonte quando as branches convergirem.
 */

const formatadorBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Regra de telefone: DDD (2 dígitos) + 9 + 8 dígitos = 11 dígitos. */
const REGRA_TELEFONE = /^\d{2}9\d{8}$/;

/** Formata um valor em reais no padrão pt-BR (ex.: 15 -> "R$ 15,00"). */
export function formatarBRL(amountBRL: number): string {
  return formatadorBRL.format(amountBRL);
}

/** Remove todos os caracteres não dígitos do texto digitado. */
export function normalizarTelefone(phoneValue: string): string {
  return phoneValue.replace(/\D/g, '');
}

/** true se o telefone normalizado casa com ^\d{2}9\d{8}$. */
export function telefoneValido(phoneValue: string): boolean {
  return REGRA_TELEFONE.test(normalizarTelefone(phoneValue));
}
