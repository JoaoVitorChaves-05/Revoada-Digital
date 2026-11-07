import { io, type Socket } from 'socket.io-client';
import type {
  ChatMessage,
  SendMessageError,
  SendMessagePayload,
} from '../types/chat.types';

// TODO(CHA-30 / Task 19): extrair a URL base para import.meta.env (VITE_*).
const SOCKET_URL = 'http://localhost:3000';

// Eventos que o servidor envia ao cliente.
interface ServerToClientEvents {
  newMsg: (message: ChatMessage) => void;
  sendMsgError: (error: SendMessageError) => void;
}

// Eventos que o cliente envia ao servidor.
interface ClientToServerEvents {
  sendMsg: (
    payload: SendMessagePayload,
    ack?: (result: { ok: boolean; error?: string }) => void,
  ) => void;
  markRead: (payload: { conversationId: string }) => void;
}

export type ChatSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

let socket: ChatSocket | null = null;
let currentUserId: string | null = null;

/**
 * Conecta (ou reusa) um único socket por sessão para o userId informado.
 * Se o userId mudar (troca de usuário de teste), recria a conexão.
 * Identidade provisória (1=a/6=a): o userId vai no handshake.auth.
 */
export function connectChatSocket(userId: string): ChatSocket {
  if (socket && currentUserId === userId) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentUserId = userId;
  socket = io(SOCKET_URL, {
    auth: { userId },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function getChatSocket(): ChatSocket | null {
  return socket;
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
}
