import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import reactNativeWeb from 'vite-plugin-react-native-web';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';
import { transformSync } from '@babel/core';

// ! Custom plugin to strip Flow types from React Native files
function stripFlowPlugin(): Plugin {
  const fs = require('fs');

  return {
    name: 'strip-flow',
    enforce: 'pre', // ! Run before other transformations
    load(id) {
      // ! Only process .js files in react-native node_modules
      // Remove query parameters (like ?v=xxx) from the ID
      const cleanId = id.split('?')[0];

      if (cleanId.includes('node_modules/react-native') && cleanId.endsWith('.js')) {
        try {
          // Read the file
          const code = fs.readFileSync(cleanId, 'utf-8');

          // Transform with Babel to strip Flow types
          const result = transformSync(code, {
            filename: cleanId,
            plugins: ['@babel/plugin-transform-flow-strip-types'],
            configFile: false,
            babelrc: false,
          });

          return {
            code: result?.code || code,
            map: result?.map,
          };
        } catch (e) {
          // ! If transformation fails, log and return null to let Vite handle it
          console.warn(`Failed to strip Flow types from ${cleanId}:`, e);
          return null;
        }
      }
      return null;
    },
  };
}

// * Base configuration for Vite
export default defineConfig({
  plugins: [
    // ! Strip Flow types BEFORE any other processing
    stripFlowPlugin(),
    // ! Order matters - React plugin must come first
    react({
      babel: {
        plugins: [
          '@babel/plugin-transform-flow-strip-types', // ! Strip Flow types from React Native files
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
  ssr: {
    // ! Force Vite to not externalize react-native during SSR/scanning
    noExternal: ['react-native'],
  },
  optimizeDeps: {
    // ! DISABLED: Bypass dependency scanning to avoid Flow syntax errors
    disabled: true,
  }
});