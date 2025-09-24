import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';
import { visualizer } from 'rollup-plugin-visualizer';

export default mergeConfig(
  baseConfig,
  defineConfig({
    mode: 'production',
    build: {
      outDir: 'dist',
      sourcemap: true,
      // * Optimize for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      // * Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Group by package name for better chunking
            if (id.includes('node_modules')) {
              const packageName = id.split('node_modules/')[1].split('/')[0];

              // Core React packages
              if (['react', 'react-dom', 'react-native-web'].includes(packageName)) {
                return 'react-core';
              }

              // Navigation packages
              if (packageName.includes('navigation') || packageName === 'react-native-screens') {
                return 'navigation';
              }

              // UI libraries
              if (['react-native-svg', 'react-native-safe-area-context', 'react-native-gesture-handler', 'react-native-reanimated'].includes(packageName)) {
                return 'ui-libs';
              }

              // State management and storage
              if (['zustand', '@react-native-async-storage'].includes(packageName) || packageName.includes('async-storage')) {
                return 'state';
              }

              // Supabase and database
              if (packageName.includes('supabase') || packageName === 'pg') {
                return 'database';
              }

              // Other utilities
              if (['uuid', 'fuse.js', 'dotenv'].includes(packageName)) {
                return 'utils';
              }

              // All other vendor code
              return 'vendor';
            }

            // Split app code by feature
            if (id.includes('/src/')) {
              if (id.includes('/screens/')) {
                // Group screens by feature area
                if (id.includes('Login') || id.includes('Auth')) return 'auth';
                if (id.includes('Settings')) return 'settings';
                if (id.includes('Project')) return 'projects';
                if (id.includes('Element')) return 'elements';
              }

              if (id.includes('/components/')) {
                return 'components';
              }

              if (id.includes('/store/')) {
                return 'app-state';
              }

              if (id.includes('/utils/')) {
                return 'app-utils';
              }
            }
          },
          // * Asset naming
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'js/[name].[hash].js',
          entryFileNames: 'js/[name].[hash].js',
        },
      },
      // * Performance budgets
      chunkSizeWarningLimit: 500,
      // * Reports
      reportCompressedSize: true,
    },
    plugins: [
      // * Bundle analyzer
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  })
);