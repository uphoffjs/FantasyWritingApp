import { defineConfig } from "cypress";
import codeCoverageTask from "@cypress/code-coverage/task";
import { factoryTasks } from "./cypress/fixtures/factories";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3002",
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
    defaultCommandTimeout: 10000,    // DOM-based commands
    execTimeout: 60000,              // cy.exec() commands
    taskTimeout: 60000,              // cy.task() commands
    pageLoadTimeout: 60000,          // Page transitions
    requestTimeout: 10000,           // HTTP requests
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

      // Add any custom tasks here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        // Register factory tasks for data seeding
        ...factoryTasks,
        // * Explicit factory task registration as fallback
        'factory:reset': () => {
          console.log('Factory reset called');
          return null;
        },
        'factory:create': () => {
          return {};
        },
        'factory:scenario': () => {
          return { project: {}, stories: [], characters: [] };
        },
        'factory:seed': () => {
          return { stories: [], characters: [], projects: [], elements: [] };
        },
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
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: (() => {
        // Load webpack config and override the port
        const config = require("./webpack.config");
        if (config.devServer) {
          config.devServer.port = 3003;
        }
        return config;
      })(),
    },
    supportFile: "cypress/support/component.tsx",
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    indexHtmlFile: "cypress/support/component-index.html",
    // * React Native Web specific viewport presets - Mobile-first
    viewportWidth: 375,  // Mobile viewport for React Native
    viewportHeight: 812, // iPhone X dimensions
    // * Performance-optimized timeouts for component testing
    defaultCommandTimeout: 10000,    // Increased for RN Web components
    requestTimeout: 10000,           // HTTP requests
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
        // Register factory tasks for data seeding
        ...factoryTasks,
        // * Explicit factory task registration as fallback
        'factory:reset': () => {
          console.log('Factory reset called');
          return null;
        },
        'factory:create': () => {
          return {};
        },
        'factory:scenario': () => {
          return { project: {}, stories: [], characters: [] };
        },
        'factory:seed': () => {
          return { stories: [], characters: [], projects: [], elements: [] };
        },
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