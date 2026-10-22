import type { Server, Socket } from 'socket.io';

//esse arquivo def ine os tipos de eventos e dados 
// que serão usados no socket.io, 
// garantindo que a comunicação entre o cliente e o servidor 
// seja tipada corretamente.

export interface SocketData {
    userId: string;
}

export type ClientToServerEvents = Record<never, never>;

export interface ServerToClientEvents {
    newMsg: (message: unknown) => void;
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
