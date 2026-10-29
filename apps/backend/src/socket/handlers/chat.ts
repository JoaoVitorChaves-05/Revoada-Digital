import type { ChatServer, ChatSocket } from '../types';

export function registerChatHandlers(socket: ChatSocket): void {
    void socket.join(`user:${socket.data.userId}`);
}

export function emitChatMessage(
    io: ChatServer,
    receiverId: string,
    message: unknown,
): void {
    if (!receiverId.trim()) {
        throw new Error('receiverId must not be empty');
    }

    io.to(`user:${receiverId}`).emit('newMsg', message);
}
