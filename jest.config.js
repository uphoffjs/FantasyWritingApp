module.exports = {
  preset: 'react-native',

  // * Test environment setup
  testEnvironment: 'node',

  // * Setup files to run after environment is set up
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],

  // * Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // * Transform files with TypeScript and JSX
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // * Module name mapping for assets and aliases
  moduleNameMapper: {
    // * Mock image imports
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',

    // * Mock style imports
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',

    // * Path aliases matching tsconfig
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
  },

  // * Test match patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '!**/cypress/**',  // * Explicitly exclude Cypress files
  ],

  // * Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,ts}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/test/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],

  // * Coverage thresholds (realistic targets)
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 75,
      functions: 80,
      statements: 80,
    },
  },

  // * Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // * Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/.expo/',
    '/dist/',
    '/build/',
    '/coverage/',
    '\\.snap$',
    '/cypress/',
  ],

  // * Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|@react-native-community|react-native-vector-icons|react-native-svg|react-native-web|nativewind)/)',
  ],

  // * Timers configuration for React Native
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: false,
  },

  // * Global setup/teardown - disabled due to nativewind/PostCSS conflict
  // globalSetup: '<rootDir>/src/test/globalSetup.js',
  // globalTeardown: '<rootDir>/src/test/globalTeardown.js',

  // * Verbose output for better debugging
  verbose: true,

  // * Clear mocks between tests
  clearMocks: true,

  // * Reset mocks between tests
  resetMocks: true,

  // * Restore mocks between tests
  restoreMocks: true,

  // * Maximum worker threads
  maxWorkers: '50%',

  // * Bail on first test failure (useful for CI)
  bail: false,

  // * Test timeout
  testTimeout: 10000,
};