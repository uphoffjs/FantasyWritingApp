import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

// * Test-specific configuration for Cypress component tests
export default mergeConfig(
  baseConfig,
  defineConfig({
    mode: 'test',
    server: {
      port: 3003,
      // * Faster startup for tests
      fs: {
        strict: false,
      },
    },
    optimizeDeps: {
      // ! Force dependency optimization for tests
      entries: [
        'cypress/component/**/*.cy.{ts,tsx}',
        'src/**/*.{ts,tsx}'
      ],
      force: true,
    },
    // * Test-specific environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
      'import.meta.env.MODE': JSON.stringify('test'),
    },
  })
);