import { Router } from 'express';
import {
  getDashboard,
  getDesempenhoAreas,
  getMyDashboard,
} from '../controllers/dashboard.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { ensureAdmin } from '../middlewares/ensureAdmin.middleware';

const dashboardRouter = Router();

dashboardRouter.get('/director', ensureAuthenticated, ensureAdmin, getDashboard);
dashboardRouter.get('/me', ensureAuthenticated, getMyDashboard);
// Resolve o aluno por ?userId= (sem JWT nesta fase), como GET /attempts.
dashboardRouter.get('/me/desempenho-areas', getDesempenhoAreas);

export default dashboardRouter;