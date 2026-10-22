import { z } from 'zod';

export const getChatMessagesSchema = z.object({
	currentUserId: z
		.string()
		.trim()
		.uuid('ID do usuário atual inválido'),

	userId: z
		.string()
		.trim()
		.uuid('ID do outro usuário inválido'),
});

export type GetChatMessagesInput = z.infer<
	typeof getChatMessagesSchema
>;