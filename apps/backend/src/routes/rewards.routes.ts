import { Router } from 'express';
import { getAvailableRewards } from '../controllers/reward.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const rewardsRouter = Router();

rewardsRouter.get('/catalog', ensureAuthenticated, getAvailableRewards);

export default rewardsRouter;
