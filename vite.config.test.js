const { defineConfig, mergeConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;
const reactNativeWeb = require('vite-plugin-react-native-web').default;
const { viteCommonjs } = require('@originjs/vite-plugin-commonjs');
const svgr = require('vite-plugin-svgr').default;
const nodePolyfills = require('rollup-plugin-node-polyfills');
const tsconfigPaths = require('vite-tsconfig-paths').default;
const { resolve } = require('path');

// * Base configuration for Vite (duplicated from vite.config.ts to avoid TS issues)
const baseConfig = defineConfig({
  plugins: [
    // ! Order matters - React plugin must come first
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }]
        ]
      }
    }),
    // * React Native Web compatibility
    reactNativeWeb(),
    // * CommonJS support for React Native packages
    viteCommonjs({
      include: [
        'react-native-svg/**',
        'react-native-safe-area-context/**',
        'react-native-screens/**'
      ]
    }),
    // * SVG as React components
    svgr(),
    // * TypeScript path mapping
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      // ! CRITICAL: Must redirect react-native to react-native-web BEFORE it's parsed
      'react-native$': 'react-native-web',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter',
      'react-native-svg': 'react-native-svg/lib/commonjs',
      '@': resolve(__dirname, './src'),
    },
    // ! Critical: Extension order for React Native Web
    extensions: [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js'
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
  define: {
    'process.env': process.env,
    global: 'globalThis',
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  optimizeDeps: {
    // * Pre-bundle heavy dependencies
    include: [
      'react-native-web',
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@react-navigation/bottom-tabs',
      'zustand'
    ],
    // * Exclude problematic packages from optimization
    exclude: [
      'react-native', // ! Never try to parse the actual react-native package
      '@react-native-async-storage/async-storage'
    ],
    // * Force ESBuild to handle these extensions
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      jsx: 'automatic'
    }
  }
});

// * Test-specific configuration for Cypress component tests
module.exports = mergeConfig(
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
      // * Skip dependency scanning for test files
      entries: [],
      // * Inherit other optimizeDeps settings from base config
    },
    // * Test-specific environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
      'import.meta.env.MODE': JSON.stringify('test'),
    },
  })
);