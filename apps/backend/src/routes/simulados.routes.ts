import { Router } from 'express';
import {
    createSimulado,
    listSimulados,
    readSimulado,
    deleteSimulado,
    updateSimulado,
} from '../controllers/simulado.controller';
import { generateSimulado } from '../controllers/simulado-generation.controller'
import { validateSchema } from '../middlewares/validate.middleware';
import {
    createSimuladoSchema,
    updateSimuladoSchema,
} from '../schemas/simulado.schema';
import { generateSimuladoSchema } from '../schemas/simulado-generate.schema';

const simuladosRouter = Router();

simuladosRouter.post('/generate', validateSchema(generateSimuladoSchema), generateSimulado);
// Criação mantida para permitir o ciclo completo do recurso.
simuladosRouter.post('/', validateSchema(createSimuladoSchema), createSimulado);
// Atualização parcial: somente os campos enviados são modificados.
simuladosRouter.put('/:id', validateSchema(updateSimuladoSchema), updateSimulado);
// Exclusão física do simulado identificado pelo parâmetro da rota.
simuladosRouter.delete('/:id', deleteSimulado);
simuladosRouter.get('/', listSimulados);
simuladosRouter.get('/:id', readSimulado);

export default simuladosRouter;