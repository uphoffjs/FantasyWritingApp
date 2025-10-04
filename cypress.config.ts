import { defineConfig } from "cypress";
import codeCoverageTask from "@cypress/code-coverage/task";
// * Import factory tasks from JavaScript file to avoid TypeScript compilation issues
const { factoryTasks } = require("./cypress/fixtures/factories/factory-tasks.js");
// * Import Vite dev server for component testing

export default defineConfig({
  e2e: {
    // ! Use host.docker.internal for Docker, localhost for native (CYPRESS_baseUrl can override)
    baseUrl: process.env.CYPRESS_baseUrl || "http://localhost:3002",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    screenshotOnRunFailure: true,
    video: false, // * Disable video for performance, enable only for debugging
    // Browser configuration
    chromeWebSecurity: false,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    viewportWidth: 1280,
    viewportHeight: 720,
    // * Performance-optimized timeouts based on best practices
    defaultCommandTimeout: 4000,     // DOM-based commands (reduced from 10000)
    execTimeout: 60000,              // cy.exec() commands
    taskTimeout: 60000,              // cy.task() commands
    pageLoadTimeout: 60000,          // Page transitions
    requestTimeout: 4000,            // HTTP requests (reduced from 10000)
    responseTimeout: 30000,          // cy.request() responses
    // * React Native Web specific: animation waits
    animationDistanceThreshold: 20,
    waitForAnimations: true,
    // * Enhanced retry configuration for flaky tests
    retries: {
      runMode: 2,    // CI/CD pipeline
      openMode: 0,   // Local development for immediate feedback
    },
    // * Performance optimizations
    testIsolation: true,             // Clean context between tests
    trashAssetsBeforeRuns: true,    // Clean old screenshots/videos
    experimentalStudio: true,       // Visual test recorder
    experimentalRunAllSpecs: true,   // Run all specs button
    numTestsKeptInMemory: 50,       // Limit memory usage
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);

      // * Configure webpack preprocessor for E2E tests to handle React Native modules
      const webpack = require('@cypress/webpack-preprocessor');
      const webpackOptions = require('./cypress/webpack.config.js');

      on('file:preprocessor', webpack({
        webpackOptions,
        watchOptions: {}
      }));

      // Add any custom tasks here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        // ==========================================
        // 🔴 ERROR LOGGING TASK
        // ==========================================
        logError(errorInfo: {
          type: string;
          message: string;
          stack?: string;
          test?: string;
          timestamp: string;
        }) {
          console.error('\n=== 🔴 LOGGED ERROR ===');
          console.error('Type:', errorInfo.type);
          console.error('Message:', errorInfo.message);
          if (errorInfo.stack) console.error('Stack:', errorInfo.stack);
          if (errorInfo.test) console.error('Test:', errorInfo.test);
          console.error('Timestamp:', errorInfo.timestamp);
          console.error('======================\n');

          // Optional: Write to file for later analysis
          // const fs = require('fs');
          // const path = require('path');
          // const logPath = path.join(__dirname, 'cypress-errors.log');
          // fs.appendFileSync(logPath, JSON.stringify(errorInfo) + '\n');

          return null;
        },
        // Register factory tasks for data seeding
        ...factoryTasks
      });

      // * Fix Chrome CDP connection issues
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // * Add Chrome flags to fix DevTools Protocol connection
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=IsolateOrigins,site-per-process');
          launchOptions.args.push('--disable-blink-features=AutomationControlled');

          // * Remove problematic flags if they exist
          const problematicFlags = ['--disable-background-timer-throttling'];
          launchOptions.args = launchOptions.args.filter(
            arg => !problematicFlags.some(flag => arg.includes(flag))
          );

          return launchOptions;
        }
      });

      return config;
    },
    env: {
      MOCK_AUTH_ENABLED: true,
      TEST_USER_EMAIL: "test@example.com",
      TEST_USER_PASSWORD: "testpassword123",
      LOG_ERRORS: true, // Enable comprehensive error logging
    },
  },

  component: {
    devServer: (devServerConfig) => {
      // ! Switch to webpack for component tests to avoid React Native Flow issues
      const { devServer } = require('@cypress/webpack-dev-server');
      const path = require('path');

      const webpackConfig = {
        mode: 'development',
        // * Performance optimization: Add filesystem cache for faster rebuilds
        cache: {
          type: 'filesystem',
          cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
          // * Cache dependencies for better invalidation
          buildDependencies: {
            config: [__filename]
          }
        },
        // * Optimization settings for faster test builds
        optimization: {
          removeAvailableModules: false,  // * Skip expensive module optimization
          removeEmptyChunks: false,       // * Skip empty chunk removal
          splitChunks: false,              // * Disable code splitting for tests
          runtimeChunk: false,             // * Single runtime chunk
          minimize: false                  // * Skip minification for tests
        },
        module: {
          rules: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              exclude: /node_modules\/(?!(react-native-.*|@react-native.*)\/.*)/,
              resolve: {
                fullySpecified: false // ! Handle ES module imports without extensions
              },
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    '@babel/preset-env',
                    ['@babel/preset-react', { runtime: 'automatic' }],
                    '@babel/preset-typescript'
                  ],
                  plugins: [
                    ['@babel/plugin-transform-class-properties', { loose: true }],
                    ['@babel/plugin-transform-private-methods', { loose: true }],
                    ['@babel/plugin-transform-private-property-in-object', { loose: true }]
                  ],
                  // ! Exclude nativewind for web builds to avoid PostCSS issues
                  babelrc: false,
                  configFile: false
                }
              }
            },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
            },
            {
              test: /\.(png|svg|jpg|jpeg|gif)$/i,
              type: 'asset/resource'
            }
          ]
        },
        resolve: {
          extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
          alias: {
            'react-native$': 'react-native-web',
            'react-native/': 'react-native-web/dist/',
            'react-native-svg': 'react-native-svg/lib/commonjs',
            '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage/lib/commonjs',
            '@': path.resolve(__dirname, './src'),
          }
        }
      };

      return devServer({
        ...devServerConfig,
        framework: "react",
        bundler: "webpack",
        webpackConfig
      });
    },
    supportFile: "cypress/support/component.tsx",
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    indexHtmlFile: "cypress/support/component-index.html",
    // * React Native Web specific viewport presets - Mobile-first
    viewportWidth: 375,  // Mobile viewport for React Native
    viewportHeight: 812, // iPhone X dimensions
    // * Performance-optimized timeouts for component testing
    defaultCommandTimeout: 4000,     // Optimized for RN Web components (reduced from 10000)
    requestTimeout: 4000,            // HTTP requests (reduced from 10000)
    responseTimeout: 10000,          // Server responses
    // * Animation handling for RN Web
    animationDistanceThreshold: 20,
    waitForAnimations: true,
    // * Enhanced retry configuration for flaky RN Web tests
    retries: {
      runMode: 2,    // CI/CD pipeline - retry flaky tests
      openMode: 0,   // No retries in dev for immediate feedback
    },
    // * Performance optimizations for component tests
    video: false,                    // Disable for performance
    screenshotOnRunFailure: true,   // Keep for debugging
    trashAssetsBeforeRuns: true,    // Clean old files
    // testIsolation: true,          // Not supported for component tests - only E2E
    // experimentalStudio: true,     // Not supported for component tests - only E2E
    // experimentalRunAllSpecs: true, // Not supported for component tests - only E2E
    numTestsKeptInMemory: 50,       // Limit memory usage
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);

      // React Native Web specific tasks and factory tasks
      on("task", {
        // General logging task for debug commands
        log(message) {
          console.log(message);
          return null;
        },
        // Log React Native warnings
        logRNWarning(message) {
          console.warn("[RN Web]", message);
          return null;
        },
        // Clear React Native cache
        clearRNCache() {
          // Could implement cache clearing logic here
          return null;
        },
        // ==========================================
        // 🔴 ERROR LOGGING TASK (Component Tests)
        // ==========================================
        logError(errorInfo: {
          type: string;
          message: string;
          stack?: string;
          test?: string;
          timestamp: string;
        }) {
          console.error('\n=== 🔴 LOGGED ERROR ===');
          console.error('Type:', errorInfo.type);
          console.error('Message:', errorInfo.message);
          if (errorInfo.stack) console.error('Stack:', errorInfo.stack);
          if (errorInfo.test) console.error('Test:', errorInfo.test);
          console.error('Timestamp:', errorInfo.timestamp);
          console.error('======================\n');
          return null;
        },
        // Register factory tasks for data seeding
        ...factoryTasks
      });

      // * Fix Chrome CDP connection issues for component tests
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // * Add Chrome flags to fix DevTools Protocol connection
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=IsolateOrigins,site-per-process');
          launchOptions.args.push('--disable-blink-features=AutomationControlled');

          // * Remove problematic flags if they exist
          const problematicFlags = ['--disable-background-timer-throttling'];
          launchOptions.args = launchOptions.args.filter(
            arg => !problematicFlags.some(flag => arg.includes(flag))
          );

          return launchOptions;
        }
      });

      // Set React Native Web environment flags
      config.env = {
        ...config.env,
        IS_REACT_NATIVE_WEB: true,
        PLATFORM: "web",
        TOUCH_EVENTS_ENABLED: true,
      };

      return config;
    },
  },
});