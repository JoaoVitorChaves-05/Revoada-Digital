import { Router } from 'express';
import { getMessageHistory } from '../controllers/chat.controller';

const chatRouter = Router();

chatRouter.get('/messages/:userId', getMessageHistory);

export default chatRouter;