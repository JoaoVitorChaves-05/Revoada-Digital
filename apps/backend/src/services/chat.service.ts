import { ChatRepository } from '../repositories/chat.repository';
import type { GetChatMessagesInput } from '../schemas/chat.schema';

export class ChatService {
	constructor(
		private readonly chatRepository = new ChatRepository(),
	) {}

	async getMessageHistory(data: GetChatMessagesInput) {
		if (data.currentUserId === data.userId) {
			throw new Error(
				'Não é possível consultar mensagens com o próprio usuário',
			);
		}

		const [currentUser, otherUser] = await Promise.all([
			this.chatRepository.findUserById(data.currentUserId),
			this.chatRepository.findUserById(data.userId),
		]);

		if (!currentUser || !otherUser) {
			throw new Error('Usuário não encontrado');
		}

		const conversation =
			await this.chatRepository.findDirectConversation(
				data.currentUserId,
				data.userId,
			);

		return {
			conversationId: conversation?.id ?? null,
			userId: data.userId,
			messages: conversation?.messages ?? [],
		};
	}
}

export const chatService = new ChatService();