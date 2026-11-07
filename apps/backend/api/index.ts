// Entrypoint serverless para o Vercel.
//
// Diferente de `src/index.ts` (usado no ambiente local), este arquivo NÃO cria
// um servidor HTTP de longa duração nem inicializa o Socket.IO. Ele apenas
// exporta o `app` do Express, que o runtime `@vercel/node` adapta como handler
// de função serverless por invocação.
//
// Motivo: inicializar `createServer(app)` + Socket.IO no carregamento do módulo
// quebrava as invocações serverless (FUNCTION_INVOCATION_FAILED / respostas
// inconsistentes no /auth/login). O Socket.IO exige um servidor persistente e
// não é suportado neste runtime; o tempo real precisa de outro host.
//
// To do: Criar servidor dedicado para o Socket.IO para implementação do Chat.
import { app } from '../src/server';

export default app;
