import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config.ts';

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
      // * Include common test dependencies
      include: [
        'react',
        'react-dom',
        'react-native-web',
        '@react-navigation/native',
        '@testing-library/react',
      ],
      // * Exclude test files from optimization
      exclude: ['cypress'],
      // ! Force dependency optimization for tests
      force: true,
    },
    // * Test-specific environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
      'import.meta.env.MODE': JSON.stringify('test'),
      'process.env': {},
      'global': 'globalThis',
    },
  })
);