import { useEffect, useRef, useState, type ReactNode } from 'react';
import './Reveal.css';

/**
 * Revela o conteudo com uma animacao suave quando ele entra na viewport.
 * Usa IntersectionObserver (barato). Respeita prefers-reduced-motion: nesse
 * caso o conteudo ja aparece visivel, sem transicao.
 */
type RevealProps = {
  children: ReactNode;
  /** Atraso em ms para efeito escalonado entre itens. */
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisivel(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisivel(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visivel ? 'reveal--visivel' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}