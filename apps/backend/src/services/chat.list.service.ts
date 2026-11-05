import { ChatRepository } from '../repositories/chat.repository';

export interface ConversationParticipantView {
	id: string;
	full_name: string;
	email: string;
}

export interface ConversationLastMessageView {
	id: string;
	content: string;
	createdAt: Date;
	senderId: string;
}

export interface ConversationView {
	id: string;
	type: string;
	name: string | null;
	createdAt: Date;
	participants: ConversationParticipantView[];
	lastMessage: ConversationLastMessageView | null;
	unreadCount: number;
}

export class ChatService {
	constructor(
		private readonly chatRepository = new ChatRepository(),
	) {}

	async getUserConversations(
		userId: string,
	): Promise<ConversationView[]> {
		const conversations =
			await this.chatRepository.findUserConversations(userId);

		return Promise.all(
			conversations.map(async (conversation) => {
				const unreadCount = await this.chatRepository.countUnread(
					conversation.id,
					userId,
				);

				const lastMessage = conversation.messages[0] ?? null;

				return {
					id: conversation.id,
					type: conversation.type,
					name: conversation.name,
					createdAt: conversation.createdAt,
					participants: conversation.participants.map(
						(participant) => participant.user,
					),
					lastMessage,
					unreadCount,
				};
			}),
		);
	}
}

export const chatService = new ChatService();
