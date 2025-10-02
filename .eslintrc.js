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

    // Platform-specific import rules
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['*.web', '*.ios', '*.android', '*.native'],
          message: 'Do not import platform-specific files directly. Use platform-agnostic imports and let Metro bundler handle selection.'
        }
      ],
      paths: [
        {
          name: 'react-native-web',
          message: 'Import from react-native instead. React Native Web handles the aliasing.'
        }
      ]
    }],

    // Ensure testID presence for testing
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  },
  overrides: [
    {
      // Web-specific platform files
      files: ['*.web.tsx', '*.web.ts', '*.web.jsx', '*.web.js'],
      env: {
        browser: true
      },
      rules: {
        // Allow web-specific patterns in .web.tsx files
        'no-restricted-globals': 'off',
        // Allow DOM manipulation for web
        'no-undef': ['error', { typeof: true }],
        // Allow web-specific event handlers
        'react/no-unknown-property': ['error', {
          ignore: ['onMouseEnter', 'onMouseLeave', 'onContextMenu']
        }],
        // Ensure data-testid for web testing
        'react/jsx-no-literals': 'off',
        // Allow style prop for web-specific styling
        'react-native/no-inline-styles': 'off'
      }
    },
    {
      // Native platform files (iOS and Android specific)
      files: ['*.ios.tsx', '*.ios.ts', '*.android.tsx', '*.android.ts'],
      rules: {
        // Enforce React Native patterns
        'react-native/no-inline-styles': 'error',
        'react-native/no-color-literals': 'warn',
        'react-native/no-raw-text': 'error'
      }
    },
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
      // Cypress-specific rules - extends from .eslintrc.cypress.js
      files: ['**/cypress/**/*.cy.{js,jsx,ts,tsx}', '**/cypress/**/*.spec.{js,jsx,ts,tsx}'],
      extends: ['./.eslintrc.cypress.js'],
      env: {
        'cypress/globals': true,
        'jest': false,  // Explicitly disable Jest environment
        'mocha': true   // Enable Mocha environment
      },
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        // Mocha globals
        describe: 'readonly',
        context: 'readonly',
        it: 'readonly',
        specify: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      },
      rules: {
        // Explicitly disable ALL Jest rules
        'jest/no-focused-tests': 'off',
        'jest/no-disabled-tests': 'off',
        'jest/valid-expect': 'off',
        'jest/no-identical-title': 'off',
        'jest/no-conditional-expect': 'off',
        'jest/no-test-return-statement': 'off',
        'jest/prefer-to-be': 'off',
        'jest/prefer-to-have-length': 'off',

        // Allow Mocha's exclusive tests (.only() in development)
        'mocha/no-exclusive-tests': 'off',
        // ! CRITICAL: Cypress Best Practices (from official docs)
        // * These override any conflicting rules from other configs
        'no-restricted-syntax': [
          'error',
          // ! Ban if/else statements - Tests MUST be deterministic
          {
            selector: 'IfStatement',
            message: '❌ NEVER use if/else in Cypress tests. Tests must be deterministic (Cypress.io best practice)'
          },
          // ! Ban CSS class selectors
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="get"][arguments.0.value=/^\\./]',
            message: '❌ NEVER use CSS class selectors. Use [data-cy="..."] instead (Cypress.io best practice)'
          },
          // ! Ban ID selectors
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="get"][arguments.0.value=/^#/]',
            message: '❌ NEVER use ID selectors. Use [data-cy="..."] instead (Cypress.io best practice)'
          },
          // ! Ban arbitrary waits
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="wait"][arguments.0.type="Literal"][arguments.0.raw=/^[0-9]+$/]',
            message: '❌ NEVER use arbitrary waits like cy.wait(3000). Use assertions instead (Cypress.io best practice)'
          },
          // ! Ban data-testid in favor of data-cy
          {
            selector: 'Literal[value=/data-testid/]',
            message: '⚠️ Use data-cy instead of data-testid for consistency'
          },
          // ! Ban hardcoded localhost URLs in cy.visit()
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="visit"] Literal[value=/^http:\\/\\/localhost/]',
            message: '❌ NEVER use hardcoded localhost URLs. Use relative paths like cy.visit("/login") to work with baseUrl (Cypress.io best practice)'
          },
          // ! Ban hardcoded localhost URLs in cy.request()
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="request"] Literal[value=/^http:\\/\\/localhost/]',
            message: '❌ NEVER use hardcoded localhost URLs in cy.request(). Use relative paths to work with baseUrl (Cypress.io best practice)'
          }
        ],
        // * Disable rules that conflict with Cypress patterns
        '@typescript-eslint/no-unused-vars': 'off'
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