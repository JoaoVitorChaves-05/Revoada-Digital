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

export function initializeSocket(server: HttpServer): ChatServer {
    const io = new SocketIOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server, {
        cors: {
            origin: '*', // TODO: restringir junto com o CORS do Express
            methods: ['GET', 'POST'],
        },
    });

    io.use(identityMiddleware);

    io.on('connection', (socket) => {
        registerChatHandlers(socket);
    });

    return io;
}
