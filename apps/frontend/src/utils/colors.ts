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
  }
};