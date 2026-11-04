import { afterEach, describe, expect, it } from 'vitest';
import { getIO, resetIO, setIO } from './instance';
import type { ChatServer } from './types';

describe('socket instance', () => {
	afterEach(() => {
		resetIO();
	});

	it('lança quando acessado antes de inicializar', () => {
		expect(() => getIO()).toThrow(
			/ainda não foi inicializado/,
		);
	});

	it('retorna a instância registrada após setIO', () => {
		const fakeIO = { marker: 'io' } as unknown as ChatServer;

		setIO(fakeIO);

		expect(getIO()).toBe(fakeIO);
	});
});
