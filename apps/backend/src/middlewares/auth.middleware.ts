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

interface TokenPayload {
    sub: string; 
    iat: number;
    exp: number;
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    try {
        const secretKey = process.env.JWT_SECRET;
        
        if (!secretKey) {
            throw new Error('JWT_SECRET não configurado nas variáveis de ambiente');
        }

       
        const decoded = jwt.verify(token, secretKey) as TokenPayload;

    
        req.user = {
            id: decoded.sub,
        };

        return next();
    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}