import type { ChatServer } from './types';

let ioInstance: ChatServer | null = null;

/**
 * Registra a instância do Socket.IO criada em initializeSocket.
 * Mantém o acesso ao io desacoplado de src/index.ts, evitando ciclo de import
 * entre os handlers e o bootstrap do servidor (CHAT-16e).
 */
export function setIO(io: ChatServer): void {
	ioInstance = io;
}

export function getIO(): ChatServer {
	if (!ioInstance) {
		throw new Error(
			'Socket.IO ainda não foi inicializado. Chame initializeSocket primeiro.',
		);
	}

	return ioInstance;
}

/** Uso em testes para reiniciar o estado entre casos. */
export function resetIO(): void {
	ioInstance = null;
}
