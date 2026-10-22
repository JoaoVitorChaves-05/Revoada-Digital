import { describe, expect, it } from 'vitest';
import { getChatMessagesSchema } from './chat.schema';

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