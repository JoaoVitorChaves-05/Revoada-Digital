import { Router } from 'express';
import {
    createSimulado,
    listSimulados,
    readSimulado,
    deleteSimulado,
    updateSimulado,
    finalizarSimulado
} from '../controllers/simulado.controller';
import { generateSimulado } from '../controllers/simulado-generation.controller'
import { validateSchema } from '../middlewares/validate.middleware';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { creditarCoinsMiddleware } from '../middlewares/creditar-coins.middleware';
import {
    createSimuladoSchema,
    updateSimuladoSchema,
} from '../schemas/simulado.schema';
import { generateSimuladoSchema } from '../schemas/simulado-generate.schema';

const simuladosRouter = Router();

simuladosRouter.post('/generate', ensureAuthenticated, validateSchema(generateSimuladoSchema), generateSimulado);

simuladosRouter.post(
    '/:id/finalizar',
    ensureAuthenticated,          // 1. Garante que o aluno está logado (popula req.user.id)
    creditarCoinsMiddleware,      // 2. Aplica a regra das 24h e calcula os pontos
    finalizarSimulado             // 3. Processa a finalização e salva no banco
);
// Criação mantida para permitir o ciclo completo do recurso.
simuladosRouter.post('/', ensureAuthenticated, validateSchema(createSimuladoSchema), createSimulado);
// Atualização parcial: somente os campos enviados são modificados.
simuladosRouter.put('/:id', ensureAuthenticated, validateSchema(updateSimuladoSchema), updateSimulado);
// Exclusão física do simulado identificado pelo parâmetro da rota.
simuladosRouter.delete('/:id', ensureAuthenticated, deleteSimulado);
simuladosRouter.get('/', ensureAuthenticated, listSimulados);
simuladosRouter.get('/:id', ensureAuthenticated, readSimulado);

export default simuladosRouter;