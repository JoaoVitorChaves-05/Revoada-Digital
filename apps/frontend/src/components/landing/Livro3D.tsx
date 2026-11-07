import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Livro 3D decorativo da landing. Começa FECHADO e abre conforme `progress`
 * (0 = fechado, 1 = aberto), controlado pelo scroll.
 *
 * Acessibilidade: decorativo (wrapper com aria-hidden). Com `reducedMotion`
 * fica numa pose levemente aberta e estatica, sem animar.
 */

type LivroProps = {
  progress: number;
  reducedMotion: boolean;
};

const COR_CAPA = '#3730a3';
const COR_PAGINA = '#f1f5f9';
const COR_LOMBADA = '#f97316';

const LARGURA = 1.5;
const ALTURA = 2.1;
const ESPESSURA_CAPA = 0.06;

/**
 * Uma capa que gira em torno da lombada (x=0). Fechada: rotacao ~0 (deitada
 * sobre o miolo). Aberta: gira ate ~180 graus para o lado.
 */
function Capa({
  lado,
  progress,
  reducedMotion,
  titulo,
  zBase,
}: {
  lado: 'esquerda' | 'direita';
  progress: number;
  reducedMotion: boolean;
  titulo?: boolean;
  zBase: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const sinal = lado === 'esquerda' ? -1 : 1;

  useFrame(() => {
    if (!ref.current) return;
    const p = reducedMotion ? 0.35 : progress;
    // progress 0 = fechado (mostra a capa/titulo); progress 1 = aberto (~165 graus).
    const alvo = sinal * THREE.MathUtils.degToRad(p * 165);
    ref.current.rotation.y = reducedMotion
      ? alvo
      : THREE.MathUtils.lerp(ref.current.rotation.y, alvo, 0.12);
  });

  return (
    <group ref={ref} position={[0, 0, zBase]}>
      {/* A capa se estende a partir da lombada (dobradica em x=0). */}
      <group position={[(sinal * LARGURA) / 2, 0, 0]}>
        <RoundedBox args={[LARGURA, ALTURA, ESPESSURA_CAPA]} radius={0.03} smoothness={4} castShadow>
          <meshStandardMaterial color={COR_CAPA} roughness={0.5} metalness={0.1} />
        </RoundedBox>
        {titulo && (
          <Text
            position={[0, 0, ESPESSURA_CAPA / 2 + 0.01]}
            fontSize={0.16}
            maxWidth={LARGURA - 0.3}
            textAlign="center"
            color={COR_LOMBADA}
            anchorX="center"
            anchorY="middle"
          >
            REVOADA{'\n'}DIGITAL
          </Text>
        )}
      </group>
    </group>
  );
}

/**
 * Miolo de paginas: so aparece quando o livro esta abrindo (opacidade cresce
 * com o progresso), para nao "vazar" por baixo das capas fechadas.
 */
function Miolo({ progress, reducedMotion }: { progress: number; reducedMotion: boolean }) {
  const matL = useRef<THREE.MeshStandardMaterial>(null);
  const matR = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const p = reducedMotion ? 0.35 : progress;
    // paginas aparecem conforme o livro abre.
    const op = THREE.MathUtils.clamp((p - 0.15) * 1.6, 0, 1);
    if (matL.current) matL.current.opacity = op;
    if (matR.current) matR.current.opacity = op;
  });

  // Paginas um pouco menores que a capa (margem) e posicionadas ATRAS dela,
  // encaixadas no vao do livro — por isso z negativo e leve inclinacao para dentro.
  const margemL = 0.12;
  const largPagina = LARGURA - margemL;
  const altPagina = ALTURA - 0.14;

  return (
    <group position={[0, 0, -0.06]}>
      {/* pagina esquerda */}
      <mesh position={[-(largPagina / 2) - 0.02, 0, 0]} rotation={[0, 0.04, 0]}>
        <planeGeometry args={[largPagina, altPagina]} />
        <meshStandardMaterial ref={matL} color={COR_PAGINA} roughness={0.95} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      {/* pagina direita */}
      <mesh position={[(largPagina / 2) + 0.02, 0, 0]} rotation={[0, -0.04, 0]}>
        <planeGeometry args={[largPagina, altPagina]} />
        <meshStandardMaterial ref={matR} color={COR_PAGINA} roughness={0.95} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Lombada fina ligando as capas (sempre visivel, no centro). */
function Lombada() {
  return (
    <mesh position={[0, 0, -0.03]}>
      <boxGeometry args={[0.08, ALTURA, ESPESSURA_CAPA + 0.02]} />
      <meshStandardMaterial color={COR_LOMBADA} roughness={0.4} metalness={0.15} />
    </mesh>
  );
}

function Cena({ progress, reducedMotion }: LivroProps) {
  return (
    <Float speed={reducedMotion ? 0 : 1} rotationIntensity={reducedMotion ? 0 : 0.2} floatIntensity={reducedMotion ? 0 : 0.4}>
      {/* Livro em pe, levemente inclinado, de frente para a camera. */}
      <group rotation={[0.2, -0.1, 0]}>
        <Lombada />
        <Miolo progress={progress} reducedMotion={reducedMotion} />
        <Capa lado="esquerda" progress={progress} reducedMotion={reducedMotion} zBase={-0.05} />
        {/* capa frontal com o titulo (fica por cima quando fechado) */}
        <Capa lado="direita" progress={progress} reducedMotion={reducedMotion} titulo zBase={0.05} />
      </group>
    </Float>
  );
}

export default function Livro3D({ progress, reducedMotion }: LivroProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.4, 6], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#c7d2fe" />
      <Suspense fallback={null}>
        <Cena progress={progress} reducedMotion={reducedMotion} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}