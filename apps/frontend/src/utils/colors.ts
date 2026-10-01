export const getDificuldadeColors = (nivel: string) => {
  switch (nivel.toLowerCase()) {
    case 'fácil': return { bg: '#dcfce7', text: '#166534' };
    case 'média': return { bg: '#fef08a', text: '#854d0e' };
    case 'difícil': return { bg: '#fee2e2', text: '#b91c1c' };
    default: return { bg: '#f4f4f5', text: '#3f3f46' };
  }
};
