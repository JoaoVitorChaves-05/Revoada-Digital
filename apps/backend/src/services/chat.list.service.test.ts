import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatRepository } from '../repositories/chat.repository';
import { ChatService } from './chat.list.service';

vi.mock('../repositories/chat.repository', () => ({
	ChatRepository: class {},
}));

function createRepositoryMock() {
	return {
		findUserConversations: vi.fn(),
		countUnread: vi.fn(),
	};
}

const userId = '550e8400-e29b-41d4-a716-446655440000';
const otherId = '550e8400-e29b-41d4-a716-446655440001';

describe('ChatService.getUserConversations', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: ChatService;

	beforeEach(() => {
		repository = createRepositoryMock();
		service = new ChatService(
			repository as unknown as ChatRepository,
		);
	});

	it('retorna preview da última mensagem e unreadCount por conversa', async () => {
		const createdAt = new Date();
		repository.findUserConversations.mockResolvedValue([
			{
				id: 'conversa-1',
				type: 'DIRECT',
				name: null,
				createdAt,
				participants: [
					{ user: { id: userId, full_name: 'Eu', email: 'eu@x.com' } },
					{
						user: {
							id: otherId,
							full_name: 'Outro',
							email: 'outro@x.com',
						},
					},
				],
				messages: [
					{
						id: 'm1',
						content: 'Olá',
						createdAt,
						senderId: otherId,
					},
				],
			},
		]);
		repository.countUnread.mockResolvedValue(3);

		const result = await service.getUserConversations(userId);

		expect(result).toEqual([
			{
				id: 'conversa-1',
				type: 'DIRECT',
				name: null,
				createdAt,
				participants: [
					{ id: userId, full_name: 'Eu', email: 'eu@x.com' },
					{ id: otherId, full_name: 'Outro', email: 'outro@x.com' },
				],
				lastMessage: {
					id: 'm1',
					content: 'Olá',
					createdAt,
					senderId: otherId,
				},
				unreadCount: 3,
			},
		]);
		expect(repository.countUnread).toHaveBeenCalledWith(
			'conversa-1',
			userId,
		);
	});

	it('retorna lastMessage nulo e unreadCount zero quando não há mensagens', async () => {
		const createdAt = new Date();
		repository.findUserConversations.mockResolvedValue([
			{
				id: 'conversa-2',
				type: 'DIRECT',
				name: null,
				createdAt,
				participants: [
					{ user: { id: userId, full_name: 'Eu', email: 'eu@x.com' } },
				],
				messages: [],
			},
		]);
		repository.countUnread.mockResolvedValue(0);

		const result = await service.getUserConversations(userId);

		expect(result[0].lastMessage).toBeNull();
		expect(result[0].unreadCount).toBe(0);
	});
});
