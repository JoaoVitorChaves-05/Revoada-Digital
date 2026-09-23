import { Request, Response } from 'express';
import { questionService } from '../services/question.service'

export async function updateQuestion (req: Request, res: Response){
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
        const question = await questionService.updateQuestion(id,req.body);
        return res.status(200).json({message: 'Questão atualizada com sucesso', data: question});
    } catch (error: any) {
        return res.status(400).json ({error: 'Erro ao atualizar questão', details: error.message});
    }
}

export async function deleteQuestion(req: Request, res: Response){
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try{
        await questionService.deleteQuestion(id);
        return res.status(204).send();
    } catch (error: any){
        return res.status(400).json ({error: 'Erro ao deletar questão', details: error.message});
    }
}
