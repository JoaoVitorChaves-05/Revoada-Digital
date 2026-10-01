import { QuestionFilters } from './components/QuestionFilters';
import { QuestionGrid } from './components/QuestionGrid';

export default function App() {
  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#36367c' }}>Banco de Questões</h1>
      
      <QuestionFilters />
      <QuestionGrid />
    </div>
  );
}