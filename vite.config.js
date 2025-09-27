/**
 * Vite Configuration for React Native Web
 * Optimized for performance and bundle size
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // React plugin with Fast Refresh
    react({
      fastRefresh: true,
      // Optimize React Native Web
      babel: {
        plugins: [
          ['module:react-native-dotenv'],
          ['react-native-web', { commonjs: true }]
        ],
      },
    }),

    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false,
    }),

    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),

    // PWA Support (optional)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Fantasy Writing App',
        short_name: 'FantasyApp',
        theme_color: '#C9A961',
        background_color: '#F5F2E8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  // Resolution and aliases for React Native Web
  resolve: {
    alias: {
      // React Native Web aliases
      'react-native$': 'react-native-web',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter',

      // Project aliases
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@screens': path.resolve(__dirname, './src/screens'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@navigation': path.resolve(__dirname, './src/navigation'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@providers': path.resolve(__dirname, './src/providers'),

      // Platform-specific resolution
      './src/components/(.+)\\.tsx$': './src/components/$1',
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json'
    ],
  },

  // Development server configuration
  server: {
    port: 3002,
    strictPort: true,
    host: true,
    open: false,
    cors: true,
    hmr: {
      overlay: true,
    },
    // Proxy API requests if needed
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-native-web')) {
            return 'react-core';
          }
          // UI libraries
          if (id.includes('react-native-vector-icons') ||
              id.includes('react-native-svg') ||
              id.includes('react-native-gesture-handler')) {
            return 'ui-libs';
          }
          // Navigation
          if (id.includes('@react-navigation')) {
            return 'navigation';
          }
          // State management
          if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
            return 'state';
          }
          // Database/Backend
          if (id.includes('supabase') || id.includes('async-storage')) {
            return 'database';
          }
          // Utilities
          if (id.includes('lodash') || id.includes('date-fns') || id.includes('uuid')) {
            return 'utils';
          }
          // Vendor (everything else from node_modules)
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Asset naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name].[hash].js`;
        },

        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name].[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            return `fonts/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // KB

    // CSS code splitting
    cssCodeSplit: true,

    // Optimize CSS
    cssMinify: true,

    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    // Enable minification
    minify: true,

    // Generate manifest
    manifest: true,

    // Clean dist folder before build
    emptyOutDir: true,
  },

  // Optimization settings
  optimizeDeps: {
    // Pre-bundle heavy dependencies
    include: [
      'react',
      'react-dom',
      'react-native-web',
      '@react-navigation/native',
      '@react-navigation/stack',
      'zustand',
      '@supabase/supabase-js',
    ],
    // Exclude packages that shouldn't be pre-bundled
    exclude: ['@vitetest'],
    // Force optimization of these packages
    esbuildOptions: {
      target: 'es2020',
    },
  },

  // Define global constants
  define: {
    __DEV__: process.env.NODE_ENV !== 'production',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  // CSS configuration
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-preset-env')({
          stage: 3,
          features: {
            'nesting-rules': true,
          },
        }),
        // Only minify in production
        process.env.NODE_ENV === 'production' && require('cssnano')({
          preset: 'default',
        }),
      ].filter(Boolean),
    },
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // Worker configuration for Web Workers
  worker: {
    format: 'es',
    plugins: [react()],
  },

  // Preview server (for testing production build)
  preview: {
    port: 3003,
    strictPort: true,
    host: true,
    open: false,
  },

  // Environment variables prefix
  envPrefix: 'VITE_',
});