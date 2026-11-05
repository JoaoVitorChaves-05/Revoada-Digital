import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estende a tipagem do Request do Express para aceitar a propriedade 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export function ensureAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({
			error: 'Token de autenticação não fornecido',
		});
	}

	const match = /^Bearer ([^\s]+)$/i.exec(authHeader);

	if (!match) {
		return res.status(401).json({
			error: 'Formato de autenticação inválido',
		});
	}

	const token = match[1]!;

	const secretKey = process.env.JWT_SECRET;

	if (!secretKey || !secretKey.trim()) {
		return res.status(500).json({
			error: 'Erro na configuração de autenticação',
		});
	}

	try {
		const decoded = jwt.verify(token, secretKey, {
			algorithms: ['HS256'],
		});

		if (
			typeof decoded === 'string' ||
			typeof decoded.sub !== 'string' ||
			!decoded.sub.trim() ||
			typeof decoded.exp !== 'number'
		) {
			return res.status(401).json({
				error: 'Token inválido ou expirado',
			});
		}

		req.user = {
			id: decoded.sub,
		};
	} catch {
		return res.status(401).json({
			error: 'Token inválido ou expirado',
		});
	}

	return next();
}