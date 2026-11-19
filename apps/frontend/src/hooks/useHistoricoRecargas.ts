import { useCallback, useEffect, useRef, useState } from 'react';
import { buscarHistoricoRecargas } from '../utils/recargasClient';
import { acumularRecargas } from '../utils/formatoRecarga';
import {
  PAGINA_INICIAL,
  TAMANHO_PAGINA_PADRAO,
  type Recarga,
} from '../types/recargas.types';

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

export interface RetornoHistoricoRecargas {
  estado: EstadoUIHistorico;
  recargas: Recarga[]; // itens acumulados, ordem decrescente por createdAt
  temMais: boolean; // controla visibilidade de "carregar mais" (R6.1, R6.5)
  carregandoMais: boolean; // desabilita o controle enquanto pendente (R6.4)
  recarregarInicial: () => void; // retry da primeira pagina (R5.3)
  carregarMais: () => void; // proxima pagina (R6.2) e retry da mesma pagina falha (R6.6)
}

/**
 * Hook de dados da Tela_Historico de recargas (CHA-196).
 *
 * Encapsula a maquina de estados da UI, a paginacao incremental, a acumulacao
 * com deduplicacao (via `acumularRecargas`) e os dois modos de erro (primeira
 * pagina vs. carregar mais). Nao trata `401`: o interceptor global de `api`
 * remove o token e redireciona ao login (R5.5, R7.7). Segue o padrao de
 * `useSaldoCoins.ts`, usando a flag `ativo` para evitar atualizacao de estado
 * apos a desmontagem.
 */
export function useHistoricoRecargas(): RetornoHistoricoRecargas {
  const [estado, setEstado] = useState<EstadoUIHistorico>('carregando-inicial');
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [temMais, setTemMais] = useState(false);

  /**
   * Proxima pagina a solicitar em `carregarMais`. Memoriza a pagina da ultima
   * requisicao falha para permitir o retry da mesma pagina (R6.6).
   */
  const proximaPaginaRef = useRef(PAGINA_INICIAL + 1);

  /**
   * Flag de ciclo de vida: usada pelas callbacks assincronas para evitar
   * atualizar o estado apos a desmontagem do componente (padrao de
   * `useSaldoCoins.ts`).
   */
  const ativoRef = useRef(true);

  const carregarInicial = useCallback(() => {
    setEstado('carregando-inicial');
    setRecargas([]);
    setTemMais(false);
    proximaPaginaRef.current = PAGINA_INICIAL + 1;

    buscarHistoricoRecargas({
      page: PAGINA_INICIAL,
      pageSize: TAMANHO_PAGINA_PADRAO,
    })
      .then((resposta) => {
        if (!ativoRef.current) return;
        const itens = resposta.items ?? [];
        if (itens.length === 0) {
          setRecargas([]);
          setTemMais(false);
          setEstado('vazio');
          return;
        }
        setRecargas(acumularRecargas([], itens));
        setTemMais(resposta.hasMore);
        setEstado('lista');
      })
      .catch(() => {
        // 401 nao chega aqui com efeito: o interceptor global redireciona ao
        // login. Qualquer outro erro/timeout cai em erro-inicial (R5.1).
        if (!ativoRef.current) return;
        setRecargas([]);
        setTemMais(false);
        setEstado('erro-inicial');
      });
  }, []);

  const carregarMais = useCallback(() => {
    // So faz sentido em lista/erro-carregar-mais; ignora cliques espurios
    // (ex.: durante um carregamento ja em andamento).
    setEstado((estadoAtual) => {
      if (estadoAtual !== 'lista' && estadoAtual !== 'erro-carregar-mais') {
        return estadoAtual;
      }

      const pagina = proximaPaginaRef.current;

      buscarHistoricoRecargas({ page: pagina, pageSize: TAMANHO_PAGINA_PADRAO })
        .then((resposta) => {
          if (!ativoRef.current) return;
          const itens = resposta.items ?? [];
          if (itens.length > 0) {
            setRecargas((anteriores) => acumularRecargas(anteriores, itens));
          }
          // Proxima pagina vazia mantem os itens e oculta o controle (R6.7).
          setTemMais(itens.length === 0 ? false : resposta.hasMore);
          proximaPaginaRef.current = pagina + 1;
          setEstado('lista');
        })
        .catch(() => {
          // Mantem os itens exibidos e memoriza a pagina falha para retry da
          // mesma pagina (R6.6). O 401 e delegado ao interceptor global.
          if (!ativoRef.current) return;
          proximaPaginaRef.current = pagina;
          setEstado('erro-carregar-mais');
        });

      return 'carregando-mais';
    });
  }, []);

  useEffect(() => {
    ativoRef.current = true;
    carregarInicial();
    return () => {
      ativoRef.current = false;
    };
  }, [carregarInicial]);

  return {
    estado,
    recargas,
    temMais,
    carregandoMais: estado === 'carregando-mais',
    recarregarInicial: carregarInicial,
    carregarMais,
  };
}
