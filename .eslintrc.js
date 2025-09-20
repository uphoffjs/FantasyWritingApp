module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:storybook/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
    'jest/globals': true
  },
  globals: {
    // Service Worker globals
    self: 'readonly',
    caches: 'readonly',
    clients: 'readonly',
    indexedDB: 'readonly',
    Response: 'readonly',
    Request: 'readonly',
    fetch: 'readonly',
    ServiceWorkerGlobalScope: 'readonly',
    FetchEvent: 'readonly',
    ExtendableEvent: 'readonly',
    // Browser globals
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    document: 'readonly',
    window: 'readonly',
    navigator: 'readonly',
    HTMLElement: 'readonly',
    // React Native globals
    __DEV__: 'readonly',
    // Jest globals
    expect: 'readonly',
    test: 'readonly',
    describe: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly',
    it: 'readonly'
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    '@typescript-eslint/no-explicit-any': 'off', // Too many to fix now, can enable later
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off', // Allow requires in JS files

    // React Native specific
    'react-native/no-inline-styles': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unstable-nested-components': 'off',

    // General rules
    'no-console': 'off', // Allow console for development
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-unused-vars': 'off', // Handled by TypeScript
    'prefer-const': 'error',
    'no-var': 'error',

    // Jest rules
    'jest/no-disabled-tests': 'warn',
    'jest/valid-expect': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',

    // Relaxed rules for specific patterns
    'no-undef': 'error',
    'no-div-regex': 'off',
    'comma-dangle': ['error', 'only-multiline'],
    'prettier/prettier': 'off', // Handled separately
  },
  overrides: [
    {
      // Service Worker files
      files: ['**/service-worker*.js', '**/sw*.js'],
      env: {
        serviceworker: true,
        browser: true
      }
    },
    {
      // Test files
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/cypress/**/*.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
        browser: true
      },
      globals: {
        cy: 'readonly',
        Cypress: 'readonly'
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'jest/no-disabled-tests': 'off', // Allow disabled tests in test files
        'jest/valid-expect': 'off', // Cypress has different expect syntax
      }
    },
    {
      // Template files
      files: ['**/*TEMPLATE*.{js,jsx,ts,tsx}', '**/templates/**/*.{js,jsx,ts,tsx}'],
      rules: {
        'react/jsx-no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-undef': 'off'
      }
    },
    {
      // Config files
      files: ['*.config.js', '*.config.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-unused-vars': 'off'
      }
    },
    {
      // Mockup files
      files: ['**/mockups/**/*.js'],
      env: {
        browser: true
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    'coverage/',
    '*.min.js',
    'vendor/',
    'ios/',
    'android/',
    '.expo/',
    '.next/',
    'metro-cache/',
    '*.generated.*'
  ]
};