// * Cypress-specific ESLint configuration for enforcing best practices
// ! This configuration ensures compliance with official Cypress.io best practices

module.exports = {
  extends: [
    'plugin:cypress/recommended'
  ],
  plugins: ['cypress'],
  env: {
    'cypress/globals': true
  },
  rules: {
    // ! CRITICAL: Cypress.io Best Practices Rules

    // * 1. No conditional statements (if/else) in tests
    'no-restricted-syntax': [
      'error',
      {
        selector: 'IfStatement',
        message: 'NEVER use if/else statements in Cypress tests. Tests must be deterministic. Use cy.intercept() or separate test cases instead.'
      },
      {
        selector: 'ConditionalExpression',
        message: 'Avoid ternary operators in tests. Tests should be deterministic.'
      },
      {
        selector: 'SwitchStatement',
        message: 'NEVER use switch statements in Cypress tests. Tests must be deterministic.'
      }
    ],

    // * 2. No arbitrary waits
    'cypress/no-unnecessary-waiting': 'error',

    // * 3. No assigning Cypress returns to variables
    'cypress/no-assigning-return-values': 'error',

    // * 4. Ensure proper async handling
    'cypress/no-async-tests': 'error',

    // * 5. No forcing actions (indicates bad test setup)
    'cypress/no-force': 'warn',

    // * 6. Proper assertion chaining
    'cypress/assertion-before-screenshot': 'warn',

    // * 7. Require data-cy attributes for selectors
    'cypress/require-data-selectors': 'error',

    // * Custom rules for selector patterns
    'no-restricted-properties': [
      'error',
      {
        object: 'cy',
        property: 'pause',
        message: 'Do not use cy.pause() in tests. Use proper debugging techniques.'
      }
    ],

    // * Enforce best practices for cy.get() selectors
    'no-restricted-globals': [
      'error',
      {
        name: 'cy.get',
        message: 'Ensure cy.get() uses data-cy attributes'
      }
    ],

    // * Additional Cypress best practice rules are defined above
  },

  overrides: [
    {
      // * E2E test files
      files: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'],
      rules: {
        // * Enforce cy.session() usage
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/setupAuth'],
                message: 'Use cy.session() instead of setupAuth(). See Cypress best practices.'
              }
            ]
          }
        ],

        // * Enforce data-cy selectors
        'no-restricted-syntax': [
          'error',
          // ! Ban CSS class selectors
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="get"][arguments.0.value=/^\\./]',
            message: 'NEVER use CSS class selectors. Use [data-cy="..."] instead.'
          },
          // ! Ban ID selectors
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="get"][arguments.0.value=/^#/]',
            message: 'NEVER use ID selectors. Use [data-cy="..."] instead.'
          },
          // ! Ban tag selectors
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="get"][arguments.0.value=/^(button|input|div|span|a|form|table|tr|td|th|ul|li|p|h[1-6])$/]',
            message: 'NEVER use HTML tag selectors. Use [data-cy="..."] instead.'
          },
          // ! Ban data-testid in favor of data-cy
          {
            selector: 'Literal[value=/data-testid/]',
            message: 'Use data-cy instead of data-testid for consistency.'
          },
          // ! Ban arbitrary waits
          {
            selector: 'CallExpression[callee.object.name="cy"][callee.property.name="wait"][arguments.0.type="Literal"][arguments.0.raw=/[0-9]+/]',
            message: 'NEVER use arbitrary waits like cy.wait(3000). Wait for specific conditions instead.'
          },
          // ! Ban if/else in tests
          {
            selector: 'IfStatement',
            message: 'NEVER use if/else in tests. Tests must be deterministic.'
          },
          // ! Ban variable assignment from Cypress commands
          {
            selector: 'VariableDeclarator[init.callee.object.name="cy"]',
            message: 'NEVER assign Cypress command returns to variables. Use aliases with .as() instead.'
          },
          // ! Ban console.log in tests
          {
            selector: 'CallExpression[callee.object.name="console"]',
            message: 'Remove console statements from tests. Use cy.log() for debugging.'
          }
        ],

        // * Enforce proper beforeEach structure
        'consistent-return': 'off', // Allow beforeEach without return
        'prefer-arrow-callback': ['error', {
          allowNamedFunctions: true,
          allowUnboundThis: true // Required for this.currentTest
        }],

        // * Cypress-specific overrides
        'cypress/unsafe-to-chain-command': 'error',
        'cypress/no-unnecessary-waiting': 'error',
        'cypress/no-async-tests': 'error',
        'cypress/no-force': 'warn',
        'cypress/assertion-before-screenshot': 'warn',
        'cypress/require-data-selectors': 'error',
        'cypress/no-pause': 'error'
      }
    },

    {
      // * Component test files
      files: ['cypress/component/**/*.cy.{js,jsx,ts,tsx}'],
      rules: {
        // * Component tests can be slightly more relaxed
        'cypress/no-force': 'warn', // Sometimes needed for complex components

        // * Still enforce data-cy selectors
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/data-testid/]',
            message: 'Use data-cy instead of data-testid for consistency.'
          }
        ]
      }
    },

    {
      // * Support files
      files: ['cypress/support/**/*.{js,ts}'],
      rules: {
        // * Allow custom command definitions
        'cypress/no-unnecessary-waiting': 'off',
        'cypress/unsafe-to-chain-command': 'off',
        'no-restricted-syntax': 'off' // Custom commands may need different patterns
      }
    }
  ]
};