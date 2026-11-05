import { prisma } from '../lib/prisma';
import type { Prisma, PrismaClient } from '@prisma/client';

export const CHAT_MESSAGE_SENDER_SELECT = {
	id: true,
	full_name: true,
	profileType: true,
} satisfies Prisma.UserSelect;

export class ChatRepository {
	constructor(private readonly client: PrismaClient = prisma) {}

	private canonicalDirectPair(userA: string, userB: string) {
		return userA < userB
			? { directUserAId: userA, directUserBId: userB }
			: { directUserAId: userB, directUserBId: userA };
	}

	private isDirectPairUniqueConflict(error: unknown): boolean {
		if (typeof error !== 'object' || error === null || !('code' in error)) {
			return false;
		}

		const prismaError = error as {
			code?: string;
			meta?: { target?: unknown };
		};
		const target = prismaError.meta?.target;
		const targetText = Array.isArray(target)
			? target.join(' ')
			: typeof target === 'string'
				? target
				: '';

		return (
			prismaError.code === 'P2002' &&
			(targetText.includes('directUserAId') ||
				targetText.includes('direct_user_a_id')) &&
			(targetText.includes('directUserBId') ||
				targetText.includes('direct_user_b_id'))
		);
	}

	private findDirectConversationByPair(
		pair: ReturnType<ChatRepository['canonicalDirectPair']>,
	) {
		return this.client.conversation.findFirst({
			where: pair,
			select: { id: true },
		});
	}

	async findUserById(id: string) {
		return this.client.user.findUnique({
			where: { id },
			select: {
				id: true,
				full_name: true,
				profileType: true,
			},
		});
	}

	/** Localiza ou cria a conversa direta e grava a mensagem na mesma transação. */
	private createMessageInDirectConversationAttempt(data: {
		userA: string;
		userB: string;
		senderId: string;
		content: string;
	}) {
		const pair = this.canonicalDirectPair(data.userA, data.userB);

		return this.client.$transaction(async (tx) => {
			const existing = await tx.conversation.findFirst({
				where: pair,
				select: { id: true },
			});

			const conversation = existing
				? existing
				: await tx.conversation.create({
					data: {
						type: 'DIRECT',
						...pair,
						participants: {
							create: [
								{ userId: data.userA },
								{ userId: data.userB },
							],
						},
					},
					select: { id: true },
				});

			return tx.chatMessage.create({
				data: {
					conversationId: conversation.id,
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
		});
	}

	async createMessageInDirectConversation(data: {
		userA: string;
		userB: string;
		senderId: string;
		content: string;
	}) {
		try {
			return await this.createMessageInDirectConversationAttempt(data);
		} catch (error) {
			if (!this.isDirectPairUniqueConflict(error)) {
				throw error;
			}

			// A concorrente já criou o par; repetir a transação agora grava a mensagem nela.
			return this.createMessageInDirectConversationAttempt(data);
		}
	}

	async isConversationParticipant(
		conversationId: string,
		userId: string,
	): Promise<boolean> {
		const participant =
			await this.client.conversationParticipant.findUnique({
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
		const messages = await this.client.chatMessage.findMany({
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

		const result = await this.client.messageRead.createMany({
			data: messageIds.map((messageId) => ({ messageId, userId })),
			skipDuplicates: true,
		});

		return result.count;
	}

	/** Conversas do usuário com a última mensagem (preview) e participantes. */
	async findUserConversations(userId: string) {
		return this.client.conversation.findMany({
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
		return this.client.chatMessage.count({
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
		return this.client.conversation.findFirst({
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