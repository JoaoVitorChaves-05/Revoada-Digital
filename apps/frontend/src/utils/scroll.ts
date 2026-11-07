import { useEffect, useRef, useState } from 'react';

/**
 * Retorna true quando o usuario prefere menos movimento (prefers-reduced-motion).
 * Usado para desligar animacoes 3D/entrada por scroll (acessibilidade).
 */
export function useReducedMotion(): boolean {
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduzido(mq.matches);
    const onChange = () => setReduzido(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduzido;
}

/**
 * Progresso de scroll (0..1) de um elemento: 0 quando o topo dele chega ao
 * fundo da viewport, 1 quando o fundo dele sai pelo topo. Usa requestAnimationFrame
 * para nao sobrecarregar o evento de scroll.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;

    const calcular = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 quando o topo do elemento esta no fundo da tela;
      // 1 quando o fundo do elemento passou pelo topo.
      const total = rect.height + vh;
      const percorrido = vh - rect.top;
      const p = Math.min(1, Math.max(0, percorrido / total));
      setProgress(p);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(calcular);
    };

    calcular();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, progress };
}