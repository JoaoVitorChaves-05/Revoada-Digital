import { Router } from 'express';
import {
  getAvailableRewards,
  redeemReward,
} from '../controllers/reward.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { validateSchema } from '../middlewares/validate.middleware';
import { redeemRewardSchema } from '../schemas/reward.schema';

const rewardsRouter = Router();

rewardsRouter.get('/catalog', ensureAuthenticated, getAvailableRewards);
rewardsRouter.post(
  '/redeem',
  ensureAuthenticated,
  validateSchema(redeemRewardSchema),
  redeemReward,
);

export default rewardsRouter;
