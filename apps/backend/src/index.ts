import { createServer } from 'http';
import { app } from './server';
import { initializeSocket } from './socket';

const PORT = Number(process.env.PORT) || 3000;
const server = createServer(app); //criar serv http e passar o app para que o socket.io funcione
export const io = initializeSocket(server); //criar socket.io e passar o server para que o socket.io funcione

// Este é o entrypoint de processo persistente (local e hosts como o Railway),
// onde o Socket.IO precisa de um servidor HTTP de longa duração. O deploy
// serverless no Vercel usa api/index.ts (apenas o app Express), que NÃO passa
// por aqui — por isso o servidor sempre escuta neste arquivo.
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
