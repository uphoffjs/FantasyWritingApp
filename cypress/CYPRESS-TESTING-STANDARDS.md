# 🏆 CYPRESS TESTING STANDARDS - Single Source of Truth

> **⚠️ THIS IS THE AUTHORITATIVE TESTING GUIDE FOR FANTASYWRITINGAPP**
> All other testing documentation is subordinate to this document.
> Last Updated: 2025-09-25 | Version: 1.0.0

## 📋 CRITICAL CHECKLIST - Must Follow

### 🔴 MANDATORY Rules (Never Compromise)
```javascript
☐ Use ONLY data-cy selectors (no CSS, IDs, or tag selectors)
☐ Include cy.comprehensiveDebug() in EVERY beforeEach
☐ Use function() not arrow functions in hooks
☐ Clean state BEFORE tests, never after
☐ Use cy.session() for ALL authentication
☐ Run npm run lint before marking tests complete
☐ Use testID attribute that converts to data-cy on web
☐ NO cy.wait() with arbitrary delays
☐ NO if/else statements in tests
☐ NO console.log statements in committed code
```

---

## 🎯 1. SELECTOR STRATEGY (Priority Order)

### ✅ CORRECT Priority (Use in this order)
```javascript
// 1. PRIMARY - Always use first
cy.get('[data-cy="submit-button"]')          // Dedicated test selector

// 2. FALLBACK - When data-cy not available
cy.get('[data-test="submit-button"]')        // Alternative test attribute

// 3. COMPATIBILITY - For Testing Library
cy.get('[data-testid="submit-button"]')      // Testing Library compatibility

// 4. ACCESSIBILITY - For a11y testing only
cy.get('[role="button"][name="Submit"]')     // Semantic HTML roles

// 5. NEVER USE THESE
cy.get('.btn-primary')                       // ❌ CSS classes
cy.get('#submit')                            // ❌ IDs
cy.get('button')                             // ❌ Tag selectors
cy.get('[class*="submit"]')                  // ❌ Partial attribute matches
```

### React Native Component Selectors
```javascript
// React Native (converts to data-cy on web)
<TouchableOpacity
  testID="submit-button"           // Becomes data-cy on web
  accessibilityLabel="Submit form"
>

// Web gets rendered as:
<div data-cy="submit-button" aria-label="Submit form">
```

### Custom Commands for Selectors
```javascript
// PREFERRED - Use these custom commands
cy.getByDataCy('submit-button')              // Primary method
cy.getByTestId('element-name')               // Handles multiple strategies
cy.clickButton('Submit')                     // Semantic button finder
cy.getModal('create-element')                // Modal-specific
cy.getCard('element-card')                   // Card-specific
cy.getPerformanceElement('toggle')           // Performance UI elements
```

### Naming Conventions
```javascript
// Pattern: [context]-[element]-[action/state]
'login-form'                                  // Forms
'submit-button'                              // Buttons
'email-input'                                // Inputs
'user-modal'                                 // Modals
'profile-card'                               // Cards
'error-message'                              // Messages
'loading-spinner'                            // States
```

---

## 🏗️ 2. TEST STRUCTURE (Mandatory Pattern)

### ✅ CORRECT Test Structure
```javascript
describe('Feature Name', () => {
  // MANDATORY: Use function() not arrow functions
  beforeEach(function() {
    // MANDATORY: These three MUST be first
    cy.comprehensiveDebug();                 // Debug setup
    cy.cleanState();                          // Clean environment
    cy.visit('/');                           // Navigate to app

    // Optional: Additional setup
    cy.setupTestData();
    cy.interceptAPIRequests();
  });

  afterEach(function() {
    // MANDATORY: Capture debug info on failure
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
      cy.screenshot(`failed-${this.currentTest.title}`);
    }
  });

  it('should follow AAA pattern', () => {
    // Arrange
    cy.loginAsUser('testuser');
    cy.navigateToFeature();

    // Act
    cy.getByDataCy('action-button').click();

    // Assert
    cy.getByDataCy('success-message')
      .should('be.visible')
      .and('contain', 'Action completed');
  });
});
```

### ❌ WRONG Test Structure
```javascript
describe('Feature', () => {
  // ❌ Arrow function
  beforeEach(() => {
    // ❌ Missing comprehensiveDebug
    cy.visit('/');
  });

  // ❌ No afterEach error handling

  it('bad test', () => {
    // ❌ Using if statements
    cy.get('button').then($btn => {
      if ($btn.length > 0) {  // ❌ NEVER DO THIS
        cy.wrap($btn).click();
      }
    });

    // ❌ Arbitrary wait
    cy.wait(3000);  // ❌ NEVER DO THIS

    // ❌ Using CSS selector
    cy.get('.submit-btn').click();  // ❌ NEVER DO THIS
  });
});
```

---

## 🔐 3. SESSION MANAGEMENT (Authentication)

### ✅ CORRECT Session Pattern
```javascript
// Custom command: cypress/support/commands.js
Cypress.Commands.add('loginWithSession', (username, role = 'user') => {
  cy.session(
    // Unique composite key for caching
    [username, role, Cypress.env('environment')],

    // Setup function - runs once per unique key
    () => {
      // PREFER API login for speed
      cy.request('POST', '/api/auth/login', {
        username,
        password: Cypress.env('password'),
        role
      }).then(response => {
        // Store auth tokens
        window.localStorage.setItem('authToken', response.body.token);
        window.localStorage.setItem('refreshToken', response.body.refreshToken);

        // Store user data if needed
        window.localStorage.setItem('userData', JSON.stringify({
          id: response.body.user.id,
          username: response.body.user.username,
          role: response.body.user.role
        }));
      });
    },

    // Validation function - verifies session is still valid
    {
      validate() {
        // Check token exists and is not expired
        cy.window().then(win => {
          const token = win.localStorage.getItem('authToken');
          expect(token, 'Auth token exists').to.not.be.null;

          // Decode and validate JWT expiration
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = payload.exp * 1000;
          const currentTime = Date.now();

          expect(
            expirationTime,
            'Token not expired'
          ).to.be.greaterThan(currentTime);
        });

        // Verify API accepts token
        cy.request({
          url: '/api/auth/verify',
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`
          },
          failOnStatusCode: false
        }).then(response => {
          expect(response.status).to.equal(200);
        });
      },

      // MANDATORY: Cache across all spec files
      cacheAcrossSpecs: true
    }
  );
});

// Usage in tests
beforeEach(function() {
  cy.comprehensiveDebug();
  cy.cleanState();
  cy.loginWithSession('testuser', 'admin');  // Cached after first run
  cy.visit('/dashboard');
});
```

### Session Best Practices
```javascript
// ✅ DO: Use composite keys for different scenarios
cy.session(['user1', 'admin', 'production'])
cy.session(['user2', 'viewer', 'staging'])

// ✅ DO: Clear sessions when testing logout
cy.clearCookie('session');
cy.clearLocalStorage();

// ❌ DON'T: Use UI login in session (too slow)
cy.session('user', () => {
  cy.visit('/login');  // ❌ Slow
  cy.get('[data-cy="username"]').type('user');
  cy.get('[data-cy="password"]').type('pass');
});
```

---

## ⚙️ 4. CONFIGURATION STANDARDS

### ✅ CORRECT Configuration (cypress.config.js)
```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3002',

    // Timeout Configuration (STANDARDIZED)
    defaultCommandTimeout: 10000,    // DOM commands
    requestTimeout: 10000,           // cy.request() initialization
    responseTimeout: 30000,          // cy.request() response (USE 30000)
    pageLoadTimeout: 60000,          // Page loads
    execTimeout: 60000,              // cy.exec()
    taskTimeout: 60000,              // cy.task()

    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,

    // Video & Screenshots
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    trashAssetsBeforeRuns: true,

    // Test Configuration
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',

    // Parallelization
    numTestsKeptInMemory: 10,

    // Retries
    retries: {
      runMode: 2,      // CI/CD retries
      openMode: 0      // Local development
    },

    // Environment
    env: {
      apiUrl: 'http://localhost:3002/api',
      coverage: true
    },

    setupNodeEvents(on, config) {
      // Load environment-specific config
      const environment = config.env.environment || 'development';
      const envConfig = require(`./cypress/config/${environment}.json`);

      // Merge configurations
      return { ...config, ...envConfig };
    }
  }
});
```

---

## 💾 5. DATA MANAGEMENT

### Data Seeding Methods (3 Types)
```javascript
// 1. cy.exec() - System commands for database operations
cy.exec('npm run db:seed:test', { failOnNonZeroExit: true });

// 2. cy.task() - Node.js code for complex seeding
cy.task('seedDatabase', {
  users: 10,
  projects: 5,
  withRelations: true
});

// 3. cy.request() - API endpoints for data creation
cy.request('POST', '/api/test/seed', {
  entities: ['users', 'projects'],
  clean: true
});
```

### Data Stubbing (Separate from Seeding)
```javascript
// cy.intercept() - Mock API responses (NOT data seeding)
cy.intercept('GET', '/api/users', {
  fixture: 'users.json'
}).as('getUsers');

cy.intercept('POST', '/api/users', {
  statusCode: 201,
  body: { id: 1, name: 'Created User' }
}).as('createUser');
```

### Test Data Patterns
```javascript
// ✅ DO: Clean before each test
beforeEach(() => {
  cy.task('cleanDatabase');
  cy.task('seedTestData');
});

// ✅ DO: Use fixtures for static data
cy.fixture('validUser').then(user => {
  cy.createUser(user);
});

// ❌ DON'T: Share data between tests
let sharedUserId; // ❌ NEVER DO THIS
```

---

## 📊 6. COVERAGE REQUIREMENTS

### ✅ REALISTIC Coverage Targets
```json
{
  "branches": 75,        // Achievable for complex logic
  "lines": 80,          // Good overall target
  "functions": 80,      // Most functions tested
  "statements": 80,     // Solid coverage

  "component-specific": {
    "authentication": 95,   // High but realistic (NOT 100%)
    "payments": 95,        // Critical paths
    "ui-components": 85,   // Reasonable for UI
    "utilities": 90        // Helper functions
  }
}
```

### Coverage Implementation
```javascript
// package.json scripts
{
  "scripts": {
    "test:e2e:coverage": "nyc --reporter=html cypress run",
    "coverage:report": "nyc report --reporter=text-summary",
    "coverage:check": "nyc report --check-coverage --branches 75 --lines 80"
  }
}
```

---

## 🐛 7. DEBUG COMMANDS

### comprehensiveDebug Implementation
```javascript
// cypress/support/commands.js
Cypress.Commands.add('comprehensiveDebug', () => {
  // Set up console log capture
  cy.window().then(win => {
    // Capture all console methods
    const originalLog = win.console.log;
    const originalError = win.console.error;
    const originalWarn = win.console.warn;

    win.consoleCapture = {
      logs: [],
      errors: [],
      warnings: []
    };

    win.console.log = (...args) => {
      win.consoleCapture.logs.push(args);
      originalLog.apply(win.console, args);
    };

    win.console.error = (...args) => {
      win.consoleCapture.errors.push(args);
      originalError.apply(win.console, args);
      // Fail test on console error
      throw new Error(`Console Error: ${args.join(' ')}`);
    };

    win.console.warn = (...args) => {
      win.consoleCapture.warnings.push(args);
      originalWarn.apply(win.console, args);
    };
  });

  // Set up network monitoring
  cy.intercept('**/*', (req) => {
    req.on('response', (res) => {
      if (res.statusCode >= 400) {
        cy.log(`Network Error: ${req.method} ${req.url} - ${res.statusCode}`);
      }
    });
  });

  // Performance monitoring
  cy.window().then(win => {
    win.performanceMarks = {
      testStart: performance.now()
    };
  });

  // React DevTools bridge (if available)
  cy.window().then(win => {
    if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      cy.log('React DevTools detected');
    }
  });
});

// Capture debug info on failure
Cypress.Commands.add('captureFailureDebug', () => {
  cy.window().then(win => {
    // Log captured console output
    if (win.consoleCapture) {
      cy.log('Console Errors:', win.consoleCapture.errors);
      cy.log('Console Warnings:', win.consoleCapture.warnings);
    }

    // Log performance metrics
    if (win.performanceMarks) {
      const duration = performance.now() - win.performanceMarks.testStart;
      cy.log(`Test Duration: ${duration}ms`);
    }

    // Capture localStorage state
    const localStorageData = {};
    for (let i = 0; i < win.localStorage.length; i++) {
      const key = win.localStorage.key(i);
      localStorageData[key] = win.localStorage.getItem(key);
    }
    cy.log('LocalStorage State:', localStorageData);
  });
});
```

### Additional Debug Tools
```javascript
// Basic Cypress debug commands (use as needed)
cy.pause();                    // Pause execution
cy.debug();                    // Debugger for element
cy.screenshot('debug-state');  // Visual debugging

// Custom debug helpers
cy.logNetworkRequests();       // Log all network activity
cy.logReduxState();           // Log Redux store (if using)
cy.logLocalStorage();         // Dump localStorage
```

---

## 📱 8. REACT NATIVE PATTERNS

### Touch Simulation
```javascript
// Custom command for React Native Web touch events
Cypress.Commands.add('simulateTouch', (selector, gesture = 'tap') => {
  const gestures = {
    tap: () => {
      cy.get(selector)
        .trigger('touchstart', { force: true })
        .trigger('touchend', { force: true });
    },

    longPress: () => {
      cy.get(selector)
        .trigger('touchstart', { force: true })
        .wait(1000)
        .trigger('touchend', { force: true });
    },

    swipeLeft: () => {
      cy.get(selector)
        .trigger('touchstart', { clientX: 200, clientY: 100 })
        .trigger('touchmove', { clientX: 100, clientY: 100 })
        .trigger('touchend', { clientX: 50, clientY: 100 });
    },

    swipeRight: () => {
      cy.get(selector)
        .trigger('touchstart', { clientX: 100, clientY: 100 })
        .trigger('touchmove', { clientX: 200, clientY: 100 })
        .trigger('touchend', { clientX: 250, clientY: 100 });
    },

    swipeUp: () => {
      cy.get(selector)
        .trigger('touchstart', { clientX: 100, clientY: 200 })
        .trigger('touchmove', { clientX: 100, clientY: 100 })
        .trigger('touchend', { clientX: 100, clientY: 50 });
    },

    swipeDown: () => {
      cy.get(selector)
        .trigger('touchstart', { clientX: 100, clientY: 100 })
        .trigger('touchmove', { clientX: 100, clientY: 200 })
        .trigger('touchend', { clientX: 100, clientY: 250 });
    }
  };

  if (gestures[gesture]) {
    gestures[gesture]();
  } else {
    throw new Error(`Unknown gesture: ${gesture}`);
  }
});

// Usage
cy.simulateTouch('[data-cy="card"]', 'tap');
cy.simulateTouch('[data-cy="list-item"]', 'swipeLeft');
cy.simulateTouch('[data-cy="button"]', 'longPress');
```

### Platform Detection
```javascript
// Check platform in tests
cy.window().then(win => {
  expect(win.Platform.OS).to.equal('web');

  // Platform-specific assertions
  if (win.Platform.OS === 'web') {
    cy.get('[data-cy="hover-tooltip"]').should('exist');
  }
});
```

### React Native Component Testing
```javascript
// Test React Native components rendered for web
describe('React Native Components', () => {
  it('should handle Text component', () => {
    cy.get('[data-cy="text-element"]')
      .should('have.css', 'font-family')  // RN Text has font
      .and('contain', 'Expected text');
  });

  it('should handle TouchableOpacity', () => {
    cy.get('[data-cy="touchable-button"]')
      .should('have.css', 'opacity', '1')
      .click()
      .should('have.css', 'opacity', '0.2');  // Active opacity
  });

  it('should handle ScrollView', () => {
    cy.get('[data-cy="scroll-view"]')
      .scrollTo('bottom')
      .find('[data-cy="last-item"]')
      .should('be.visible');
  });
});
```

---

## 🖥️ 9. SERVER MANAGEMENT

### Server Startup & Cleanup
```json
// package.json
{
  "scripts": {
    "pre-test:cleanup": "pkill -f webpack || true && pkill -f 'port 3002' || true && sleep 2",
    "test:server": "webpack serve --mode development --port 3002",
    "test:e2e": "npm run pre-test:cleanup && start-server-and-test test:server http://localhost:3002 cypress:run",
    "test:e2e:open": "npm run pre-test:cleanup && start-server-and-test test:server http://localhost:3002 cypress:open",
    "post-test:cleanup": "pkill -f 'port 3002' || true"
  }
}
```

### Port Management
```javascript
// cypress/support/commands.js
Cypress.Commands.add('ensureServerRunning', () => {
  cy.request({
    url: 'http://localhost:3002/health',
    failOnStatusCode: false,
    timeout: 30000,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true
  }).then(response => {
    if (response.status !== 200) {
      throw new Error('Dev server not responding on port 3002');
    }
  });
});

// Use in tests
before(() => {
  cy.ensureServerRunning();
});
```

---

## 📋 10. TEST RESULTS MANAGEMENT

### File Naming Convention
```bash
test-results-YYYYMMDD-HHmmss-[type].md
test-results-20250124-143022-e2e.md         # E2E tests
test-results-20250124-143022-component.md   # Component tests
test-results-20250124-143022-all.md         # All test types
```

### Directory Structure
```
test-results/
├── latest/                                  # Most recent results
│   ├── test-results-latest.md
│   ├── test-results-latest-e2e.md
│   └── summary.json
├── 2025-01/                                # Monthly archives
└── archive/                                # 30+ days old
```

### Metadata Header (Required)
```markdown
---
timestamp: 2025-01-24T14:30:22Z
type: e2e
runner: cypress
status: complete
duration: 3m42s
passed: 45
failed: 3
skipped: 2
coverage: 78%
---
```

### Report Scripts
```json
// package.json
{
  "scripts": {
    "test:report": "npm run test:e2e && node scripts/generate-report.js",
    "test:latest": "cat test-results/latest/test-results-latest.md",
    "test:compare": "node scripts/compare-results.js"
  }
}
```

---

## 💬 11. BETTER COMMENTS SYNTAX

### ✅ CORRECT Usage
```javascript
// * Important information about this test
// ! DEPRECATED: This pattern will be removed in v2.0
// ? Should we add retry logic here?
// TODO: Add test for error boundary
// // Old implementation commented out for reference
```

### Comment Standards
```javascript
describe('Feature', () => {
  // * This suite tests critical authentication flows

  it('should handle login', () => {
    // ! WARNING: This test modifies global state
    cy.cleanState();

    // ? TODO: Should we test rate limiting here?

    // * Arrange
    cy.visit('/login');

    // * Act
    cy.getByDataCy('submit').click();

    // * Assert
    // // cy.wait(1000);  // Removed arbitrary wait
    cy.getByDataCy('dashboard').should('be.visible');
  });
});
```

---

## ❌ 12. ANTI-PATTERNS (Never Do These)

### ❌ WRONG: Conditional Testing
```javascript
// ❌ NEVER use if/else in tests
cy.get('body').then($body => {
  if ($body.find('[data-cy="modal"]').length) {
    cy.get('[data-cy="close"]').click();
  }
});

// ✅ CORRECT: Make state deterministic
cy.cleanState();  // Ensure modal is not present
cy.get('[data-cy="modal"]').should('not.exist');
```

### ❌ WRONG: Arbitrary Waits
```javascript
// ❌ NEVER wait for fixed time
cy.wait(3000);

// ✅ CORRECT: Wait for specific conditions
cy.intercept('POST', '/api/data').as('saveData');
cy.get('[data-cy="save"]').click();
cy.wait('@saveData');
```

### ❌ WRONG: Sharing State
```javascript
// ❌ NEVER share variables between tests
let userId;  // Shared state

it('test 1', () => {
  userId = '123';
});

it('test 2', () => {
  cy.visit(`/user/${userId}`);  // ❌ Depends on test 1
});

// ✅ CORRECT: Each test is independent
it('test 2', () => {
  const userId = '123';  // Local to test
  cy.visit(`/user/${userId}`);
});
```

### ❌ WRONG: Testing External Sites
```javascript
// ❌ NEVER test external sites
cy.visit('https://google.com');

// ✅ CORRECT: Only test your application
cy.visit('/');  // Your app only
```

### ❌ WRONG: Using After Hooks for Cleanup
```javascript
// ❌ NEVER clean in after hooks
afterEach(() => {
  cy.cleanupTestData();  // ❌ Next test might fail
});

// ✅ CORRECT: Clean before tests
beforeEach(() => {
  cy.cleanupTestData();  // ✅ Clean slate
});
```

---

## 🚀 13. PERFORMANCE OPTIMIZATION

### Session Caching
```javascript
// ✅ Cache sessions across all specs
cy.session(id, setup, {
  cacheAcrossSpecs: true  // ALWAYS enable
});
```

### Parallel Execution
```javascript
// cypress.config.js
{
  e2e: {
    numTestsKeptInMemory: 10,  // Reduce memory usage
    experimentalMemoryManagement: true
  }
}
```

### API vs UI Operations
```javascript
// ✅ PREFER API for setup
cy.request('POST', '/api/users', userData);  // Fast

// ❌ AVOID UI for setup
cy.visit('/register');  // Slow
cy.fillForm(userData);
```

### Smart Intercepts
```javascript
// ✅ Specific intercepts
cy.intercept('GET', '/api/users/123').as('getUser');

// ❌ Avoid wildcards
cy.intercept('**/*').as('everything');  // Too broad
```

---

## 🔧 14. CUSTOM COMMANDS REFERENCE

### Authentication
```javascript
cy.loginWithSession(username, role)    // Session-based login
cy.logout()                           // Clear auth state
cy.loginAsAdmin()                     // Quick admin login
cy.loginAsUser()                      // Quick user login
```

### Navigation
```javascript
cy.navigateToProject(projectId)       // Go to project
cy.navigateToSettings()               // Go to settings
cy.goBack()                          // Browser back
cy.goForward()                       // Browser forward
```

### Data Operations
```javascript
cy.cleanState()                      // Reset app state
cy.seedTestData(config)             // Seed test data
cy.createProject(data)              // Create project via API
cy.deleteAllProjects()              // Cleanup projects
```

### Assertions
```javascript
cy.shouldBeAccessible()             // a11y check
cy.shouldHaveNoConsoleErrors()      // Console check
cy.shouldHaveValidSession()         // Auth check
cy.shouldMatchSnapshot()            // Visual regression
```

### React Native
```javascript
cy.simulateTouch(selector, gesture)  // Touch events
cy.checkPlatform()                   // Platform detection
cy.scrollToElement(selector)        // Scroll in ScrollView
```

---

## 📚 15. REFERENCES & LINKS

### Official Cypress Documentation
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Selector Priorities](https://docs.cypress.io/guides/references/best-practices#Selecting-Elements)
- [Session API](https://docs.cypress.io/api/commands/session)
- [Network Requests](https://docs.cypress.io/guides/guides/network-requests)
- [Test Data Guide](https://docs.cypress.io/guides/guides/test-data)

### Project-Specific Documentation
- [ADVANCED-TESTING-STRATEGY.md](./docs/ADVANCED-TESTING-STRATEGY.md) - Deep dive strategies
- [Migration Guide](./docs/MIGRATION-GUIDE.md) - Updating existing tests
- [CI/CD Integration](./docs/CI-CD-INTEGRATION.md) - Pipeline configuration

---

## 🎯 16. QUICK START CHECKLIST

### New Test File
```javascript
// cypress/e2e/my-feature.cy.js

describe('My Feature', () => {
  // ✅ Function, not arrow
  beforeEach(function() {
    // ✅ Required three commands
    cy.comprehensiveDebug();
    cy.cleanState();
    cy.visit('/');

    // ✅ Session-based auth
    cy.loginWithSession('testuser');
  });

  // ✅ Error capture
  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('should work correctly', () => {
    // ✅ Only data-cy selectors
    cy.getByDataCy('my-element').click();

    // ✅ Wait for specific conditions
    cy.intercept('POST', '/api/action').as('action');
    cy.wait('@action');

    // ✅ Clear assertions
    cy.getByDataCy('result')
      .should('be.visible')
      .and('contain', 'Success');
  });
});
```

---

## 📈 17. ENFORCEMENT & VALIDATION

### ESLint Rules
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/no-force': 'warn',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/require-data-selectors': 'error'
  }
};
```

### Pre-commit Hook
```bash
#!/bin/sh
# .husky/pre-commit

# Check for console.log
if grep -r "console\.log" cypress/e2e/; then
  echo "❌ console.log found in tests"
  exit 1
fi

# Check for CSS selectors
if grep -r "cy\.get('\." cypress/e2e/; then
  echo "❌ CSS selectors found"
  exit 1
fi

# Run linting
npm run lint:cypress
```

### Validation Script
```javascript
// scripts/validate-tests.js
const validateTests = () => {
  // Check for data-cy usage
  // Verify beforeEach structure
  // Ensure session management
  // Report compliance score
};
```

---

## 📝 18. MIGRATION GUIDE

### Updating Existing Tests
```bash
# Step 1: Update selectors
find . -name "*.cy.js" -exec sed -i '' 's/cy\.get("\./cy.getByDataCy("/g' {} \;

# Step 2: Add comprehensiveDebug
# Manual: Add to each beforeEach

# Step 3: Convert to sessions
# Manual: Replace cy.login() with cy.loginWithSession()

# Step 4: Validate
npm run validate:tests
```

---

## 🔄 19. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-09-25 | Aligned with Cypress.io official best practices |
| 1.0.0 | 2025-09-24 | Initial consolidated standards |

---

## ✅ 20. FINAL CHECKLIST

Before committing any test:
```
☐ Only data-cy selectors used
☐ comprehensiveDebug() in beforeEach
☐ function() syntax in hooks
☐ No if/else statements
☐ No cy.wait() with numbers
☐ No console.log statements
☐ Session management for auth
☐ Tests are independent
☐ npm run lint passes
☐ Coverage targets met
```

---

**⚠️ This document supersedes all other testing documentation.
For questions, refer to official Cypress documentation linked above.**

---

*Maintained by: FantasyWritingApp Team*
*Last Review: 2025-09-25*
*Next Review: 2025-10-25*