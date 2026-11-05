import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatMessageService } from './chat.message.service';

const databaseUrl = process.env.CHAT_CONCURRENCY_TEST_DATABASE_URL;
const concurrencySuite = describe.skipIf(!databaseUrl);

function assertSafeTestDatabaseUrl(value: string): void {
	const url = new URL(value);
	const databaseName = decodeURIComponent(url.pathname.slice(1));

	if (
		!['postgres:', 'postgresql:'].includes(url.protocol) ||
		!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
		!databaseName.endsWith('_test')
	) {
		throw new Error(
			'CHAT_CONCURRENCY_TEST_DATABASE_URL deve apontar para PostgreSQL local com nome terminado em _test',
		);
	}
}

concurrencySuite(
	'ChatMessageService concorrência no PostgreSQL',
	() => {
		let firstClient: PrismaClient | undefined;
		let secondClient: PrismaClient | undefined;
		let firstUserId = '';
		let secondUserId = '';

		beforeAll(async () => {
			assertSafeTestDatabaseUrl(databaseUrl!);

			firstClient = new PrismaClient({
				adapter: new PrismaPg({ connectionString: databaseUrl! }),
			});
			secondClient = new PrismaClient({
				adapter: new PrismaPg({ connectionString: databaseUrl! }),
			});

			firstUserId = randomUUID();
			secondUserId = randomUUID();

			await firstClient.user.createMany({
				data: [
					{
						id: firstUserId,
						email: `${firstUserId}@chat-test.invalid`,
						password: 'integration-test',
						full_name: 'Chat test user A',
						cpf: firstUserId,
						profileType: 'STUDENT',
					},
					{
						id: secondUserId,
						email: `${secondUserId}@chat-test.invalid`,
						password: 'integration-test',
						full_name: 'Chat test user B',
						cpf: secondUserId,
						profileType: 'STUDENT',
					},
				],
			});
		});

		afterAll(async () => {
			try {
				if (firstClient && firstUserId && secondUserId) {
					const conversations =
						await firstClient.conversation.findMany({
							where: {
								OR: [
									{
										directUserAId: firstUserId,
										directUserBId: secondUserId,
									},
									{
										directUserAId: secondUserId,
										directUserBId: firstUserId,
									},
									{
										participants: {
											some: { userId: firstUserId },
										},
									},
									{
										participants: {
											some: { userId: secondUserId },
										},
									},
								],
							},
							select: { id: true },
						});
					const conversationIds = conversations.map(({ id }) => id);

					await firstClient.$transaction(async (tx) => {
						if (conversationIds.length > 0) {
							await tx.messageRead.deleteMany({
								where: {
									message: {
										conversationId: {
											in: conversationIds,
										},
									},
								},
							});
							await tx.chatMessage.deleteMany({
								where: {
									conversationId: {
										in: conversationIds,
									},
								},
							});
							await tx.conversationParticipant.deleteMany({
								where: {
									conversationId: {
										in: conversationIds,
									},
								},
							});
							await tx.conversation.deleteMany({
								where: { id: { in: conversationIds } },
							});
						}

						await tx.user.deleteMany({
							where: {
								id: { in: [firstUserId, secondUserId] },
							},
						});
					});
				}
			} finally {
				await Promise.all([
					firstClient?.$disconnect(),
					secondClient?.$disconnect(),
				]);
			}
		});

		it('cria uma conversa e persiste as duas mensagens concorrentes', async () => {
			const firstService = new ChatMessageService(
				new ChatRepository(firstClient!),
			);
			const secondService = new ChatMessageService(
				new ChatRepository(secondClient!),
			);

			const [firstResult, secondResult] = await Promise.allSettled([
				firstService.enviar({
					senderId: firstUserId,
					receiverId: secondUserId,
					content: 'Mensagem concorrente A',
				}),
				secondService.enviar({
					senderId: secondUserId,
					receiverId: firstUserId,
					content: 'Mensagem concorrente B',
				}),
			]);

			if (firstResult.status === 'rejected') {
				throw firstResult.reason;
			}
			if (secondResult.status === 'rejected') {
				throw secondResult.reason;
			}

			const firstMessage = firstResult.value;
			const secondMessage = secondResult.value;

			expect(firstMessage.conversationId).toBe(
				secondMessage.conversationId,
			);

			const conversations =
				await firstClient!.conversation.count({
					where: {
						directUserAId: [firstUserId, secondUserId].sort()[0],
						directUserBId: [firstUserId, secondUserId].sort()[1],
					},
				});
			const messages = await firstClient!.chatMessage.count({
				where: {
					conversationId: firstMessage.conversationId,
				},
			});

			expect(conversations).toBe(1);
			expect(messages).toBe(2);
		});
	},
);
