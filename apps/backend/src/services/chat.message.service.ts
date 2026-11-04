import { ChatRepository } from '../repositories/chat.repository';
import type { SendMessageInput } from '../schemas/chat.schema';

export type ChatSendErrorCode =
	| 'SELF_CHAT'
	| 'USER_NOT_FOUND'
	| 'PERSISTENCE_ERROR';

export class ChatSendError extends Error {
	constructor(
		public readonly code: ChatSendErrorCode,
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = 'ChatSendError';
	}
}

export interface SendMessageParams extends SendMessageInput {
	senderId: string;
}

/**
 * Service de envio de mensagens (CHAT-16b/16s). Nome distinto de ChatService
 * (histórico) para evitar a colisão com as classes homônimas existentes.
 */
export class ChatMessageService {
	constructor(
		private readonly chatRepository = new ChatRepository(),
	) {}

	async enviar(params: SendMessageParams) {
		const { senderId, receiverId, content } = params;

		if (senderId === receiverId) {
			throw new ChatSendError(
				'SELF_CHAT',
				'Não é possível enviar mensagem para si mesmo',
			);
		}

		const [sender, receiver] = await Promise.all([
			this.chatRepository.findUserById(senderId),
			this.chatRepository.findUserById(receiverId),
		]);

		if (!sender || !receiver) {
			throw new ChatSendError(
				'USER_NOT_FOUND',
				'Usuário não encontrado',
			);
		}

		try {
			const conversationId =
				await this.chatRepository.findOrCreateDirectConversation(
					senderId,
					receiverId,
				);

			const message = await this.chatRepository.createMessage({
				conversationId,
				senderId,
				content,
			});

			return {
				...message,
				receiverId,
			};
		} catch (error) {
			throw new ChatSendError(
				'PERSISTENCE_ERROR',
				'Erro ao salvar a mensagem',
				{ cause: error },
			);
		}
	}
}

export const chatMessageService = new ChatMessageService();
