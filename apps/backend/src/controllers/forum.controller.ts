import { Request, Response } from 'express';
import { forumService } from '../services/forum.service';
import { listForumPostsSchema } from '../schemas/forum.schema';

function getParam(req: Request, name: string) {
	const value = req.params[name];
	return Array.isArray(value) ? value[0] : value;
}

function isNotFoundError(error: unknown) {
	return error instanceof Error && (
		error.message === 'Postagem não encontrada' ||
		error.message === 'Resposta não encontrada'
	);
}

export async function listPosts(req: Request, res: Response) {
	const result = listForumPostsSchema.safeParse(req.query);

	if (!result.success) {
		return res.status(400).json({
			error: 'Parâmetros inválidos',
			details: result.error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message,
			})),
		});
	}

	try {
		const posts = await forumService.listPosts(result.data);
		return res.status(200).json(posts);
	} catch {
		return res.status(500).json({
			error: 'Erro ao listar postagens',
		});
	}
}

export async function getPost(req: Request, res: Response) {
	try {
		return res.status(200).json(await forumService.getPost(getParam(req, 'id')));
	} catch (error) {
		return isNotFoundError(error)
			? res.status(404).json({ error: 'Postagem não encontrada' })
			: res.status(500).json({ error: 'Erro ao buscar postagem' });
	}
}

export async function createPost(req: Request, res: Response) {
	try {
		return res.status(201).json(await forumService.createPost(req.body));
	} catch {
		return res.status(500).json({ error: 'Erro ao criar postagem' });
	}
}

export async function updatePost(req: Request, res: Response) {
	try {
		return res.status(200).json(await forumService.updatePost(getParam(req, 'id'), req.body));
	} catch (error) {
		return isNotFoundError(error)
			? res.status(404).json({ error: 'Postagem não encontrada' })
			: res.status(500).json({ error: 'Erro ao atualizar postagem' });
	}
}

export async function deletePost(req: Request, res: Response) {
    try {
        const postId = getParam(req, 'id');
        const userId = req.headers['user-id'] as string;
        const userProfileType = req.headers['user-profile-type'] as string;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        await forumService.deletePost(postId, userId, userProfileType);
        
        return res.status(204).send();
    } catch (error: any) {
        // Intercepta o erro de segurança que criamos no service
        if (error.message === 'Acesso negado: Sem permissão para excluir este post.') {
            return res.status(403).json({ error: error.message });
        }

        // Mantém o tratamento de erros original do seu projeto
        return isNotFoundError(error)
            ? res.status(404).json({ error: 'Postagem não encontrada' })
            : res.status(500).json({ error: 'Erro ao remover postagem' });
    }
}

export async function listReplies(req: Request, res: Response) {
	try {
		return res.status(200).json(await forumService.listReplies(getParam(req, 'postId')));
	} catch (error) {
		return isNotFoundError(error)
			? res.status(404).json({ error: 'Postagem não encontrada' })
			: res.status(500).json({ error: 'Erro ao listar respostas' });
	}
}

export async function createReply(req: Request, res: Response) {
	try {
		return res.status(201).json(await forumService.createReply(getParam(req, 'postId'), req.body));
	} catch (error) {
		return isNotFoundError(error)
			? res.status(404).json({ error: 'Postagem não encontrada' })
			: res.status(500).json({ error: 'Erro ao criar resposta' });
	}
}

export async function updateReply(req: Request, res: Response) {
	try {
		return res.status(200).json(await forumService.updateReply(
			getParam(req, 'postId'),
			getParam(req, 'id'),
			req.body,
		));
	} catch (error) {
		return isNotFoundError(error)
			? res.status(404).json({ error: 'Resposta não encontrada' })
			: res.status(500).json({ error: 'Erro ao atualizar resposta' });
	}
}

export async function deleteReply(req: Request, res: Response) {
	try {
		await forumService.deleteReply(getParam(req, 'postId'), getParam(req, 'id'));
		return res.status(204).send();
	} catch (error) {
		return isNotFoundError(error)
			? res.status(404).json({ error: 'Resposta não encontrada' })
			: res.status(500).json({ error: 'Erro ao remover resposta' });
	}
}