import type { ChatServer, ChatSocket, ChatMessagePayload } from '../types';
import { sendMessageSchema } from '../../schemas/chat.schema';
import {
	chatMessageService,
	ChatSendError,
} from '../../services/chat.message.service';
import { chatReadService } from '../../services/chat.read.service';
import { getIO } from '../instance';

export function registerChatHandlers(socket: ChatSocket): void {
	const userId = socket.data.userId;

	void socket.join(`user:${userId}`);

	socket.on('sendMsg', async (payload, ack) => {
		const parsed = sendMessageSchema.safeParse(payload);

		if (!parsed.success) {
			const message =
				parsed.error.issues[0]?.message ?? 'Dados inválidos';
			socket.emit('sendMsgError', {
				code: 'VALIDATION_ERROR',
				message,
			});
			ack?.({ ok: false, error: message });
			return;
		}

		try {
			const message = await chatMessageService.enviar({
				senderId: userId,
				receiverId: parsed.data.receiverId,
				content: parsed.data.content,
			});

			emitChatMessage(getIO(), {
				...message,
				createdAt: message.createdAt,
			});

			ack?.({ ok: true });
		} catch (error) {
			const { code, message } = toSocketError(error);
			socket.emit('sendMsgError', { code, message });
			ack?.({ ok: false, error: message });
		}
	});

	socket.on('markRead', async (payload) => {
		const conversationId = payload?.conversationId;

		if (typeof conversationId !== 'string' || !conversationId.trim()) {
			socket.emit('sendMsgError', {
				code: 'VALIDATION_ERROR',
				message: 'conversationId é obrigatório',
			});
			return;
		}

		try {
			await chatReadService.marcarComoLidas(
				conversationId.trim(),
				userId,
			);
		} catch {
			socket.emit('sendMsgError', {
				code: 'READ_ERROR',
				message: 'Erro ao marcar mensagens como lidas',
			});
		}
	});
}

/**
 * Emite newMsg para a sala do destinatário e também para a do remetente
 * (eco para reconciliar o envio otimista e refletir em outras sessões).
 */
export function emitChatMessage(
	io: ChatServer,
	message: ChatMessagePayload,
): void {
	const { receiverId, sender } = message;

	if (!receiverId.trim()) {
		throw new Error('receiverId must not be empty');
	}

	if (!sender?.id?.trim()) {
		throw new Error('sender id must not be empty');
	}

	io.to(`user:${receiverId}`)
		.to(`user:${sender.id}`)
		.emit('newMsg', message);
}

function toSocketError(error: unknown): {
	code: string;
	message: string;
} {
	if (error instanceof ChatSendError) {
		return { code: error.code, message: error.message };
	}

	return {
		code: 'INTERNAL_ERROR',
		message: 'Erro ao enviar a mensagem',
	};
}
