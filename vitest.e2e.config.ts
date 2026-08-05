import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

/** Runs the tests that hit real APIs and download real server jars. Never part of CI. */
export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve('src/shared'),
      '@renderer': resolve('src/renderer/src')
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.e2e.test.ts'],
    testTimeout: 900_000
  }
})
