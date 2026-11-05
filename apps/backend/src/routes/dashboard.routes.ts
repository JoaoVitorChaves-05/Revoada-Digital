import { Router } from 'express';
import {
  getDashboard,
  getMyDashboard,
} from '../controllers/dashboard.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { ensureAdmin } from '../middlewares/ensureAdmin.middleware';

const dashboardRouter = Router();

dashboardRouter.get('/director', ensureAuthenticated, ensureAdmin, getDashboard);
dashboardRouter.get('/me', ensureAuthenticated, getMyDashboard);

export default dashboardRouter;