import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';
import { resolve } from 'path';
import { reactNativeFixPlugin } from './vite-plugin-react-native-fix';

// * Test-specific configuration for Cypress component tests
export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      // ! Add custom plugin to fix React Native Flow types issue
      reactNativeFixPlugin(),
    ],
    mode: 'test',
    server: {
      port: 3003,
      // * Faster startup for tests
      fs: {
        strict: false,
      },
    },
    resolve: {
      alias: {
        // ! CRITICAL: Full react-native alias to prevent Flow file parsing
        'react-native': 'react-native-web',
        'react-native$': 'react-native-web',
        'react-native/': 'react-native-web/',
        // * Ensure specific react-native modules are aliased
        'react-native/Libraries': 'react-native-web/dist',
        'react-native/index': 'react-native-web',
      },
    },
    optimizeDeps: {
      // ! Force dependency optimization for tests
      entries: [
        'cypress/component/**/*.cy.{ts,tsx}',
        'src/**/*.{ts,tsx}'
      ],
      force: true,
      // * Include packages that need pre-bundling
      include: [
        'react-native-web',
        '@react-navigation/native',
        '@react-navigation/native-stack',
        'zustand'
      ],
      // * Keep excluded packages from base config
      exclude: [
        'react-native',
        'react-native/**',
        '**/*.flow',
        '@cypress/react',
        'cypress-axe',
        'cypress-real-events'
      ],
      // * ESBuild options to handle issues
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.flow': 'text', // * Treat Flow files as text to avoid parsing
        },
        jsx: 'automatic',
        // * Exclude problematic files from transformation
        exclude: ['**/*.flow', 'node_modules/react-native/**'],
      }
    },
    // * Build options for tests
    build: {
      rollupOptions: {
        external: [
          'react-native', // * Externalize to prevent bundling
        ],
      },
    },
    // * Test-specific environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
      'import.meta.env.MODE': JSON.stringify('test'),
    },
  })
);