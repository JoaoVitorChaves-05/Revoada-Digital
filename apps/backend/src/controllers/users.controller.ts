import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export async function createUser(req: Request, res: Response) {
	try {
		const result = await userService.createUser(req.body);

		return res.status(201).json({
			message: 'Usuário cadastrado com sucesso! Aguardando aprovação.',
			data: result,
		});
	} catch (error: any) {
		return res.status(400).json({
			error: 'Erro ao cadastrar usuário',
			details: error.message,
		});
	}
}