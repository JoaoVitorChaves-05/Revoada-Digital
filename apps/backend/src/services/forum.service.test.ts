import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ForumRepository } from '../repositories/forum.repository';
import { ForumService } from './forum.service';

vi.mock('../repositories/forum.repository', () => ({
	ForumRepository: class {},
}));

function createRepositoryMock() {
	return {
		findAllPosts: vi.fn(),
		findPostById: vi.fn(),
		createPost: vi.fn(),
		updatePost: vi.fn(),
		deletePost: vi.fn(),
		findRepliesByPostId: vi.fn(),
		findReplyById: vi.fn(),
		createReply: vi.fn(),
		updateReply: vi.fn(),
		deleteReply: vi.fn(),
	};
}

const postInput = {
	authorId: 'user-1',
	title: 'Dúvida',
	content: 'Como resolvo?',
	subject: 'MATH' as const,
};

describe('ForumService', () => {
	let repository: ReturnType<typeof createRepositoryMock>;
	let service: ForumService;

	beforeEach(() => {
		repository = createRepositoryMock();
		service = new ForumService(repository as unknown as ForumRepository);
	});

	it('cria uma postagem', async () => {
		const createdPost = { id: 'post-1', ...postInput };
		repository.createPost.mockResolvedValue(createdPost);

		const result = await service.createPost(postInput);

		expect(result).toEqual(createdPost);
		expect(repository.createPost).toHaveBeenCalledWith(postInput);
	});

	it('lista postagens', async () => {
		const posts = [{ id: 'post-1' }];
		repository.findAllPosts.mockResolvedValue(posts);

		await expect(service.listPosts()).resolves.toEqual(posts);
	});

	it('impede consulta de postagem inexistente', async () => {
		repository.findPostById.mockResolvedValue(null);

		await expect(service.getPost('missing-post')).rejects.toThrow('Postagem não encontrada');
	});

	it('atualiza postagem existente', async () => {
		const post = { id: 'post-1', ...postInput };
		const update = { title: 'Novo título' };
		repository.findPostById.mockResolvedValue(post);
		repository.updatePost.mockResolvedValue({ ...post, ...update });

		await expect(service.updatePost('post-1', update)).resolves.toEqual({ ...post, ...update });
		expect(repository.updatePost).toHaveBeenCalledWith('post-1', update);
	});

	it('impede remoção de postagem inexistente', async () => {
		repository.findPostById.mockResolvedValue(null);

		await expect(service.deletePost('missing-post')).rejects.toThrow('Postagem não encontrada');
		expect(repository.deletePost).not.toHaveBeenCalled();
	});

	it('cria resposta apenas para postagem existente', async () => {
		const replyInput = { authorId: 'user-2', replyContent: 'Minha resposta' };
		repository.findPostById.mockResolvedValue({ id: 'post-1' });
		repository.createReply.mockResolvedValue({ id: 'reply-1', forumId: 'post-1', ...replyInput });

		await expect(service.createReply('post-1', replyInput)).resolves.toMatchObject({
			id: 'reply-1',
		});
		expect(repository.createReply).toHaveBeenCalledWith('post-1', replyInput);
	});

	it('impede criação de resposta em postagem inexistente', async () => {
		repository.findPostById.mockResolvedValue(null);

		await expect(
			service.createReply('missing-post', { authorId: 'user-2', replyContent: 'Resposta' }),
		).rejects.toThrow('Postagem não encontrada');
		expect(repository.createReply).not.toHaveBeenCalled();
	});

	it('impede acesso a resposta pertencente a outra postagem', async () => {
		repository.findPostById.mockResolvedValue({ id: 'post-1' });
		repository.findReplyById.mockResolvedValue({ id: 'reply-1', forumId: 'post-2' });

		await expect(service.getReply('post-1', 'reply-1')).rejects.toThrow('Resposta não encontrada');
	});

	it('atualiza e remove resposta pertencente à postagem', async () => {
		const reply = { id: 'reply-1', forumId: 'post-1' };
		repository.findPostById.mockResolvedValue({ id: 'post-1' });
		repository.findReplyById.mockResolvedValue(reply);
		repository.updateReply.mockResolvedValue({ ...reply, replyContent: 'Editada' });
		repository.deleteReply.mockResolvedValue(reply);

		await expect(
			service.updateReply('post-1', 'reply-1', { replyContent: 'Editada' }),
		).resolves.toMatchObject({ replyContent: 'Editada' });
		expect(repository.updateReply).toHaveBeenCalledWith('reply-1', { replyContent: 'Editada' });

		await expect(service.deleteReply('post-1', 'reply-1')).resolves.toEqual(reply);
		expect(repository.deleteReply).toHaveBeenCalledWith('reply-1');
	});
});