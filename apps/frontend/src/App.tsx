import { useState } from 'react';
import { QuestionFilters } from './components/QuestionFilters';
import { QuestionGrid } from './components/QuestionGrid';
import { theme } from '../src/utils/colors';

export default function App() {
  const [filtrosAtivos, setFiltrosAtivos] = useState<string[]>([]);

  return (
    <div style={{
      padding: '32px',
      fontFamily: 'sans-serif',
      maxWidth: '1200px',
      margin: '0 auto' }}>
      <h1 style={{ color: theme.text.title, marginBottom: '20px' }}>
        Banco de Questões - Revoada-Digital
      </h1>
      
      <QuestionFilters 
        filtrosAtivos = {filtrosAtivos} 
        setFiltrosAtivos={setFiltrosAtivos} 
      />
      
      <QuestionGrid filtrosAtivos = {filtrosAtivos} />
    </div>
  );
}