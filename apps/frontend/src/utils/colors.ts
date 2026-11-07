export const getDificuldadeColors = (nivel: string) => {
  switch (nivel.toLowerCase()) {
    case 'fácil': return { bg: '#dcfce7', text: '#166534' };
    case 'média': return { bg: '#fef08a', text: '#854d0e' };
    case 'difícil': return { bg: '#fee2e2', text: '#b91c1c' };
    default: return { bg: '#f4f4f5', text: '#3f3f46' };
  }
};

export const theme = {
  background: {
    grid: '#f8fafc',
    card: '#ffffff',
  },
  text: {
    title: '#18181b',
    subtitle: '#3f3f46',
    body: '#71717a',
  },
  button: {
    bgDefault: '#f8fafc',
    bgActive: '#e4e4e7',
    border: '#d4d4d8',
    text: '#3f3f46',
  },
  border: {
    card: '#e4e4e7',
  },
  shadow: {
    card: '0 2px 4px rgba(0,0,0,0.05)'
  },
  // Cores de destaque do dashboard ("Início"), seguindo o SVG do Figma.
  // Azul primario para elementos ativos/realce; laranja de acento.
  accent: {
    primary: '#2563eb',      // azul primario (destaque, barra do dia atual)
    primaryHover: '#1d4ed8', // azul em hover/estado pressionado
    primarySoft: '#dbeafe',  // azul claro para fundos de realce sutil
    orange: '#f97316',       // laranja de acento do SVG
    orangeSoft: '#ffedd5',   // laranja claro para fundos de acento
  },
  // Tons neutros para blocos/placeholders "em breve" (desabilitados/atenuados).
  placeholder: {
    bg: '#f4f4f5',       // fundo atenuado do bloco placeholder
    border: '#e4e4e7',   // borda do bloco placeholder
    text: '#a1a1aa',     // texto atenuado ("em breve")
    badgeBg: '#e4e4e7',  // fundo do selo textual "em breve"
    badgeText: '#52525b',// texto do selo "em breve"
  }
};

// Mapeamento Nivel_De_Defasagem -> cor (CHA-30).
// Semantica de desempenho traduzida para a paleta de getDificuldadeColors:
//   defasagem BAIXA = melhor desempenho -> verde ('fácil')
//   defasagem MÉDIA = intermediario     -> amarelo ('média')
//   defasagem ALTA  = pior (reforçar)   -> vermelho ('difícil')
import type { NivelDefasagem } from '../types/desempenho.types';

const NIVEL_PARA_DIFICULDADE: Record<NivelDefasagem, string> = {
  baixa: 'fácil',
  'média': 'média',
  alta: 'difícil',
};

export const coresDoNivelDefasagem = (nivel: NivelDefasagem) =>
  getDificuldadeColors(NIVEL_PARA_DIFICULDADE[nivel]);