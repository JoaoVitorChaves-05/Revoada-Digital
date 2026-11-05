// Contrato de dados do chat em tempo real (US-16).
// Reflete o shape retornado pelo backend em GET /chat/conversations,
// GET /chat/messages/:userId e pelos eventos Socket.IO (newMsg).

export interface ChatParticipant {
  id: string;
  full_name: string;
  email: string;
}

// Remetente embutido na mensagem (shape do backend: id/full_name/profileType).
export interface ChatMessageSender {
  id: string;
  full_name: string;
  profileType: string;
}

// Mensagem persistida, como retornada no histórico e no evento newMsg.
export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  sender: ChatMessageSender;
  // Presente no payload do socket (newMsg); ausente no histórico REST.
  receiverId?: string;
}

// Preview da última mensagem na lista de conversas.
export interface ConversationLastMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

// Conversa como retornada por GET /chat/conversations.
export interface Conversation {
  id: string;
  type: string;
  name: string | null;
  createdAt: string;
  participants: ChatParticipant[];
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
}

// Resposta do histórico: GET /chat/messages/:userId.
export interface MessageHistory {
  conversationId: string | null;
  userId: string;
  messages: ChatMessage[];
}

// Payload emitido pelo cliente ao enviar (evento sendMsg).
export interface SendMessagePayload {
  receiverId: string;
  content: string;
}

// Erro devolvido pelo servidor no evento sendMsgError.
export interface SendMessageError {
  code: string;
  message: string;
}
