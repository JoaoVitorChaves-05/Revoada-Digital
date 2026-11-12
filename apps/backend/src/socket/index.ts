import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerChatHandlers } from './handlers/chat';
import type {
    ChatServer,
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from './types';
import { identityMiddleware } from './middlewares/identity';
import { setIO } from './instance';

// Origens permitidas para o handshake do Socket.IO. Configuráveis por env
// (CORS_ORIGINS, separadas por vírgula), espelhando o CORS do Express. Em
// produção, inclui o frontend no Vercel por padrão.
const defaultOrigins = [
    'https://revoada-digital-frontend.vercel.app',
    'http://localhost:5173',
];

const allowedOrigins = (process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : defaultOrigins
).map((origin) => origin.trim()).filter(Boolean);

export function initializeSocket(server: HttpServer): ChatServer {
    const io = new SocketIOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server, {
        cors: {
            // Função (em vez de lista) para efetivamente RECUSAR o handshake de
            // origens não permitidas no servidor — inclusive no transporte
            // WebSocket, onde a política de CORS do navegador não se aplica.
            origin(origin, callback) {
                // Conexões sem Origin (ex.: clientes nativos, health checks).
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                    return;
                }
                callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
            },
            methods: ['GET', 'POST'],
        },
    });

    io.use(identityMiddleware);

    io.on('connection', (socket) => {
        registerChatHandlers(socket);
    });

    setIO(io);

    return io;
}
