/// <reference types="vitest/config" />
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // No monorepo, apps/frontend fixa react/react-dom 19.2.8 enquanto a raiz
  // resolve 19.3.0 (hoisted por @testing-library/react). Bibliotecas como
  // lucide-react podem acabar resolvendo a copia da raiz, gerando duas copias
  // de React no bundle ("Invalid hook call"). O dedupe garante uma unica copia
  // no dev e no build.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
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
    // Apenas nos testes, fixamos ambos na copia da raiz (a mesma usada pelo
    // react-dom de @testing-library) para garantir uma unica instancia pareada.
    alias: {
      react: path.resolve(dirname, '../../node_modules/react'),
      'react-dom': path.resolve(dirname, '../../node_modules/react-dom'),
    },
  },
})