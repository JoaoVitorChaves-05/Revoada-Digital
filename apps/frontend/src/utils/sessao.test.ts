import { describe, expect, it } from 'vitest';

import { TOKEN_STORAGE_KEY } from '../auth/authStore';
import { criarSessao, sessao } from './sessao';

/**
 * Sem sessão disponível, getUserId usa o fallback e os dados opcionais
 * permanecem nulos; quando há token persistido, getAuthToken o retorna.
 */
describe('Servico_Sessao', () => {
  it('getAuthToken retorna o token persistido', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'token-de-teste');
    const servico = criarSessao({ userIdFallback: 'qualquer-id' });

    expect(servico.getAuthToken()).toBe('token-de-teste');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  });

  describe('criarSessao', () => {
    it('getUserId retorna o userIdFallback configurado quando nao ha sessao (R2.2)', () => {
      const userIdFallback = 'fallback-id-123';
      const servico = criarSessao({ userIdFallback });

      expect(servico.getUserId()).toBe(userIdFallback);
    });

    it('getAuthToken retorna null quando não há token persistido', () => {
      const servico = criarSessao({ userIdFallback: 'qualquer-id' });

      expect(servico.getAuthToken()).toBeNull();
    });

    it('getNomeAluno retorna null nesta fase (R4.2)', () => {
      const servico = criarSessao({ userIdFallback: 'qualquer-id' });

      expect(servico.getNomeAluno()).toBeNull();
    });
  });

  describe('instancia padrao `sessao`', () => {
    it('getUserId retorna uma string nao vazia (fallback central)', () => {
      const userId = sessao.getUserId();

      expect(typeof userId).toBe('string');
      expect(userId.length).toBeGreaterThan(0);
    });

    it('getAuthToken e getNomeAluno retornam null sem sessão persistida', () => {
      expect(sessao.getAuthToken()).toBeNull();
      expect(sessao.getNomeAluno()).toBeNull();
    });
  });
});
