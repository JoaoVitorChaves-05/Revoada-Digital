import ComunidadePostScreen from '../screens/comunidadepostscreen';

/**
 * Rota da lista da comunidade (/comunidade). A tela navega sozinha: clicar num
 * post leva a /comunidade/:postId e o usuário vem do AuthContext.
 */
export function ComunidadeRoute() {
  return <ComunidadePostScreen />;
}
