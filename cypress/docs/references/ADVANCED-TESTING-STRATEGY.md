# Advanced Cypress Testing Strategy for FantasyWritingApp

## 📚 Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Organization](#test-organization)
4. [Custom Commands Architecture](#custom-commands-architecture)
5. [Component Testing Strategy](#component-testing-strategy)
6. [E2E Testing Strategy](#e2e-testing-strategy)
7. [React Native Web Considerations](#react-native-web-considerations)
8. [Debugging & Error Handling](#debugging--error-handling)
9. [Performance & Optimization](#performance--optimization)
10. [Best Practices](#best-practices)

## Overview

This document outlines the comprehensive Cypress testing strategy for FantasyWritingApp, a React Native application tested through React Native Web. The patterns are derived from battle-tested approaches used in production applications and aligned with [Official Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices), adapted specifically for React Native's unique requirements.

> **⚠️ CRITICAL**: Always start your development server BEFORE running Cypress tests. Never attempt to start servers from within Cypress scripts.

## Testing Philosophy

### Core Principles

1. **Test Independence**: Each test can run in isolation without dependency on other tests
2. **User-Centric Testing**: Test actual user workflows, not implementation details
3. **Proper Element Selection**: Use data-\* attributes exclusively, never CSS selectors
4. **No Arbitrary Waits**: Use assertions and intercepts, not cy.wait(time)
5. **Server Management**: Start servers BEFORE tests, never within test code
6. **baseUrl Configuration**: Always set baseUrl to avoid hardcoding URLs
7. **State Isolation**: Clean state BEFORE tests, not after
8. **Session Caching**: Use cy.session() for all authentication to improve performance
9. **Cypress Commands**: Use Cypress commands, not JavaScript variable assignments

### Testing Pyramid for React Native

```
        /\
       /E2E\      (15%) - Critical user journeys
      /------\
     /Component\  (35%) - UI components and interactions
    /----------\
   /Unit Testing\ (50%) - Business logic, stores, utilities
  /--------------\
```

## Test Organization

### Directory Structure

```
cypress/
├── component/                # Component tests
│   ├── common/              # Shared components
│   ├── elements/            # Element-specific components
│   ├── projects/            # Project management components
│   └── navigation/          # Navigation components
├── e2e/                     # End-to-end tests
│   ├── elements/            # Element CRUD operations
│   ├── projects/            # Project workflows
│   ├── auth/                # Authentication flows
│   ├── navigation/          # App navigation
│   └── responsive/          # Responsive design tests
├── fixtures/                # Test data factories
│   ├── elements.json        # Element fixtures
│   ├── projects.json        # Project fixtures
│   └── users.json          # User fixtures
├── support/                 # Utilities and commands
│   ├── commands/           # Custom commands (organized by category)
│   │   ├── auth/          # Authentication commands
│   │   ├── elements/      # Element-specific commands
│   │   ├── debug/         # Debugging utilities
│   │   └── responsive/    # Viewport and responsive commands
│   ├── component-wrapper.jsx  # Component test wrapper
│   ├── test-helpers.js       # Shared utilities
│   └── commands.js           # Command aggregator
└── docs/                    # Testing documentation
```

### Test File Naming Convention

- **E2E Tests**: `[feature]-[action].cy.js`
  - Example: `element-creation.cy.js`, `project-management.cy.js`
- **Component Tests**: `[ComponentName].cy.jsx` or `[ComponentName].cy.tsx`
  - Example: `ElementCard.cy.jsx`, `ProjectList.cy.tsx`

### Server Management (Critical)

```bash
# ALWAYS start server BEFORE running Cypress
npm run web              # Start dev server on port 3002
npm run cypress:open     # Then open Cypress

# Or use start-server-and-test for automation
npm run test:e2e         # Handles server startup automatically
```

### Test Structure Template

```javascript
/**
 * @fileoverview [Feature] [Test Type] Tests
 * Tests for US-X.X: [User Story Name]
 *
 * User Story:
 * As a [user type]
 * I want to [action]
 * So that [benefit]
 *
 * Acceptance Criteria:
 * - [Criterion 1]
 * - [Criterion 2]
 * - [Criterion 3]
 */

describe('[Feature Name]', () => {
  beforeEach(function () {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Setup test user/data
    cy.setupTestData();
  });

  afterEach(function () {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('should [expected behavior]', () => {
    // * Arrange - Setup test conditions
    // * Act - Perform actions
    // * Assert - Verify outcomes
  });
});
```

## Data Seeding Strategies

### Three Primary Methods (from Official Cypress Docs)

#### 1. Using cy.exec() - Run System Commands

```javascript
// * Run database reset and seed scripts
describe('Elements with Fresh Data', () => {
  beforeEach(function () {
    cy.comprehensiveDebug();
    // * Reset and seed database using npm scripts
    cy.exec('npm run db:reset && npm run db:seed');
    cy.cleanState();
  });

  it('displays seeded elements', () => {
    cy.visit('/');
    cy.contains('Seeded Character').should('be.visible');
  });
});
```

#### 2. Using cy.task() - Run Node.js Code

```javascript
// * In cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        'db:seed': () => {
          // * Node.js database seeding code here
          return seedDatabase();
        },
        'reset:testData': () => {
          // * Reset to known state
          return resetTestData();
        },
      });
    },
  },
});

// * In test file
beforeEach(function () {
  cy.comprehensiveDebug();
  cy.task('reset:testData');
  cy.task('db:seed');
});
```

#### 3. Using cy.request() - Make HTTP Requests

```javascript
// * Seed via API endpoints
beforeEach(function () {
  cy.comprehensiveDebug();
  cy.cleanState();

  // * Create test project via API
  cy.request('POST', '/test/seed/project', {
    name: 'Test Fantasy World',
    description: 'A test project',
  })
    .its('body')
    .as('project');

  // * Create test elements
  cy.request('POST', '/test/seed/element', {
    name: 'Test Dragon',
    type: 'creature',
    projectId: '@project.id',
  });
});
```

### Stubbing Server Responses

```javascript
// * Instead of real data, stub API responses
describe('Elements with Stubbed Data', () => {
  beforeEach(function () {
    cy.comprehensiveDebug();

    // * Stub the elements API
    cy.intercept('GET', '/api/elements', {
      fixture: 'elements.json',
    }).as('getElements');

    // * Stub specific element
    cy.intercept('GET', '/api/elements/*', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Stubbed Dragon',
        type: 'creature',
        completionPercentage: 75,
      },
    }).as('getElement');
  });

  it('displays stubbed elements', () => {
    cy.visit('/elements');
    cy.wait('@getElements');
    cy.contains('Stubbed Dragon').should('be.visible');
  });
});
```

## Session Management with cy.session()

### Core Session Concepts

`cy.session()` provides intelligent caching of browser state (cookies, localStorage, sessionStorage) between tests, dramatically improving test performance while maintaining proper isolation.

### Session Lifecycle (Per Cypress.io Best Practices)

```javascript
// Session Creation Flow
cy.session(id, setup, options);
// 1. Clear all session data
// 2. Execute setup function
// 3. Cache session data with id
// 4. Run validation (MANDATORY for reliability)
// 5. Restore session in subsequent calls

// ⚠️ IMPORTANT: Always include validation callback
// This ensures the session is still valid before use
```

### Session ID Best Practices (Updated per Cypress.io)

```javascript
// ✅ BEST PRACTICE - Unique, deterministic IDs
cy.session([email, role, environment]); // Composite key
cy.session([userType, permissions.join(',')]);
cy.session(`${username}-${testSuite}`); // Scoped by test suite

// ❌ ANTI-PATTERNS - Never use these
cy.session('user'); // Too generic, causes conflicts
cy.session(Math.random()); // Non-deterministic
cy.session(Date.now()); // Changes every run

// ✅ ALWAYS call cy.visit() after cy.session()
cy.session('user', setup, validate);
cy.visit('/dashboard'); // Navigate after session restore
```

### Advanced Session Patterns

#### Multi-Role Testing

```javascript
describe('Role-Based Access Control', () => {
  it('admin has full access', () => {
    cy.loginAs('admin'); // Uses cy.session internally
    cy.visit('/admin');
    cy.get('[data-cy="admin-panel"]').should('be.visible');
  });

  it('viewer has limited access', () => {
    cy.loginAs('viewer'); // Different session
    cy.visit('/admin');
    cy.get('[data-cy="access-denied"]').should('be.visible');
  });
});
```

#### Cross-Origin Sessions

```javascript
cy.session('multi-domain', () => {
  // Login to main app
  cy.visit('https://app.example.com/login');
  cy.get('#email').type('user@example.com');
  cy.get('#password').type('password');
  cy.get('#submit').click();

  // Establish session on API domain
  cy.origin('https://api.example.com', () => {
    cy.visit('/authorize');
    cy.get('#approve').click();
  });
});
```

#### Session Validation Strategies

```javascript
// Token-based validation
{
  validate() {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth-token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        expect(payload.exp * 1000).to.be.greaterThan(Date.now());
      }
    });
  }
}

// API-based validation
{
  validate() {
    cy.request({
      url: '/api/validate',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  }
}

// Cookie-based validation
{
  validate() {
    cy.getCookie('session').should('exist')
      .then((cookie) => {
        expect(cookie.value).to.not.be.empty;
        expect(cookie.httpOnly).to.be.true;
      });
  }
}
```

### Session Performance Optimization

```javascript
// Use API login instead of UI when possible
cy.session('fast-login', () => {
  // Fast: Direct API call
  cy.request('POST', '/api/login', { email, password }).then(res => {
    window.localStorage.setItem('token', res.body.token);
  });

  // Slow: UI interactions
  // cy.visit('/login');
  // cy.get('#email').type(email);
  // etc.
});

// Cache sessions across specs for suite-wide performance
cy.session('shared-user', setup, {
  cacheAcrossSpecs: true, // Reuse in all spec files
});
```

### Session Debugging

```javascript
// Force new session creation
cy.session('user', setup, {
  validate() {
    if (Cypress.env('RESET_SESSION')) {
      throw new Error('Forcing session reset');
    }
    // Normal validation
  },
});

// Log session events
cy.session('debug', () => {
  cy.task('log', 'Creating session');
  // Setup
}).then(() => {
  cy.task('log', 'Session restored');
});

// View session in Cypress UI
// Click on session command in command log to see:
// - Session ID
// - Creation/restoration status
// - Validation results
// - Timing information
```

### Migration from Old Login Patterns

```javascript
// Before: Repeated login in every test
beforeEach(() => {
  cy.visit('/login');
  cy.get('#email').type('user@example.com');
  cy.get('#password').type('password');
  cy.get('#submit').click();
});

// After: Cached session
beforeEach(() => {
  cy.session(
    'user',
    () => {
      cy.visit('/login');
      cy.get('#email').type('user@example.com');
      cy.get('#password').type('password');
      cy.get('#submit').click();
    },
    {
      validate() {
        cy.getCookie('auth').should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );
  cy.visit('/'); // Navigate after session restore
});
```

## Selector Best Practices (Critical)

### Priority Order (From Cypress.io Official Docs)

```javascript
// 1. BEST - Test-specific attributes
cy.get('[data-cy="submit"]'); // Preferred by Cypress team
cy.get('[data-test="submit"]'); // Alternative
cy.get('[data-testid="submit"]'); // Testing Library compatibility

// 2. ACCEPTABLE - When test attributes unavailable
cy.get('[role="button"][name="Submit"]'); // Semantic HTML

// 3. NEVER USE - Too brittle
cy.get('.btn.btn-large'); // CSS classes change
cy.get('#submit'); // IDs may not be unique
cy.get('button'); // Too generic
cy.contains('Submit'); // Text changes break tests
```

## Custom Commands Architecture

### Command Categories

#### 1. Authentication Commands (`cypress/support/commands/auth/`)

```javascript
// cleanState.js - Reset application to clean state
Cypress.Commands.add('cleanState', () => {
  cy.window().then(win => {
    // * Clear AsyncStorage (React Native Web)
    win.localStorage.clear();
    win.sessionStorage.clear();

    // * Clear IndexedDB for Zustand persistence
    if (win.indexedDB) {
      win.indexedDB.deleteDatabase('fantasy-writing-app');
    }
  });

  // * Clear cookies
  cy.clearCookies();
  cy.clearLocalStorage();
});

// setupTestUser.js - Create authenticated test user with enhanced session caching
Cypress.Commands.add('setupTestUser', (options = {}) => {
  const defaults = {
    username: 'test_user_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    projects: [],
    elements: [],
    role: 'user', // Added role support
  };

  const userData = { ...defaults, ...options };

  // * Use cy.session with unique ID including all parameters
  cy.session(
    [userData.email, userData.role], // Include role in session ID
    () => {
      // * Set up Zustand store directly
      cy.window().then(win => {
        const storeData = {
          auth: {
            user: userData,
            isAuthenticated: true,
            token: 'mock-jwt-token-' + Date.now(),
          },
          projects: userData.projects,
          elements: userData.elements,
        };

        win.localStorage.setItem(
          'fantasy-writing-app-store',
          JSON.stringify(storeData),
        );
        // Also set auth token for API requests
        win.localStorage.setItem('auth-token', storeData.auth.token);
      });
    },
    {
      validate() {
        // * Enhanced validation to ensure session integrity
        cy.window().then(win => {
          const store = win.localStorage.getItem('fantasy-writing-app-store');
          expect(store, 'Store data should exist').to.not.be.null;

          const data = JSON.parse(store);
          expect(data.auth.isAuthenticated, 'User should be authenticated').to
            .be.true;
          expect(data.auth.user.role, 'User role should match').to.equal(
            userData.role,
          );

          // Validate token exists and is not expired
          const token = win.localStorage.getItem('auth-token');
          expect(token, 'Auth token should exist').to.not.be.null;
        });
      },
      cacheAcrossSpecs: true, // * Cache session across test files for performance
    },
  );

  return cy.wrap(userData);
});

// login.js - Login with different authentication methods
Cypress.Commands.add('login', (method = 'ui', credentials = {}) => {
  const { email = 'test@example.com', password = 'password123' } = credentials;

  cy.session(
    [email, method], // Include method in session ID
    () => {
      if (method === 'ui') {
        // UI-based login
        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type(email);
        cy.get('[data-cy="password-input"]').type(password);
        cy.get('[data-cy="submit-button"]').click();
        cy.url().should('not.include', '/login');
      } else if (method === 'api') {
        // API-based login (faster)
        cy.request('POST', '/api/login', { email, password }).then(response => {
          window.localStorage.setItem('auth-token', response.body.token);
          window.localStorage.setItem(
            'user',
            JSON.stringify(response.body.user),
          );
        });
      }
    },
    {
      validate() {
        cy.getCookie('session').should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );
});

// loginAs.js - Role-based login helper
const testUsers = {
  admin: { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  editor: {
    email: 'editor@example.com',
    password: 'editor123',
    role: 'editor',
  },
  viewer: {
    email: 'viewer@example.com',
    password: 'viewer123',
    role: 'viewer',
  },
};

Cypress.Commands.add('loginAs', userType => {
  const user = testUsers[userType];

  cy.session(
    ['role', userType, user.email],
    () => {
      // Use API login for speed
      cy.request('POST', '/api/login', {
        email: user.email,
        password: user.password,
      }).then(response => {
        window.localStorage.setItem('auth-token', response.body.token);
        window.localStorage.setItem('user-role', user.role);
      });
    },
    {
      validate() {
        cy.window().then(win => {
          const role = win.localStorage.getItem('user-role');
          expect(role).to.equal(user.role);
        });
      },
      cacheAcrossSpecs: true,
    },
  );
});
```

#### 2. Element Commands (`cypress/support/commands/elements/`)

```javascript
// createElement.js - Create test elements
Cypress.Commands.add('createElement', elementData => {
  const defaults = {
    id: 'element_' + Date.now(),
    name: 'Test Element',
    type: 'character',
    category: 'Characters',
    answers: {},
    relationships: [],
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
  };

  const element = { ...defaults, ...elementData };

  // * Add to store
  cy.window().then(win => {
    const store = JSON.parse(
      win.localStorage.getItem('fantasy-writing-app-store') || '{}',
    );
    store.elements = store.elements || [];
    store.elements.push(element);
    win.localStorage.setItem(
      'fantasy-writing-app-store',
      JSON.stringify(store),
    );
  });

  return cy.wrap(element);
});

// navigateToElement.js - Navigate to element editor
Cypress.Commands.add('navigateToElement', elementId => {
  cy.visit(`/app/elements/${elementId}`);
  cy.get('[data-cy="element-editor"]').should('be.visible');
});
```

#### 3. Debug Commands (`cypress/support/commands/debug/`)

```javascript
// comprehensiveDebug.js - Complete debug setup
Cypress.Commands.add('comprehensiveDebug', () => {
  const testInfo = {
    title: Cypress.currentTest.title,
    spec: Cypress.spec.name,
    timestamp: Date.now(),
  };

  // * Arrays to store debug information
  const errors = [];
  const logs = [];
  const networkErrors = [];

  // ! Capture uncaught exceptions
  Cypress.on('uncaught:exception', err => {
    errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack,
      phase: 'execution',
    });

    // ? Don't fail test on uncaught exceptions during setup
    return false;
  });

  // ! Capture network failures
  cy.intercept('**', req => {
    req.on('response', res => {
      if (res.statusCode >= 400) {
        networkErrors.push({
          timestamp: new Date().toISOString(),
          url: req.url,
          method: req.method,
          statusCode: res.statusCode,
          phase: 'network',
        });
      }
    });
  });

  // ! Listen for console errors and warnings
  cy.window().then(win => {
    const originalError = win.console.error;
    win.console.error = (...args) => {
      errors.push({
        timestamp: new Date().toISOString(),
        type: 'console_error',
        message: args.join(' '),
      });
      originalError.apply(win.console, args);
    };

    const originalWarn = win.console.warn;
    win.console.warn = (...args) => {
      logs.push({
        timestamp: new Date().toISOString(),
        type: 'console_warn',
        message: args.join(' '),
      });
      originalWarn.apply(win.console, args);
    };
  });

  // ! Set up failure capture
  cy.on('fail', err => {
    const failureData = {
      testInfo,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      errors,
      logs,
      networkErrors,
      summary: {
        totalErrors: errors.length,
        totalLogs: logs.length,
        totalNetworkErrors: networkErrors.length,
      },
    };

    // * Save debug info
    const filename = `debug-${testInfo.spec}-${testInfo.timestamp}.json`;
    cy.writeFile(`cypress/debug-logs/${filename}`, failureData);

    // * Take screenshot
    cy.screenshot(`failure-${testInfo.title}-${testInfo.timestamp}`, {
      capture: 'fullPage',
    });

    throw err;
  });
});

// captureFailureDebug.js - Capture additional failure info
Cypress.Commands.add('captureFailureDebug', () => {
  // * Capture current state
  cy.window().then(win => {
    const debugInfo = {
      url: win.location.href,
      localStorage: { ...win.localStorage },
      sessionStorage: { ...win.sessionStorage },
      viewport: {
        width: win.innerWidth,
        height: win.innerHeight,
      },
    };

    console.log('Debug Info:', debugInfo);
  });

  // * Take failure screenshot
  cy.screenshot('test-failure', { capture: 'fullPage' });
});
```

#### 4. Responsive Commands (`cypress/support/commands/responsive/`)

```javascript
// testResponsive.js - Test multiple viewports
Cypress.Commands.add('testResponsive', callback => {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    callback(viewport);
  });
});

// simulateTouch.js - Simulate touch interactions (React Native Web)
Cypress.Commands.add('simulateTouch', (selector, gesture) => {
  switch (gesture) {
    case 'tap':
      cy.get(selector).trigger('touchstart').trigger('touchend');
      break;
    case 'longPress':
      cy.get(selector).trigger('touchstart').wait(500).trigger('touchend');
      break;
    case 'swipeLeft':
      cy.get(selector)
        .trigger('touchstart', { touches: [{ clientX: 300, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
        .trigger('touchend');
      break;
    case 'swipeRight':
      cy.get(selector)
        .trigger('touchstart', { touches: [{ clientX: 50, clientY: 100 }] })
        .trigger('touchmove', { touches: [{ clientX: 300, clientY: 100 }] })
        .trigger('touchend');
      break;
  }
});
```

## Component Testing Strategy

### Component Test Wrapper

```jsx
// cypress/support/component-wrapper.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from '../src/store/Provider';

export const TestWrapper = ({ children, initialState = {} }) => {
  return (
    <StoreProvider initialState={initialState}>
      <NavigationContainer>
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#1a1a2e',
            color: 'white',
            padding: '20px',
          }}
        >
          {children}
        </div>
      </NavigationContainer>
    </StoreProvider>
  );
};
```

### Component Testing Patterns

#### 1. Testing All Component States

```javascript
describe('ElementCard Component', () => {
  it('should render all states correctly', () => {
    const states = [
      { completionPercentage: 0, expectedClass: 'empty-state' },
      { completionPercentage: 50, expectedClass: 'partial-state' },
      { completionPercentage: 100, expectedClass: 'complete-state' },
    ];

    states.forEach(state => {
      cy.mount(
        <TestWrapper>
          <ElementCard element={{ ...baseElement, ...state }} />
        </TestWrapper>,
      );

      cy.get('[data-cy="element-card"]').should(
        'have.class',
        state.expectedClass,
      );
    });
  });
});
```

#### 2. Testing Touch Interactions (React Native)

```javascript
describe('Touch Interactions', () => {
  it('should handle touch gestures', () => {
    cy.mount(
      <TestWrapper>
        <SwipeableElementList elements={mockElements} />
      </TestWrapper>,
    );

    // * Test swipe to delete
    cy.simulateTouch('[data-cy="element-0"]', 'swipeLeft');
    cy.get('[data-cy="delete-button"]').should('be.visible');

    // * Test long press for options
    cy.simulateTouch('[data-cy="element-1"]', 'longPress');
    cy.get('[data-cy="context-menu"]').should('be.visible');
  });
});
```

#### 3. Testing React Native Components

```javascript
describe('React Native Components', () => {
  it('should handle ScrollView correctly', () => {
    cy.mount(
      <TestWrapper>
        <ScrollView testID="element-scroll">
          {elements.map(el => (
            <ElementCard key={el.id} element={el} />
          ))}
        </ScrollView>
      </TestWrapper>,
    );

    // * React Native Web converts testID to data-cy
    cy.get('[data-cy="element-scroll"]').should('be.visible');
    cy.get('[data-cy="element-scroll"]').scrollTo('bottom');
  });

  it('should handle TextInput correctly', () => {
    cy.mount(
      <TestWrapper>
        <TextInput
          testID="element-name-input"
          placeholder="Enter element name"
        />
      </TestWrapper>,
    );

    cy.get('[data-cy="element-name-input"]')
      .type('Dragon King')
      .should('have.value', 'Dragon King');
  });
});
```

## E2E Testing Strategy

### Critical User Journeys

#### 1. Element Creation Flow

```javascript
describe('Element Creation E2E', () => {
  it('should create a new character element', () => {
    // * Setup
    cy.setupTestUser();
    cy.visit('/app/elements');

    // * Create element
    cy.get('[data-cy="create-element-button"]').click();
    cy.get('[data-cy="element-type-select"]').select('character');
    cy.get('[data-cy="element-name-input"]').type('Aragorn');
    cy.get('[data-cy="save-element-button"]').click();

    // * Fill questionnaire
    cy.get('[data-cy="question-0-input"]').type('A ranger from the North');
    cy.get('[data-cy="question-1-input"]').type('To reclaim his throne');
    cy.get('[data-cy="save-answers-button"]').click();

    // * Verify creation
    cy.get('[data-cy="element-card"]').should('contain', 'Aragorn');
    cy.get('[data-cy="completion-percentage"]').should('contain', '20%');
  });
});
```

#### 2. Project Management Flow

```javascript
describe('Project Management E2E', () => {
  it('should manage multiple projects', () => {
    cy.setupTestUser();

    // * Create first project
    cy.createProject({ name: 'Lord of the Rings' });
    cy.createProject({ name: 'The Hobbit' });

    // * Switch projects
    cy.get('[data-cy="project-selector"]').select('The Hobbit');
    cy.get('[data-cy="active-project"]').should('contain', 'The Hobbit');

    // * Add elements to project
    cy.createElement({ name: 'Bilbo', projectId: 'the-hobbit' });
    cy.get('[data-cy="project-elements"]').should('contain', 'Bilbo');
  });
});
```

## React Native Web Considerations

### 1. Platform-Specific Testing

```javascript
// Test platform detection
cy.window().then(win => {
  expect(win.Platform.OS).to.equal('web');
});

// Test React Native Web transformations
cy.get('[testID="my-component"]').should('not.exist');
cy.get('[data-cy="my-component"]').should('exist'); // testID becomes data-cy
```

### 2. AsyncStorage Testing

```javascript
// React Native AsyncStorage becomes localStorage in web
cy.window().then(win => {
  // Set data
  win.localStorage.setItem('@FantasyApp:user', JSON.stringify(userData));

  // Get data
  const user = JSON.parse(win.localStorage.getItem('@FantasyApp:user'));
  expect(user).to.deep.equal(userData);
});
```

### 3. Navigation Testing

```javascript
// React Navigation testing
cy.get('[data-cy="navigate-to-elements"]').click();
cy.url().should('include', '/elements');

// Back navigation
cy.go('back');
cy.url().should('include', '/dashboard');
```

## Debugging & Error Handling

### Debug Output Structure

```
cypress/debug-logs/
├── comprehensive-debug-[spec]-[test]-[timestamp].json
├── failure-screenshots/
│   └── failure-[test]-[timestamp].png
└── summary-[date].json
```

### Debug Information Captured

1. **Test Context**: Test name, spec file, timestamp
2. **Errors**: Uncaught exceptions, console errors, assertion failures
3. **Network**: Failed requests, response codes, timeouts
4. **State**: localStorage, sessionStorage, store state
5. **Environment**: Viewport, URL, browser info
6. **Screenshots**: Full-page captures on failure

## Configuration Best Practices (Aligned with Cypress.io)

### Cypress Configuration (cypress.config.js)

```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // * MANDATORY - Always set baseUrl (Cypress.io Best Practice)
    baseUrl: 'http://localhost:3002', // Enables cy.visit('/path') instead of full URLs
    viewportWidth: 375, // Mobile-first
    viewportHeight: 812,

    // * Timeouts optimized for React Native Web
    defaultCommandTimeout: 10000, // UI commands
    requestTimeout: 10000, // HTTP requests
    responseTimeout: 10000, // Server responses
    pageLoadTimeout: 30000, // Page transitions

    // * Video and screenshots
    video: false, // Enable only for debugging
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,

    // * Retries for flaky tests
    retries: {
      runMode: 2, // CI/CD pipeline
      openMode: 0, // Local development
    },

    // * Test isolation
    testIsolation: true, // Clean browser context between tests

    // * Experimental features for React Native Web
    experimentalStudio: true, // Visual test recorder
    experimentalRunAllSpecs: true, // Run all specs button

    setupNodeEvents(on, config) {
      // * Task plugins for data seeding
      on('task', {
        'db:reset': () => {
          // Reset database logic
          return null;
        },
        'db:seed': data => {
          // Seed database with test data
          return null;
        },
        log(message) {
          console.log(message);
          return null;
        },
      });

      // * Environment-specific configuration
      const environmentName = config.env.environmentName || 'local';
      if (environmentName === 'staging') {
        config.baseUrl = 'https://staging.fantasyapp.com';
      }

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./webpack.config.js'),
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
  },
});
```

### Environment-Specific Configuration

```javascript
// cypress/config/staging.json
{
  "baseUrl": "https://staging.fantasyapp.com",
  "env": {
    "apiUrl": "https://api.staging.fantasyapp.com",
    "environment": "staging"
  }
}

// Load environment config in cypress.config.js
setupNodeEvents(on, config) {
  const environmentName = config.env.environmentName || 'local';
  const environmentFilename = `./cypress/config/${environmentName}.json`;
  const environmentConfig = require(environmentFilename);
  return { ...config, ...environmentConfig };
}
```

## Performance & Optimization

### 1. Parallel Execution

```bash
# Run component and E2E tests in parallel
npm run cypress:run -- --record --parallel
```

### 2. Test Data Factories

```javascript
// cypress/fixtures/factories.js
export const elementFactory = (overrides = {}) => ({
  id: `element_${Date.now()}`,
  name: 'Test Element',
  type: 'character',
  category: 'Characters',
  ...overrides,
});

export const projectFactory = (overrides = {}) => ({
  id: `project_${Date.now()}`,
  name: 'Test Project',
  elements: [],
  ...overrides,
});
```

### 3. Selective Test Running

```javascript
// Tag tests for selective execution
it('should handle large datasets @performance', () => {
  // Performance-critical test
});

// Run only performance tests
npm run cypress:run -- --env grep=@performance
```

## Code Coverage Strategy

### Coverage Setup & Configuration

#### Installation

```bash
npm install --save-dev @cypress/code-coverage babel-plugin-istanbul
```

#### Configuration Files

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Enable code coverage collection
      require('@cypress/code-coverage/task')(on, config);

      // Custom coverage tasks
      on('task', {
        'coverage:reset': () => {
          // Reset coverage between test suites
          return null;
        },
        'coverage:report': () => {
          // Generate custom reports
          const NYC = require('nyc');
          const nyc = new NYC({
            reporter: ['html', 'text', 'json'],
          });
          return nyc.report();
        },
      });

      return config;
    },
  },
});

// cypress/support/e2e.js
import '@cypress/code-coverage/support';
```

#### Instrumentation for React Native Web

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'istanbul',
      {
        exclude: [
          '**/*.test.{js,jsx,ts,tsx}',
          '**/*.cy.{js,jsx,ts,tsx}',
          '**/node_modules/**',
          '**/cypress/**',
        ],
      },
    ],
  ],
  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
};

// webpack.config.js (for web build)
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

### Coverage Goals & Thresholds

#### Overall Project Thresholds

```json
// .nycrc
{
  "all": true,
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "exclude": [
    "**/*.test.{js,jsx,ts,tsx}",
    "**/*.cy.{js,jsx,ts,tsx}",
    "**/node_modules/**",
    "**/coverage/**",
    "**/__mocks__/**"
  ],
  "reporter": ["html", "text", "lcov", "json"],
  "check-coverage": true,
  "branches": 75,
  "lines": 80,
  "functions": 80,
  "statements": 80
}
```

#### Component-Specific Coverage Targets

```javascript
// Coverage enforcement by component type
const coverageTargets = {
  'src/auth/**': { lines: 95, branches: 90 }, // Critical: Authentication
  'src/models/**': { lines: 90, branches: 85 }, // High: Data models
  'src/components/**': { lines: 85, branches: 80 }, // Medium: UI components
  'src/utils/**': { lines: 95, branches: 90 }, // High: Utilities
  'src/navigation/**': { lines: 80, branches: 75 }, // Medium: Navigation
  'src/errors/**': { lines: 90, branches: 85 }, // High: Error handlers
};
```

### Coverage Collection Strategies

#### 1. E2E Test Coverage

```javascript
describe('E2E Coverage Collection', () => {
  beforeEach(() => {
    // Coverage is automatically collected
    cy.visit('/');
  });

  it('covers critical user paths', () => {
    cy.login('user@example.com', 'password');
    cy.navigateToProject('Test Project');
    cy.createElement({ type: 'character', name: 'Hero' });
    // Each interaction increases code coverage
  });

  after(() => {
    // Check coverage thresholds
    cy.task('coverage').then(coverage => {
      expect(coverage.lines.pct).to.be.at.least(80);
    });
  });
});
```

#### 2. Component Test Coverage

```javascript
// src/components/ElementCard.cy.tsx
describe('Component Coverage', () => {
  it('covers all component branches', () => {
    // Test all props combinations
    const props = [
      { element: mockElement, editable: true },
      { element: mockElement, editable: false },
      { element: { ...mockElement, relationships: [] } },
    ];

    props.forEach(prop => {
      cy.mount(<ElementCard {...prop} />);
      cy.get('[data-cy="element-card"]').should('exist');
    });
  });
});
```

#### 3. Combining Coverage from Multiple Sources

```javascript
// package.json scripts
{
  "scripts": {
    "coverage:e2e": "cypress run",
    "coverage:component": "cypress run --component",
    "coverage:unit": "jest --coverage",
    "coverage:combine": "nyc merge coverage-e2e coverage-unit coverage-combined",
    "coverage:report": "nyc report -t coverage-combined"
  }
}
```

### Coverage Reporting & Analysis

#### HTML Report Generation

```bash
# Generate interactive HTML report
npx nyc report --reporter=html
open coverage/lcov-report/index.html
```

#### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run tests with coverage
  run: |
    npm run test:coverage
    npm run coverage:report

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: cypress

- name: Check coverage thresholds
  run: npm run coverage:check
```

#### Custom Coverage Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('checkCoverage', (threshold = 80) => {
  cy.task('coverage').then(coverage => {
    const { lines, branches, functions, statements } = coverage;

    cy.log(`Coverage Report:
      Lines: ${lines.pct}%
      Branches: ${branches.pct}%
      Functions: ${functions.pct}%
      Statements: ${statements.pct}%
    `);

    // Fail if below threshold
    if (lines.pct < threshold) {
      throw new Error(`Line coverage ${lines.pct}% is below ${threshold}%`);
    }
  });
});

// Usage in tests
afterEach(() => {
  cy.checkCoverage(85); // Require 85% coverage
});
```

### Coverage Best Practices

#### 1. Incremental Coverage Improvement

```javascript
// Track coverage trends over time
const coverageTrend = {
  'sprint-1': { lines: 60, target: 65 },
  'sprint-2': { lines: 70, target: 75 },
  'sprint-3': { lines: 80, target: 85 },
};

// Enforce incremental improvements
cy.task('coverage').then(current => {
  const target = coverageTrend[currentSprint].target;
  expect(current.lines.pct).to.be.at.least(target);
});
```

#### 2. Focus on Critical Paths

```javascript
describe('Critical Path Coverage @critical', () => {
  // These tests MUST achieve 95%+ coverage
  const criticalPaths = [
    'authentication',
    'payment-processing',
    'data-persistence',
    'error-recovery',
  ];

  criticalPaths.forEach(path => {
    it(`ensures ${path} has high coverage`, () => {
      // Test implementation
      cy.checkCoverage(95);
    });
  });
});
```

#### 3. Exclude Unreachable Code

```javascript
/* istanbul ignore next - Platform specific code */
if (Platform.OS === 'ios') {
  // iOS-only code
}

/* istanbul ignore if - Defensive programming */
if (!this_should_never_happen) {
  throw new Error('Impossible state');
}

/* istanbul ignore next - Dev only */
if (__DEV__) {
  console.log('Debug info');
}
```

#### 4. Coverage-Driven Development

```javascript
// Write tests to increase coverage
describe('Increase Coverage', () => {
  it('covers untested error paths', () => {
    // Force error conditions
    cy.intercept('GET', '/api/**', { statusCode: 500 });
    cy.visit('/');
    cy.get('[data-cy="error-message"]').should('be.visible');
  });

  it('covers edge cases', () => {
    // Test boundary conditions
    cy.createElement({ name: 'A'.repeat(255) }); // Max length
    cy.createElement({ name: '' }); // Empty
    cy.createElement({ name: '特殊字符' }); // Unicode
  });
});
```

### Coverage Troubleshooting

#### Common Issues & Solutions

```javascript
// Issue: Coverage shows 0%
// Solution: Check window.__coverage__ exists
cy.window().then((win) => {
  expect(win.__coverage__, 'Coverage object should exist').to.exist
})

// Issue: Missing source maps
// Solution: Enable source maps in build
// webpack.config.js
{
  devtool: 'source-map'
}

// Issue: Coverage not combining
// Solution: Clear cache and regenerate
rm -rf .nyc_output coverage
npm run test:coverage
```

## Cypress Commands vs JavaScript (Critical Distinction)

### ❌ WRONG - JavaScript Variable Assignment

```javascript
// This WILL NOT WORK - Cypress commands are asynchronous
const button = cy.get('[data-cy="submit"]'); // ❌ Returns a Cypress chain, not element
button.click(); // ❌ Will fail

let username; // ❌ Don't do this
cy.get('[data-cy="username"]').then($el => {
  username = $el.text(); // ❌ Breaks command chain
});
```

### ✅ CORRECT - Use Cypress Commands

```javascript
// Use aliases for reusability
cy.get('[data-cy="submit"]').as('submitBtn');
cy.get('@submitBtn').click();

// Use closures for values
cy.get('[data-cy="username"]').then($username => {
  const text = $username.text();
  cy.get('[data-cy="greeting"]').should('contain', text);
});

// Or use invoke
cy.get('[data-cy="username"]').invoke('text').should('equal', 'JohnDoe');
```

## Best Practices

### DO's ✅

1. **Always use data-cy selectors** (testID for React Native components)
2. **Include comprehensive debug setup** in every test file
3. **Test user workflows**, not implementation details
4. **Clean state between tests** for isolation
5. **Document test purpose** with user stories
6. **Test responsive behavior** across viewports
7. **Capture failure context** for debugging
8. **Use factories** for test data generation
9. **Test touch interactions** for mobile experience
10. **Organize commands** by category

### DON'Ts ❌ (Updated per Cypress.io)

1. **Never use CSS selectors** for element selection
2. **Don't use conditional logic** in tests (no if statements)
3. **Don't visit external sites** - only test your application
4. **Don't use arbitrary waits** - cy.wait(3000) is always wrong
5. **Don't start servers in tests** - start before running Cypress
6. **Don't assign return values** - use aliases and closures instead
7. **Don't make tests dependent** - each test must stand alone
8. **Don't clean after tests** - clean before to ensure isolation
9. **Don't skip baseUrl** - always configure it
10. **Don't ignore validation** in cy.session() - always validate

## React Native Specific Patterns

### 1. Testing FlatList/ScrollView

```javascript
cy.get('[data-cy="element-list"]').within(() => {
  // Scroll to bottom
  cy.scrollTo('bottom');

  // Verify virtualization
  cy.get('[data-cy^="element-"]').should('have.length.at.least', 10);
});
```

### 2. Testing Modal/Overlay Components

```javascript
cy.get('[data-cy="open-modal-button"]').click();
cy.get('[data-cy="modal-backdrop"]').should('be.visible');
cy.get('[data-cy="modal-content"]').should('be.visible');

// Dismiss modal
cy.get('[data-cy="modal-backdrop"]').click({ force: true });
cy.get('[data-cy="modal-content"]').should('not.exist');
```

### 3. Testing Keyboard Interactions

```javascript
// React Native TextInput keyboard handling
cy.get('[data-cy="search-input"]').type('dragon{enter}');

cy.get('[data-cy="search-results"]').should('contain', 'Dragon');
```

## Advanced Patterns from Official Cypress Documentation

### Testing Different User Roles

```javascript
describe('Role-based Access', () => {
  it('admin can manage all elements', () => {
    cy.setupTestUser({ role: 'admin', email: 'admin@example.com' });
    cy.visit('/admin');
    cy.get('[data-cy="admin-panel"]').should('be.visible');
  });

  it('regular user has limited access', () => {
    cy.setupTestUser({ role: 'user', email: 'user@example.com' });
    cy.visit('/admin');
    cy.url().should('include', '/unauthorized');
  });
});
```

### Network Request Patterns

```javascript
// * Wait for specific requests
cy.intercept('POST', '/api/elements').as('createElement');
cy.get('[data-cy="save-button"]').click();
cy.wait('@createElement').then(interception => {
  expect(interception.response.statusCode).to.eq(201);
  expect(interception.response.body).to.have.property('id');
});

// * Modify requests on the fly
cy.intercept('GET', '/api/elements', req => {
  req.headers['authorization'] = 'Bearer test-token';
}).as('getElements');
```

### Error State Testing

```javascript
describe('Error Handling', () => {
  it('handles network errors gracefully', () => {
    // * Simulate network failure
    cy.intercept('GET', '/api/elements', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('serverError');

    cy.visit('/elements');
    cy.wait('@serverError');
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Something went wrong');

    // * Test retry mechanism
    cy.get('[data-cy="retry-button"]').click();
  });

  it('handles timeout errors', () => {
    // * Simulate timeout
    cy.intercept('GET', '/api/elements', req => {
      req.reply(res => {
        res.delay(31000); // Longer than timeout
        res.send({ fixture: 'elements.json' });
      });
    });

    cy.visit('/elements', { timeout: 30000 });
    cy.get('[data-cy="timeout-error"]').should('be.visible');
  });
});
```

### Form Validation Testing

```javascript
describe('Form Validation', () => {
  beforeEach(function () {
    cy.comprehensiveDebug();
    cy.cleanState();
    cy.visit('/elements/create');
  });

  it('validates required fields', () => {
    // * Submit empty form
    cy.get('[data-cy="submit-button"]').click();

    // * Check all validation messages
    cy.get('[data-cy="name-error"]').should('contain', 'Name is required');
    cy.get('[data-cy="type-error"]').should('contain', 'Type is required');
  });

  it('validates field formats', () => {
    // * Test invalid inputs
    cy.get('[data-cy="name-input"]').type('a'); // Too short
    cy.get('[data-cy="submit-button"]').click();
    cy.get('[data-cy="name-error"]').should('contain', 'at least 3 characters');
  });
});
```

## Conclusion

This comprehensive testing strategy, enhanced with official Cypress best practices, ensures robust, maintainable tests for the FantasyWritingApp. By following these patterns and incorporating proper data seeding, stubbing, session management, and configuration strategies, the test suite will provide confidence in the application's functionality across all platforms while maintaining excellent debugging capabilities and performance.

### Key Takeaways (Cypress.io Best Practices)

1. **Start servers BEFORE Cypress** - Never use cy.exec() to start servers
2. **Always configure baseUrl** - Enables relative URLs in cy.visit()
3. **Write independent tests** - No coupling or shared state between tests
4. **Use data-\* attributes** - Never use CSS selectors or IDs
5. **Cache sessions properly** - Always include validation callbacks
6. **Avoid arbitrary waits** - Use intercepts and assertions instead
7. **Don't visit external sites** - Only test your own application
8. **Use Cypress commands** - Don't assign return values to JavaScript variables
9. **Clean before, not after** - Ensure test isolation
10. **Test user behavior** - Not implementation details
