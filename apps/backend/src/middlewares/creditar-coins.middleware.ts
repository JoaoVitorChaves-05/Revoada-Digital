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

        // Se o aluno escolheu explicitamente não creditar os coins deste simulado
        if (creditarCoins === false) {
            return next();
        }

        // 1. Verificar a regra das 24 horas (máximo de 2 simulados pontuados por dia)
        const agora = new Date();
        const vinteQuatroHorasAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

        // Precisamos encontrar o StudentProfile do usuário para vincular/checar
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId },
        });

        if (!studentProfile) {
            return res.status(404).json({ error: 'Perfil de estudante não encontrado para este usuário.' });
        }

        // Conta quantos attempts do aluno tiveram coins creditados nas últimas 24h
        const tentativasPontuadasRecentes = await prisma.attempt.count({
            where: {
                mockExam: {
                    studentId: studentProfile.id,
                },
                coinsCredited: true,
                updatedAt: {
                    gte: vinteQuatroHorasAtras,
                },
            },
        });

        if (tentativasPontuadasRecentes >= 2) {
            return res.status(400).json({
                error: 'Limite diário atingido',
                message: 'Você já pontuou com coins em 2 simulados nas últimas 24 horas. Este simulado não gerará coins.',
            });
        }

        // 2. Buscar a tentativa, suas respostas e as questões associadas para o cálculo
        const attempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                mockExam: true,
                answers: {
                    include: {
                        question: true,
                    },
                },
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

        // 3. Cálculo dos pontos com base na dificuldade (Fácil: 1, Média: 2, Difícil: 3)
        let totalCoinsGanho = 0;
        for (const answer of attempt.answers) {
            if (answer.isCorrect === true) {
                const diff = answer.question.difficulty;
                if (diff === 1) totalCoinsGanho += 1;
                else if (diff === 2) totalCoinsGanho += 2;
                else if (diff >= 3) totalCoinsGanho += 3;
                else totalCoinsGanho += 1; // Fallback caso haja nível 0 ou padrão
            }
        }

        // 4. Transação Prisma: atualiza os pontos no StudentProfile e marca o Attempt como creditado
        await prisma.$transaction([
            prisma.studentProfile.update({
                where: { id: studentProfile.id },
                data: {
                    points: { increment: totalCoinsGanho },
                },
            }),
            prisma.attempt.update({
                where: { id: attemptId },
                data: {
                    coinsCredited: true,
                    earnedPoints: totalCoinsGanho,
                },
            }),
        ]);

        req.body.totalCoinsGanho = totalCoinsGanho;

        return next();
    } catch (error) {
        return res.status(500).json({
            error: 'Erro interno ao processar o crédito de coins.',
            details: error instanceof Error ? error.message : 'Erro desconhecido',
        });
    }
}