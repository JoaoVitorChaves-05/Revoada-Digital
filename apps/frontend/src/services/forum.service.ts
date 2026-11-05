import { api } from './api';
import type {
  ForumPost,
  ForumReply,
  CreateForumPostDTO,
  CreateForumReplyDTO,
  UpdateForumPostDTO,
  UpdateForumReplyDTO,
} from '../types/forum.types';

class ForumService {
  async listPosts(): Promise<ForumPost[]> {
    const response = await api.get('/forum/posts');
    return response.data;
  }

  async getPost(id: string): Promise<ForumPost> {
    const response = await api.get(`/forum/posts/${id}`);
    return response.data;
  }

  async createPost(data: CreateForumPostDTO): Promise<ForumPost> {
    const response = await api.post('/forum/posts', data);
    return response.data;
  }

  async updatePost(id: string, data: UpdateForumPostDTO): Promise<ForumPost> {
    const response = await api.put(`/forum/posts/${id}`, data);
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await api.delete(`/forum/posts/${id}`);
  }

  async listReplies(postId: string): Promise<ForumReply[]> {
    const response = await api.get(`/forum/posts/${postId}/replies`);
    return response.data;
  }

  async createReply(postId: string, data: CreateForumReplyDTO): Promise<ForumReply> {
    const response = await api.post(`/forum/posts/${postId}/replies`, data);
    return response.data;
  }

  async updateReply(
    postId: string,
    replyId: string,
    data: UpdateForumReplyDTO
  ): Promise<ForumReply> {
    const response = await api.put(`/forum/posts/${postId}/replies/${replyId}`, data);
    return response.data;
  }

  async deleteReply(postId: string, replyId: string): Promise<void> {
    await api.delete(`/forum/posts/${postId}/replies/${replyId}`);
  }
}

export const forumService = new ForumService();
