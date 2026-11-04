import { Router } from 'express';
import { listUserConversations } from '../controllers/chat.list.controller';
import { getMessageHistory } from '../controllers/chat.controller';

const chatRoutes = Router();

// Registro consolidado das rotas de chat sob /chat.
// Identidade provisória unificada (1=a): histórico usa o mesmo userId provisório
// (header x-user-id) enquanto conversations usa o id resolvido pela aplicação.
// A unificação por JWT fica para o Bloco B (Tasks 15-17).
chatRoutes.get('/conversations', listUserConversations);
chatRoutes.get('/messages/:userId', getMessageHistory);

export { chatRoutes };
