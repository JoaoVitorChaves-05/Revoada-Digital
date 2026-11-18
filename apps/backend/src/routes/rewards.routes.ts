import { Router } from 'express';
import {
  getAvailableRewards,
  redeemReward,
  createReward,
  updateReward,
} from '../controllers/reward.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';
import { ensureAdmin } from '../middlewares/ensureAdmin.middleware';
import { validateSchema } from '../middlewares/validate.middleware';
import {
  redeemRewardSchema,
  createRewardSchema,
  updateRewardSchema,
} from '../schemas/reward.schema';

const rewardsRouter = Router();

rewardsRouter.get('/catalog', ensureAuthenticated, getAvailableRewards);
rewardsRouter.post(
  '/redeem',
  ensureAuthenticated,
  validateSchema(redeemRewardSchema),
  redeemReward,
);

rewardsRouter.post(
  '/',
  ensureAuthenticated,
  ensureAdmin,
  validateSchema(createRewardSchema),
  createReward,
);
rewardsRouter.put(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  validateSchema(updateRewardSchema),
  updateReward,
);

export default rewardsRouter;
