// ============================================================================
// CÓDIGO TEMPORÁRIO DE DESENVOLVIMENTO
// ----------------------------------------------------------------------------
// Mock da API_Historico_Recargas (`GET /payments/history`), que ainda NÃO
// existe no backend. Serve apenas para validar visualmente loading, paginação
// incremental, lista vazia, dedupe e (opcionalmente) o estado de erro sem
// depender do endpoint real. REMOVER/DESLIGAR na integração com a API real.
//
// Ligado apenas via flag de dev (`VITE_RECARGAS_HISTORICO_MOCK === 'true'`),
// consumida exclusivamente por `recargasClient`. Nenhum outro módulo (página,
// hook, tipos) importa este arquivo. Desligado por padrão.
//
// NÃO simula 401 — isso é responsabilidade do interceptor global de `api`.
// ============================================================================
import type {
  RespostaHistoricoRecargas,
  ParametrosPaginacao,
  Recarga,
  StatusRecarga,
} from '../types/recargas.types';

/** Atraso simulado para exercitar o estado de carregamento (R1.2, R3.1). */
const LATENCIA_MOCK_MS = 600;

/**
 * Total fixo de Recargas fake. Ajuste para exercitar cenários:
 * - múltiplas páginas + "próxima página vazia" (com o `pageSize` padrão de 20);
 * - lista vazia (R4): defina como 0.
 */
const TOTAL_RECARGAS_MOCK = 45;

const STATUS_CICLO: StatusRecarga[] = ['COMPLETED', 'PENDING', 'REFUNDED'];

/**
 * Conjunto fixo de Recargas fake, ordenado DECRESCENTE por `createdAt`
 * (mais recentes primeiro), igual à ordenação proposta no contrato (R1.1).
 * Gerado uma única vez no carregamento do módulo para manter estabilidade
 * entre páginas (dedupe por `id`).
 */
const RECARGAS_MOCK: Recarga[] = (() => {
  const base = Date.now();
  const itens: Recarga[] = Array.from({ length: TOTAL_RECARGAS_MOCK }, (_, i) => ({
    id: `mock-recarga-${i + 1}`,
    catalogItemName: `Recarga de celular R$ ${(i % 5) + 1}0,00`,
    amountBRL: ((i % 5) + 1) * 10,
    coinsSpent: ((i % 5) + 1) * 100,
    status: STATUS_CICLO[i % STATUS_CICLO.length],
    phoneNumber: `119${String(10000000 + i).slice(0, 8)}`,
    // Cada item 1 hora mais antigo que o anterior.
    createdAt: new Date(base - i * 60 * 60 * 1000).toISOString(),
  }));
  // Garante a ordenação decrescente por createdAt independentemente da geração.
  return itens.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
})();

function atrasar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retorna uma Pagina_Recargas fake com EXATAMENTE o shape de
 * RespostaHistoricoRecargas, respeitando `page`/`pageSize` e derivando
 * `hasMore` do total fixo de itens fake. Permite múltiplas páginas, próxima
 * página vazia (`items: []`, `hasMore: false`) e, com `TOTAL_RECARGAS_MOCK = 0`,
 * a lista vazia (R4). NÃO simula 401.
 *
 * Com `VITE_RECARGAS_HISTORICO_MOCK_ERRO === 'true'`, rejeita após a latência
 * (sem status 401) para exercitar o estado de erro de R5.
 */
export async function buscarHistoricoRecargasMock(
  params: ParametrosPaginacao,
): Promise<RespostaHistoricoRecargas> {
  const { page, pageSize } = params;

  await atrasar(LATENCIA_MOCK_MS);

  if (import.meta.env.VITE_RECARGAS_HISTORICO_MOCK_ERRO === 'true') {
    throw new Error(
      'Mock de desenvolvimento: falha simulada da API_Historico_Recargas (sem 401).',
    );
  }

  const inicio = (page - 1) * pageSize;
  const fim = inicio + pageSize;
  const items = RECARGAS_MOCK.slice(Math.max(inicio, 0), Math.max(fim, 0));
  const hasMore = fim < RECARGAS_MOCK.length;

  return { items, page, pageSize, hasMore };
}
