import type { Server, Socket } from 'socket.io';

//esse arquivo def ine os tipos de eventos e dados 
// que serão usados no socket.io, 
// garantindo que a comunicação entre o cliente e o servidor 
// seja tipada corretamente.

export interface SocketData {
    userId: string;
}

export interface ChatMessagePayload {
    id: string;
    conversationId: string;
    content: string;
    createdAt: string | Date;
    sender: {
        id: string;
        full_name: string;
        profileType: string;
    };
    receiverId: string;
}

export interface SendMessagePayload {
    receiverId: string;
    content: string;
}

export interface SendMessageErrorPayload {
    code: string;
    message: string;
}

export interface MarkReadPayload {
    conversationId: string;
}

export interface ClientToServerEvents {
    sendMsg: (
        payload: SendMessagePayload,
        ack?: (result: { ok: boolean; error?: string }) => void,
    ) => void;
    markRead: (payload: MarkReadPayload) => void;
}

export interface ServerToClientEvents {
    newMsg: (message: ChatMessagePayload) => void;
    sendMsgError: (error: SendMessageErrorPayload) => void;
}

export type InterServerEvents = Record<never, never>;

export type ChatServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type ChatSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
