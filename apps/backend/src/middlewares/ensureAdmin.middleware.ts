import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function ensureAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        // O req.user.id foi preenchido pelo auth.middleware, então podemos usá-lo para buscar o usuário no banco de dados
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Busca o usuário no banco de dados para verificar o profileType
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { profileType: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verifica se o profileType é ADMIN (Diretor)
        if (user.profileType !== 'ADMIN') {
            return res.status(403).json({ 
                error: 'Acesso negado. Apenas administradores/diretores podem acessar esta ferramenta.' 
            });
        }

        // Se for admin, prossegue para o controller
        return next();
    } catch (error: any) {
        return res.status(500).json({ 
            error: 'Erro interno ao verificar permissões', 
            details: error.message 
        });
    }
}