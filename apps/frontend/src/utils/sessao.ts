/**
 * Serviço_Sessão (R2).
 *
 * Interface única que desacopla "quem é o aluno" do restante do Dashboard.
 * Nesta fase (Fase 1) resolve o userId a partir de uma fonte configurável com
 * fallback e nunca lança. A assinatura já prevê o token da Fase 2
 * (`getAuthToken`) sem exigir alteração nos componentes de bloco.
 */

export interface SessaoAluno {
  /** Retorna o userId atual do aluno. Nunca lança; usa fallback se preciso. */
  getUserId(): string;
  /**
   * Ponto de extensao Fase 2: token de autenticacao.
   * Nesta fase retorna null (auth ainda nao emite JWT).
   */
  getAuthToken(): string | null;
  /** Nome do aluno quando disponivel; null nesta fase (vira placeholder na saudacao). */
  getNomeAluno(): string | null;
}

export interface ConfigSessao {
  /** userId usado quando nenhuma sessao esta disponivel (R2.2). */
  userIdFallback: string;
}

/**
 * userId de teste central desta fase, espelhando o `currentAttemptId` de teste
 * usado em `src/App.tsx`. Ponto único de configuração do fallback (R2.2);
 * a Fase 2 substitui a origem do id sem tocar nos componentes de bloco.
 */
const USER_ID_FALLBACK = '769e855b-4a27-4a5b-a48c-170be35004d2';

type UsuarioLogadoMinimo = { id: string; full_name?: string };

/**
 * Le o usuario logado gravado pelo LoginScreen no localStorage.
 * Nunca lanca: retorna null se ausente, invalido ou fora do browser.
 */
function lerUsuarioLogado(): UsuarioLogadoMinimo | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem('usuarioLogado');
    if (!raw) return null;
    const dados = JSON.parse(raw) as UsuarioLogadoMinimo;
    return dados && typeof dados.id === 'string' && dados.id ? dados : null;
  } catch {
    return null;
  }
}

export function criarSessao(config: ConfigSessao): SessaoAluno {
  return {
    getUserId() {
      // Ordem de resolucao: usuario logado (localStorage) -> fallback.
      // O LoginScreen grava "usuarioLogado" apos o login (fase sem JWT).
      const logado = lerUsuarioLogado();
      return logado?.id ?? config.userIdFallback;
    },
    getAuthToken() {
      // Ainda nao ha JWT emitido nesta fase.
      return null;
    },
    getNomeAluno() {
      // Usa o nome do usuario logado quando disponivel; senao, placeholder.
      return lerUsuarioLogado()?.full_name ?? null;
    },
  };
}

/** Instancia padrao usada pela pagina; fallback vindo de config central. */
export const sessao: SessaoAluno = criarSessao({ userIdFallback: USER_ID_FALLBACK });
