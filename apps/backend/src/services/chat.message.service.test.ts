import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatRepository } from '../repositories/chat.repository';
import {
	ChatMessageService,
	ChatSendError,
} from './chat.message.service';

vi.mock('../repositories/chat.repository', () => ({
	ChatRepository: class {},
}));

function createRepositoryMock() {
	return {
		findUserById: vi.fn(),
		findOrCreateDirectConversation: vi.fn(),
		createMessage: vi.fn(),
	};
}

const senderId = '550e8400-e29b-41d4-a716-446655440000';
const receiverId = '550e8400-e29b-41d4-a716-446655440001';

describe('ChatMessageService.enviar', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: ChatMessageService;

	beforeEach(() => {
		repository = createRepositoryMock();
		service = new ChatMessageService(
			repository as unknown as ChatRepository,
		);
	});

	it('persiste a mensagem numa conversa direta e retorna com o sender', async () => {
		repository.findUserById
			.mockResolvedValueOnce({ id: senderId })
			.mockResolvedValueOnce({ id: receiverId });
		repository.findOrCreateDirectConversation.mockResolvedValue('conversa-1');

		const createdAt = new Date();
		repository.createMessage.mockResolvedValue({
			id: 'mensagem-1',
			conversationId: 'conversa-1',
			content: 'Olá!',
			createdAt,
			sender: {
				id: senderId,
				full_name: 'Remetente',
				profileType: 'STUDENT',
			},
		});

		await expect(
			service.enviar({ senderId, receiverId, content: 'Olá!' }),
		).resolves.toEqual({
			id: 'mensagem-1',
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

		expect(
			repository.findOrCreateDirectConversation,
		).toHaveBeenCalledWith(senderId, receiverId);
		expect(repository.createMessage).toHaveBeenCalledWith({
			conversationId: 'conversa-1',
			senderId,
			content: 'Olá!',
		});
	});

	it('rejeita envio para si mesmo com SELF_CHAT', async () => {
		await expect(
			service.enviar({
				senderId,
				receiverId: senderId,
				content: 'Olá!',
			}),
		).rejects.toMatchObject({ code: 'SELF_CHAT' });

		expect(repository.findUserById).not.toHaveBeenCalled();
	});

	it('rejeita quando o destinatário não existe com USER_NOT_FOUND', async () => {
		repository.findUserById
			.mockResolvedValueOnce({ id: senderId })
			.mockResolvedValueOnce(null);

		await expect(
			service.enviar({ senderId, receiverId, content: 'Olá!' }),
		).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });

		expect(
			repository.findOrCreateDirectConversation,
		).not.toHaveBeenCalled();
	});

	it('rejeita quando o remetente não existe com USER_NOT_FOUND', async () => {
		repository.findUserById
			.mockResolvedValueOnce(null)
			.mockResolvedValueOnce({ id: receiverId });

		await expect(
			service.enviar({ senderId, receiverId, content: 'Olá!' }),
		).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
	});

	it('mapeia falha de persistência para PERSISTENCE_ERROR', async () => {
		repository.findUserById
			.mockResolvedValueOnce({ id: senderId })
			.mockResolvedValueOnce({ id: receiverId });
		repository.findOrCreateDirectConversation.mockRejectedValue(
			new Error('db down'),
		);

		const error = await service
			.enviar({ senderId, receiverId, content: 'Olá!' })
			.catch((e) => e);

		expect(error).toBeInstanceOf(ChatSendError);
		expect(error.code).toBe('PERSISTENCE_ERROR');
	});
});
