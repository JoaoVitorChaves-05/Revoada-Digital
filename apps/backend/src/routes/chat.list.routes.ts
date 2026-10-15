import { Router } from 'express';
import { listUserConversations } from '../controllers/chat.list.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const chatRoutes = Router();

chatRoutes.get('/conversations', ensureAuthenticated, listUserConversations);

export { chatRoutes };