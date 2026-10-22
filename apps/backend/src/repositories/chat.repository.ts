import { prisma } from '../lib/prisma';

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