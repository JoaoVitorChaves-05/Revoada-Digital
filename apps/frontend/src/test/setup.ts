// Setup global do Vitest para o frontend.
// Registra os matchers de @testing-library/jest-dom (ex.: toBeInTheDocument)
// e limpa o DOM renderizado apos cada teste para isolar os casos.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
