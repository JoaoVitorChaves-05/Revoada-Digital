import { describe, expect, it } from 'vitest';
import {
	createForumPostSchema,
	createForumReplySchema,
	updateForumPostSchema,
	updateForumReplySchema,
	listForumPostsSchema,
} from './forum.schema';

const validPost = {
	authorId: 'user-1',
	title: 'Dúvida sobre matemática',
	content: 'Como resolvo esta questão?',
	subject: 'MATH' as const,
};

describe('createForumPostSchema', () => {
	it('aceita uma postagem válida e remove espaços externos', () => {
		const result = createForumPostSchema.safeParse({
			...validPost,
			title: '  Dúvida sobre matemática  ',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe('Dúvida sobre matemática');
		}
	});

	it('rejeita postagem sem campos obrigatórios', () => {
		const result = createForumPostSchema.safeParse({});

		expect(result.success).toBe(false);
	});

	it('rejeita título vazio ou maior que 200 caracteres', () => {
		expect(
			createForumPostSchema.safeParse({ ...validPost, title: '   ' }).success,
		).toBe(false);
		expect(
			createForumPostSchema.safeParse({ ...validPost, title: 'a'.repeat(201) }).success,
		).toBe(false);
	});

	it('rejeita assunto inválido', () => {
		const result = createForumPostSchema.safeParse({
			...validPost,
			subject: 'SCIENCE',
		});

		expect(result.success).toBe(false);
	});
});

describe('updateForumPostSchema', () => {
	it('aceita atualização parcial sem autor', () => {
		const result = updateForumPostSchema.safeParse({ title: 'Novo título' });

		expect(result.success).toBe(true);
	});

	it('remove autor do payload de atualização', () => {
		const result = updateForumPostSchema.safeParse({ authorId: 'user-2' });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).not.toHaveProperty('authorId');
		}
	});
});

describe('createForumReplySchema', () => {
	it('aceita resposta válida e remove espaços externos', () => {
		const result = createForumReplySchema.safeParse({
			authorId: ' user-1 ',
			replyContent: '  Minha resposta  ',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.authorId).toBe('user-1');
			expect(result.data.replyContent).toBe('Minha resposta');
		}
	});

	it('rejeita resposta vazia ou sem autor', () => {
		expect(
			createForumReplySchema.safeParse({ authorId: 'user-1', replyContent: ' ' }).success,
		).toBe(false);
		expect(
			createForumReplySchema.safeParse({ replyContent: 'Resposta' }).success,
		).toBe(false);
	});
});

describe('updateForumReplySchema', () => {
	it('aceita atualização parcial apenas do conteúdo', () => {
		const result = updateForumReplySchema.safeParse({ replyContent: 'Resposta editada' });

		expect(result.success).toBe(true);
	});
});

describe('listForumPostsSchema', () => {
	it('usa a primeira página quando nenhum parâmetro é enviado', () => {
		const result = listForumPostsSchema.safeParse({});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.page).toBe(1);
		}
	});

	it('aceita filtro por matéria e converte a página para número', () => {
		const result = listForumPostsSchema.safeParse({
			subject: 'MATH',
			page: '2',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				subject: 'MATH',
				page: 2,
			});
		}
	});

	it('rejeita matéria inválida', () => {
		const result = listForumPostsSchema.safeParse({
			subject: 'SCIENCE',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita páginas inválidas', () => {
		for (const page of ['0', '-1', '1.5', 'abc', '']) {
			expect(
				listForumPostsSchema.safeParse({ page }).success,
			).toBe(false);
		}
	});

	it('rejeita números de página grandes demais', () => {
		const result = listForumPostsSchema.safeParse({
			page: '9007199254740992',
		});

		expect(result.success).toBe(false);
	});

	it('rejeita o parâmetro page repetido como array', () => {
		const result = listForumPostsSchema.safeParse({
			page: ['1', '2'],
		});

		expect(result.success).toBe(false);
	});
});