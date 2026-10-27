import { Router } from 'express';
import { getMyDashboard } from '../controllers/dashboard.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

dashboardRouter.get(
  '/me',
  ensureAuthenticated,
  getMyDashboard,
);

export default dashboardRouter;