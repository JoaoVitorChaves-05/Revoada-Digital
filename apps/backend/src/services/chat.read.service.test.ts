import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatRepository } from '../repositories/chat.repository';
import { ChatReadService } from './chat.read.service';

vi.mock('../repositories/chat.repository', () => ({
	ChatRepository: class {},
}));

function createRepositoryMock() {
	return {
		isConversationParticipant: vi.fn(),
		findUnreadMessageIds: vi.fn(),
		markMessagesAsRead: vi.fn(),
	};
}

const conversationId = 'conversa-1';
const userId = '550e8400-e29b-41d4-a716-446655440000';

describe('ChatReadService.marcarComoLidas', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: ChatReadService;

	beforeEach(() => {
		repository = createRepositoryMock();
		service = new ChatReadService(
			repository as unknown as ChatRepository,
		);
	});

	it('marca apenas as mensagens não lidas do outro participante', async () => {
		repository.isConversationParticipant.mockResolvedValue(true);
		repository.findUnreadMessageIds.mockResolvedValue(['m1', 'm2']);
		repository.markMessagesAsRead.mockResolvedValue(2);

		await expect(
			service.marcarComoLidas(conversationId, userId),
		).resolves.toEqual({ marked: 2 });

		expect(repository.markMessagesAsRead).toHaveBeenCalledWith(
			['m1', 'm2'],
			userId,
		);
	});

	it('é idempotente: sem mensagens não lidas, não marca nada', async () => {
		repository.isConversationParticipant.mockResolvedValue(true);
		repository.findUnreadMessageIds.mockResolvedValue([]);
		repository.markMessagesAsRead.mockResolvedValue(0);

		await expect(
			service.marcarComoLidas(conversationId, userId),
		).resolves.toEqual({ marked: 0 });
	});

	it('não marca nada quando o usuário não participa da conversa', async () => {
		repository.isConversationParticipant.mockResolvedValue(false);

		await expect(
			service.marcarComoLidas(conversationId, userId),
		).resolves.toEqual({ marked: 0 });

		expect(repository.findUnreadMessageIds).not.toHaveBeenCalled();
		expect(repository.markMessagesAsRead).not.toHaveBeenCalled();
	});
});
