import { defineConfig } from "cypress";
import codeCoverageTask from "@cypress/code-coverage/task";
import { factoryTasks } from "./cypress/fixtures/factories";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3002",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    screenshotOnRunFailure: true,
    video: true,
    // Browser configuration
    chromeWebSecurity: false,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // React Native Web specific: animation waits
    animationDistanceThreshold: 20,
    waitForAnimations: true,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);

      // Add any custom tasks here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
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
    // React Native Web specific viewport presets
    viewportWidth: 375,  // Default to mobile viewport
    viewportHeight: 667,
    // Component testing timeouts optimized for RN Web
    defaultCommandTimeout: 12000,  // Increased for RN animations
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Animation handling for RN Web
    animationDistanceThreshold: 20,
    waitForAnimations: true,
    // Retry configuration for flaky RN Web tests
    retries: {
      runMode: 3,  // More retries in CI
      openMode: 1,  // Some retries in dev
    },
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      
      // React Native Web specific tasks
      on("task", {
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
        // Factory tasks for test data management
        ...factoryTasks,
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