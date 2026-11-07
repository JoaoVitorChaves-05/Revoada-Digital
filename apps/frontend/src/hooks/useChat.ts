import { useCallback, useEffect, useRef, useState } from 'react';
import {
  connectChatSocket,
  disconnectChatSocket,
} from '../lib/chatSocket';
import type {
  ChatMessage,
  Conversation,
  MessageHistory,
} from '../types/chat.types';

// URL base da API REST do chat. Em produção aponta para o backend persistente
// (ex.: Railway) via VITE_API_URL; em dev, cai no backend local.
const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type Status = 'loading' | 'error' | 'ready';

interface UseChatResult {
  conversations: Conversation[];
  conversationsStatus: Status;
  conversationsError: string | null;
  reloadConversations: () => void;

  selectedUserId: string | null;
  selectConversationWith: (otherUserId: string) => void;

  messages: ChatMessage[];
  messagesStatus: Status;
  messagesError: string | null;

  sendMessage: (content: string) => void;
  sendError: string | null;
}

/**
 * Hook central do chat: carrega conversas e histórico via REST (padrão fetch do
 * PainelDesempenho), conecta o socket com o userId de teste, trata newMsg,
 * envio otimista e markRead. Estados loading/erro/vazio explícitos.
 */
export function useChat(currentUserId: string): UseChatResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsStatus, setConversationsStatus] =
    useState<Status>('loading');
  const [conversationsError, setConversationsError] = useState<string | null>(
    null,
  );

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesStatus, setMessagesStatus] = useState<Status>('ready');
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Mantém o destinatário atual acessível dentro dos listeners do socket.
  const selectedUserIdRef = useRef<string | null>(null);
  selectedUserIdRef.current = selectedUserId;

  const loadConversations = useCallback(async () => {
    setConversationsStatus('loading');
    setConversationsError(null);
    try {
      const response = await fetch(`${URL_BASE_API}/chat/conversations`, {
        headers: { 'x-user-id': currentUserId },
      });
      if (!response.ok) {
        throw new Error('Não foi possível carregar as conversas.');
      }
      const body = await response.json();
      setConversations(body.data ?? []);
      setConversationsStatus('ready');
    } catch (err: unknown) {
      setConversationsError(
        err instanceof Error ? err.message : 'Erro inesperado.',
      );
      setConversationsStatus('error');
    }
  }, [currentUserId]);

  const loadMessages = useCallback(
    async (otherUserId: string) => {
      setMessagesStatus('loading');
      setMessagesError(null);
      try {
        const response = await fetch(
          `${URL_BASE_API}/chat/messages/${otherUserId}`,
          { headers: { 'x-user-id': currentUserId } },
        );
        if (!response.ok) {
          throw new Error('Não foi possível carregar as mensagens.');
        }
        const body: MessageHistory = await response.json();
        setMessages(body.messages ?? []);
        setMessagesStatus('ready');

        // Marca a conversa como lida ao abrir (CHAT-16u) e zera o unread local.
        if (body.conversationId) {
          const socket = connectChatSocket(currentUserId);
          socket.emit('markRead', { conversationId: body.conversationId });
          setConversations((prev) =>
            prev.map((c) =>
              c.id === body.conversationId ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }
      } catch (err: unknown) {
        setMessagesError(
          err instanceof Error ? err.message : 'Erro inesperado.',
        );
        setMessagesStatus('error');
      }
    },
    [currentUserId],
  );

  // Carga inicial das conversas.
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Conexão do socket + listeners (um por sessão/usuário).
  useEffect(() => {
    const socket = connectChatSocket(currentUserId);

    const handleNewMsg = (message: ChatMessage) => {
      const otherId =
        message.sender.id === currentUserId
          ? message.receiverId
          : message.sender.id;

      // Se a mensagem pertence à conversa aberta, reflete na lista.
      if (otherId && otherId === selectedUserIdRef.current) {
        setMessages((prev) => {
          // Evita duplicar: o eco do próprio envio pode já ter sido otimista.
          if (prev.some((m) => m.id === message.id)) return prev;
          // Reconcilia o otimista (mesmo sender e conteúdo, id temporário).
          const withoutOptimistic = prev.filter(
            (m) =>
              !(
                m.id.startsWith('tmp-') &&
                m.sender.id === message.sender.id &&
                m.content === message.content
              ),
          );
          return [...withoutOptimistic, message];
        });
      }

      // Atualiza o preview/unread da lista de conversas de forma leve.
      loadConversations();
    };

    socket.on('newMsg', handleNewMsg);
    socket.on('sendMsgError', (error) => setSendError(error.message));

    return () => {
      socket.off('newMsg', handleNewMsg);
      socket.off('sendMsgError');
    };
  }, [currentUserId, loadConversations]);

  // Desconecta ao desmontar o componente que usa o hook.
  useEffect(() => {
    return () => {
      disconnectChatSocket();
    };
  }, []);

  const selectConversationWith = useCallback(
    (otherUserId: string) => {
      setSelectedUserId(otherUserId);
      setSendError(null);
      loadMessages(otherUserId);
    },
    [loadMessages],
  );

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      const receiverId = selectedUserIdRef.current;
      if (!trimmed || !receiverId) return;

      setSendError(null);

      // Mensagem otimista com id temporário; reconciliada ao chegar o newMsg.
      const optimistic: ChatMessage = {
        id: `tmp-${Date.now()}`,
        conversationId: 'optimistic',
        content: trimmed,
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUserId,
          full_name: 'Você',
          profileType: '',
        },
        receiverId,
      };
      setMessages((prev) => [...prev, optimistic]);

      const socket = connectChatSocket(currentUserId);
      socket.emit('sendMsg', { receiverId, content: trimmed }, (result) => {
        if (!result.ok) {
          // Reverte a mensagem otimista em caso de falha.
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
          setSendError(result.error ?? 'Falha ao enviar a mensagem.');
        }
      });
    },
    [currentUserId],
  );

  return {
    conversations,
    conversationsStatus,
    conversationsError,
    reloadConversations: loadConversations,
    selectedUserId,
    selectConversationWith,
    messages,
    messagesStatus,
    messagesError,
    sendMessage,
    sendError,
  };
}
