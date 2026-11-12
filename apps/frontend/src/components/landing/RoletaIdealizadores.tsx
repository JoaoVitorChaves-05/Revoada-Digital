import { useEffect, useRef } from 'react';
import './RoletaIdealizadores.css';
import { useReducedMotion } from '../../utils/scroll';

// COMO ADICIONAR AS FOTOS DO TIME:
// 1) Coloque os arquivos em: apps/frontend/src/assets/idealizadores/
//    usando o primeiro-e-ultimo nome em minusculo, ex.: maria-fernanda.jpg
// 2) Descomente/adicione os imports abaixo (ajuste .jpg/.png conforme o arquivo).
// 3) Preencha o campo `foto` de cada idealizador com a variavel importada.
// Enquanto nao houver foto, o card mostra as iniciais (fallback automatico).
import mariaFernanda from '../../assets/idealizadores/maria-fernanda.jpg';
import mariaClara from '../../assets/idealizadores/maria-clara.jpg';
import joaoVitor from '../../assets/idealizadores/joao-vitor.jpg';
import guilhermeSilva from '../../assets/idealizadores/guilherme-silva.jpg';
import luizaDugois from '../../assets/idealizadores/luiza-dugois.jpg';
// Sem foto ainda (usa iniciais): Guilherme Miguel, Gabrielle Suemi.

type Idealizador = { nome: string; foto?: string };

// Idealizadores do Revoada Digital (fonte: README).
const IDEALIZADORES: Idealizador[] = [
  { nome: 'Maria Fernanda Siqueira de Moraes', foto: mariaFernanda },
  { nome: 'Maria Clara Freire Araújo', foto: mariaClara },
  { nome: 'João Vitor Mâncio Chaves', foto: joaoVitor },
  { nome: 'Guilherme Miguel Spyrides Leite Ferro' },
  { nome: 'Gabrielle Suemi Iquejiri Alencar' },
  { nome: 'Guilherme Silva do Nascimento', foto: guilhermeSilva },
  { nome: 'Luiza Dugois Silva Alves', foto: luizaDugois },
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function Card({ nome, foto }: Idealizador) {
  return (
    <li className="roleta__card">
      {foto ? (
        <img className="roleta__foto" src={foto} alt={`Foto de ${nome}`} loading="lazy" draggable={false} />
      ) : (
        <div className="roleta__avatar" aria-hidden="true">{iniciais(nome)}</div>
      )}
      <span className="roleta__nome">{nome}</span>
    </li>
  );
}

const VELOCIDADE = 0.4; // px por frame no auto-giro

export function RoletaIdealizadores() {
  const reducedMotion = useReducedMotion();
  // Lista duplicada para o loop continuo.
  const lista = [...IDEALIZADORES, ...IDEALIZADORES];

  const trilhoRef = useRef<HTMLDivElement>(null);
  const fitaRef = useRef<HTMLUListElement>(null);
  // Estado do movimento guardado em refs (nao re-renderiza a cada frame).
  const estado = useRef({
    offset: 0,
    pausado: false,
    arrastando: false,
    startX: 0,
    startOffset: 0,
    larguraMetade: 0,
  });

  useEffect(() => {
    const fita = fitaRef.current;
    const trilho = trilhoRef.current;
    if (!fita || !trilho) return;

    // Metade da largura total = tamanho de uma "volta" (a lista aparece 2x).
    const medir = () => { estado.current.larguraMetade = fita.scrollWidth / 2; };
    medir();
    window.addEventListener('resize', medir);

    let raf = 0;
    const tick = () => {
      const s = estado.current;
      if (!reducedMotion && !s.pausado && !s.arrastando) {
        s.offset -= VELOCIDADE;
      }
      // Mantem o offset no intervalo [-larguraMetade, 0] para loop perfeito.
      if (s.larguraMetade > 0) {
        if (s.offset <= -s.larguraMetade) s.offset += s.larguraMetade;
        if (s.offset > 0) s.offset -= s.larguraMetade;
      }
      fita.style.transform = `translateX(${s.offset}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // --- Pausa no hover ---
    const onEnter = () => { estado.current.pausado = true; };
    const onLeave = () => {
      estado.current.pausado = false;
      estado.current.arrastando = false;
      trilho.classList.remove('roleta__trilho--arrastando');
    };
    trilho.addEventListener('mouseenter', onEnter);
    trilho.addEventListener('mouseleave', onLeave);

    // --- Arraste manual (pointer) ---
    const onDown = (e: PointerEvent) => {
      const s = estado.current;
      s.arrastando = true;
      s.startX = e.clientX;
      s.startOffset = s.offset;
      trilho.classList.add('roleta__trilho--arrastando');
      trilho.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = estado.current;
      if (!s.arrastando) return;
      s.offset = s.startOffset + (e.clientX - s.startX);
    };
    const onUp = (e: PointerEvent) => {
      const s = estado.current;
      s.arrastando = false;
      trilho.classList.remove('roleta__trilho--arrastando');
      if (trilho.hasPointerCapture(e.pointerId)) trilho.releasePointerCapture(e.pointerId);
    };
    trilho.addEventListener('pointerdown', onDown);
    trilho.addEventListener('pointermove', onMove);
    trilho.addEventListener('pointerup', onUp);
    trilho.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', medir);
      trilho.removeEventListener('mouseenter', onEnter);
      trilho.removeEventListener('mouseleave', onLeave);
      trilho.removeEventListener('pointerdown', onDown);
      trilho.removeEventListener('pointermove', onMove);
      trilho.removeEventListener('pointerup', onUp);
      trilho.removeEventListener('pointercancel', onUp);
    };
  }, [reducedMotion]);

  // Move a roleta um "passo" (~1.2 card) para o lado ao clicar nas setas.
  function deslocar(direcao: 'esquerda' | 'direita') {
    const passo = 200;
    estado.current.offset += direcao === 'esquerda' ? passo : -passo;
  }

  return (
    <section className="roleta" aria-labelledby="roleta-titulo">
      <h2 id="roleta-titulo" className="roleta__titulo">Quem idealizou a Revoada Digital</h2>
      <p className="roleta__subtitulo">
        Um time que acredita que estudar para o ENEM pode ser mais justo e direcionado.
        Passe o mouse para pausar e arraste para explorar.
      </p>

      <div className="roleta__wrap">
        <button
          type="button"
          className="roleta__seta roleta__seta--esq"
          aria-label="Ver anteriores"
          onClick={() => deslocar('esquerda')}
        >
          &#8249;
        </button>

        <div className="roleta__trilho" ref={trilhoRef} role="list" aria-label="Idealizadores">
          <ul className="roleta__fita" ref={fitaRef}>
            {lista.map((p, i) => (
              <Card key={`${p.nome}-${i}`} nome={p.nome} foto={p.foto} />
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="roleta__seta roleta__seta--dir"
          aria-label="Ver proximos"
          onClick={() => deslocar('direita')}
        >
          &#8250;
        </button>
      </div>
    </section>
  );
}