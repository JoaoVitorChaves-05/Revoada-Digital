import { Request, Response } from 'express';
import { forumService } from '../services/forum.service';

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

export async function listPosts(_req: Request, res: Response) {
	try {
		return res.status(200).json(await forumService.listPosts());
	} catch {
		return res.status(500).json({ error: 'Erro ao listar postagens' });
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
		await forumService.deletePost(getParam(req, 'id'));
		return res.status(204).send();
	} catch (error) {
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