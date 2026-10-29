import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { emailVerificationService } from '../services/emailVerification.service';

export async function createUser(req: Request, res: Response) {
	try {
		const result = await userService.createUser(req.body);


try {
await emailVerificationService.enviarVerificacao(result.user.id, result.user.email);
} catch (emailError) {
console.error('[cadastro] falha ao enviar email de verificacao:', emailError);
}

		return res.status(201).json({
			message: 'Usuário cadastrado com sucesso! Confirme seu email para ativar a conta.',
			data: result,
		});
	} catch (error: any) {
		return res.status(400).json({
			error: 'Erro ao cadastrar usuário',
			details: error.message,
		});
	}
}

export async function readUser(req: Request, res: Response) {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

	try {
		const user = await userService.readUser(id);
		return res.status(200).json(user);
	} catch (error: any) {
		return res.status(400).json({ error: 'Erro ao buscar usuário', details: error.message });
	}
}

export async function updateUser(req: Request, res: Response) {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

	try {
		const user = await userService.updateUser(id, req.body);
		return res.status(200).json({ message: 'Usuário atualizado com sucesso.', data: user });
	} catch (error: any) {
		return res.status(400).json({ error: 'Erro ao atualizar usuário', details: error.message });
	}
}

export async function deleteUser(req: Request, res: Response) {
	const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

	try {
		await userService.deleteUser(id);
		return res.status(204).send();
	} catch (error: any) {
		return res.status(400).json({ error: 'Erro ao remover usuário', details: error.message });
	}
}