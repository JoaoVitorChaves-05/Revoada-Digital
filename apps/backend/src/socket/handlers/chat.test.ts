import { createServer } from 'http';
import { io as createClient, type Socket as ClientSocket } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeSocket } from '../index';
import { resetIO } from '../instance';
import type { ChatServer } from '../types';

const enviarMock = vi.fn();
const marcarComoLidasMock = vi.fn();

vi.mock('../../services/chat.message.service', () => ({
	ChatSendError: class ChatSendError extends Error {
		constructor(
			public readonly code: string,
			message: string,
		) {
			super(message);
		}
	},
	chatMessageService: {
		enviar: (...args: unknown[]) => enviarMock(...args),
	},
}));

vi.mock('../../services/chat.read.service', () => ({
	chatReadService: {
		marcarComoLidas: (...args: unknown[]) =>
			marcarComoLidasMock(...args),
	},
}));

const senderId = '550e8400-e29b-41d4-a716-446655440000';
const receiverId = '550e8400-e29b-41d4-a716-446655440001';

describe('registerChatHandlers - sendMsg', () => {
	beforeEach(() => {
		enviarMock.mockReset();
		marcarComoLidasMock.mockReset();
	});

	afterEach(() => {
		resetIO();
	});

	it('persiste e entrega newMsg ao remetente e destinatário', async () => {
		const createdAt = new Date().toISOString();
		enviarMock.mockResolvedValue({
			id: 'm1',
			conversationId: 'conversa-1',
			content: 'Olá!',
			createdAt,
			sender: {
				id: senderId,
				full_name: 'Remetente',
				profileType: 'STUDENT',
			},
			receiverId,
		});

		const { url, close } = await createTestServer();
		const sender = createClient(url, clientOptions({ userId: senderId }));
		const recipient = createClient(
			url,
			clientOptions({ userId: receiverId }),
		);

		try {
			await Promise.all([connect(sender), connect(recipient)]);

			const delivered = new Promise<any>((resolve) => {
				recipient.once('newMsg', resolve);
			});

			sender.emit('sendMsg', { receiverId, content: 'Olá!' });

			const message = await delivered;
			expect(message.content).toBe('Olá!');
			expect(message.sender.id).toBe(senderId);
			expect(enviarMock).toHaveBeenCalledWith({
				senderId,
				receiverId,
				content: 'Olá!',
			});
		} finally {
			sender.disconnect();
			recipient.disconnect();
			await close();
		}
	});

	it('emite sendMsgError quando o payload é inválido, sem chamar o service', async () => {
		const { url, close } = await createTestServer();
		const sender = createClient(url, clientOptions({ userId: senderId }));

		try {
			await connect(sender);

			const errored = new Promise<any>((resolve) => {
				sender.once('sendMsgError', resolve);
			});

			sender.emit('sendMsg', { receiverId: 'id-invalido', content: '' });

			const error = await errored;
			expect(error.code).toBe('VALIDATION_ERROR');
			expect(enviarMock).not.toHaveBeenCalled();
		} finally {
			sender.disconnect();
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
