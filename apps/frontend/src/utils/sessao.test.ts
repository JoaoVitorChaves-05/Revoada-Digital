import { describe, expect, it } from 'vitest';

import { criarSessao, sessao } from './sessao';

/**
 * Testes de exemplo do Servico_Sessao (tarefa 2.2).
 *
 * Cobrem o comportamento da Fase 1 descrito na Testing Strategy do design:
 * sem sessao disponivel, `getUserId()` retorna o fallback configurado (R2.2);
 * `getAuthToken()` e `getNomeAluno()` retornam `null` nesta fase (R2.4, R4.2).
 */
describe('Servico_Sessao', () => {
  describe('criarSessao', () => {
    it('getUserId retorna o userIdFallback configurado quando nao ha sessao (R2.2)', () => {
      const userIdFallback = 'fallback-id-123';
      const servico = criarSessao({ userIdFallback });

      expect(servico.getUserId()).toBe(userIdFallback);
    });

    it('getAuthToken retorna null nesta fase (R2.4)', () => {
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

    it('getAuthToken e getNomeAluno retornam null nesta fase', () => {
      expect(sessao.getAuthToken()).toBeNull();
      expect(sessao.getNomeAluno()).toBeNull();
    });
  });
});
