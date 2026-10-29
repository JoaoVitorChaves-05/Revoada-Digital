import { prisma } from '../lib/prisma';

export class ChatService {
    async getUserConversations(userId: string) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId,
                    },
                },
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
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1, // Pega apenas a última mensagem para exibir preview na tela
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return conversations;
    }
}

export const chatService = new ChatService();