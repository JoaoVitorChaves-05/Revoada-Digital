import { Router } from 'express';
import {
  getDashboard,
  getMyDashboard,
} from '../controllers/dashboard.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

dashboardRouter.get('/director', getDashboard);
dashboardRouter.get('/me', ensureAuthenticated, getMyDashboard);

export default dashboardRouter;
