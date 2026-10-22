import { z } from 'zod';

const subjectSchema = z.enum([
	'PORTUGUESE',
	'MATH',
	'ENGLISH',
	'GEOGRAPHY',
	'PHYSICS',
	'CHEMICAL',
	'HISTORY',
]);

export const listForumPostsSchema = z.object({
	subject: subjectSchema.optional(),
	page: z
		.string()
		.regex(/^[1-9]\d*$/, 'A página deve ser um número inteiro positivo')
		.optional()
		.transform((value) => value === undefined ? 1 : Number(value))
		.refine(Number.isSafeInteger, 'Número de página muito grande'),
});

export const createForumPostSchema = z.object({
	authorId: z.string().trim().min(1, 'ID do autor é obrigatório'),
	title: z.string().trim().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
	content: z.string().trim().min(1, 'Conteúdo é obrigatório'),
	subject: subjectSchema,
});

export const updateForumPostSchema = createForumPostSchema
	.omit({ authorId: true })
	.partial();

export const createForumReplySchema = z.object({
	authorId: z.string().trim().min(1, 'ID do autor é obrigatório'),
	replyContent: z.string().trim().min(1, 'Conteúdo da resposta é obrigatório'),
});

export const updateForumReplySchema = createForumReplySchema
	.omit({ authorId: true })
	.partial();

export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;
export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>;
export type CreateForumReplyInput = z.infer<typeof createForumReplySchema>;
export type UpdateForumReplyInput = z.infer<typeof updateForumReplySchema>;
export type ListForumPostsInput = z.infer<typeof listForumPostsSchema>;