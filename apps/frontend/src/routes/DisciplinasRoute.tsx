import { DisciplinasScreen } from '../screens/DisciplinasScreen';

/**
 * Wrapper de rota das disciplinas. O cabeçalho navega sozinho; as ações de
 * estudar/praticar redação ainda não têm destino de rota definido (tela de
 * questões futura), então permanecem como stubs no-op por enquanto.
 */
export function DisciplinasRoute() {
  return (
    <DisciplinasScreen
      onEstudar={(disciplinaId) => console.log('estudar', disciplinaId)}
      onPraticarRedacao={() => console.log('praticar redação')}
    />
  );
}
