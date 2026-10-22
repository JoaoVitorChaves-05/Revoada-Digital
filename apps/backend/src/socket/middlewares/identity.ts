import type { ChatServer } from '../types';

type SocketMiddleware = Parameters<ChatServer['use']>[0];

//TODO: provisório !! substituir por verificação JWT

export const identityMiddleware: SocketMiddleware = (socket, next) => {
    const userId = socket.handshake.auth.userId;

    if (typeof userId !== 'string' || userId.trim() === '') {
        next(new Error('Unauthorized'));
        return;
    }

    socket.data.userId = userId.trim();
    next();
};
