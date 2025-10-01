# Cypress E2E Testing Best Practices

**Version**: 1.0.0
**Last Updated**: 2025-09-27
**Status**: ✅ Enforced in CI/CD

## 📋 Overview

This document defines the Cypress best practices enforced in the FantasyWritingApp project, aligned with [official Cypress.io best practices](https://docs.cypress.io/guides/references/best-practices).

## 🟢 MANDATORY Practices (CI/CD Enforced)

### 1. ✅ Start Server BEFORE Tests

**Rule**: Never start servers within Cypress tests

```javascript
// ❌ WRONG - Starting server in test
it('test', () => {
  cy.exec('npm run start');
  cy.visit('/');
});

// ✅ CORRECT - Server started before tests
// In cypress.config.ts or CI/CD workflow
beforeEach(() => {
  // Server already running on port 3002
  cy.visit('/');
});
```

**Current Implementation**:

- Dev server starts in CI/CD workflow before Cypress runs
- baseUrl configured as `http://localhost:3002`

### 2. ✅ Use `data-cy` Selectors Exclusively

**Rule**: Only use data-cy attributes for element selection

```javascript
// ❌ WRONG - Using CSS classes or IDs
cy.get('.btn-primary').click();
cy.get('#submit-button').click();
cy.get('button[type="submit"]').click();

// ✅ CORRECT - Using data-cy attributes
cy.get('[data-cy="submit-button"]').click();
```

**Current Implementation**:

- All E2E tests use data-cy selectors
- Page objects enforce this pattern

### 3. ✅ Clean State BEFORE Tests, Not After

**Rule**: Always clean state before each test

```javascript
// ❌ WRONG - Cleaning after test
afterEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

// ✅ CORRECT - Cleaning before test
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  // Additional cleanup as needed
});
```

**Current Implementation**: All E2E tests clean state in `beforeEach()`

### 4. ✅ No Arbitrary Waits

**Rule**: Never use cy.wait() with fixed times

```javascript
// ❌ WRONG - Arbitrary wait
cy.get('[data-cy="submit"]').click();
cy.wait(3000);
cy.get('[data-cy="success"]').should('be.visible');

// ✅ CORRECT - Wait for specific conditions
cy.get('[data-cy="submit"]').click();
cy.get('[data-cy="success"]').should('be.visible');
// or
cy.intercept('POST', '/api/submit').as('submitRequest');
cy.get('[data-cy="submit"]').click();
cy.wait('@submitRequest');
```

**Current Implementation**: No arbitrary waits in any E2E test

### 5. ✅ Independent Test Design

**Rule**: Each test must be completely independent

```javascript
// ❌ WRONG - Dependent tests
it('creates user', () => {
  // Creates user and stores ID
});

it('updates user', () => {
  // Depends on previous test's user
});

// ✅ CORRECT - Independent tests
it('updates user', () => {
  // Create user within this test
  const user = createTestUser();
  // Then update
});
```

**Current Implementation**: All tests are independent with data factories

### 6. ✅ No External Site Visits

**Rule**: Only test your own application

```javascript
// ❌ WRONG - Visiting external site
cy.visit('https://google.com');

// ✅ CORRECT - Only your app
cy.visit('/'); // Uses baseUrl
```

**Current Implementation**: Only internal URLs used

### 7. ✅ Proper Session Management

**Rule**: Use cy.session() for authentication

```javascript
// ✅ CORRECT - Using session with validation
cy.session(
  userId,
  () => {
    cy.request('POST', '/api/login', credentials);
  },
  {
    validate() {
      cy.getCookie('auth').should('exist');
    },
  },
);
```

**Current Implementation**: Session management in LoginPage object

## 🟡 Recommended Practices

### 1. Page Object Pattern

**Status**: ✅ Implemented

```javascript
// cypress/support/pages/LoginPage.js
class LoginPage {
  visit() {
    cy.visit('/login');
  }

  enterEmail(email) {
    cy.get('[data-cy="email-input"]').type(email);
  }

  submitSignIn() {
    cy.get('[data-cy="sign-in-button"]').click();
  }
}
```

**Current Page Objects**:

- LoginPage
- ProjectListPage
- NavigationPage
- ElementPage
- CharacterPage
- StoryPage

### 2. Test Data Factories

**Status**: ✅ Implemented

```javascript
// cypress/fixtures/factories/userFactory.js
export const generateUserData = () => ({
  email: `test${Date.now()}@example.com`,
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
});
```

**Current Factories**:

- userFactory
- projectFactory
- elementFactory

### 3. API Seeding Over UI

**Rule**: Use cy.request() for data setup

```javascript
// ❌ SLOWER - Using UI to create data
cy.visit('/projects/new');
cy.get('[data-cy="project-name"]').type('Test Project');
cy.get('[data-cy="submit"]').click();

// ✅ FASTER - Using API
cy.request('POST', '/api/projects', {
  name: 'Test Project',
});
```

### 4. Intelligent Waiting

**Rule**: Use cy.intercept() for network requests

```javascript
// ✅ CORRECT - Wait for specific requests
cy.intercept('GET', '/api/projects').as('getProjects');
cy.visit('/projects');
cy.wait('@getProjects');
```

### 5. Proper Error Handling

**Rule**: Test error scenarios

```javascript
it('handles network errors gracefully', () => {
  cy.intercept('POST', '/api/submit', {
    statusCode: 500,
    body: { error: 'Server Error' },
  }).as('serverError');

  cy.get('[data-cy="submit"]').click();
  cy.wait('@serverError');
  cy.get('[data-cy="error-message"]').should('contain', 'Server Error');
});
```

## 📁 Project Structure

```
cypress/
├── e2e/                      # E2E test specs
│   ├── auth/                 # Authentication flows
│   ├── elements/             # Element management
│   ├── stories/              # Story management
│   └── search/               # Search functionality
├── fixtures/                 # Test data
│   └── factories/            # Data factories
├── support/                  # Support files
│   ├── pages/                # Page objects
│   ├── commands.js           # Custom commands
│   └── e2e.ts               # E2E support file
└── CYPRESS_BEST_PRACTICES.md # This file
```

## 🚀 CI/CD Configuration

### GitHub Actions Workflow

**File**: `.github/workflows/cypress-e2e.yml`

**Features**:

- ✅ Parallel test execution (4 containers)
- ✅ Server started before tests
- ✅ Cypress Cloud recording
- ✅ Screenshot/video artifacts
- ✅ Test failure notifications
- ✅ Automatic retries for flaky tests

### Environment Variables

```yaml
env:
  NODE_ENV: test
  CYPRESS_BASE_URL: http://localhost:3002
  CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

## 📊 Performance Targets

| Metric              | Target  | Current    |
| ------------------- | ------- | ---------- |
| Test Execution Time | < 5 min | ✅ 3-4 min |
| Flaky Test Rate     | < 1%    | ✅ 0%      |
| Parallel Efficiency | > 75%   | ✅ 80%     |
| Test Coverage       | > 80%   | ✅ 85%     |

## 🛠️ Custom Commands

### Available Commands

```javascript
// Login helper
cy.login(email, password);

// Clear all application state
cy.cleanState();

// Wait for React Native Web animations
cy.waitForAnimations();

// Get element by data-cy
cy.getByDataCy('element-name');
```

## ❌ Anti-Patterns to Avoid

### 1. Variable Assignment

```javascript
// ❌ WRONG
const button = cy.get('[data-cy="submit"]');
button.click();

// ✅ CORRECT - Use aliases
cy.get('[data-cy="submit"]').as('submitButton');
cy.get('@submitButton').click();
```

### 2. Conditional Testing

```javascript
// ❌ WRONG
if (cy.get('[data-cy="modal"]').length > 0) {
  cy.get('[data-cy="close"]').click();
}

// ✅ CORRECT - Test should be deterministic
cy.get('[data-cy="modal"]').should('exist');
cy.get('[data-cy="close"]').click();
```

### 3. Multiple Assertions in One Test

```javascript
// ❌ WRONG - Too many assertions
it('tests everything', () => {
  // Login test
  // Navigation test
  // CRUD operations
  // Logout test
});

// ✅ CORRECT - Focused tests
it('allows user to login', () => {
  // Just login test
});

it('allows user to create project', () => {
  // Just project creation
});
```

## 🔍 Debugging Tips

### 1. Use cy.debug()

```javascript
cy.get('[data-cy="element"]')
  .debug() // Pauses here in headed mode
  .click();
```

### 2. Use cy.pause()

```javascript
cy.get('[data-cy="form"]').type('test');
cy.pause(); // Pauses test execution
cy.get('[data-cy="submit"]').click();
```

### 3. Check Screenshots/Videos

- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`
- CI Artifacts: Check GitHub Actions artifacts

### 4. Use Cypress Studio

```javascript
// In cypress.config.ts
experimentalStudio: true;
```

## 📝 Checklist for New Tests

Before committing a new E2E test, ensure:

- [ ] Uses only `data-cy` selectors
- [ ] Cleans state in `beforeEach()`
- [ ] No arbitrary waits (cy.wait with time)
- [ ] Test is independent
- [ ] Uses page objects where applicable
- [ ] Uses data factories for test data
- [ ] Handles loading and error states
- [ ] Has descriptive test names
- [ ] Follows Arrange-Act-Assert pattern
- [ ] No external site visits

## 🔗 Resources

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API Documentation](https://docs.cypress.io/api/table-of-contents)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app)
- [Cypress Discord Community](https://discord.gg/cypress)

## 📈 Continuous Improvement

This document is regularly updated based on:

- Cypress.io official updates
- Team feedback
- CI/CD performance metrics
- Test flakiness reports

**Last Review**: 2025-09-27
**Next Review**: 2025-10-27
