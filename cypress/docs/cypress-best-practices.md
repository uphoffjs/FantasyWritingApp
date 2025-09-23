# Cypress Best Practices Guide

This document outlines essential best practices for writing effective, maintainable, and reliable Cypress tests for the FantasyWritingApp project.

> **⚠️ CRITICAL RULES**:
> 1. NEVER use conditional statements (if/else) in Cypress tests. Tests must be deterministic.
> 2. ALWAYS use `cy.comprehensiveDebug()` in every `beforeEach` hook - THIS IS MANDATORY.
> 3. ALWAYS use `cy.cleanState()` to reset application state before each test.
> 4. ALWAYS test against local development servers for maximum control.
> 5. NEVER try to start a web server from within Cypress scripts.

## Table of Contents
1. [Starting Your Development Server](#starting-your-development-server)
2. [Organizing Tests](#organizing-tests)
3. [Selecting Elements](#selecting-elements)
4. [Test Independence](#test-independence)
5. [State Management](#state-management)
6. [Avoiding Common Pitfalls](#avoiding-common-pitfalls)
7. [Authentication & Login](#authentication--login)
8. [Network Requests & Waiting](#network-requests--waiting)
9. [Configuration Best Practices](#configuration-best-practices)
10. [Data Seeding Strategies](#data-seeding-strategies)

---

## Starting Your Development Server

### Why Start Local Development Server?

Testing against local servers provides:
- **Complete control** over server configuration and environment
- **Ability to seed data** and reset state between tests
- **Faster test execution** compared to remote servers
- **Debugging capabilities** with access to server logs
- **Test-specific endpoints** for data setup and teardown

### Starting Your Server (Before Cypress)

```bash
# Start your React Native Web development server
npm run web        # Starts on port 3002

# Or use start-server-and-test for CI/CD
# package.json
{
  "scripts": {
    "test:e2e": "start-server-and-test web http://localhost:3002 cypress:run"
  }
}
```

⚠️ **Important**: Server must be running BEFORE starting Cypress. Never try to start servers from within Cypress tests.

---

## Organizing Tests

### Test Structure
- **Write specs in isolation**: Each test spec should be able to run independently
- **Group related tests**: Use `describe` blocks to organize related test cases
- **Use meaningful test names**: Test names should clearly describe what is being tested

```javascript
// Good - Clear, descriptive test structure
describe('Element Creation', () => {
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Reset state before each test
    cy.cleanState();

    cy.visit('/elements')
  })

  it('should create a new character element', () => {
    // Test implementation
  })

  it('should validate required fields', () => {
    // Test implementation
  })
})
```

### File Organization
```
cypress/
├── e2e/                    # End-to-end tests
│   ├── elements/          # Element-related tests
│   ├── projects/          # Project management tests
│   └── auth/              # Authentication tests
├── component/             # Component tests
├── fixtures/              # Test data
└── support/               # Helper commands and utilities
```

---

## Selecting Elements

### ✅ Best Practice: Use Data Attributes

**Always use `data-cy` attributes for element selection** in the FantasyWritingApp project:

```javascript
// ✅ GOOD - Using data-cy attribute
cy.get('[data-cy="create-element-button"]').click()
cy.get('[data-cy="element-title-input"]').type('Dragon')

// ❌ BAD - Don't use these selectors
cy.get('.btn-primary').click()        // CSS class
cy.get('#submit').click()              // ID
cy.get('button').contains('Submit')   // Tag + text
```

### Implementing Data Attributes in React Native

For React Native components, use `testID` which converts to `data-cy` on web:

```tsx
// React Native component
<TouchableOpacity 
  testID="create-element-button"  // Becomes data-cy on web
  onPress={handleCreate}
>
  <Text>Create Element</Text>
</TouchableOpacity>

// For web-specific attributes
import { Platform } from 'react-native';

const getTestProps = (id: string) => {
  if (Platform.OS === 'web') {
    return { 'data-cy': id };
  }
  return { testID: id };
};

<TextInput {...getTestProps('element-title-input')} />
```

### Selector Priority Order
1. **`data-cy`** - Preferred for all test selectors
2. **`data-test`** - Alternative if data-cy not available
3. **`data-testid`** - For compatibility with Testing Library
4. **Role attributes** - For accessibility testing
5. Never use CSS classes, IDs, or tag names

---

## Test Independence

### Each Test Should Stand Alone

Tests should not depend on the execution order or results of other tests:

```javascript
// ✅ GOOD - Independent tests
describe('Project Management', () => {
  beforeEach(function() {
    // ! MANDATORY: Debug and clean state
    cy.comprehensiveDebug();
    cy.cleanState();

    // Create fresh state for each test
    cy.setupTestUser();
    cy.visit('/projects')
  })

  it('creates a new project', () => {
    cy.get('[data-cy="new-project-button"]').click()
    // Test continues...
  })

  it('deletes a project', () => {
    // This test creates its own project to delete
    cy.createProject({ name: 'Test Project' })
    cy.get('[data-cy="delete-project-button"]').click()
    // Test continues...
  })
})

// ❌ BAD - Dependent tests
it('creates a project', () => {
  cy.get('[data-cy="new-project-button"]').click()
  // Creates project...
})

it('edits the project created above', () => {
  // This assumes the previous test ran and succeeded
  cy.get('[data-cy="edit-button"]').click()
})
```

---

## State Management

### Clean State Before Tests, Not After

```javascript
// ✅ GOOD - Clean state in beforeEach
beforeEach(function() {
  // ! MANDATORY: Always include these
  cy.comprehensiveDebug();
  cy.cleanState();

  // For React Native Web with Zustand
  cy.setupTestData({ projects: 2, elements: 5 });
})

// ❌ BAD - Don't clean in afterEach
afterEach(() => {
  // Avoid cleanup here - if test fails, cleanup might not run
  cy.task('db:clean')
})
```

### Using Aliases and Closures

Avoid assigning return values directly:

```javascript
// ❌ BAD - Don't do this
const button = cy.get('[data-cy="submit-button"]')
button.click()

// ✅ GOOD - Use aliases
cy.get('[data-cy="submit-button"]').as('submitBtn')
cy.get('@submitBtn').click()

// ✅ GOOD - Use then() for accessing values
cy.get('[data-cy="element-count"]').then(($count) => {
  const count = parseInt($count.text())
  expect(count).to.be.greaterThan(0)
})
```

---

## Avoiding Common Pitfalls

### Don't Use Arbitrary Waits

```javascript
// ❌ BAD - Fixed wait times
cy.wait(3000) // Arbitrary wait

// ✅ GOOD - Wait for specific conditions
cy.get('[data-cy="loading-spinner"]').should('not.exist')
cy.get('[data-cy="element-list"]').should('be.visible')
cy.get('[data-cy="save-status"]').should('contain', 'Saved')
```

### Don't Visit External Sites

```javascript
// ❌ BAD - Testing external sites
cy.visit('https://google.com')

// ✅ GOOD - Only test your application
cy.visit('/elements')

// For external API calls, use cy.request() or cy.intercept()
cy.intercept('GET', 'https://api.external.com/**', { 
  fixture: 'external-api-response.json' 
})
```

### Don't Start Web Servers in Tests

```javascript
// ❌ BAD - Starting server in test
before(() => {
  exec('npm run start')
})

// ✅ GOOD - Use start-server-and-test in package.json
// package.json
{
  "scripts": {
    "test:e2e": "start-server-and-test web http://localhost:3002 cypress:run"
  }
}
```

### Server Management Best Practices

#### Automatic Process Cleanup
To prevent port conflicts and orphaned processes:

```json
// package.json
{
  "scripts": {
    "pre-test:cleanup": "pkill -f webpack || true && pkill -f 'react-scripts' || true && sleep 2",
    "cypress:open": "npm run pre-test:cleanup && cypress open --browser chrome",
    "test:e2e": "npm run pre-test:cleanup && start-server-and-test web http://localhost:3002 cypress:run"
  }
}
```

#### Key Points:
- **Always clean before tests**: Kill existing processes before starting new ones
- **Use `|| true`**: Prevents script failure if no processes found
- **Add sleep delay**: Ensures ports are fully released before starting new server
- **Chain commands**: Use `&&` to ensure cleanup runs before tests

#### Manual Server Management:
```bash
# Check for running processes on port 3002
lsof -i :3002

# Kill specific process by PID
kill -9 <PID>

# Kill all webpack processes
pkill -f webpack

# Kill all node processes (use carefully)
killall node
```

---

## Authentication & Login

### Authentication for React Native Web

```javascript
// cypress/support/commands.js
// For React Native Web with Zustand store
Cypress.Commands.add('setupTestUser', (options = {}) => {
  const userData = {
    username: 'test_user_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    projects: [],
    elements: [],
    ...options
  };

  cy.window().then((win) => {
    const storeData = {
      auth: { user: userData, isAuthenticated: true },
      projects: userData.projects,
      elements: userData.elements
    };
    win.localStorage.setItem('fantasy-writing-app-store', JSON.stringify(storeData));
  });

  return cy.wrap(userData);
})

// In tests
beforeEach(function() {
  cy.comprehensiveDebug();
  cy.cleanState();
  cy.setupTestUser();
  cy.visit('/dashboard')
})
```

### Using cy.session() for Login Caching

```javascript
Cypress.Commands.add('login', (email = 'test@example.com') => {
  cy.session(
    email,
    () => {
      cy.visit('/login')
      cy.get('[data-cy="email-input"]').type(email)
      cy.get('[data-cy="password-input"]').type('password')
      cy.get('[data-cy="login-button"]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist')
      }
    }
  )
})
```

---

## Network Requests & Waiting

### Intercepting and Waiting for Requests

```javascript
// ✅ GOOD - Wait for specific network requests
it('saves element changes', () => {
  cy.intercept('PUT', '/api/elements/*').as('saveElement')
  
  cy.get('[data-cy="element-title-input"]').clear().type('Updated Title')
  cy.get('[data-cy="save-button"]').click()
  
  // Wait for the save request to complete
  cy.wait('@saveElement').then((interception) => {
    expect(interception.response.statusCode).to.equal(200)
  })
  
  cy.get('[data-cy="save-status"]').should('contain', 'Saved')
})
```

### Stubbing Network Responses

```javascript
// Stub API responses for consistent testing
cy.intercept('GET', '/api/elements', {
  fixture: 'elements-list.json'
}).as('getElements')

cy.visit('/elements')
cy.wait('@getElements')
```

---

## Configuration Best Practices

### cypress.config.ts Settings

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Essential Configuration
    baseUrl: 'http://localhost:3002',  // ALWAYS use baseUrl
    viewportWidth: 375,   // Mobile-first for React Native
    viewportHeight: 812,

    // Video & Screenshots
    video: false,                    // Only enable for debugging
    videoCompression: 32,            // If enabled, optimize size
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,    // Clean old screenshots/videos

    // Timeouts (milliseconds)
    defaultCommandTimeout: 10000,    // DOM-based commands
    execTimeout: 60000,              // cy.exec() commands
    taskTimeout: 60000,              // cy.task() commands
    pageLoadTimeout: 60000,          // Page transitions
    requestTimeout: 10000,           // HTTP requests
    responseTimeout: 30000,          // cy.request() responses

    // Retries
    retries: {
      runMode: 2,    // CI/CD pipeline
      openMode: 0    // Local development
    },

    // Test Isolation
    testIsolation: true,             // Clean context between tests

    // Browser Settings
    chromeWebSecurity: true,        // Keep enabled for security
    blockHosts: null,                // Block external domains if needed
    userAgent: null,                 // Override for mobile testing

    // Folders Configuration
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    // Experimental Features
    experimentalStudio: true,       // Visual test recorder
    experimentalRunAllSpecs: true,  // Run all specs button

    setupNodeEvents(on, config) {
      // Load environment-specific config
      const environmentName = config.env.environmentName || 'local'
      const environmentFilename = `./cypress/config/${environmentName}.json`

      try {
        const environmentConfig = require(environmentFilename)
        config = { ...config, ...environmentConfig }
      } catch (e) {
        // Environment config file not found, use defaults
      }

      // Task implementations
      on('task', {
        'db:reset': () => {
          // Reset database
          return null
        },
        'db:seed': (data) => {
          // Seed database
          return null
        },
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        }
      })

      // Code coverage
      require('@cypress/code-coverage/task')(on, config)

      return config
    }
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config.js')
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
})
```

### Environment Variables

```javascript
// cypress.env.json (local defaults - don't commit secrets!)
{
  "API_URL": "http://localhost:3000/api",
  "TEST_USER_EMAIL": "test@example.com",
  "TEST_USER_PASSWORD": "testpassword"
}

// Usage in tests
const apiUrl = Cypress.env('API_URL')
cy.request(`${apiUrl}/elements`)
```

### Configuration Precedence (Highest to Lowest)

1. **Command Line Arguments**
   ```bash
   cypress run --env API_URL=https://staging.api.com
   ```

2. **Environment Variables**
   ```bash
   CYPRESS_API_URL=https://staging.api.com cypress run
   ```

3. **cypress.env.json**
   ```json
   { "API_URL": "http://localhost:3000/api" }
   ```

4. **cypress.config.js**
   ```javascript
   env: { API_URL: 'http://localhost:3000/api' }
   ```

5. **Default values**

---

## Custom Commands with cy.session()

### Enhanced Authentication Commands

```javascript
// cypress/support/commands.js

// Login with session caching for performance
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.session(
    email, // Use email as session ID
    () => {
      cy.visit('/login')
      cy.get('[data-cy="email-input"]').type(email)
      cy.get('[data-cy="password-input"]').type(password)
      cy.get('[data-cy="submit-button"]').click()

      // Wait for successful login
      cy.url().should('not.include', '/login')
    },
    {
      validate() {
        // Ensure session is still valid
        cy.getCookie('auth-token').should('exist')
      },
      cacheAcrossSpecs: true // Share across all test files
    }
  )
})

// Fast API-based login
Cypress.Commands.add('apiLogin', (email, password) => {
  cy.session(
    ['api', email],
    () => {
      cy.request('POST', '/api/login', { email, password })
        .then((response) => {
          window.localStorage.setItem('auth-token', response.body.token)
          window.localStorage.setItem('user', JSON.stringify(response.body.user))
        })
    },
    {
      validate() {
        cy.window().then((win) => {
          const token = win.localStorage.getItem('auth-token')
          expect(token).to.not.be.null
        })
      },
      cacheAcrossSpecs: true
    }
  )
})

// Role-based login
const users = {
  admin: { email: 'admin@example.com', password: 'admin123' },
  editor: { email: 'editor@example.com', password: 'editor123' },
  viewer: { email: 'viewer@example.com', password: 'viewer123' }
}

Cypress.Commands.add('loginAs', (role) => {
  const user = users[role]
  cy.session(
    [role, user.email],
    () => {
      cy.apiLogin(user.email, user.password)
    },
    {
      validate() {
        cy.window().then((win) => {
          const userData = JSON.parse(win.localStorage.getItem('user'))
          expect(userData.role).to.equal(role)
        })
      },
      cacheAcrossSpecs: true
    }
  )
})
```

### Element and Project Commands

```javascript
// Element creation helper
Cypress.Commands.add('createElement', (elementData) => {
  cy.get('[data-cy="new-element-button"]').click()
  cy.get('[data-cy="element-title-input"]').type(elementData.title)
  cy.get('[data-cy="element-type-select"]').select(elementData.type)
  if (elementData.description) {
    cy.get('[data-cy="element-description-input"]').type(elementData.description)
  }
  cy.get('[data-cy="save-element-button"]').click()
  cy.get('[data-cy="element-saved-notification"]').should('be.visible')
})

// Project navigation helper
Cypress.Commands.add('navigateToProject', (projectName) => {
  cy.visit('/projects')
  cy.get(`[data-cy="project-card-${projectName}"]`).click()
  cy.url().should('include', '/project/')
})

// Setup test data with session caching
Cypress.Commands.add('setupTestData', (data = {}) => {
  cy.session(
    ['test-data', JSON.stringify(data)],
    () => {
      // Create test data once and cache it
      if (data.projects) {
        cy.window().then((win) => {
          win.localStorage.setItem('projects', JSON.stringify(data.projects))
        })
      }
      if (data.elements) {
        cy.window().then((win) => {
          win.localStorage.setItem('elements', JSON.stringify(data.elements))
        })
      }
    },
    {
      validate() {
        cy.window().then((win) => {
          if (data.projects) {
            expect(win.localStorage.getItem('projects')).to.not.be.null
          }
          if (data.elements) {
            expect(win.localStorage.getItem('elements')).to.not.be.null
          }
        })
      },
      cacheAcrossSpecs: true
    }
  )
})
```

### TypeScript Definitions

```typescript
// cypress/support/index.d.ts
declare global {
  namespace Cypress {
    interface Chainable {
      // Authentication
      login(email?: string, password?: string): Chainable<void>
      apiLogin(email: string, password: string): Chainable<void>
      loginAs(role: 'admin' | 'editor' | 'viewer'): Chainable<void>

      // Data setup
      setupTestData(data?: {
        projects?: any[]
        elements?: any[]
      }): Chainable<void>

      // Navigation
      createElement(elementData: {
        title: string
        type: string
        description?: string
      }): Chainable<void>
      navigateToProject(projectName: string): Chainable<void>
    }
  }
}
```

### Session Management Best Practices

```javascript
// 1. Include all unique parameters in session ID
cy.session([userId, role, environment], setupFn)

// 2. Always validate sessions
cy.session('user', setup, {
  validate() {
    // Check if session is still valid
    cy.getCookie('auth').should('exist')
  }
})

// 3. Call cy.visit() after cy.session()
cy.session('user', setup)
cy.visit('/dashboard') // Navigate after session restore

// 4. Use API login for speed
cy.session('fast', () => {
  // Fast: Direct API call
  cy.request('POST', '/api/login', credentials)
    .then((res) => {
      window.localStorage.setItem('token', res.body.token)
    })
})

// 5. Debug sessions when needed
cy.session('debug', () => {
  cy.task('log', 'Creating session')
  // Setup
}).then(() => {
  cy.task('log', 'Session restored')
})
```

---

## Session Performance Optimization

### Measuring Session Performance

```javascript
// Compare session vs no-session performance
describe('Performance Comparison', () => {
  it('without session caching (slow)', () => {
    const start = Date.now()

    // Login every time
    cy.visit('/login')
    cy.get('[data-cy="email"]').type('test@example.com')
    cy.get('[data-cy="password"]').type('password')
    cy.get('[data-cy="submit"]').click()

    cy.task('log', `Login took ${Date.now() - start}ms`)
  })

  it('with session caching (fast)', () => {
    const start = Date.now()

    // Use cached session
    cy.login('test@example.com', 'password')

    cy.task('log', `Session restore took ${Date.now() - start}ms`)
    // Typically 10-100x faster!
  })
})
```

### Session Strategies by Test Type

```javascript
// Smoke tests - Share single session
describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.login() // Same session for all
    cy.visit('/dashboard')
  })
})

// Feature tests - Isolated sessions
describe('Feature Tests', () => {
  it('test with admin', () => {
    cy.loginAs('admin')
    // Admin-specific tests
  })

  it('test with user', () => {
    cy.loginAs('viewer')
    // User-specific tests
  })
})

// Data manipulation tests - Fresh sessions
describe('Data Tests', () => {
  beforeEach(() => {
    cy.session('fresh-' + Date.now(), setup)
    // New session each time
  })
})
```

---

## Testing Different Viewports

### Mobile and Responsive Testing

```javascript
describe('Responsive Design', () => {
  // Use Cypress device presets for consistency
  const viewports = [
    'iphone-x',     // 375x812
    'ipad-2',       // 768x1024
    'macbook-15'    // 1440x900
  ]

  viewports.forEach((device) => {
    context(`${device} viewport`, () => {
      beforeEach(function() {
        cy.comprehensiveDebug();
        cy.cleanState();
        cy.viewport(device); // Use preset
        cy.visit('/elements')
      })

      it('displays properly on ' + device, () => {
        // Check viewport-specific elements
        cy.window().then((win) => {
          if (win.innerWidth < 768) {
            // Mobile specific assertions
            cy.get('[data-cy="mobile-menu"]').should('be.visible')
            cy.get('[data-cy="desktop-sidebar"]').should('not.exist')
          } else {
            // Desktop assertions
            cy.get('[data-cy="desktop-sidebar"]').should('be.visible')
            cy.get('[data-cy="mobile-menu"]').should('not.exist')
          }
        })
      })
    })
  })
})
```

---

## Performance Considerations

### Optimize Test Execution

1. **Parallel Execution**: Run tests in parallel in CI
2. **Smart Test Selection**: Only run affected tests on PRs
3. **Fixture Management**: Use fixtures for large test data
4. **Command Batching**: Combine multiple assertions when possible

```javascript
// ✅ GOOD - Batched assertions
cy.get('[data-cy="element-card"]')
  .should('be.visible')
  .and('contain', 'Dragon')
  .and('have.class', 'active')

// ❌ LESS EFFICIENT - Multiple separate gets
cy.get('[data-cy="element-card"]').should('be.visible')
cy.get('[data-cy="element-card"]').should('contain', 'Dragon')
cy.get('[data-cy="element-card"]').should('have.class', 'active')
```

---

## Code Coverage Best Practices

### Setting Up Code Coverage

#### Installation
```bash
npm install --save-dev @cypress/code-coverage babel-plugin-istanbul
```

#### Basic Configuration
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config)
      return config
    }
  }
})

// cypress/support/e2e.js
import '@cypress/code-coverage/support'
```

### Coverage Thresholds

#### Set Realistic Targets
```json
// .nycrc
{
  "check-coverage": true,
  "branches": 75,   // Good for complex logic
  "lines": 80,      // Achievable target
  "functions": 80,  // Most functions tested
  "statements": 80  // Overall execution
}
```

#### Component-Specific Goals
```javascript
const coverageGoals = {
  'authentication': 95,  // Critical
  'payment': 95,        // Critical
  'ui-components': 85,  // Medium
  'utilities': 90,      // High
  'navigation': 80      // Medium
}
```

### Writing Tests for Coverage

#### Cover All Branches
```javascript
describe('Complete Branch Coverage', () => {
  it('tests all conditional paths', () => {
    // Test true condition
    cy.visit('/?feature=enabled')
    cy.get('[data-cy="feature"]').should('be.visible')

    // Test false condition
    cy.visit('/?feature=disabled')
    cy.get('[data-cy="feature"]').should('not.exist')

    // Test edge cases
    cy.visit('/?feature=')
    cy.get('[data-cy="default"]').should('be.visible')
  })
})
```

#### Test Error Paths
```javascript
describe('Error Coverage', () => {
  it('covers error handling', () => {
    // Force network error
    cy.intercept('GET', '/api/**', { statusCode: 500 })
    cy.visit('/')
    cy.get('[data-cy="error-message"]').should('be.visible')

    // Force timeout
    cy.intercept('GET', '/api/**', { delay: 10000 })
    cy.visit('/')
    cy.get('[data-cy="timeout-message"]').should('be.visible')
  })
})
```

#### Edge Case Testing
```javascript
describe('Edge Case Coverage', () => {
  it('handles boundary conditions', () => {
    // Empty data
    cy.test({ data: [] })

    // Maximum values
    cy.test({ data: new Array(1000).fill(item) })

    // Special characters
    cy.test({ name: '!@#$%^&*()' })

    // Unicode
    cy.test({ text: '你好世界🌍' })
  })
})
```

### Excluding Code from Coverage

#### Valid Exclusions
```javascript
// Platform-specific code
/* istanbul ignore next */
if (Platform.OS === 'ios') {
  // iOS only code
}

// Defensive programming
/* istanbul ignore if */
if (!should_never_happen) {
  throw new Error('Impossible state')
}

// Development only
/* istanbul ignore next */
if (__DEV__) {
  console.log('Debug info')
}
```

### Coverage Analysis

#### Check Coverage in Tests
```javascript
afterEach(() => {
  cy.task('coverage').then((coverage) => {
    if (coverage.lines.pct < 80) {
      cy.log('⚠️ Coverage below 80%:', coverage.lines.pct)
    }
  })
})

after(() => {
  cy.checkCoverage(85) // Custom command
})
```

#### View Reports
```bash
# Generate HTML report
npx nyc report --reporter=html
open coverage/lcov-report/index.html

# Quick summary
npx nyc report --reporter=text-summary
```

### CI/CD Integration

#### GitHub Actions
```yaml
- name: Test with Coverage
  run: |
    npm run test:coverage
    npm run coverage:check

- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

#### Coverage Badges
```markdown
[![codecov](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/user/repo)
```

### Common Coverage Pitfalls

#### ❌ Avoid These Mistakes
```javascript
// Don't write tests just for coverage
it('pointless test for coverage', () => {
  expect(true).to.be.true // Meaningless
})

// Don't exclude too much
/* istanbul ignore next */
// entire important function // Bad practice

// Don't set unrealistic targets
"branches": 100 // Usually impossible
```

#### ✅ Do These Instead
```javascript
// Write meaningful tests
it('validates user input correctly', () => {
  cy.testInvalidInput().should('show.error')
  cy.testValidInput().should('succeed')
})

// Only exclude truly untestable code
/* istanbul ignore next - Platform specific */
if (Platform.OS === 'android') { }

// Set achievable goals
"branches": 75 // Realistic
```

### Coverage-Driven Development

#### Workflow
1. **Run coverage report** to find gaps
2. **Identify untested code** in report
3. **Write targeted tests** for gaps
4. **Verify improvement** in metrics
5. **Repeat** until threshold met

#### Finding Coverage Gaps
```bash
# Generate detailed report
npx nyc report --reporter=html

# Look for red lines in HTML report
# Focus on:
# - Uncovered branches (if/else)
# - Uncovered functions
# - Error handlers
# - Edge cases
```

### Best Practices Summary

✅ **DO**:
- Set realistic coverage goals (80-85%)
- Focus on critical paths (95%+)
- Test error conditions
- Use coverage to find gaps
- Exclude only untestable code
- Track coverage trends

❌ **DON'T**:
- Write meaningless tests for coverage
- Set 100% coverage goals
- Ignore coverage reports
- Exclude important code
- Test implementation details
- Focus only on line coverage

---

## Debugging Tips

### Using Debug Commands

```javascript
// Pause test execution
cy.pause()

// Debug specific elements
cy.get('[data-cy="complex-element"]').debug()

// Log to console
cy.log('Current state:', someVariable)

// Take screenshots for debugging
cy.screenshot('before-action')
cy.get('[data-cy="button"]').click()
cy.screenshot('after-action')
```

### Cypress Studio

Enable Cypress Studio for generating test code:

```javascript
// cypress.config.ts
export default defineConfig({
  e2e: {
    experimentalStudio: true
  }
})
```

---

## Data Seeding Strategies

### Three Primary Approaches

#### 1. cy.exec() - Run System Commands
```javascript
describe('Elements with Fresh Data', () => {
  beforeEach(function() {
    cy.comprehensiveDebug();
    // Reset and seed database
    cy.exec('npm run db:reset && npm run db:seed');
    cy.cleanState();
    cy.visit('/elements');
  });

  it('displays fresh test data', () => {
    cy.get('[data-cy="element-list"]')
      .should('contain', 'Seeded Element');
  });
});
```

#### 2. cy.task() - Run Node.js Code
```javascript
// In cypress.config.js
setupNodeEvents(on, config) {
  on('task', {
    'db:seed': () => {
      // Direct database operations in Node.js
      return seedDatabase();
    }
  });
}

// In tests
beforeEach(function() {
  cy.comprehensiveDebug();
  cy.task('db:seed');
  cy.cleanState();
});
```

#### 3. cy.request() - HTTP API Seeding
```javascript
beforeEach(function() {
  cy.comprehensiveDebug();
  cy.cleanState();

  // Seed via API endpoints
  cy.request('POST', '/test/seed/user', {
    name: 'Test User',
    email: 'test@example.com'
  });

  cy.request('POST', '/test/seed/project', {
    title: 'Test Project',
    userId: 1
  });
});
```

### Stubbing vs Real Data

#### When to Use Stubbing
- Testing error states and edge cases
- Avoiding external dependencies
- Faster test execution
- Testing specific response scenarios

```javascript
// Stub API responses
cy.intercept('GET', '/api/elements', {
  fixture: 'elements.json'
}).as('getElements');

// Force error states
cy.intercept('POST', '/api/elements', {
  statusCode: 500,
  body: { error: 'Server Error' }
}).as('serverError');
```

#### When to Use Real Data
- Integration testing
- Testing actual data flow
- Validating backend logic
- Performance testing

---

## Summary Checklist

- [ ] Start local development server before running tests
- [ ] Always use `data-cy` attributes for element selection
- [ ] Write independent, isolated tests
- [ ] Clean state before tests, not after
- [ ] Configure baseUrl to avoid hardcoding URLs
- [ ] Avoid arbitrary waits - wait for specific conditions
- [ ] Use cy.session() for caching authentication
- [ ] Choose appropriate data seeding strategy
- [ ] Intercept and control network requests
- [ ] Configure timeouts based on your app's needs
- [ ] Create custom commands for common operations
- [ ] Test across different viewports
- [ ] Never test external sites
- [ ] Run linting before committing test code
- [ ] Use environment-specific configurations for different stages

---

*This document is based on official Cypress best practices and adapted specifically for the FantasyWritingApp React Native project.*