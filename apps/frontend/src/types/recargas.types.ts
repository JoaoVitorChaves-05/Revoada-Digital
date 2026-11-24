/** Valores de Status_Recarga definidos no glossario (R7.5). */
export type StatusRecarga = 'PENDING' | 'COMPLETED' | 'REFUNDED';

/**
 * Uma Recarga retornada pela API_Historico_Recargas (R7.4, R7.5).
 * NOTA (ponta solta): `catalogItemName` deriva de RechargeCatalogItem.name;
 * o Payment do backend guarda apenas catalogItemId, entao o backend precisara
 * incluir/join o nome na resposta do historico.
 */
export interface Recarga {
  id: string; // identificador unico (dedupe de paginacao — R6.3)
  catalogItemName: string; // nome do item de catalogo (R2.2)
  amountBRL: number; // valor em BRL, 0,01..999999999,99 (R2.2, R7.5)
  coinsSpent: number; // pontos gastos, inteiro >= 0 (R2.3, R7.5)
  status: StatusRecarga; // R2.4, R7.5
  phoneNumber: string; // telefone recarregado (R2.5)
  createdAt: string; // ISO 8601 (R2.1, R7.5)
}

/** Parametros de paginacao enviados a API (R7.2, R7.3). */
export interface ParametrosPaginacao {
  page: number; // inteiro >= 1, default 1
  pageSize: number; // inteiro 1..50, default 20
}

export const PAGINA_INICIAL = 1; // R7.3
export const TAMANHO_PAGINA_PADRAO = 20; // R1.1, R7.3

/** Resposta paginada da API_Historico_Recargas (shape proposto, a confirmar). */
export interface RespostaHistoricoRecargas {
  items: Recarga[];
  page: number;
  pageSize: number;
  hasMore: boolean; // indica existencia de mais itens (R6.1, R6.5)
}
