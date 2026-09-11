import { Request, Response } from 'express';
import { healthService } from '../services/health.service';

export async function healthCheck(_req: Request, res: Response) {
	try {
		await healthService.check();
		return res.status(200).json({
			status: 'OK',
			message: 'API e Banco de Dados rodando perfeitamente!',
			timestamp: new Date(),
		});
	} catch (error) {
		return res.status(500).json({
			status: 'ERROR',
			message: 'Erro ao conectar no banco de dados',
			error,
		});
	}
}