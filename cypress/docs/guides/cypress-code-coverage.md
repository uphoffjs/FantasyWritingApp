# Cypress Code Coverage Documentation

_Source: https://docs.cypress.io/app/tooling/code-coverage_

## Overview

Code coverage is a metric that measures how much of your application code is executed while running tests. Cypress integrates with Istanbul/NYC to provide comprehensive code coverage reports for both E2E and component tests.

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Code Instrumentation](#code-instrumentation)
3. [Configuration](#configuration)
4. [Coverage Collection](#coverage-collection)
5. [Report Generation](#report-generation)
6. [Advanced Patterns](#advanced-patterns)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Installation & Setup

### Step 1: Install the Plugin

```bash
npm install --save-dev @cypress/code-coverage
# or
yarn add -D @cypress/code-coverage
```

### Step 2: Configure Support File

```javascript
// cypress/support/e2e.js (for E2E tests)
import '@cypress/code-coverage/support';

// cypress/support/component.js (for component tests)
import '@cypress/code-coverage/support';
```

### Step 3: Configure Cypress

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',
    setupNodeEvents(on, config) {
      // Implement code coverage task
      require('@cypress/code-coverage/task')(on, config);

      // IMPORTANT: return the config object
      return config;
    },
  },

  component: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
```

---

## Code Instrumentation

Code instrumentation adds tracking code to your application to record which lines are executed. There are several methods:

### Method 1: Babel Plugin (Recommended for React)

```json
// .babelrc or babel.config.js
{
  "presets": ["@babel/preset-react"],
  "plugins": ["istanbul"],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
```

### Method 2: NYC Instrumentation

```bash
# Instrument source code
npx nyc instrument --compact=false src instrumented

# Serve instrumented code during tests
npx http-server instrumented -p 3003
```

### Method 3: Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['istanbul'],
          },
        },
      },
    ],
  },
};
```

### Method 4: Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  plugins: [
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/'],
      extension: ['.js', '.ts', '.tsx'],
      requireEnv: false,
    }),
  ],
});
```

### Method 5: Create React App

For CRA without ejecting:

```javascript
// package.json
{
  "scripts": {
    "start:coverage": "react-scripts -r @cypress/instrument-cra start"
  }
}
```

---

## Configuration

### NYC Configuration (.nycrc)

```json
{
  "all": true,
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "exclude": [
    "**/*.test.{js,jsx,ts,tsx}",
    "**/*.cy.{js,jsx,ts,tsx}",
    "**/node_modules/**",
    "**/test/**",
    "**/tests/**",
    "**/coverage/**",
    "**/*.config.js"
  ],
  "reporter": ["html", "text", "lcov", "json"],
  "report-dir": "./coverage",
  "temp-dir": ".nyc_output",
  "check-coverage": true,
  "branches": 80,
  "lines": 80,
  "functions": 80,
  "statements": 80
}
```

### TypeScript Support

```json
// .nycrc for TypeScript
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx"],
  "reporter": ["html", "text", "lcov"],
  "sourceMap": true,
  "instrument": true,
  "require": ["ts-node/register"]
}
```

### Environment Variables

```javascript
// cypress.config.js
module.exports = defineConfig({
  env: {
    codeCoverage: {
      url: 'http://localhost:3002/__coverage__',
      exclude: ['cypress/**/*.*'],
    },
  },
});
```

---

## Coverage Collection

### Basic Coverage Collection

```javascript
// cypress/e2e/app.cy.js
describe('Application Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('covers homepage functionality', () => {
    cy.get('[data-cy="header"]').should('be.visible');
    cy.get('[data-cy="navigation"]').click();
    // Coverage is automatically collected
  });
});
```

### Component Test Coverage

```javascript
// src/components/Button.cy.tsx
import Button from './Button';

describe('Button Component', () => {
  it('covers button clicks', () => {
    cy.mount(<Button onClick={cy.stub()} />);
    cy.get('button').click();
    // Component code coverage is collected
  });
});
```

### Combining Coverage from Multiple Tests

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on('after:run', () => {
        // Combine coverage reports
        console.log('Coverage reports combined');
      });

      return config;
    },
  },
});
```

### Coverage for Specific Files

```javascript
// Force coverage collection for specific files
describe('Critical Path Coverage', () => {
  it('ensures auth module is fully covered', () => {
    // Import to ensure file is included
    cy.task('coverage:include', 'src/auth/**/*.js');

    cy.visit('/login');
    cy.get('[data-cy="email"]').type('user@example.com');
    cy.get('[data-cy="password"]').type('password');
    cy.get('[data-cy="submit"]').click();
  });
});
```

---

## Report Generation

### Viewing Coverage Reports

After running tests, coverage reports are generated in the `coverage/` directory:

```bash
# Run tests with coverage
npm run cypress:run

# View HTML report
open coverage/lcov-report/index.html

# Generate text summary
npx nyc report --reporter=text-summary

# Generate multiple formats
npx nyc report --reporter=html --reporter=text --reporter=json
```

### Report Types

#### HTML Report

Interactive visual report showing line-by-line coverage:

```bash
coverage/lcov-report/index.html
```

#### Text Summary

Console output with coverage percentages:

```
=============================== Coverage summary ===============================
Statements   : 85.71% ( 180/210 )
Branches     : 75.00% ( 30/40 )
Functions    : 90.00% ( 45/50 )
Lines        : 85.71% ( 180/210 )
================================================================================
```

#### LCOV Report

For CI/CD tools and coverage services:

```bash
coverage/lcov.info
```

#### JSON Report

Machine-readable format:

```bash
coverage/coverage-final.json
```

### Custom Report Configuration

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      // Custom reporter configuration
      on('task', {
        'coverage:report': () => {
          const NYC = require('nyc');
          const nyc = new NYC({
            reporter: ['html', 'text', 'json'],
            reportDir: './custom-coverage',
            tempDir: '.nyc_output',
          });
          return nyc.report();
        },
      });

      return config;
    },
  },
});
```

---

## Advanced Patterns

### Full Stack Coverage (Frontend + Backend)

```javascript
// Combine frontend and backend coverage
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on('task', {
        'coverage:combine': () => {
          const { execSync } = require('child_process');

          // Combine frontend and backend coverage
          execSync(
            'nyc merge coverage-frontend coverage-backend coverage-combined',
          );
          execSync('nyc report -t coverage-combined');

          return null;
        },
      });

      return config;
    },
  },
});
```

### Parallel Test Coverage

```javascript
// Merge coverage from parallel runs
describe('Parallel Coverage', () => {
  after(() => {
    if (Cypress.env('PARALLEL_GROUP') === 'last') {
      cy.task('coverage:combine');
    }
  });

  it('test in parallel', () => {
    // Test code
  });
});
```

### Conditional Coverage

```javascript
// Only collect coverage in certain environments
if (Cypress.env('coverage')) {
  import('@cypress/code-coverage/support');
}
```

### Per-Test Coverage Thresholds

```javascript
// cypress/e2e/critical.cy.js
describe(
  'Critical Features',
  {
    env: {
      coverage: {
        lines: 95,
        functions: 95,
        branches: 90,
      },
    },
  },
  () => {
    it('critical path must have high coverage', () => {
      // Critical tests
    });
  },
);
```

### Coverage Reset Between Tests

```javascript
// Reset coverage for specific tests
describe('Isolated Coverage', () => {
  beforeEach(() => {
    cy.task('resetCoverage');
  });

  afterEach(() => {
    cy.task('saveCoverage');
  });

  it('tracks coverage independently', () => {
    // Test code
  });
});
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test-coverage.yml
name: Test Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Instrument code
        run: npm run instrument

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: cypress
          name: cypress-coverage

      - name: Store coverage artifacts
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

jobs:
  test-coverage:
    docker:
      - image: cypress/browsers:latest
    steps:
      - checkout
      - run: npm ci
      - run: npm run test:coverage
      - store_artifacts:
          path: coverage
      - run:
          name: Upload coverage
          command: |
            npm install -g codecov
            codecov
```

### Coverage Badges

```markdown
# README.md

[![Coverage Status](https://coveralls.io/repos/github/user/repo/badge.svg)](https://coveralls.io/github/user/repo)
[![codecov](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/user/repo)
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Coverage shows 0%

```javascript
// Solution: Ensure instrumentation is working
// Check window.__coverage__ in browser console
cy.window().then(win => {
  expect(win.__coverage__).to.exist;
});
```

#### Issue: Missing source maps

```javascript
// webpack.config.js
module.exports = {
  devtool: 'source-map', // Add source maps
  // ...
};
```

#### Issue: Coverage not combining

```bash
# Clear NYC cache
rm -rf .nyc_output
rm -rf coverage
npm run test:coverage
```

#### Issue: React Native Web coverage

```javascript
// Special configuration for React Native Web
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
          // Include React Native modules
          path.resolve(__dirname, 'node_modules/react-native'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['istanbul'],
          },
        },
      },
    ],
  },
};
```

#### Issue: TypeScript files not covered

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false,
    "declarationMap": true
  }
}
```

### Debugging Coverage

```javascript
// Enable debug output
DEBUG=code-coverage npm run cypress:run

// Check coverage object
cy.task('coverage').then(coverage => {
  console.log('Coverage:', coverage)
})

// Validate instrumentation
cy.window().then(win => {
  if (!win.__coverage__) {
    throw new Error('No coverage object found')
  }
})
```

---

## Best Practices

### 1. Exclude Test Files

```json
// .nycrc
{
  "exclude": ["**/*.test.js", "**/*.cy.js", "**/cypress/**", "**/test/**"]
}
```

### 2. Set Realistic Thresholds

```json
{
  "check-coverage": true,
  "branches": 80, // Realistic for complex logic
  "lines": 85, // Good target for most projects
  "functions": 80, // Ensure most functions are tested
  "statements": 85 // Overall code execution
}
```

### 3. Focus on Critical Paths

```javascript
describe('Critical User Flows', () => {
  // Ensure high coverage for critical features
  it('authentication flow', () => {
    // Must have 95%+ coverage
  });

  it('payment processing', () => {
    // Must have 95%+ coverage
  });
});
```

### 4. Use Coverage Reports in PR Reviews

```yaml
# Pull request template
## Coverage Report
- [ ] Coverage increased or maintained
- [ ] All new code is covered
- [ ] Critical paths have >90% coverage
```

### 5. Incremental Coverage Improvements

```javascript
// Track coverage trends
const coverageTrend = {
  'week-1': { lines: 60 },
  'week-2': { lines: 65 },
  'week-3': { lines: 70 },
  // Gradual improvement
};
```

### 6. Combine Test Types

```javascript
// Maximize coverage with different test types
// Unit tests: 40% coverage
// Component tests: 30% coverage
// E2E tests: 30% coverage
// Total: ~85-90% coverage
```

### 7. Document Uncovered Code

```javascript
/* istanbul ignore next - Defensive code, should never execute */
if (impossible_condition) {
  throw new Error('This should never happen');
}

/* istanbul ignore if - Platform specific */
if (process.platform === 'win32') {
  // Windows-specific code
}
```

### 8. Regular Coverage Audits

```bash
# Weekly coverage check
npm run coverage:check

# Monthly detailed analysis
npm run coverage:report:detailed
```

---

## React Native Web Specific Configuration

For React Native Web projects like FantasyWritingApp:

### Babel Configuration

```json
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['istanbul', {
      exclude: [
        '**/*.test.js',
        '**/*.cy.js',
        '**/node_modules/**'
      ]
    }]
  ],
  env: {
    test: {
      plugins: ['istanbul']
    }
  }
}
```

### Webpack Configuration for Web

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          path.resolve(__dirname, 'src'),
          // Include React Native Web modules
          path.resolve(__dirname, 'node_modules/react-native-web'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: process.env.COVERAGE ? ['istanbul'] : [],
          },
        },
      },
    ],
  },
};
```

### Coverage Script

```json
// package.json
{
  "scripts": {
    "test:coverage": "COVERAGE=true npm run web & wait-on http://localhost:3002 && cypress run",
    "coverage:report": "nyc report --reporter=html --reporter=text"
  }
}
```

---

## Integration with Testing Strategy

### Coverage Goals by Component Type

| Component Type | Target Coverage | Priority |
| -------------- | --------------- | -------- |
| Authentication | 95%             | Critical |
| Data Models    | 90%             | High     |
| UI Components  | 85%             | Medium   |
| Utilities      | 95%             | High     |
| Navigation     | 80%             | Medium   |
| Error Handlers | 90%             | High     |

### Coverage Enforcement

```javascript
// cypress/support/commands.js
Cypress.Commands.add('checkCoverage', thresholds => {
  cy.task('coverage').then(coverage => {
    const { lines, functions, branches, statements } = coverage;

    if (lines < thresholds.lines) {
      throw new Error(
        `Line coverage ${lines}% is below threshold ${thresholds.lines}%`,
      );
    }
    if (functions < thresholds.functions) {
      throw new Error(
        `Function coverage ${functions}% is below threshold ${thresholds.functions}%`,
      );
    }
    if (branches < thresholds.branches) {
      throw new Error(
        `Branch coverage ${branches}% is below threshold ${thresholds.branches}%`,
      );
    }
    if (statements < thresholds.statements) {
      throw new Error(
        `Statement coverage ${statements}% is below threshold ${thresholds.statements}%`,
      );
    }
  });
});

// Usage in tests
after(() => {
  cy.checkCoverage({
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  });
});
```

---

## Additional Resources

- [Istanbul Documentation](https://istanbul.js.org/)
- [NYC Documentation](https://github.com/istanbuljs/nyc)
- [@cypress/code-coverage Plugin](https://github.com/cypress-io/code-coverage)
- [Codecov Integration](https://docs.codecov.com/docs)
- [Coveralls Integration](https://docs.coveralls.io/)

---

_Note: Code coverage is a useful metric but should not be the only measure of test quality. Focus on meaningful tests that validate business logic and user workflows._
