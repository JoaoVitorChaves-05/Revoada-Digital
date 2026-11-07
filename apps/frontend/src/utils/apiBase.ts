/**
 * Resolve a URL base da API de forma robusta em qualquer ambiente:
 *
 * 1) Se VITE_API_URL estiver definida (ex.: configurada na Vercel), usa ela.
 * 2) Senao, se estiver rodando em localhost/127.0.0.1 (dev), usa o backend local.
 * 3) Senao (producao sem a variavel), usa a URL de producao do backend.
 *
 * Assim o login funciona tanto em dev quanto no deploy, mesmo que a variavel
 * de ambiente nao esteja configurada. O ideal continua sendo definir
 * VITE_API_URL no painel da Vercel; este fallback evita o "Failed to fetch".
 */

// URL de producao do backend (deploy Vercel do servico revoada-digital-backend).
const API_PRODUCAO = 'https://revoada-digital-backend.vercel.app';
const API_LOCAL = 'http://localhost:3000';

function resolver(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env && env.trim()) return env.trim();

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return API_LOCAL;
  }
  return API_PRODUCAO;
}

// Sem barra final, para evitar '//auth/login'.
export const API_BASE_URL = resolver().replace(/\/+$/, '');