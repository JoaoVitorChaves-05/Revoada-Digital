import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function creditarCoinsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const { attemptId, creditarCoins } = req.body;

        if (!attemptId) {
            return res.status(400).json({ error: 'O ID da tentativa (attemptId) é obrigatório.' });
        }

        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!studentProfile) {
            return res.status(404).json({ error: 'Perfil de estudante não encontrado para este usuário.' });
        }

        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                mockExam: { select: { studentId: true } },
            },
        });

        if (!attempt) {
            return res.status(404).json({ error: 'Tentativa não encontrada.' });
        }

        // Valida se a tentativa pertence a um simulado do estudante
        if (attempt.mockExam.studentId !== studentProfile.id) {
            return res.status(403).json({ error: 'Acesso negado a esta tentativa.' });
        }

        if (attempt.coinsCredited) {
            return res.status(400).json({ error: 'Os coins desta tentativa já foram creditados anteriormente.' });
        }

        if (creditarCoins === false) {
            return next();
        }

        const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const tentativasPontuadasRecentes = await prisma.attempt.count({
            where: {
                mockExam: { studentId: studentProfile.id },
                coinsCredited: true,
                updatedAt: { gte: vinteQuatroHorasAtras },
            },
        });

        if (tentativasPontuadasRecentes >= 2) {
            return res.status(400).json({
                error: 'Limite diário atingido',
                message: 'Você já pontuou com coins em 2 simulados nas últimas 24 horas. Este simulado não gerará coins.',
            });
        }

        return next();
    } catch (error) {
        return res.status(500).json({
            error: 'Erro interno ao processar o crédito de coins.',
            details: error instanceof Error ? error.message : 'Erro desconhecido',
        });
    }
}