import { Request, Response } from 'express';
import { chatService } from '../services/chat.list.service';

export async function listUserConversations(req: Request, res: Response) {
    try {
        // Identidade provisória unificada (1=a): mesmo esquema do histórico.
        // No Bloco B (JWT) isto volta a ser req.user.id via ensureAuthenticated.
        const userId =
            req.user?.id ||
            (req as any).userId ||
            req.header('x-user-id');

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const conversations = await chatService.getUserConversations(userId);

        return res.status(200).json({
            message: 'Conversas listadas com sucesso',
            data: conversations,
        });
    } catch (error: any) {
        return res.status(400).json({
            error: 'Erro ao listar conversas',
            details: error.message,
        });
    }
}