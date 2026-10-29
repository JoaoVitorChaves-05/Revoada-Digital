import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import forumRouter from './forum.routes';
import { forumService } from '../services/forum.service';

vi.mock('../services/forum.service', () => ({
	forumService: {
		listPosts: vi.fn(),
	},
}));

function createTestApp() {
	const app = express();
	app.use(express.json());
	app.use('/forum', forumRouter);
	return app;
}

describe('GET /forum/posts', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('retorna 200 e usa a primeira página por padrão', async () => {
		vi.mocked(forumService.listPosts).mockResolvedValue([]);

		const response = await request(createTestApp())
			.get('/forum/posts');

		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
		expect(forumService.listPosts).toHaveBeenCalledWith({
			page: 1,
		});
	});

	it('envia matéria e página convertida ao service', async () => {
		vi.mocked(forumService.listPosts).mockResolvedValue([]);

		const response = await request(createTestApp())
			.get('/forum/posts')
			.query({ subject: 'MATH', page: '2' });

		expect(response.status).toBe(200);
		expect(forumService.listPosts).toHaveBeenCalledWith({
			subject: 'MATH',
			page: 2,
		});
	});

	it.each(['0', '-1', 'abc'])(
		'retorna 400 para página inválida: %s',
		async (page) => {
			const response = await request(createTestApp())
				.get('/forum/posts')
				.query({ page });

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('Parâmetros inválidos');
			expect(forumService.listPosts).not.toHaveBeenCalled();
		},
	);

	it('retorna 400 para matéria inválida', async () => {
		const response = await request(createTestApp())
			.get('/forum/posts')
			.query({ subject: 'SCIENCE' });

		expect(response.status).toBe(400);
		expect(forumService.listPosts).not.toHaveBeenCalled();
	});

	it('retorna 500 quando o service falha', async () => {
		vi.mocked(forumService.listPosts).mockRejectedValue(
			new Error('Falha na consulta'),
		);

		const response = await request(createTestApp())
			.get('/forum/posts');

		expect(response.status).toBe(500);
		expect(response.body.error).toBe('Erro ao listar postagens');
	});
});