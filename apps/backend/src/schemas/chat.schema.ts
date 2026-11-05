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

export const MAX_MESSAGE_LENGTH = 2000;

export const sendMessageSchema = z.object({
	receiverId: z
		.string()
		.trim()
		.uuid('ID do destinatário inválido'),

	content: z
		.string()
		.trim()
		.min(1, 'A mensagem não pode estar vazia')
		.max(
			MAX_MESSAGE_LENGTH,
			`A mensagem excede o limite de ${MAX_MESSAGE_LENGTH} caracteres`,
		),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;