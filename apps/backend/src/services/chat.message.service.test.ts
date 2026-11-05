import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatRepository } from '../repositories/chat.repository';
import {
	ChatMessageService,
	ChatSendError,
} from './chat.message.service';

vi.mock('../repositories/chat.repository', () => ({
	ChatRepository: class {},
}));

// Mock alinhado a API atual do ChatRepository usada pelo ChatMessageService:
// o service resolve sender/receiver com `findUserById` e grava a mensagem numa
// unica chamada a `createMessageInDirectConversation` (com retry interno).
function createRepositoryMock() {
	return {
		findUserById: vi.fn(),
		createMessageInDirectConversation: vi.fn(),
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

	// O service usa Promise.all([findUserById(sender), findUserById(receiver)]);
	// resolver por id (em vez de ...Once encadeado) evita dependencia de ordem.
	function stubUsers(existing: Record<string, boolean>) {
		repository.findUserById.mockImplementation(async (id: string) =>
			existing[id] ? { id } : null,
		);
	}

	it('persiste a mensagem numa conversa direta e retorna com o sender', async () => {
		stubUsers({ [senderId]: true, [receiverId]: true });

		const createdAt = new Date();
		repository.createMessageInDirectConversation.mockResolvedValue({
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
			repository.createMessageInDirectConversation,
		).toHaveBeenCalledTimes(1);
		expect(
			repository.createMessageInDirectConversation,
		).toHaveBeenCalledWith({
			userA: senderId,
			userB: receiverId,
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
		stubUsers({ [senderId]: true, [receiverId]: false });

		await expect(
			service.enviar({ senderId, receiverId, content: 'Olá!' }),
		).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });

		expect(
			repository.createMessageInDirectConversation,
		).not.toHaveBeenCalled();
	});

	it('rejeita quando o remetente não existe com USER_NOT_FOUND', async () => {
		stubUsers({ [senderId]: false, [receiverId]: true });

		await expect(
			service.enviar({ senderId, receiverId, content: 'Olá!' }),
		).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });

		expect(
			repository.createMessageInDirectConversation,
		).not.toHaveBeenCalled();
	});

	it('mapeia falha de persistência para PERSISTENCE_ERROR', async () => {
		stubUsers({ [senderId]: true, [receiverId]: true });
		repository.createMessageInDirectConversation.mockRejectedValue(
			new Error('db down'),
		);

		const error = await service
			.enviar({ senderId, receiverId, content: 'Olá!' })
			.catch((e) => e);

		expect(error).toBeInstanceOf(ChatSendError);
		expect(error.code).toBe('PERSISTENCE_ERROR');
		// O service tenta persistir duas vezes antes de desistir.
		expect(
			repository.createMessageInDirectConversation,
		).toHaveBeenCalledTimes(2);
	});
});
