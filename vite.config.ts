import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import reactNativeWeb from 'vite-plugin-react-native-web';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// * Base configuration for Vite
export default defineConfig({
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
        'react-native-screens/**',
        'merge-options/**', // * Fix merge-options ESM/CommonJS interop
        '@react-native-async-storage/async-storage/**'
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
  server: {
    port: 3002, // ! Match project's standard port
    open: true,
    // * CORS configuration for development
    cors: true,
    // * HMR configuration
    hmr: {
      overlay: true,
    }
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
      'zustand',
      '@react-native-async-storage/async-storage' // * Include to pre-bundle with its dependencies
    ],
    // * Exclude problematic packages from optimization
    exclude: [
      'react-native', // ! Never try to parse the actual react-native package
      '@cypress/react',
      'cypress-axe',
      'cypress-real-events'
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