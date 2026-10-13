import { createServer } from 'http';
import { io as createClient } from 'socket.io-client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initializeSocket } from './index';

describe('initializeSocket', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('accepts a client connection and receives sendMsg events', async () => {
        const httpServer = createServer();
        const socketServer = initializeSocket(httpServer);
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        await new Promise<void>((resolve, reject) => {
            httpServer.once('error', reject);
            httpServer.listen(0, resolve);
        });

        const address = httpServer.address();
        if (!address || typeof address === 'string') {
            throw new Error('Could not determine the HTTP server port');
        }

        const client = createClient(`http://localhost:${address.port}`, {
            autoConnect: false,
            reconnection: false,
            transports: ['websocket'],
        });

        try {
            const connected = new Promise<void>((resolve, reject) => {
                client.once('connect', resolve);
                client.once('connect_error', reject);
            });
            client.connect();
            await connected;

            const message = 'Mensagem de teste';
            client.emit('sendMsg', message);

            await vi.waitFor(() => {
                expect(logSpy).toHaveBeenCalledWith('Mensagem recebida do cliente:', message);
            });
        } finally {
            client.disconnect();
            await new Promise<void>((resolve) => socketServer.close(() => resolve()));
        }
    });
});
