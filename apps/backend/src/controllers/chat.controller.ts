import { Request, Response } from 'express';
import { getChatMessagesSchema } from '../schemas/chat.schema';
import { chatService } from '../services/chat.service';

function getUserId(req: Request) {
	const value = req.params.userId;

	return Array.isArray(value) ? value[0] : value;
}

export async function getMessageHistory(
	req: Request,
	res: Response,
) {
	const result = getChatMessagesSchema.safeParse({
		currentUserId: req.header('x-user-id'),
		userId: getUserId(req),
	});

	if (!result.success) {
		return res.status(400).json({
			error: 'Dados inválidos',
			details: result.error.issues.map((issue) => ({
				path: issue.path.join('.'),
				message: issue.message,
			})),
		});
	}

	try {
		const history = await chatService.getMessageHistory(
			result.data,
		);

		return res.status(200).json(history);
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === 'Usuário não encontrado'
		) {
			return res.status(404).json({
				error: 'Usuário não encontrado',
			});
		}

		if (
			error instanceof Error &&
			error.message ===
				'Não é possível consultar mensagens com o próprio usuário'
		) {
			return res.status(400).json({
				error: error.message,
			});
		}

		return res.status(500).json({
			error: 'Erro ao buscar histórico de mensagens',
		});
	}
}