import { useCallback, useEffect, useState } from 'react';
import { sessao } from '../utils/sessao';
import { buscarSaldoCoins } from '../utils/coinsClient';

type EstadoSaldo = {
  /** Saldo atual; null enquanto carrega ou em erro. */
  saldo: number | null;
  carregando: boolean;
  erro: boolean;
  /** Recarrega o saldo (ex.: apos ganhar pontos num simulado). */
  recarregar: () => void;
};

/**
 * Busca o saldo de coins (Learn-to-Earn) do aluno logado via Servico_Sessao.
 * Compartilhado pelo chip do header (CHA-187) e pela loja de recompensas.
 */
export function useSaldoCoins(): EstadoSaldo {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const recarregar = useCallback(() => {
    let ativo = true;
    setCarregando(true);
    setErro(false);
    buscarSaldoCoins(sessao.getUserId(), sessao.getAuthToken())
      .then((valor) => {
        if (ativo) setSaldo(valor);
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    const cancelar = recarregar();
    return cancelar;
  }, [recarregar]);

  return { saldo, carregando, erro, recarregar };
}