import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function initializeSocket(server: HttpServer): SocketIOServer {
    const io = new SocketIOServer(server, {
        cors: {
            origin: '*', // TODO: restringir junto com o CORS do Express
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Novo cliente conectado:', socket.id);

        socket.on('sendMsg', (data) => {
            console.log('Mensagem recebida do cliente:', data);
        });

        socket.on('disconnect', (reason) => {
            console.log('Cliente desconectado:', socket.id, reason);
        });
    });

    return io;
}