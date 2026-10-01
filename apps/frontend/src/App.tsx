import { QuestionFilters } from './components/QuestionFilters';
import { QuestionGrid } from './components/questionGrid';

export default function App() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#18181b' }}>Banco de Questões - Revoada-Digital</h1>
      
      {/* Aqui nós empilhamos as caixas que criamos! */}
      <QuestionFilters />
      <QuestionGrid />
    </div>
  );
}