# Cypress Complete Reference - FantasyWritingApp

**Complete Cypress testing reference with commands, rules, and best practices.**

**Quick Start:** See [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md) for test template

---

## Table of Contents

1. [Running Cypress Commands](#running-cypress-commands)
2. [URL Best Practices](#url-best-practices)
3. [Testing Rules & Standards](#testing-rules--standards)
4. [Selector Strategies](#selector-strategies)
5. [Session Management](#session-management)
6. [Data Seeding](#data-seeding)
7. [Debug Process](#debug-process)

---

## Running Cypress Commands

### Essential Commands

```bash
npm run web           # Dev server port 3002
npm run lint          # MANDATORY before commits

# Run All E2E Tests
npm run cypress:open  # Open Cypress UI - select tests manually
npm run cypress:run   # Run all tests headless
npm run test:e2e      # Alias for cypress:run

# 🎯 Run Single Test File (RECOMMENDED for development!)
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:run:spec
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:open:spec
SPEC=cypress/e2e/**/*.cy.ts npm run test:e2e:spec  # Works with globs

# Quick Examples
SPEC=cypress/e2e/homepage.cy.ts npm run test:e2e:spec
SPEC=cypress/e2e/auth/*.cy.ts npm run cypress:run:spec
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:open:spec

# Component & Unit Testing
npm run test          # Jest unit tests
npm run test:component # Cypress component tests

npm run build:web     # Production build

# 🐳 Docker Cypress (macOS Sequoia Solution) ✅ VERIFIED WORKING
npm run cypress:docker:test           # All tests + auto-server
npm run cypress:docker:run            # All tests (manual server)
SPEC=path/to/test.cy.ts npm run cypress:docker:test:spec    # Single test + auto-server
SPEC=path/to/test.cy.ts npm run cypress:docker:run:spec     # Single test (manual server)
```

### ⚠️ CRITICAL: ALWAYS Use npm Scripts for Cypress

#### ✅ CORRECT Commands (Use These!)

```bash
# Cypress interactive mode
npm run cypress:open

# Run specific test (RECOMMENDED METHOD)
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:run:spec

# Run specific test in interactive mode
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:open:spec

# Run all E2E tests
npm run test:e2e
```

#### ❌ WRONG Commands (NEVER Use These!)

```bash
# ❌ DO NOT USE - Bypasses project configuration
npx cypress open
npx cypress run
npx cypress run --spec "path/to/test.cy.ts"

# ❌ DO NOT USE - Bypasses automatic server startup
cypress open
cypress run

# ❌ DO NOT USE - Doesn't work with start-server-and-test
npm run cypress:run -- --spec "path/to/test.cy.ts"
# The -- flag doesn't inject into the quoted command, runs ALL tests instead
```

### Why This Matters

**Using npm scripts ensures:**

1. ✅ Automatic dev server startup via `start-server-and-test`
2. ✅ Proper pre-test cleanup (kills old processes)
3. ✅ Correct project configuration and environment
4. ✅ Waits for server readiness before running tests
5. ✅ Automatic server shutdown after tests complete

**Using `npx` or direct `cypress` commands:**

1. ❌ Bypasses automatic server startup
2. ❌ Skips pre-test cleanup
3. ❌ May use wrong configuration
4. ❌ Requires manual server management
5. ❌ Can cause port conflicts and test failures

### Before Running ANY Cypress Command

**MANDATORY Pre-Flight Checklist:**

1. □ Check CLAUDE.md for documented commands
2. □ Verify npm script exists in package.json
3. □ Use `npm run [script-name]` format
4. □ NEVER use `npx cypress` or direct `cypress` commands
5. □ Ask user if command works before trying alternatives

### ⚡ Automated Server Startup

**No need to manually start the server!** All E2E commands use `start-server-and-test`:

- Automatically starts dev server on port 3002
- Waits for server to be ready
- Runs Cypress tests
- Shuts down server when complete

```bash
# OLD: Two terminals needed
# Terminal 1: npm run web
# Terminal 2: npm run cypress:run

# NEW: One command does everything!
npm run cypress:run
```

### Docker Cypress Usage

**When to Use Docker:**

- ✅ macOS Sequoia (Darwin 24.6.0+) - Native Cypress fails with "bad option" errors
- ✅ CI/CD - Consistent cross-platform environment
- ❌ Interactive debugging - Use native Cypress on compatible platforms (headless only in Docker)

**Full Docker Guide:** [cypress/docs/DOCKER-CYPRESS-GUIDE.md](../cypress/docs/DOCKER-CYPRESS-GUIDE.md)

---

## URL Best Practices

### ✅ ALWAYS Use Relative URLs

**CORRECT** - Uses `baseUrl` from configuration:

```typescript
cy.visit('/');
cy.visit('/login');
cy.visit('/dashboard');
cy.visit('/app/projects');
cy.request('/api/users');
```

**WRONG** ❌ - Hardcoded localhost URLs:

```typescript
cy.visit('http://localhost:3002'); // ❌ Breaks Docker
cy.visit('http://localhost:3002/login'); // ❌ Breaks CI/CD
cy.request('http://localhost:3002/api'); // ❌ Not portable
```

### Why Relative URLs?

1. **Docker Compatibility** - Works with `host.docker.internal:3002`
2. **CI/CD Ready** - Easy to configure per environment
3. **Cypress Best Practice** - Official recommendation from Cypress.io
4. **Single Config** - Change URL once in `cypress.config.ts`
5. **Environment Agnostic** - Same tests work everywhere

### How baseUrl Works

**Native Cypress** (`cypress.config.ts`):

```javascript
baseUrl: 'http://localhost:3002';
cy.visit('/login'); // → http://localhost:3002/login ✅
```

**Docker Cypress** (environment variable):

```bash
CYPRESS_baseUrl=http://host.docker.internal:3002
cy.visit('/login')  // → http://host.docker.internal:3002/login ✅
```

**CI/CD** (environment variable):

```bash
CYPRESS_baseUrl=https://staging.example.com
cy.visit('/login')  // → https://staging.example.com/login ✅
```

### ESLint Protection

ESLint will automatically catch hardcoded localhost URLs:

```typescript
// ❌ This will fail lint:
cy.visit('http://localhost:3002/test');

// Error: ❌ NEVER use hardcoded localhost URLs. Use relative paths
// like cy.visit("/login") to work with baseUrl (Cypress.io best practice)
```

### Exception: External Sites

Only use absolute URLs when testing external sites (rare):

```typescript
// Acceptable - testing redirect to external site
cy.visit('https://external-oauth-provider.com/login');
```

### Quick Fix for Old Code

```bash
# Replace hardcoded URLs with relative paths
# Before: cy.visit('http://localhost:3002/login')
# After:  cy.visit('/login')
```

**Related Docs:**

- [cypress/docs/DOCKER-CYPRESS-URL-FIX-COMPLETE.md](../cypress/docs/DOCKER-CYPRESS-URL-FIX-COMPLETE.md)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

---

## Testing Rules & Standards

### NEVER Do (Cypress.io Best Practices)

- ❌ Start servers within Cypress tests - start BEFORE
- ❌ Visit external sites - only test your application
- ❌ Use arbitrary waits like `cy.wait(3000)`
- ❌ Use CSS selectors, IDs, or tag selectors
- ❌ Assign Cypress returns to variables
- ❌ Use `if/else` statements in tests
- ❌ Create dependent tests - each must be independent
- ❌ Clean after tests - clean BEFORE
- ❌ Skip baseUrl configuration
- ❌ Leave console.log statements
- ❌ Skip `npm run lint`
- ❌ Use `context()` or `specify()` aliases

### ALWAYS Do (Cypress & React Native Standards)

- ✅ Start dev server BEFORE running Cypress
- ✅ Set baseUrl in cypress.config.ts
- ✅ Use `data-cy` attributes exclusively
- ✅ Use `describe()` and `it()` ONLY (no `context()` or `specify()`)
- ✅ Use cy.session() with validation for auth
- ✅ Write independent, isolated tests
- ✅ Clean state BEFORE each test
- ✅ React Native components only (View, Text, TouchableOpacity, TextInput)
- ✅ Platform.select() for platform-specific code
- ✅ StyleSheet.create() for styles
- ✅ Error boundaries on all components
- ✅ Validate/sanitize user inputs
- ✅ Add accessibility props

### Cypress Test Structure (MANDATORY)

```typescript
// MANDATORY Structure (Aligned with Official Docs)
describe('Feature', () => {
  // ! MANDATORY: Must be first
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Optional: Additional setup
  beforeEach(() => {
    // Use session for auth (Cypress.io pattern)
    cy.session('user', setup, {
      validate() {
        // Validation required
        cy.getCookie('auth').should('exist');
      },
      cacheAcrossSpecs: true,
    });

    cy.visit('/'); // Uses baseUrl
  });

  // Optional: Failure capture
  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('test description', () => {
    // Arrange → Act → Assert pattern
    // NO if/else statements (Cypress.io rule)
    // NO arbitrary waits (Cypress.io rule)
    // Use only data-cy selectors (Cypress.io rule)
    // Each test independent (Cypress.io rule)
  });
});
```

---

## Selector Strategies

### Priority Order (From Cypress.io Official Docs)

1. **`data-cy`** - Cypress team's PREFERRED selector
2. **`data-test`** - Alternative test attribute
3. **`data-testid`** - Testing Library compatibility
4. **`testID`** - React Native (converts to data-cy)
5. **`[role][name]`** - Semantic HTML (if above unavailable)

### NEVER Use (Cypress.io Anti-patterns)

- ❌ **`.class`** - CSS classes change
- ❌ **`#id`** - IDs aren't unique
- ❌ **`button`** - Too generic
- ❌ **`[title="..."]`** - Attributes change
- ❌ **`cy.contains('text')`** - Text changes

### Custom Cypress Commands (Best Practices)

```typescript
// PREFERRED: Use data-cy attributes (Cypress.io)
cy.get('[data-cy="submit-button"]').click();
cy.getByDataCy('submit-button').click(); // Custom helper

// NEVER assign to variables (Cypress.io rule)
// ❌ WRONG
const button = cy.get('[data-cy="submit"]');

// ✅ CORRECT - Use aliases
cy.get('[data-cy="submit"]').as('submitBtn');
cy.get('@submitBtn').click();

// Specialized commands for common patterns
cy.clickButton('Submit'); // Looks for data-cy first, then text
cy.getModal('create-element'); // Gets modal with data-cy pattern
cy.getCard('element-card'); // Gets card with data-cy pattern
cy.getPerformanceElement('toggle'); // Gets performance-[element]

// Within parent elements
cy.getByDataCy('form').findByTestId('field');
```

### Adding Selectors to Components

```typescript
// React Native components
<TouchableOpacity
  testID="submit-button"  // Converts to data-cy on web
  data-cy="submit-button"  // Explicit for web
>

// Web-specific components
<button data-cy="submit-button">Submit</button>

// Performance components
<div data-cy="performance-monitor-toggle">
<div data-cy="performance-dashboard-overlay">
<button data-cy="clear-metrics-button">
```

### Naming Conventions

- **Buttons**: `[action]-button` (e.g., `submit-button`, `cancel-button`)
- **Modals**: `[name]-modal` (e.g., `create-element-modal`)
- **Cards**: `[type]-card` (e.g., `element-card`, `project-card`)
- **Forms**: `[name]-form` (e.g., `login-form`, `element-form`)
- **Inputs**: `[field]-input` (e.g., `email-input`, `password-input`)
- **Performance**: `performance-[element]` (e.g., `performance-monitor-toggle`)

---

## Session Management

### Session Pattern (Cypress.io Best Practice)

```typescript
// CORRECT per Cypress.io
cy.session(
  ['user', 'role', 'env'], // Composite key
  () => {
    // PREFER API login (faster)
    cy.request('POST', '/api/login', credentials).then(res => {
      window.localStorage.setItem('token', res.body.token);
    });
  },
  {
    validate() {
      // MANDATORY
      cy.window().then(win => {
        expect(win.localStorage.getItem('token')).to.not.be.null;
      });
    },
    cacheAcrossSpecs: true, // Share across files
  },
);

// ALWAYS navigate after session
cy.visit('/dashboard');
```

### Authentication Example

```typescript
beforeEach(() => {
  cy.session(
    'authenticated-user',
    () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
      cy.url().should('include', '/projects');
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );

  cy.visit('/target-page');
});
```

---

## Data Seeding

### Methods (Cypress.io Patterns)

1. **cy.exec()** - System commands (DB reset)
2. **cy.task()** - Node.js code (complex seeding)
3. **cy.request()** - API seeding (PREFERRED for speed)
4. **cy.intercept()** - Stub responses (not seeding)

### Examples

```typescript
// BEST: API seeding (fast)
cy.request('POST', '/api/seed/user', userData);

// Good: Task for complex operations
cy.task('seedDatabase', { users: 5 });

// Stubbing (different from seeding)
cy.intercept('GET', '/api/users', { fixture: 'users.json' });
```

---

## Debug Process

### Quick Debug Process (Cypress.io Aligned)

1. **Ensure server is running on port 3002 FIRST**
2. Check webpack output (BashOutput tool)
3. Verify http://localhost:3002 responds
4. **Check baseUrl is set in cypress.config.ts**
5. Run Cypress tests for console errors
6. **Check for arbitrary waits** (grep for cy.wait)
7. **Verify all tests are independent**
8. Check TypeScript compilation
9. Verify dependencies (npm ls)

### Debug Commands in Tests

```typescript
// Check values
cy.log('Debug message');
cy.debug(); // Debugger breakpoint

// Inspect elements
cy.get('[data-cy="element"]').then($el => {
  console.log($el);
});

// Network requests
cy.intercept('POST', '/api/endpoint').as('apiCall');
cy.wait('@apiCall').its('response.statusCode').should('eq', 200);
```

---

## Additional Resources

### Official Cypress Documentation

- [Cypress.io Best Practices](https://docs.cypress.io/guides/references/best-practices) - Ultimate authority
- [Writing and Organizing Tests](https://docs.cypress.io/app/core-concepts/writing-and-organizing-tests)
- [TypeScript Support](https://docs.cypress.io/guides/tooling/typescript-support)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)

### Project Documentation

- [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md) - Quick test template
- [cypress-best-practices.md](../cypress/docs/cypress-best-practices.md) - Comprehensive best practices
- [cypress-writing-organizing-tests.md](../cypress/docs/cypress-writing-organizing-tests.md) - Complete guide
- [DOCKER-CYPRESS-GUIDE.md](../cypress/docs/DOCKER-CYPRESS-GUIDE.md) - Docker setup
- [CUSTOM-COMMANDS-REFERENCE.md](../cypress/docs/CUSTOM-COMMANDS-REFERENCE.md) - Custom commands
- [SELECTOR-PATTERNS.md](../cypress/docs/SELECTOR-PATTERNS.md) - Selector strategies

---

**Version**: 1.0
**Last Updated**: 2025-10-02
**For**: FantasyWritingApp Cypress Testing
