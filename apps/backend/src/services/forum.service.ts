import {
	CreateForumPostInput,
	CreateForumReplyInput,
	ListForumPostsInput,
	UpdateForumPostInput,
	UpdateForumReplyInput,
} from '../schemas/forum.schema';
import { ForumRepository } from '../repositories/forum.repository';

export class ForumService {
	constructor(private readonly forumRepository = new ForumRepository()) {}

	async listPosts(
		data: ListForumPostsInput = { page: 1 },
	) {
		const limit = 10;
		const skip = (data.page - 1) * limit;

		return this.forumRepository.findAllPosts(
			skip,
			limit,
			data.subject,
		);
	}

	async getPost(id: string) {
		const post = await this.forumRepository.findPostById(id);
		if (!post) throw new Error('Postagem não encontrada');
		return post;
	}

	async createPost(data: CreateForumPostInput) {
		return this.forumRepository.createPost(data);
	}

	async updatePost(id: string, data: UpdateForumPostInput) {
		await this.getPost(id);
		return this.forumRepository.updatePost(id, data);
	}

	async deletePost(id: string) {
		await this.getPost(id);
		return this.forumRepository.deletePost(id);
	}

	async listReplies(postId: string) {
		await this.getPost(postId);
		return this.forumRepository.findRepliesByPostId(postId);
	}

	async getReply(postId: string, replyId: string) {
		await this.getPost(postId);
		const reply = await this.forumRepository.findReplyById(replyId);
		if (!reply || reply.forumId !== postId) throw new Error('Resposta não encontrada');
		return reply;
	}

	async createReply(postId: string, data: CreateForumReplyInput) {
		await this.getPost(postId);
		return this.forumRepository.createReply(postId, data);
	}

	async updateReply(postId: string, replyId: string, data: UpdateForumReplyInput) {
		await this.getReply(postId, replyId);
		return this.forumRepository.updateReply(replyId, data);
	}

	async deleteReply(postId: string, replyId: string) {
		await this.getReply(postId, replyId);
		return this.forumRepository.deleteReply(replyId);
	}
}

export const forumService = new ForumService();