import { Request, Response } from 'express';
import { simuladoGenerationService } from '../services/simulado-generation.service';

function isInsufficientQuestionsError(error: unknown) {
    return error instanceof Error && error.message === 'Questões insuficientes para gerar o simulado';
}

export async function generateSimulado(req: Request, res: Response) {
    try {
        const simulado = await simuladoGenerationService.generate(req.body);
        return res.status(201).json(simulado);
    } catch (error) {
        if (isInsufficientQuestionsError(error)) {
            return res.status(422).json({ error: error.message });
            //422 Unprocessable Entity é pra quando a requisição está com a forma certa, mas não pode ser processada por uma regra de negócio
        }

        return res.status(500).json({ error: 'Erro ao gerar simulado' });
    }
}