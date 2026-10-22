import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatRepository } from '../repositories/chat.repository';
import { ChatService } from './chat.service';

vi.mock('../repositories/chat.repository', () => ({
	ChatRepository: class {},
}));

function createRepositoryMock() {
	return {
		findUserById: vi.fn(),
		findDirectConversation: vi.fn(),
	};
}

const currentUserId = '550e8400-e29b-41d4-a716-446655440000';
const userId = '550e8400-e29b-41d4-a716-446655440001';

describe('ChatService', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: ChatService;

	beforeEach(() => {
		repository = createRepositoryMock();

		service = new ChatService(
			repository as unknown as ChatRepository,
		);
	});

	it('retorna o histórico de uma conversa direta', async () => {
		repository.findUserById
			.mockResolvedValueOnce({ id: currentUserId })
			.mockResolvedValueOnce({ id: userId });

		const messages = [
			{
				id: 'mensagem-1',
				content: 'Olá!',
				createdAt: new Date(),
				sender: {
					id: currentUserId,
					full_name: 'Usuário atual',
					profileType: 'STUDENT',
				},
			},
		];

		repository.findDirectConversation.mockResolvedValue({
			id: 'conversa-1',
			messages,
		});

		await expect(
			service.getMessageHistory({
				currentUserId,
				userId,
			}),
		).resolves.toEqual({
			conversationId: 'conversa-1',
			userId,
			messages,
		});

		expect(
			repository.findDirectConversation,
		).toHaveBeenCalledWith(currentUserId, userId);
	});

	it('retorna lista vazia quando ainda não existe conversa', async () => {
		repository.findUserById
			.mockResolvedValueOnce({ id: currentUserId })
			.mockResolvedValueOnce({ id: userId });

		repository.findDirectConversation.mockResolvedValue(null);

		await expect(
			service.getMessageHistory({
				currentUserId,
				userId,
			}),
		).resolves.toEqual({
			conversationId: null,
			userId,
			messages: [],
		});
	});

	it('rejeita a consulta quando um usuário não existe', async () => {
		repository.findUserById
			.mockResolvedValueOnce({ id: currentUserId })
			.mockResolvedValueOnce(null);

		await expect(
			service.getMessageHistory({
				currentUserId,
				userId,
			}),
		).rejects.toThrow('Usuário não encontrado');

		expect(
			repository.findDirectConversation,
		).not.toHaveBeenCalled();
	});

	it('rejeita consulta de mensagens com o próprio usuário', async () => {
		await expect(
			service.getMessageHistory({
				currentUserId,
				userId: currentUserId,
			}),
		).rejects.toThrow(
			'Não é possível consultar mensagens com o próprio usuário',
		);

		expect(repository.findUserById).not.toHaveBeenCalled();
		expect(
			repository.findDirectConversation,
		).not.toHaveBeenCalled();
	});
});