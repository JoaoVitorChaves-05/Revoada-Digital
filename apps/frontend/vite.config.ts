/// <reference types="vitest/config" />
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Escuta em todos os enderecos (IPv4 + IPv6) para que links
    // http://localhost:5173 e http://127.0.0.1:5173 funcionem no navegador.
    host: true,
    port: 5173,
    strictPort: true,
  },
  test: {
    globals: true,
    // jsdom cobre tanto os testes de componentes React quanto os de funcoes puras.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // No monorepo, apps/frontend fixa react/react-dom 19.2.8 enquanto a raiz
    // resolve 19.3.0 (hoisted por @testing-library/react). Duas copias de React
    // quebram os hooks nos testes de componente ("Invalid hook call"). Apenas
    // nos testes, fixamos ambos na copia da raiz (a mesma usada pelo react-dom
    // de @testing-library) para garantir uma unica instancia pareada; o build
    // de producao segue usando a copia do app, sem alteracao.
    alias: {
      react: path.resolve(dirname, '../../node_modules/react'),
      'react-dom': path.resolve(dirname, '../../node_modules/react-dom'),
    },
  },
})