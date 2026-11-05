import { ChatRepository } from '../repositories/chat.repository';

/**
 * Marcação de mensagens como lidas (CHAT-16u). Cria MessageRead para as
 * mensagens da conversa que o usuário ainda não leu, ignorando as próprias.
 * É idempotente: repetir não gera duplicatas nem erro.
 */
export class ChatReadService {
	constructor(
		private readonly chatRepository = new ChatRepository(),
	) {}

	async marcarComoLidas(
		conversationId: string,
		userId: string,
	): Promise<{ marked: number }> {
		const isParticipant =
			await this.chatRepository.isConversationParticipant(
				conversationId,
				userId,
			);

		if (!isParticipant) {
			return { marked: 0 };
		}

		const unreadIds =
			await this.chatRepository.findUnreadMessageIds(
				conversationId,
				userId,
			);

		const marked = await this.chatRepository.markMessagesAsRead(
			unreadIds,
			userId,
		);

		return { marked };
	}
}

export const chatReadService = new ChatReadService();
