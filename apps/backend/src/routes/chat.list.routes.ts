import { Router } from 'express';
import { listUserConversations } from '../controllers/chat.list.controller';
import { getMessageHistory } from '../controllers/chat.controller';
import { ensureAuthenticated } from '../middlewares/auth.middleware';

const chatRoutes = Router();

// Rotas de chat sob /chat, protegidas por JWT: ensureAuthenticated verifica o
// token (Authorization: Bearer) e preenche req.user.id, que os controllers usam
// como identidade do usuário atual.
chatRoutes.get('/conversations', ensureAuthenticated, listUserConversations);
chatRoutes.get('/messages/:userId', ensureAuthenticated, getMessageHistory);

export { chatRoutes };
