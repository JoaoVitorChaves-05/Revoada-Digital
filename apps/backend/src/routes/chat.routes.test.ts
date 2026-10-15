import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatService } from '../services/chat.service';
import chatRouter from './chat.routes';

vi.mock('../services/chat.service', () => ({
	chatService: {
		getMessageHistory: vi.fn(),
	},
}));

function createTestApp() {
	const app = express();

	app.use(express.json());
	app.use('/chat', chatRouter);

	return app;
}

const currentUserId = '550e8400-e29b-41d4-a716-446655440000';
const userId = '550e8400-e29b-41d4-a716-446655440001';

describe('GET /chat/messages/:userId', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('retorna 200 com o histórico de mensagens', async () => {
		const history = {
			conversationId: 'conversa-1',
			userId,
			messages: [
				{
					id: 'mensagem-1',
					content: 'Olá!',
					createdAt: new Date(),
					sender: {
						id: currentUserId,
						full_name: 'Usuário atual',
						profileType: 'STUDENT' as const,
					},
				},
			],
		};

		vi.mocked(
			chatService.getMessageHistory,
		).mockResolvedValue(history);

		const response = await request(createTestApp())
			.get(`/chat/messages/${userId}`)
			.set('x-user-id', currentUserId);

		expect(response.status).toBe(200);
		expect(response.body.conversationId).toBe('conversa-1');
		expect(response.body.messages).toHaveLength(1);
		expect(response.body.messages[0].content).toBe('Olá!');

		expect(
			chatService.getMessageHistory,
		).toHaveBeenCalledWith({
			currentUserId,
			userId,
		});
	});

	it('retorna 200 com lista vazia quando não existe conversa', async () => {
		vi.mocked(
			chatService.getMessageHistory,
		).mockResolvedValue({
			conversationId: null,
			userId,
			messages: [],
		});

		const response = await request(createTestApp())
			.get(`/chat/messages/${userId}`)
			.set('x-user-id', currentUserId);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			conversationId: null,
			userId,
			messages: [],
		});
	});

	it('retorna 400 quando o header x-user-id não é enviado', async () => {
		const response = await request(createTestApp())
			.get(`/chat/messages/${userId}`);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Dados inválidos');

		expect(
			chatService.getMessageHistory,
		).not.toHaveBeenCalled();
	});

	it('retorna 400 quando o ID da URL é inválido', async () => {
		const response = await request(createTestApp())
			.get('/chat/messages/usuario-invalido')
			.set('x-user-id', currentUserId);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Dados inválidos');

		expect(
			chatService.getMessageHistory,
		).not.toHaveBeenCalled();
	});

	it('retorna 400 ao consultar o próprio usuário', async () => {
		vi.mocked(
			chatService.getMessageHistory,
		).mockRejectedValue(
			new Error(
				'Não é possível consultar mensagens com o próprio usuário',
			),
		);

		const response = await request(createTestApp())
			.get(`/chat/messages/${currentUserId}`)
			.set('x-user-id', currentUserId);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe(
			'Não é possível consultar mensagens com o próprio usuário',
		);
	});

	it('retorna 404 quando algum usuário não existe', async () => {
		vi.mocked(
			chatService.getMessageHistory,
		).mockRejectedValue(
			new Error('Usuário não encontrado'),
		);

		const response = await request(createTestApp())
			.get(`/chat/messages/${userId}`)
			.set('x-user-id', currentUserId);

		expect(response.status).toBe(404);
		expect(response.body.error).toBe(
			'Usuário não encontrado',
		);
	});

	it('retorna 500 quando ocorre um erro inesperado', async () => {
		vi.mocked(
			chatService.getMessageHistory,
		).mockRejectedValue(
			new Error('Falha inesperada'),
		);

		const response = await request(createTestApp())
			.get(`/chat/messages/${userId}`)
			.set('x-user-id', currentUserId);

		expect(response.status).toBe(500);
		expect(response.body.error).toBe(
			'Erro ao buscar histórico de mensagens',
		);
	});
});