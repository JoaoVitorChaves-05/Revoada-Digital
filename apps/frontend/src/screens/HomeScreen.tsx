import { Suspense, lazy, useEffect, useState } from 'react';
import iconContainer from './icons/icon-container.png';
import { Reveal } from '../components/landing/Reveal';
import { RoletaIdealizadores } from '../components/landing/RoletaIdealizadores';
import { useReducedMotion } from '../utils/scroll';
import './HomeLanding.css';

// O livro 3D (three.js) e pesado: carrega sob demanda para nao atrasar o
// carregamento inicial da landing.
const Livro3D = lazy(() => import('../components/landing/Livro3D'));

type HomeScreenProps = {
  onCadastro: () => void;
  onLogin: () => void;
};

const DIFERENCIAIS = [
  {
    titulo: 'Learn-to-Earn',
    texto: 'Ganhe pontos ao concluir simulados e manter a frequência. Estudo que rende de verdade.',
  },
  {
    titulo: 'Questões por conceito',
    texto: 'Treinos personalizados por matéria, conceito e dificuldade para reforçar o que importa.',
  },
  {
    titulo: 'Feedback de desempenho',
    texto: 'Enxergue suas defasagens por área e descubra exatamente onde focar os estudos.',
  },
];

export function HomeScreen({ onCadastro, onLogin }: HomeScreenProps) {
  const reducedMotion = useReducedMotion();
  const [progresso, setProgresso] = useState(0);

  // Progresso de scroll do hero (0..1) controla a abertura do livro.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    const calcular = () => {
      frame = 0;
      const alvo = window.innerHeight * 1.2; // abre o livro ao longo da 1a dobra
      setProgresso(Math.min(1, Math.max(0, window.scrollY / alvo)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(calcular);
    };
    calcular();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="logo-wrap" aria-label="Revoada Digital">
          <div className="logo-mark"><img src={iconContainer} alt="Revoada Digital" /></div>
          <div className="logo-text">
            <span className="text-orange">Revoada</span>
            <span className="text-blue">Digital</span>
          </div>
        </div>


        <div className="header-actions">
          <button type="button" className="btn btn-link" onClick={onLogin}>Login</button>
          <button type="button" className="btn btn-primary" onClick={onCadastro}>Nova conta</button>
        </div>
      </header>

      <main className="landing">
        {/* HERO com livro 3D */}
        <section className="landing-hero" id="inicio">
          <div className="landing-hero__copy">
            <h1>O estudo que rende e a nota que sobe.</h1>
            <p>
              A Revoada Digital transforma o esforço de estudar para o ENEM em progresso real:
              simulados direcionados por matéria e conceito, feedback de desempenho e pontos por estudo.
            </p>
            <div className="cta-row">
              <button type="button" className="btn btn-primary large" onClick={onCadastro}>
                Começar a Praticar Grátis
              </button>
              <button type="button" className="btn btn-link" onClick={onLogin}>Já tenho conta</button>
            </div>
          </div>

          <div className="landing-hero__livro" aria-hidden="true">
            <Suspense fallback={<div className="landing-hero__livro-fallback" />}>
              <Livro3D progress={progresso} reducedMotion={reducedMotion} />
            </Suspense>
          </div>
        </section>

        {/* SOBRE */}
        <section className="landing-sobre" id="sobre">
          <Reveal>
            <h2>Uma plataforma gratuita, focada no ENEM</h2>
          </Reveal>
          <Reveal delay={120}>
            <p>
              Muitos alunos não sabem exatamente qual conteúdo precisam reforçar. A Revoada ajuda a
              identificar defasagens invisíveis com treinos focados e dashboards inteligentes, para
              uma evolução direcionada — sem perder tempo com o que você já domina.
            </p>
          </Reveal>
        </section>

        {/* DIFERENCIAIS */}
        <section className="landing-diferenciais" id="diferenciais">
          <Reveal>
            <h2>Por que a Revoada é diferente</h2>
          </Reveal>
          <div className="landing-diferenciais__grid">
            {DIFERENCIAIS.map((d, i) => (
              <Reveal key={d.titulo} delay={i * 120}>
                <article className="landing-card">
                  <h3>{d.titulo}</h3>
                  <p>{d.texto}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* NÚMEROS */}
        <section className="landing-numeros">
          <Reveal>
            <div className="landing-numeros__grid">
              <div><strong>2.700+</strong><span>Questões catalogadas</span></div>
              <div><strong>14</strong><span>Matérias do ENEM</span></div>
              <div><strong>100%</strong><span>Gratuito</span></div>
            </div>
          </Reveal>
        </section>

        {/* TIME / ROLETA */}
        <div id="time">
          <RoletaIdealizadores />
        </div>
      </main>
    </div>
  );
}