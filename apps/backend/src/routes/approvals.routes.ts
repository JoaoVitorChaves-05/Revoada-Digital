import { Router } from 'express';
import { updateApproval } from '../controllers/approval.controller';
import { listPendingApprovals } from '../controllers/approval.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { updateApprovalSchema } from '../schemas/approval.schema';

const approvalsRouter = Router();

approvalsRouter.get('/pending', listPendingApprovals);

approvalsRouter.patch('/:id', validateSchema(updateApprovalSchema), updateApproval);

export default approvalsRouter;
