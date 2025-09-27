/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,

  // * Transform setup for React Native
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },

  // * Module name mapper for React Native
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // * Setup files
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
};