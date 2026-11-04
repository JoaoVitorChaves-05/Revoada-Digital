import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';

export const CHAT_MESSAGE_SENDER_SELECT = {
	id: true,
	full_name: true,
	profileType: true,
} satisfies Prisma.UserSelect;

export class ChatRepository {
	async findUserById(id: string) {
		return prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				full_name: true,
				profileType: true,
			},
		});
	}

	/**
	 * Procura a conversa DIRECT entre os dois usuários e, se não existir,
	 * cria a conversa + os dois participantes numa única transação.
	 * Retorna o id da conversa (nova ou existente).
	 */
	async findOrCreateDirectConversation(
		userA: string,
		userB: string,
	): Promise<string> {
		return prisma.$transaction(async (tx) => {
			const existing = await tx.conversation.findFirst({
				where: {
					type: 'DIRECT',
					AND: [
						{ participants: { some: { userId: userA } } },
						{ participants: { some: { userId: userB } } },
						{
							participants: {
								every: { userId: { in: [userA, userB] } },
							},
						},
					],
				},
				select: { id: true },
			});

			if (existing) {
				return existing.id;
			}

			const conversation = await tx.conversation.create({
				data: {
					type: 'DIRECT',
					participants: {
						create: [{ userId: userA }, { userId: userB }],
					},
				},
				select: { id: true },
			});

			return conversation.id;
		});
	}

	async createMessage(data: {
		conversationId: string;
		senderId: string;
		content: string;
	}) {
		return prisma.chatMessage.create({
			data: {
				conversationId: data.conversationId,
				senderId: data.senderId,
				content: data.content,
			},
			select: {
				id: true,
				conversationId: true,
				content: true,
				createdAt: true,
				sender: {
					select: CHAT_MESSAGE_SENDER_SELECT,
				},
			},
		});
	}

	async isConversationParticipant(
		conversationId: string,
		userId: string,
	): Promise<boolean> {
		const participant =
			await prisma.conversationParticipant.findUnique({
				where: {
					conversationId_userId: { conversationId, userId },
				},
				select: { userId: true },
			});

		return participant !== null;
	}

	/**
	 * IDs de mensagens da conversa enviadas por OUTROS participantes que o
	 * usuário ainda não leu (sem MessageRead para esse usuário).
	 */
	async findUnreadMessageIds(
		conversationId: string,
		userId: string,
	): Promise<string[]> {
		const messages = await prisma.chatMessage.findMany({
			where: {
				conversationId,
				senderId: { not: userId },
				reads: { none: { userId } },
			},
			select: { id: true },
		});

		return messages.map((message) => message.id);
	}

	/** Insere MessageRead para os ids informados, ignorando duplicatas. */
	async markMessagesAsRead(
		messageIds: string[],
		userId: string,
	): Promise<number> {
		if (messageIds.length === 0) {
			return 0;
		}

		const result = await prisma.messageRead.createMany({
			data: messageIds.map((messageId) => ({ messageId, userId })),
			skipDuplicates: true,
		});

		return result.count;
	}

	/** Conversas do usuário com a última mensagem (preview) e participantes. */
	async findUserConversations(userId: string) {
		return prisma.conversation.findMany({
			where: {
				participants: { some: { userId } },
			},
			include: {
				participants: {
					include: {
						user: {
							select: {
								id: true,
								full_name: true,
								email: true,
							},
						},
					},
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					select: {
						id: true,
						content: true,
						createdAt: true,
						senderId: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	/** Quantidade de mensagens de outros participantes ainda não lidas pelo usuário. */
	async countUnread(
		conversationId: string,
		userId: string,
	): Promise<number> {
		return prisma.chatMessage.count({
			where: {
				conversationId,
				senderId: { not: userId },
				reads: { none: { userId } },
			},
		});
	}

	async findDirectConversation(
		currentUserId: string,
		userId: string,
	) {
		return prisma.conversation.findFirst({
			where: {
				type: 'DIRECT',
				AND: [
					{
						participants: {
							some: { userId: currentUserId },
						},
					},
					{
						participants: {
							some: { userId },
						},
					},
					{
						participants: {
							every: {
								userId: {
									in: [currentUserId, userId],
								},
							},
						},
					},
				],
			},
			select: {
				id: true,
				messages: {
					orderBy: {
						createdAt: 'asc',
					},
					select: {
						id: true,
						content: true,
						createdAt: true,
						sender: {
							select: {
								id: true,
								full_name: true,
								profileType: true,
							},
						},
					},
				},
			},
		});
	}
}