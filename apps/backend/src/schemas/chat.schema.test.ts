import { describe, expect, it } from 'vitest';
import {
	getChatMessagesSchema,
	MAX_MESSAGE_LENGTH,
	sendMessageSchema,
} from './chat.schema';

const currentUserId = '550e8400-e29b-41d4-a716-446655440000';
const userId = '550e8400-e29b-41d4-a716-446655440001';

describe('getChatMessagesSchema', () => {
	it('aceita os IDs válidos dos dois usuários', () => {
		const result = getChatMessagesSchema.safeParse({
			currentUserId,
			userId,
		});

		expect(result.success).toBe(true);
	});

	it('rejeita quando o ID do usuário atual não é enviado', () => {
		const result = getChatMessagesSchema.safeParse({
			userId,
		});

		expect(result.success).toBe(false);
	});

	it('rejeita ID inválido do usuário atual', () => {
		const result = getChatMessagesSchema.safeParse({
			currentUserId: 'usuario-atual',
			userId,
		});

		expect(result.success).toBe(false);
	});

	it('rejeita ID inválido do outro usuário', () => {
		const result = getChatMessagesSchema.safeParse({
			currentUserId,
			userId: 'outro-usuario',
		});

		expect(result.success).toBe(false);
	});
});

describe('sendMessageSchema', () => {
	it('aceita destinatário válido e conteúdo não-vazio', () => {
		const result = sendMessageSchema.safeParse({
			receiverId: userId,
			content: 'Olá, tudo bem?',
		});

		expect(result.success).toBe(true);
	});

	it('faz trim do conteúdo', () => {
		const result = sendMessageSchema.safeParse({
			receiverId: userId,
			content: '  mensagem com espaços  ',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.content).toBe('mensagem com espaços');
		}
	});

	it('rejeita conteúdo vazio', () => {
		const result = sendMessageSchema.safeParse({
			receiverId: userId,
			content: '',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita conteúdo só com espaços', () => {
		const result = sendMessageSchema.safeParse({
			receiverId: userId,
			content: '    ',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita destinatário com ID inválido', () => {
		const result = sendMessageSchema.safeParse({
			receiverId: 'destinatario-invalido',
			content: 'Olá',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita conteúdo acima do limite máximo', () => {
		const result = sendMessageSchema.safeParse({
			receiverId: userId,
			content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1),
		});

		expect(result.success).toBe(false);
	});
});