import jwt from 'jsonwebtoken';
import type { ChatServer } from '../types';

type SocketMiddleware = Parameters<ChatServer['use']>[0];

/**
 * Autenticação do handshake do Socket.IO por JWT (mesmo token do login, emitido
 * por auth.service e verificado por auth.middleware). O cliente envia o token em
 * handshake.auth.token; aqui ele é verificado e o id do usuário (claim `sub`)
 * vira socket.data.userId, consumido pelos handlers.
 */
export const identityMiddleware: SocketMiddleware = (socket, next) => {
    const token = socket.handshake.auth.token;

    if (typeof token !== 'string' || token.trim() === '') {
        next(new Error('Unauthorized'));
        return;
    }

    const secretKey = process.env.JWT_SECRET;

    if (!secretKey || !secretKey.trim()) {
        next(new Error('Erro na configuração de autenticação'));
        return;
    }

    try {
        const decoded = jwt.verify(token.trim(), secretKey, {
            algorithms: ['HS256'],
        });

        if (
            typeof decoded === 'string' ||
            typeof decoded.sub !== 'string' ||
            !decoded.sub.trim() ||
            typeof decoded.exp !== 'number'
        ) {
            next(new Error('Unauthorized'));
            return;
        }

        socket.data.userId = decoded.sub;
        next();
    } catch {
        next(new Error('Unauthorized'));
    }
};
