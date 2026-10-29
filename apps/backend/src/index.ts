import { createServer } from 'http';
import { app } from './server';
import { initializeSocket } from './socket';

const PORT = process.env.PORT || 3000;
const server = createServer(app); //criar serv http e passar o app para que o socket.io funcione 
export const io = initializeSocket(server); //criar socket.io e passar o server para que o socket.io funcione

if (process.env.NODE_ENV !== 'production') {
    server.listen(PORT, () => console.log(`Server running on: \n> http://localhost:${PORT}\n`))
    //iniciar o server e logar a porta que ele está rodando
}

export default app;