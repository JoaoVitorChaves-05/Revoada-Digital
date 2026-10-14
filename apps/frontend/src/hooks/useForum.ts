import { useState, useEffect, useCallback } from 'react';
import { forumService } from '../services/forum.service';
import type {
  ForumPost,
  ForumReply,
  CreateForumPostDTO,
  CreateForumReplyDTO,
} from '../types/forum.types';

export function useForumPosts() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumService.listPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar posts');
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

export function useForumPost(postId: string | undefined) {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await forumService.getPost(postId);
      setPost(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar post');
      console.error('Erro ao buscar post:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, loading, error, refetch: fetchPost };
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (data: CreateForumPostDTO): Promise<ForumPost | null> => {
    try {
      setLoading(true);
      setError(null);
      const newPost = await forumService.createPost(data);
      return newPost;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar post');
      console.error('Erro ao criar post:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPost, loading, error };
}

export function useCreateReply(postId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReply = async (data: CreateForumReplyDTO): Promise<ForumReply | null> => {
    try {
      setLoading(true);
      setError(null);
      const newReply = await forumService.createReply(postId, data);
      return newReply;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar resposta');
      console.error('Erro ao criar resposta:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReply, loading, error };
}

export function useDeletePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await forumService.deletePost(postId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao deletar post');
      console.error('Erro ao deletar post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deletePost, loading, error };
}
