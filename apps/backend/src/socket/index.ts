import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function initializeSocket(server: HttpServer): SocketIOServer {
    return new SocketIOServer(server, {
        cors: {
            origin: '*', // Permitir todas as origens (não recomendado para produção)
        },
    });
}