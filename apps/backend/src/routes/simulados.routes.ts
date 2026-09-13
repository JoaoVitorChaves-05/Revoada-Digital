import { Router } from 'express';
import {
 createSimulado,
 deleteSimulado,
 updateSimulado,
} from '../controllers/simulado.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import {
 createSimuladoSchema,
 updateSimuladoSchema,
} from '../schemas/simulado.schema';

const simuladosRouter = Router();

// Criação mantida para permitir o ciclo completo do recurso.
simuladosRouter.post('/', validateSchema(createSimuladoSchema), createSimulado);
// Atualização parcial: somente os campos enviados são modificados.
simuladosRouter.put('/:id', validateSchema(updateSimuladoSchema), updateSimulado);
// Exclusão física do simulado identificado pelo parâmetro da rota.
simuladosRouter.delete('/:id', deleteSimulado);

export default simuladosRouter;