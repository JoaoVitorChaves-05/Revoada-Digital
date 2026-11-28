import { useNavigate } from 'react-router-dom';
import { Disciplinas } from '../pages/disciplinas/Disciplinas';

/**
 * Wrapper de rota das disciplinas. O cabeçalho navega sozinho; clicar em
 * "Estudar" leva o aluno para a geração de simulado.
 */
export function DisciplinasRoute() {
  const navigate = useNavigate();
  return (
    <Disciplinas
      onEstudar={() => navigate('/simulado/gerar')}
    />
  );
}