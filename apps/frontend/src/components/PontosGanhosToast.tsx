import { useEffect, useRef, useState } from 'react';

type Props = {
  /** Pontos ganhos a exibir. O toast so aparece quando > 0. */
  pontos: number;
  /** Tempo visivel antes de iniciar a saida (ms). Padrao 5000. */
  duracaoMs?: number;
};

// Detecta preferencia do usuario por menos animacoes (acessibilidade).
function prefereMenosMovimento(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Notificacao animada "+X pontos" exibida ao ganhar pontos (CHA-188).
 *
 * - Entra com slide + fade; o numero sobe de 0 ate `pontos` (contador animado).
 * - Respeita `prefers-reduced-motion`: mostra o valor final, sem animacao.
 * - Acessivel: `role="status"` + `aria-live="polite"` anunciam o ganho.
 */
export function PontosGanhosToast({ pontos, duracaoMs = 5000 }: Props) {
  const reduzido = prefereMenosMovimento();
  const [visivel, setVisivel] = useState(false);
  const [exibido, setExibido] = useState(reduzido ? pontos : 0);
  const rafRef = useRef<number | null>(null);

  // Entrada + agendamento da saida.
  useEffect(() => {
    if (pontos <= 0) return;
    const entrada = window.setTimeout(() => setVisivel(true), 50);
    const saida = window.setTimeout(() => setVisivel(false), duracaoMs);
    return () => {
      window.clearTimeout(entrada);
      window.clearTimeout(saida);
    };
  }, [pontos, duracaoMs]);

  // Contador animado (ignorado quando o usuario prefere menos movimento).
  useEffect(() => {
    if (pontos <= 0 || reduzido) return;
    const inicio = performance.now();
    const dur = 900;
    function passo(agora: number) {
      const t = Math.min(1, (agora - inicio) / dur);
      // easing suave (easeOutCubic)
      const e = 1 - Math.pow(1 - t, 3);
      setExibido(Math.round(e * pontos));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(passo);
      }
    }
    rafRef.current = requestAnimationFrame(passo);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pontos, reduzido]);

  if (pontos <= 0) return null;

  const transicao = reduzido ? 'none' : 'opacity 300ms ease, transform 300ms ease';
  const transform = reduzido
    ? 'none'
    : visivel
      ? 'translateY(0)'
      : 'translateY(-12px)';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 12,
        background: '#fffbeb',
        border: '1px solid #fde68a',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        color: '#92400e',
        fontWeight: 700,
        opacity: reduzido ? 1 : visivel ? 1 : 0,
        transform,
        transition: transicao,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 20 }}>🎉</span>
      <span>
        Você ganhou <strong>+{exibido}</strong> pontos!
      </span>
    </div>
  );
}