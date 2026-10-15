import { prisma } from '../lib/prisma';
import {
	CreateForumPostInput,
	CreateForumReplyInput,
	UpdateForumPostInput,
	UpdateForumReplyInput,
	ListForumPostsInput,
} from '../schemas/forum.schema';

const postInclude = {
	author: {
		select: { id: true, full_name: true, profileType: true },
	},
	replies: {
		include: {
			author: {
				select: { id: true, full_name: true, profileType: true },
			},
		},
		orderBy: { createdAt: 'asc' as const },
	},
};

const replyInclude = {
	author: {
		select: { id: true, full_name: true, profileType: true },
	},
};

export class ForumRepository {
	async findAllPosts(
		skip: number,
		take: number,
		subject?: ListForumPostsInput['subject'],
	) {
		return prisma.forum.findMany({
			where: subject ? { subject } : {},
			skip,
			take,
			include: postInclude,
			orderBy: [
				{ createdAt: 'desc' },
				{ id: 'desc' },
			],
		});
	}

	async findPostById(id: string) {
		return prisma.forum.findUnique({
			where: { id },
			include: postInclude,
		});
	}

	async createPost(data: CreateForumPostInput) {
		return prisma.forum.create({
			data,
			include: postInclude,
		});
	}

	async updatePost(id: string, data: UpdateForumPostInput) {
		return prisma.forum.update({
			where: { id },
			data,
			include: postInclude,
		});
	}

	async deletePost(id: string) {
		return prisma.forum.delete({ where: { id } });
	}

	async findRepliesByPostId(forumId: string) {
		return prisma.forumReplies.findMany({
			where: { forumId },
			include: replyInclude,
			orderBy: { createdAt: 'asc' },
		});
	}

	async findReplyById(id: string) {
		return prisma.forumReplies.findUnique({
			where: { id },
			include: replyInclude,
		});
	}

	async createReply(forumId: string, data: CreateForumReplyInput) {
		return prisma.forumReplies.create({
			data: { ...data, forumId },
			include: replyInclude,
		});
	}

	async updateReply(id: string, data: UpdateForumReplyInput) {
		return prisma.forumReplies.update({
			where: { id },
			data,
			include: replyInclude,
		});
	}

	async deleteReply(id: string) {
		return prisma.forumReplies.delete({ where: { id } });
	}
}