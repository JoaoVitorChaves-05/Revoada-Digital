import { createServer } from 'http';
import { io as createClient, type Socket as ClientSocket } from 'socket.io-client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emitChatMessage } from './handlers/chat';
import { initializeSocket } from './index';
import { resetIO } from './instance';
import type { ChatMessagePayload, ChatServer } from './types';

function buildMessage(
    overrides: Partial<ChatMessagePayload> = {},
): ChatMessagePayload {
    return {
        id: 'message-1',
        conversationId: 'conversa-1',
        content: 'Hello',
        createdAt: new Date().toISOString(),
        sender: {
            id: 'sender-1',
            full_name: 'Remetente',
            profileType: 'STUDENT',
        },
        receiverId: 'recipient-1',
        ...overrides,
    };
}

describe('initializeSocket', () => {
    afterEach(() => {
        resetIO();
    });

    it('rejects a connection without a user id', async () => {
        const { url, close } = await createTestServer();
        const client = createClient(url, clientOptions());

        try {
            await expect(connect(client)).rejects.toMatchObject({
                message: 'Unauthorized',
            });
        } finally {
            client.disconnect();
            await close();
        }
    });

    it('accepts an identified user and joins the matching room', async () => {
        const { io, url, close } = await createTestServer();
        const client = createClient(url, clientOptions({ userId: 'user-123' }));

        try {
            await connect(client);

            await vi.waitFor(async () => {
                const roomSockets = await io.in('user:user-123').fetchSockets();
                expect(roomSockets).toHaveLength(1);
            });
        } finally {
            client.disconnect();
            await close();
        }
    });

    it('delivers newMsg to the receiver and the sender, but not to third parties', async () => {
        const { io, url, close } = await createTestServer();
        const recipient = createClient(url, clientOptions({ userId: 'recipient-1' }));
        const sender = createClient(url, clientOptions({ userId: 'sender-1' }));
        const otherUser = createClient(url, clientOptions({ userId: 'other-1' }));

        try {
            await Promise.all([
                connect(recipient),
                connect(sender),
                connect(otherUser),
            ]);

            const message = buildMessage({
                receiverId: 'recipient-1',
                sender: {
                    id: 'sender-1',
                    full_name: 'Remetente',
                    profileType: 'STUDENT',
                },
            });

            const receivedByRecipient = new Promise<unknown>((resolve) => {
                recipient.once('newMsg', resolve);
            });
            const receivedBySender = new Promise<unknown>((resolve) => {
                sender.once('newMsg', resolve);
            });
            const unexpectedMessage = new Promise<unknown>((resolve) => {
                otherUser.once('newMsg', resolve);
            });
            const noMessage = Symbol('no message');

            emitChatMessage(io, message);

            await expect(receivedByRecipient).resolves.toEqual(message);
            await expect(receivedBySender).resolves.toEqual(message);
            await expect(
                Promise.race([
                    unexpectedMessage,
                    new Promise<typeof noMessage>((resolve) => setTimeout(() => resolve(noMessage), 100)),
                ]),
            ).resolves.toBe(noMessage);
        } finally {
            recipient.disconnect();
            sender.disconnect();
            otherUser.disconnect();
            await close();
        }
    });
});

function clientOptions(auth?: Record<string, string>) {
    return {
        auth,
        autoConnect: false,
        reconnection: false,
        transports: ['websocket' as const],
    };
}

function connect(socket: ClientSocket): Promise<void> {
    return new Promise((resolve, reject) => {
        socket.once('connect', resolve);
        socket.once('connect_error', reject);
        socket.connect();
    });
}

async function createTestServer(): Promise<{
    io: ChatServer;
    url: string;
    close: () => Promise<void>;
}> {
    const httpServer = createServer();
    const io = initializeSocket(httpServer);

    await new Promise<void>((resolve, reject) => {
        httpServer.once('error', reject);
        httpServer.listen(0, resolve);
    });

    const address = httpServer.address();
    if (!address || typeof address === 'string') {
        await new Promise<void>((resolve) => io.close(() => resolve()));
        throw new Error('Could not determine the HTTP server port');
    }

    return {
        io,
        url: `http://localhost:${address.port}`,
        close: () => new Promise<void>((resolve) => io.close(() => resolve())),
    };
}
